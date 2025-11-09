import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CategoriesService } from '../../../services/categories.service';
import { AuthService } from '../../../services/auth.service';
import { UsersService } from '../../../services/users.service';
import { Categoria } from '../../../shared/interfaces/categoria';
import { Usuario } from '../../../shared/interfaces/usuario';
import { ConfirmDeleteCategoryModalComponent } from '../../../modals/confirm-delete-category-modal/confirm-delete-category-modal.component';

@Component({
  selector: 'app-list',
  imports: [RouterLink, CommonModule, ConfirmDeleteCategoryModalComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  categorias: Categoria[] = [];
  usuarios: Map<number, Usuario> = new Map();
  loading: boolean = false;
  isAdmin: boolean = false;
  currentUserId: number = 0;

  // Modal state
  isModalOpen: boolean = false;
  selectedCategory: Categoria | null = null;
  hasTransactions: boolean = false;
  transactionCount: number = 0;

  // Alert messages
  alertMessage: string = '';
  alertType: 'success' | 'warning' | 'error' | '' = '';
  showAlert: boolean = false;

  constructor(
    private categoriesService: CategoriesService,
    private authService: AuthService,
    private usersService: UsersService
  ) {
    const currentUser = this.authService.getCurrentUser();
    this.isAdmin = currentUser?.rol === 'admin';
    this.currentUserId = currentUser?.id || 0;
  }

  ngOnInit() {
    this.loadUsuarios();
    this.loadCategorias();
  }

  loadUsuarios() {
    if (this.isAdmin) {
      this.usersService.getAll().subscribe({
        next: (users) => {
          users.forEach(user => {
            if (user.id) {
              this.usuarios.set(user.id, user);
            }
          });
        },
        error: (err) => {
          console.error('Error al cargar usuarios:', err);
        }
      });
    }
  }

  getNombreUsuario(usuarioId: number | string): string {
    // Convertir a número si es string
    const id = typeof usuarioId === 'string' ? parseInt(usuarioId, 10) : usuarioId;
    const usuario = this.usuarios.get(id);
    return usuario ? `${usuario.nombre} ${usuario.apellidos}` : 'Usuario desconocido';
  }

  showAlertMessage(message: string, type: 'success' | 'warning' | 'error') {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }

  loadCategorias() {
    this.loading = true;
    
    // Si es admin, cargar todas las categorías
    // Si es usuario, cargar solo sus categorías
    const observable = this.isAdmin 
      ? this.categoriesService.getAll()
      : this.categoriesService.getByUserId(this.currentUserId);
    
    observable.subscribe({
      next: (data) => {
        this.categorias = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
        this.showAlertMessage('Error al cargar categorías', 'error');
        this.loading = false;
      }
    });
  }

  onDeleteClick(categoria: Categoria) {
    if (!categoria.id || !categoria.nombre) return;

    this.selectedCategory = categoria;
    
    // Verificar si tiene transacciones asociadas
    this.categoriesService.checkTransactionsForCategory(categoria.id, categoria.nombre).subscribe({
      next: ({ hasTransactions, count }) => {
        this.hasTransactions = hasTransactions;
        this.transactionCount = count;
        this.isModalOpen = true;
      },
      error: (err) => {
        console.error('Error al verificar transacciones:', err);
        this.showAlertMessage('Error al verificar transacciones', 'error');
      }
    });
  }

  onConfirmDelete() {
    if (!this.selectedCategory || !this.selectedCategory.id) return;

    const categoryId = this.selectedCategory.id;
    const categoryName = this.selectedCategory.nombre;

    this.categoriesService.deleteOrInactivate(categoryId, categoryName).subscribe({
      next: (result) => {
        this.showAlertMessage(result.message, result.inactivated ? 'warning' : 'success');
        this.isModalOpen = false;
        this.selectedCategory = null;
        this.loadCategorias();
      },
      error: (err) => {
        console.error('Error al eliminar/inactivar categoría:', err);
        this.showAlertMessage('Error al procesar la solicitud', 'error');
        this.isModalOpen = false;
      }
    });
  }

  onCancelDelete() {
    this.isModalOpen = false;
    this.selectedCategory = null;
    this.hasTransactions = false;
    this.transactionCount = 0;
  }

  onActivateClick(categoria: Categoria) {
    if (!categoria.id) return;

    // Activar la categoría
    const categoriaActualizada = {
      ...categoria,
      estado: true
    };

    this.categoriesService.update(categoria.id, categoriaActualizada).subscribe({
      next: () => {
        this.showAlertMessage('✅ Categoría activada correctamente', 'success');
        this.loadCategorias();
      },
      error: (err) => {
        console.error('Error al activar categoría:', err);
        this.showAlertMessage('Error al activar la categoría', 'error');
      }
    });
  }

  // Método legacy, mantenido para compatibilidad pero redirige al nuevo
  deleteCategoria(id: number) {
    const categoria = this.categorias.find(c => c.id === id);
    if (categoria) {
      this.onDeleteClick(categoria);
    }
  }
}
