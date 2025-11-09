import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BudgetsService, Presupuesto } from '../../../services/budgets.service';
import { AuthService } from '../../../services/auth.service';
import { TransactionsService } from '../../../services/transactions.service';
import { CategoriesService } from '../../../services/categories.service';
import { UsersService } from '../../../services/users.service';
import { Usuario } from '../../../shared/interfaces/usuario';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-list',
  imports: [RouterLink, CommonModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  presupuestos: Presupuesto[] = [];
  presupuestosConProgreso: any[] = [];
  usuarios: Usuario[] = [];
  usuariosMap: Map<number, Usuario> = new Map();
  currentUser: Usuario | null = null;
  isAdmin: boolean = false;
  loading: boolean = false;

  constructor(
    private budgetSvc: BudgetsService,
    private auth: AuthService,
    private txSvc: TransactionsService,
    private catSvc: CategoriesService,
    private usersSvc: UsersService
  ) {
    this.currentUser = this.auth.getCurrentUser();
    this.isAdmin = this.currentUser?.rol === 'admin';
  }

  ngOnInit() {
    // Si es admin, cargar usuarios primero
    if (this.isAdmin) {
      this.loadUsuarios().then(() => {
        this.loadPresupuestos();
      });
    } else {
      this.loadPresupuestos();
    }
  }

  async loadUsuarios(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.usersSvc.getAll().subscribe({
        next: (users) => {
          this.usuarios = users;
          // Crear mapa para acceso rápido
          this.usuariosMap = new Map(users.map(u => [u.id!, u]));
          resolve();
        },
        error: (err) => {
          console.error('Error al cargar usuarios:', err);
          reject(err);
        }
      });
    });
  }

  getNombreUsuario(usuarioId: number): string {
    const usuario = this.usuariosMap.get(usuarioId);
    return usuario ? `${usuario.nombre} ${usuario.apellidos}` : 'Usuario desconocido';
  }

  loadPresupuestos() {
    this.loading = true;
    const filters: any = {};

    // Si no es admin, solo ver sus propios presupuestos
    if (!this.isAdmin && this.currentUser?.id) {
      filters.usuarioId = this.currentUser.id;
    }

    this.budgetSvc.getAll(filters).subscribe({
      next: (budgets) => {
        this.presupuestos = budgets;
        this.calculateProgress();
      },
      error: (err) => {
        console.error('Error al cargar presupuestos:', err);
        this.loading = false;
      }
    });
  }

  calculateProgress() {
    if (this.presupuestos.length === 0) {
      this.loading = false;
      return;
    }

    const requests = this.presupuestos.map(budget => 
      this.txSvc.getAll({
        usuarioId: budget.usuarioId,
        categoria: budget.categoria,
        tipo: 'Gasto'
      })
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        this.presupuestosConProgreso = this.presupuestos.map((budget, index) => {
          const gastos = results[index];
          const totalGastado = gastos.reduce((sum, t) => sum + t.monto, 0);
          const porcentaje = (totalGastado / budget.monto) * 100;
          const disponible = budget.monto - totalGastado;

          return {
            ...budget,
            totalGastado,
            porcentaje: Math.min(porcentaje, 100),
            disponible,
            excedido: totalGastado > budget.monto,
            estado: this.getEstado(porcentaje)
          };
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al calcular progreso:', err);
        this.loading = false;
      }
    });
  }

  getEstado(porcentaje: number): 'ok' | 'warning' | 'danger' {
    if (porcentaje < 70) return 'ok';
    if (porcentaje < 90) return 'warning';
    return 'danger';
  }

  getEstadoClass(estado: string): string {
    return `estado-${estado}`;
  }

  onDelete(id: number | undefined) {
    if (!id) return;

    if (!confirm('¿Estás seguro de eliminar este presupuesto?')) {
      return;
    }

    this.budgetSvc.delete(id).subscribe({
      next: () => {
        alert('✅ Presupuesto eliminado correctamente');
        this.loadPresupuestos();
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        alert('❌ Error al eliminar el presupuesto');
      }
    });
  }

  canEdit(presupuesto: Presupuesto): boolean {
    if (this.isAdmin) return true;
    return presupuesto.usuarioId === this.currentUser?.id;
  }
}
