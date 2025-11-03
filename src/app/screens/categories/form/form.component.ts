import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CategoriesService } from '../../../services/categories.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent implements OnInit {
  form: FormGroup;
  isEditMode: boolean = false;
  categoryId: number | null = null;
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Colores predefinidos
  availableColors: string[] = [
    '#4f8ef7', // Azul
    '#e67e22', // Naranja
    '#27ae60', // Verde
    '#e74c3c', // Rojo
    '#9b59b6', // Púrpura
    '#f39c12', // Amarillo
    '#1abc9c', // Turquesa
    '#34495e', // Gris oscuro
    '#16a085', // Verde azulado
    '#c0392b'  // Rojo oscuro
  ];

  constructor(
    private fb: FormBuilder,
    private categoriesService: CategoriesService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      tipo: ['Gasto', Validators.required],
      color: ['#4f8ef7', Validators.required],
      estado: [true]
    });
  }

  ngOnInit() {
    // Verificar si es modo edición
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.categoryId = +params['id'];
        this.loadCategory(this.categoryId);
      }
    });
  }

  loadCategory(id: number) {
    this.loading = true;
    this.categoriesService.getById(id).subscribe({
      next: (categoria) => {
        this.form.patchValue({
          nombre: categoria.nombre,
          tipo: categoria.tipo,
          color: categoria.color,
          estado: categoria.estado
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar categoría:', err);
        this.errorMessage = 'Error al cargar la categoría';
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const categoriaData = {
      nombre: this.form.value.nombre,
      tipo: this.form.value.tipo,
      color: this.form.value.color,
      estado: this.form.value.estado ?? true
    };

    if (this.isEditMode && this.categoryId) {
      // Actualizar categoría existente
      this.categoriesService.update(this.categoryId, categoriaData).subscribe({
        next: () => {
          this.successMessage = 'Categoría actualizada exitosamente';
          setTimeout(() => {
            this.router.navigate(['/categories']);
          }, 1500);
        },
        error: (err) => {
          console.error('Error al actualizar categoría:', err);
          this.errorMessage = 'Error al actualizar la categoría';
          this.loading = false;
        }
      });
    } else {
      // Crear nueva categoría
      this.categoriesService.create(categoriaData).subscribe({
        next: () => {
          this.successMessage = 'Categoría creada exitosamente';
          setTimeout(() => {
            this.router.navigate(['/categories']);
          }, 1500);
        },
        error: (err) => {
          console.error('Error al crear categoría:', err);
          this.errorMessage = 'Error al crear la categoría';
          this.loading = false;
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/categories']);
  }

  get f() { return this.form.controls; }
}