import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CategoriesService } from '../../../services/categories.service';
import { Categoria } from '../../../shared/interfaces/categoria';
import { ConfirmDeleteCategoryModalComponent } from '../../../modals/confirm-delete-category-modal/confirm-delete-category-modal.component';

@Component({
  selector: 'app-list',
  imports: [RouterLink, CommonModule, ConfirmDeleteCategoryModalComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  categorias: Categoria[] = [];
  loading: boolean = false;

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
    private categoriesService: CategoriesService
  ) {}

  ngOnInit() {
    this.loadCategorias();
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
    
    // Cargar todas las categorías (son compartidas entre usuarios)
    this.categoriesService.getAll().subscribe({
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

  // Método legacy, mantenido para compatibilidad pero redirige al nuevo
  deleteCategoria(id: number) {
    const categoria = this.categorias.find(c => c.id === id);
    if (categoria) {
      this.onDeleteClick(categoria);
    }
  }
}
