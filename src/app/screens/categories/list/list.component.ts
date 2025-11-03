import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CategoriesService } from '../../../services/categories.service';
import { Categoria } from '../../../shared/interfaces/categoria';

@Component({
  selector: 'app-list',
  imports: [RouterLink, CommonModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  categorias: Categoria[] = [];
  loading: boolean = false;

  constructor(
    private categoriesService: CategoriesService
  ) {}

  ngOnInit() {
    this.loadCategorias();
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
        this.loading = false;
      }
    });
  }

  deleteCategoria(id: number) {
    if (confirm('¿Está seguro de eliminar esta categoría?')) {
      this.categoriesService.delete(id).subscribe({
        next: () => {
          console.log('Categoría eliminada');
          this.loadCategorias();
        },
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }
}
