import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TransactionsService } from '../../../services/transactions.service';
import { CategoriesService } from '../../../services/categories.service';
import { AuthService } from '../../../services/auth.service';
import { Categoria } from '../../../shared/interfaces/categoria';

@Component({
  selector: 'app-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
  form: FormGroup;
  categorias: Categoria[] = [];
  isEditMode: boolean = false;
  transaccionId: number | null = null;
  originalUsuarioId: number | undefined; // Guardar el usuarioId original
  loading: boolean = false;
  errorMsg: string = '';
  successMsg: string = '';

  constructor(
    private fb: FormBuilder,
    private txSvc: TransactionsService,
    private catSvc: CategoriesService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      tipo: ['Gasto', Validators.required],
      categoria: ['', Validators.required],
      monto: [null, [Validators.required, Validators.min(0.01)]],
      fecha: ['', [Validators.required, this.fechaNoFuturaValidator]],
      descripcion: ['']
    });
  }

  ngOnInit() {
    this.loadCategorias();
    this.checkEditMode();
  }

  // Cargar categorías activas
  loadCategorias() {
    this.catSvc.getAll().subscribe({
      next: (cats) => {
        this.categorias = cats.filter(c => c.estado);
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
        this.errorMsg = 'Error al cargar las categorías';
      }
    });
  }

  // Verificar si estamos en modo edición
  checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.transaccionId = Number(id);
      this.loadTransaccion(this.transaccionId);
    }
  }

  // Cargar datos de la transacción para editar
  loadTransaccion(id: number) {
    this.loading = true;
    this.txSvc.getById(id).subscribe({
      next: (transaccion) => {
        // Verificar que el usuario puede editar esta transacción
        const currentUser = this.auth.getCurrentUser();
        const isAdmin = currentUser?.rol === 'admin';
        const isOwner = transaccion.usuarioId === currentUser?.id;

        if (!isAdmin && !isOwner) {
          this.errorMsg = 'No tienes permisos para editar esta transacción';
          this.router.navigate(['/transactions']);
          return;
        }

        // Guardar el usuarioId original para mantenerlo en la actualización
        this.originalUsuarioId = transaccion.usuarioId;

        this.form.patchValue({
          tipo: transaccion.tipo,
          categoria: transaccion.categoria,
          monto: transaccion.monto,
          fecha: transaccion.fecha,
          descripcion: transaccion.descripcion || ''
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar transacción:', err);
        this.errorMsg = 'Error al cargar la transacción';
        this.loading = false;
      }
    });
  }

  // Validador personalizado: fecha no puede ser futura
  fechaNoFuturaValidator(control: AbstractControl) {
    if (!control.value) return null;
    
    const input = new Date(control.value);
    const today = new Date();
    
    // Normalizar horas para comparar solo fechas
    today.setHours(0, 0, 0, 0);
    input.setHours(0, 0, 0, 0);
    
    return input.getTime() <= today.getTime() ? null : { fechaFutura: true };
  }

  // Filtrar categorías según el tipo seleccionado
  get categoriasFiltradas(): Categoria[] {
    const tipoSeleccionado = this.form.get('tipo')?.value;
    return this.categorias.filter(c => c.tipo === tipoSeleccionado);
  }

  // Al cambiar el tipo, limpiar la categoría si no es válida
  onTipoChange() {
    const categoriaActual = this.form.get('categoria')?.value;
    const categoriaValida = this.categoriasFiltradas.find(c => c.nombre === categoriaActual);
    
    if (!categoriaValida) {
      this.form.patchValue({ categoria: '' });
    }
  }

  // Enviar formulario
  onSubmit() {
    this.errorMsg = '';
    this.successMsg = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMsg = 'Por favor completa todos los campos correctamente';
      return;
    }

    this.loading = true;
    const formData = this.form.value;

    if (this.isEditMode && this.transaccionId) {
      // Actualizar - asegurarnos de mantener el usuarioId original
      const updateData = {
        ...formData,
        usuarioId: this.originalUsuarioId // Mantener el usuario original
      };
      
      this.txSvc.update(this.transaccionId, updateData).subscribe({
        next: () => {
          this.successMsg = 'Transacción actualizada correctamente';
          setTimeout(() => {
            this.router.navigate(['/transactions']);
          }, 1500);
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          this.errorMsg = 'Error al actualizar la transacción';
          this.loading = false;
        }
      });
    } else {
      // Crear
      this.txSvc.create(formData).subscribe({
        next: () => {
          this.successMsg = 'Transacción creada correctamente';
          setTimeout(() => {
            this.router.navigate(['/transactions']);
          }, 1500);
        },
        error: (err) => {
          console.error('Error al crear:', err);
          this.errorMsg = 'Error al crear la transacción';
          this.loading = false;
        }
      });
    }
  }

  // Cancelar y volver a la lista
  onCancel() {
    this.router.navigate(['/transactions']);
  }

  get f() { 
    return this.form.controls; 
  }
}
