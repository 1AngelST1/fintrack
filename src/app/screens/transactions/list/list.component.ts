import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { TransactionsService } from '../../../services/transactions.service';
import { AuthService } from '../../../services/auth.service';
import { CategoriesService } from '../../../services/categories.service';
import { UsersService } from '../../../services/users.service';
import { Movimiento } from '../../../shared/interfaces/movimiento';
import { Categoria } from '../../../shared/interfaces/categoria';
import { Usuario } from '../../../shared/interfaces/usuario';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-list',
  imports: [RouterLink, CommonModule, FormsModule, CurrencyFormatPipe, DateFormatPipe],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  transacciones: Movimiento[] = [];
  categorias: Categoria[] = [];
  usuarios: Usuario[] = [];
  usuariosMap: Map<number, Usuario> = new Map();
  currentUser: Usuario | null = null;
  isAdmin: boolean = false;
  loading: boolean = false;

  // Filtros
  filtros = {
    tipo: '',
    categoria: '',
    fechaDesde: '',
    fechaHasta: ''
  };

  constructor(
    private txSvc: TransactionsService,
    private auth: AuthService,
    private catSvc: CategoriesService,
    private usersSvc: UsersService
  ) {
    this.currentUser = this.auth.getCurrentUser();
    this.isAdmin = this.currentUser?.rol === 'admin';
  }

  ngOnInit() {
    if (this.isAdmin) {
      // Si es admin, cargar usuarios primero y luego todo lo demás
      this.loadUsuarios().then(() => {
        this.loadCategorias();
        this.load();
      });
    } else {
      // Si no es admin, cargar normalmente
      this.loadCategorias();
      this.load();
    }
  }

  // Cargar usuarios para mostrar nombres en vez de IDs
  loadUsuarios(): Promise<void> {
    return new Promise((resolve) => {
      this.usersSvc.getAll().subscribe({
        next: (users) => {
          this.usuarios = users;
          // Crear mapa para acceso rápido
          this.usuariosMap = new Map(users.map(u => [u.id!, u]));
          console.log('✅ Usuarios cargados:', this.usuariosMap);
          resolve();
        },
        error: (err) => {
          console.error('Error al cargar usuarios:', err);
          resolve(); // Resolver igual para continuar la carga
        }
      });
    });
  }

  // Obtener nombre completo del usuario
  getNombreUsuario(usuarioId: number): string {
    const usuario = this.usuariosMap.get(usuarioId);
    if (usuario) {
      const nombreCompleto = `${usuario.nombre} ${usuario.apellidos}`.trim();
      console.log(`Usuario ${usuarioId}:`, nombreCompleto);
      return nombreCompleto;
    }
    console.log(`⚠️ Usuario ${usuarioId} no encontrado en el mapa`);
    return `Usuario #${usuarioId}`;
  }

  // Cargar categorías para el filtro
  loadCategorias() {
    this.catSvc.getAll().subscribe({
      next: (cats) => {
        this.categorias = cats.filter(c => c.estado);
      },
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }

  // Cargar transacciones con filtros aplicados
  load() {
    this.loading = true;
    const filters: any = {};

    // Si no es admin, solo ver sus propias transacciones
    if (!this.isAdmin && this.currentUser?.id) {
      filters.usuarioId = this.currentUser.id;
    }

    // Aplicar filtros del usuario
    if (this.filtros.tipo) {
      filters.tipo = this.filtros.tipo;
    }
    if (this.filtros.categoria) {
      filters.categoria = this.filtros.categoria;
    }
    if (this.filtros.fechaDesde) {
      filters.fechaDesde = this.filtros.fechaDesde;
    }
    if (this.filtros.fechaHasta) {
      filters.fechaHasta = this.filtros.fechaHasta;
    }

    this.txSvc.getAll(filters).subscribe({
      next: (list) => {
        this.transacciones = list;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar transacciones:', err);
        this.loading = false;
      }
    });
  }

  // Aplicar filtros y recargar
  aplicarFiltros() {
    this.load();
  }

  // Limpiar todos los filtros
  limpiarFiltros() {
    this.filtros = {
      tipo: '',
      categoria: '',
      fechaDesde: '',
      fechaHasta: ''
    };
    this.load();
  }

  // Eliminar transacción
  onDelete(id: number | undefined) {
    if (!id) return;

    if (!confirm('¿Estás seguro de eliminar esta transacción?')) {
      return;
    }

    this.txSvc.delete(id).subscribe({
      next: () => {
        this.load();
        alert('Transacción eliminada correctamente');
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        alert('Error al eliminar la transacción');
      }
    });
  }

  // Verificar si el usuario puede editar/eliminar la transacción
  canEdit(transaccion: Movimiento): boolean {
    if (this.isAdmin) return true;
    return transaccion.usuarioId === this.currentUser?.id;
  }

  // Obtener clase CSS según el tipo de transacción
  getTipoClass(tipo: string): string {
    return tipo === 'Ingreso' ? 'ingreso' : 'gasto';
  }
}
