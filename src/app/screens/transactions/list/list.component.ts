import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionsService } from '../../../services/transactions.service';
import { AuthService } from '../../../services/auth.service';
import { CategoriesService } from '../../../services/categories.service';
import { Movimiento } from '../../../shared/interfaces/movimiento';
import { Categoria } from '../../../shared/interfaces/categoria';
import { Usuario } from '../../../shared/interfaces/usuario';

@Component({
  selector: 'app-list',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  transacciones: Movimiento[] = [];
  categorias: Categoria[] = [];
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
    private catSvc: CategoriesService
  ) {
    this.currentUser = this.auth.getCurrentUser();
    this.isAdmin = this.currentUser?.rol === 'admin';
  }

  ngOnInit() {
    this.loadCategorias();
    this.load();
  }

  /**
   * Cargar categorías para el filtro
   */
  loadCategorias() {
    this.catSvc.getAll().subscribe({
      next: (cats) => {
        this.categorias = cats.filter(c => c.estado);
      },
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }

  /**
   * Cargar transacciones con filtros aplicados
   */
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

  /**
   * Aplicar filtros y recargar
   */
  aplicarFiltros() {
    this.load();
  }

  /**
   * Limpiar todos los filtros
   */
  limpiarFiltros() {
    this.filtros = {
      tipo: '',
      categoria: '',
      fechaDesde: '',
      fechaHasta: ''
    };
    this.load();
  }

  /**
   * Eliminar transacción
   */
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

  /**
   * Verificar si el usuario puede editar/eliminar la transacción
   */
  canEdit(transaccion: Movimiento): boolean {
    if (this.isAdmin) return true;
    return transaccion.usuarioId === this.currentUser?.id;
  }

  /**
   * Obtener clase CSS según el tipo de transacción
   */
  getTipoClass(tipo: string): string {
    return tipo === 'Ingreso' ? 'ingreso' : 'gasto';
  }
}
