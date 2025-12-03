import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TransactionsService } from '../../../services/transactions.service';
import { CategoriesService } from '../../../services/categories.service';
import { AuthService } from '../../../services/auth.service';
import { BudgetsService } from '../../../services/budgets.service';
import { UsersService } from '../../../services/users.service';
import { Categoria } from '../../../shared/interfaces/categoria';
import { Usuario } from '../../../shared/interfaces/usuario';
import { BudgetWarningModalComponent } from '../../../modals/budget-warning-modal/budget-warning-modal.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-form',
  imports: [CommonModule, ReactiveFormsModule, BudgetWarningModalComponent],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
  form: FormGroup;
  categorias: Categoria[] = [];
  usuarios: Usuario[] = [];
  isEditMode: boolean = false;
  transaccionId: number | null = null;
  originalUsuarioId: number | undefined;
  loading: boolean = false;
  errorMsg: string = '';
  successMsg: string = '';
  isAdmin: boolean = false;

  // Modal de presupuesto
  isBudgetWarningOpen: boolean = false;
  budgetData = {
    categoryName: '',
    budgetLimit: 0,
    currentSpent: 0,
    newAmount: 0
  };

  constructor(
    private fb: FormBuilder,
    private txSvc: TransactionsService,
    private catSvc: CategoriesService,
    private auth: AuthService,
    private budgetSvc: BudgetsService,
    private usersSvc: UsersService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const currentUser = this.auth.getCurrentUser();
    
    // Asignar isAdmin EXPLÍCITAMENTE
    if (currentUser && currentUser.rol === 'admin') {
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
    }
    
    // Si NO es admin, usar el ID del usuario actual automáticamente
    const defaultUserId = this.isAdmin ? null : currentUser?.id;
    
    this.form = this.fb.group({
      usuarioId: [defaultUserId, Validators.required],
      tipo: ['Gasto', Validators.required],
      categoria: ['', Validators.required],
      monto: [null, [Validators.required, Validators.min(0.01)]],
      fecha: ['', [Validators.required, this.fechaNoFuturaValidator]],
      descripcion: ['']
    });
  }

  ngOnInit() {
    // Cargar usuarios primero si es admin
    if (this.isAdmin) {
      this.loadUsuarios();
    }
    
    // Solo cargar categorías si ya hay un usuario seleccionado
    const usuarioId = this.form.get('usuarioId')?.value;
    if (usuarioId) {
      this.loadCategorias();
    }
    
    this.checkEditMode();
  }

  // Cargar usuarios (solo para administradores)
  loadUsuarios() {
    this.usersSvc.getAll().subscribe({
      next: (users) => {
        this.usuarios = users;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
      }
    });
  }

  // Cargar categorías activas del usuario seleccionado
  loadCategorias() {
    const usuarioId = this.form.get('usuarioId')?.value;
    
    if (!usuarioId) {
      console.warn('No hay usuario seleccionado');
      this.categorias = [];
      return;
    }

    this.catSvc.getByUserId(usuarioId).subscribe({
      next: (cats) => {
        // Filtrar solo categorías activas
        this.categorias = cats.filter(c => c.estado);
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
        this.errorMsg = 'Error al cargar las categorías';
      }
    });
  }

  // Cuando el admin cambia de usuario, recargar categorías
  onUsuarioChange(usuarioId: string | number) {
    // Convertir a número
    const userId = typeof usuarioId === 'string' ? parseInt(usuarioId, 10) : usuarioId;
    
    if (!userId || isNaN(userId)) {
      this.categorias = [];
      this.form.patchValue({ categoria: '' });
      return;
    }
    
    // Resetear la categoría seleccionada
    this.form.patchValue({ categoria: '' });
    // Recargar categorías del nuevo usuario
    this.loadCategorias();
  }

  // Verificar si estamos en modo edición
  checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.transaccionId = Number(id);
      
      // Deshabilitar el campo de usuario en modo edición
      if (this.isAdmin) {
        this.form.get('usuarioId')?.disable();
      }
      
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
          usuarioId: transaccion.usuarioId,
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

    const formData = this.form.value;

    // Si es un gasto, verificar presupuesto (tanto al crear como al editar)
    if (formData.tipo === 'Gasto') {
      this.checkBudgetAndSave(formData);
    } else {
      this.saveTransaction(formData);
    }
  }

  // Verificar presupuesto antes de guardar
  checkBudgetAndSave(formData: any) {
    // Obtener el usuario para verificar presupuesto:
    // - Usar el usuarioId del formulario (que puede ser seleccionado por admin o el usuario actual)
    // - Convertir a número si es string
    const targetUserId = typeof formData.usuarioId === 'string' ? parseInt(formData.usuarioId, 10) : formData.usuarioId;

    if (!targetUserId) {
      //console.log('❌ No hay usuario seleccionado');
      this.saveTransaction(formData);
      return;
    }

    const categoria = this.categorias.find(c => c.nombre === formData.categoria);
    if (!categoria?.id) {
      //console.log('❌ No se encontró la categoría:', formData.categoria);
      this.saveTransaction(formData);
      return;
    }

    const currentUser = this.auth.getCurrentUser();

   /*console.log('🔍 Verificando presupuesto para:', {
      categoria: categoria.nombre,
      categoriaId: categoria.id,
      usuarioId: targetUserId,
      esAdmin: currentUser?.rol === 'admin',
      esEdicion: this.isEditMode
    });*/

    // Obtener presupuesto y gastos actuales de la categoría
    forkJoin({
      budgets: this.budgetSvc.getByCategoryAndUser(categoria.id, targetUserId),
      transactions: this.txSvc.getAll({
        usuarioId: targetUserId,
        categoria: formData.categoria,
        tipo: 'Gasto'
      })
    }).subscribe({
      next: ({ budgets, transactions }) => {
        /*console.log('📊 Resultados:', { 
          budgets: budgets.length, 
          transactions: transactions.length 
        });*/

        if (budgets.length === 0) {
          // No hay presupuesto, guardar directamente sin alertas
          //console.log('✅ No hay presupuesto configurado, guardando...');
          this.saveTransaction(formData);
          return;
        }

        const budget = budgets[0];
        
        // Calcular gasto actual (excluyendo la transacción que estamos editando)
        let currentSpent = transactions.reduce((sum, t) => {
          // Si estamos editando, excluir el monto original de esta transacción
          if (this.isEditMode && t.id === this.transaccionId) {
            return sum;
          }
          return sum + t.monto;
        }, 0);
        
        const newAmount = parseFloat(formData.monto);
        const totalAfter = currentSpent + newAmount;
        const percentageUsed = (totalAfter / budget.monto) * 100;
        const remaining = budget.monto - totalAfter;

        /*console.log('💰 Análisis de presupuesto:', {
          limite: budget.monto,
          gastadoActual: currentSpent,
          nuevo: newAmount,
          totalDespues: totalAfter,
          porcentaje: percentageUsed,
          restante: remaining,
          excede: totalAfter > budget.monto,
          esEdicion: this.isEditMode
        });*/

        if (totalAfter > budget.monto) {
          // BLOQUEAR: Excede el presupuesto - Mostrar MODAL
          //console.log('🚫 ¡Presupuesto excedido! Mostrando modal.');
          
          this.budgetData = {
            categoryName: formData.categoria,
            budgetLimit: budget.monto,
            currentSpent: currentSpent,
            newAmount: newAmount
          };
          this.isBudgetWarningOpen = true;
          this.loading = false;
          return; // NO guardar
        } else {
          // No excede, pero mostrar alertas según el porcentaje
          //console.log('✅ Dentro del presupuesto, guardando...');
          
          if (percentageUsed >= 90) {
            // Alerta crítica: 90% o más
            alert(`⚠️ ¡ATENCIÓN! Con este gasto alcanzarás el ${percentageUsed.toFixed(1)}% de tu presupuesto.\n\n` +
                  `📊 Presupuesto: $${budget.monto.toFixed(2)}\n` +
                  `💸 Gastado: $${currentSpent.toFixed(2)}\n` +
                  `➕ Nuevo gasto: $${newAmount.toFixed(2)}\n` +
                  `💰 Te quedará disponible: $${remaining.toFixed(2)}`);
          } else if (percentageUsed >= 70) {
            // Advertencia: 70-89%
            alert(`⚡ Advertencia: Con este gasto alcanzarás el ${percentageUsed.toFixed(1)}% de tu presupuesto.\n\n` +
                  `Te quedarán $${remaining.toFixed(2)} disponibles de $${budget.monto.toFixed(2)}`);
          } else {
            // Información: menos del 70%
            alert(`✅ Gasto registrado correctamente.\n\n` +
                  `💰 Presupuesto disponible: $${remaining.toFixed(2)} de $${budget.monto.toFixed(2)}\n` +
                  `📊 Has usado el ${percentageUsed.toFixed(1)}% de tu presupuesto`);
          }
          
          this.saveTransaction(formData);
        }
      },
      error: (err) => {
        console.error('❌ Error al verificar presupuesto:', err);
        // En caso de error, continuar con la transacción
        this.saveTransaction(formData);
      }
    });
  }

  // Cancelar el modal de presupuesto excedido
  onCancelBudgetWarning() {
    this.isBudgetWarningOpen = false;
  }

  // Guardar transacción
  saveTransaction(formData: any) {
    this.loading = true;

    // Convertir usuarioId a número si es string
    const transactionData = {
      ...formData,
      usuarioId: typeof formData.usuarioId === 'string' ? parseInt(formData.usuarioId, 10) : formData.usuarioId,
      monto: typeof formData.monto === 'string' ? parseFloat(formData.monto) : formData.monto
    };

    if (this.isEditMode && this.transaccionId) {
      // Actualizar
      this.txSvc.update(this.transaccionId, transactionData).subscribe({
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
      this.txSvc.create(transactionData).subscribe({
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