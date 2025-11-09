import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CategoriesService } from '../../../services/categories.service';
import { AuthService } from '../../../services/auth.service';
import { UsersService } from '../../../services/users.service';
import { Usuario } from '../../../shared/interfaces/usuario';
import { DuplicateCategoryModalComponent } from '../../../modals/duplicate-category-modal/duplicate-category-modal.component';

@Component({
  selector: 'app-form',
  imports: [CommonModule, ReactiveFormsModule, DuplicateCategoryModalComponent],
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
  isAdmin: boolean = false;
  usuarios: Usuario[] = [];

  // Modal de categoría duplicada
  isDuplicateModalOpen: boolean = false;
  duplicateCategoryName: string = '';

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
    private usersService: UsersService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Obtener usuario actual
    const currentUser = this.authService.getCurrentUser();
    this.isAdmin = currentUser?.rol === 'admin';

    this.form = this.fb.group({
      usuarioId: [currentUser?.id || 0, Validators.required],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      tipo: ['Gasto', Validators.required],
      color: ['#4f8ef7', Validators.required],
      estado: [true]
    });
  }

  ngOnInit() {
    // Cargar usuarios si es admin
    if (this.isAdmin) {
      this.loadUsuarios();
    }

    // Verificar si es modo edición
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.categoryId = +params['id'];
        this.loadCategory(this.categoryId);
      }
    });
  }

  loadUsuarios() {
    this.usersService.getAll().subscribe({
      next: (users) => {
        this.usuarios = users;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
      }
    });
  }

  loadCategory(id: number) {
    this.loading = true;
    this.categoriesService.getById(id).subscribe({
      next: (categoria) => {
        this.form.patchValue({
          usuarioId: categoria.usuarioId,
          nombre: categoria.nombre,
          tipo: categoria.tipo,
          color: categoria.color,
          estado: categoria.estado
        });
        
        // Deshabilitar selector de usuario en modo edición
        if (this.isEditMode) {
          this.form.get('usuarioId')?.disable();
        }
        
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

    // Obtener usuarioId y convertir a número
    const usuarioIdValue = this.form.get('usuarioId')?.value || this.form.value.usuarioId;
    const usuarioId = typeof usuarioIdValue === 'string' ? parseInt(usuarioIdValue, 10) : usuarioIdValue;
    const nombre = this.form.value.nombre;

    // Verificar si existe una categoría con el mismo nombre para este usuario
    this.categoriesService.checkDuplicateByName(nombre, usuarioId, this.categoryId || undefined).subscribe({
      next: (isDuplicate) => {
        if (isDuplicate) {
          // Mostrar modal de duplicado
          this.loading = false;
          this.duplicateCategoryName = nombre;
          this.isDuplicateModalOpen = true;
          return;
        }

        // No es duplicado, proceder a guardar
        const categoriaData = {
          usuarioId: usuarioId,
          nombre: nombre,
          tipo: this.form.value.tipo,
          color: this.form.value.color,
          estado: this.form.value.estado ?? true
        };

        this.saveCategory(categoriaData);
      },
      error: (err) => {
        console.error('Error al verificar duplicados:', err);
        // En caso de error, continuar con el guardado
        const categoriaData = {
          usuarioId: usuarioId,
          nombre: nombre,
          tipo: this.form.value.tipo,
          color: this.form.value.color,
          estado: this.form.value.estado ?? true
        };
        this.saveCategory(categoriaData);
      }
    });
  }

  saveCategory(categoriaData: any) {

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

  closeDuplicateModal() {
    this.isDuplicateModalOpen = false;
  }

  get f() { return this.form.controls; }
}