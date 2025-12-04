import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BudgetsService, Presupuesto } from '../../../services/budgets.service';
import { CategoriesService } from '../../../services/categories.service';
import { AuthService } from '../../../services/auth.service';
import { UsersService } from '../../../services/users.service';
import { Usuario } from '../../../shared/interfaces/usuario';
import { Categoria } from '../../../shared/interfaces/categoria';
import { DuplicateBudgetModalComponent } from '../../../modals/duplicate-budget-modal/duplicate-budget-modal.component';

@Component({
  selector: 'app-form',
  imports: [CommonModule, FormsModule, DuplicateBudgetModalComponent],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent implements OnInit {
  presupuesto: Presupuesto = {
    id: undefined,
    usuarioId: 0,
    categoriaId: 0,
    categoria: '',
    monto: 0,
    periodo: 'mensual'
  };

  categorias: Categoria[] = [];
  usuarios: Usuario[] = [];
  periodos: Array<'mensual' | 'anual'> = ['mensual', 'anual'];
  isEditMode: boolean = false;
  loading: boolean = false;
  currentUser: Usuario | null = null;
  isAdmin: boolean = false;

  // Modal de presupuesto duplicado
  isDuplicateModalOpen: boolean = false;
  duplicateData = {
    categoryName: '',
    existingAmount: 0,
    existingPeriod: ''
  };

  constructor(
    private budgetSvc: BudgetsService,
    private categoriesSvc: CategoriesService,
    private auth: AuthService,
    private usersSvc: UsersService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.currentUser = this.auth.getCurrentUser();
    this.isAdmin = this.currentUser?.rol === 'admin';
    
    // Si no es admin, asignamos el ID del usuario actual por defecto
    if (this.currentUser?.id) {
      this.presupuesto.usuarioId = this.currentUser.id;
    }
  }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
    }
    
    // Cargar usuarios solo si es admin
    if (this.isAdmin) {
      this.loadUsuarios();
    }
    
    // Cargar datos iniciales
    this.loadCategorias();
  }

  loadUsuarios() {
    this.usersSvc.getAll().subscribe({
      next: (users) => {
        this.usuarios = users;
      },
      error: (err) => console.error('Error al cargar usuarios:', err)
    });
  }

  loadCategorias() {
    const userId = this.presupuesto.usuarioId;
    
    if (!userId) {
      return; // Esperar a que se seleccione un usuario
    }

    this.categoriesSvc.getByUserId(userId).subscribe({
      next: (cats) => {
        // Solo permitimos presupuestos para categorías de "Gasto" activas
        this.categorias = cats.filter(c => c.tipo === 'Gasto' && c.estado);
        
        // Si estamos editando, cargamos el presupuesto DESPUÉS de tener las categorías
        const id = this.route.snapshot.params['id'];
        if (this.isEditMode && id && !this.loading) { // Evitar doble carga
          this.loadPresupuesto(+id);
        }
      },
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }

  onCategoriaChange(categoriaId: number) {
    // Asegurar conversión a número
    const catIdNum = Number(categoriaId);
    const categoria = this.categorias.find(c => c.id === catIdNum);
    if (categoria) {
      this.presupuesto.categoriaId = categoria.id!;
      this.presupuesto.categoria = categoria.nombre;
    }
  }

  onUsuarioChange(usuarioId: number) {
    this.presupuesto.usuarioId = Number(usuarioId);
    this.presupuesto.categoriaId = 0;
    this.presupuesto.categoria = '';
    this.loadCategorias();
  }

  loadPresupuesto(id: number) {
    this.loading = true;
    
    this.budgetSvc.getById(id).subscribe({
      next: (budget) => {
        // Validar permisos
        const isAdmin = this.currentUser?.rol === 'admin';
        const isOwner = budget.usuarioId === this.currentUser?.id;

        if (!isAdmin && !isOwner) {
          alert('No tienes permisos para editar este presupuesto');
          this.router.navigate(['/budgets']);
          return;
        }

        this.presupuesto = { ...budget };
        
        // Sincronizar nombre de categoría
        const categoriaIdNum = Number(budget.categoriaId);
        const categoria = this.categorias.find(c => c.id === categoriaIdNum);
        
        if (categoria) {
          this.presupuesto.categoria = categoria.nombre;
          this.presupuesto.categoriaId = categoria.id!;
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando presupuesto:', err);
        alert('Error al cargar el presupuesto');
        this.loading = false;
        this.router.navigate(['/budgets']);
      }
    });
  }

  onSubmit() {
    // Validaciones básicas
    if (!this.presupuesto.categoriaId || this.presupuesto.categoriaId === 0) {
      alert('⚠️ Debe seleccionar una categoría');
      return;
    }

    if (!this.presupuesto.monto || this.presupuesto.monto <= 0) {
      alert('⚠️ El monto debe ser mayor a 0');
      return;
    }

    if (!this.presupuesto.periodo) {
      alert('⚠️ Debe seleccionar un periodo');
      return;
    }

    this.loading = true;
    this.checkDuplicateAndSave();
  }

  checkDuplicateAndSave() {
    const targetUserId = Number(this.presupuesto.usuarioId);
    const categoriaId = Number(this.presupuesto.categoriaId); // Categoría que queremos guardar

    // Buscar si ya existe un presupuesto
    this.budgetSvc.getByCategoryAndUser(categoriaId, targetUserId)
      .subscribe({
        next: (existingBudgets) => {
          
          // --- CORRECCIÓN CLAVE AQUÍ ---
          // Aseguramos que lo que llegó del servidor REALMENTE sea de esta categoría.
          // Esto soluciona el problema si el backend devuelve más datos de los necesarios.
          const realDuplicates = existingBudgets.filter(b => Number(b.categoriaId) === categoriaId);

          // Si editamos, excluimos el presupuesto actual de la verificación
          const finalDuplicates = this.isEditMode 
            ? realDuplicates.filter(b => b.id !== this.presupuesto.id)
            : realDuplicates;

          if (finalDuplicates.length > 0) {
            this.loading = false;
            // Mostramos los datos del presupuesto que YA EXISTE
            this.duplicateData = {
              categoryName: this.presupuesto.categoria, // Nombre de la categoría actual
              existingAmount: finalDuplicates[0].monto,
              existingPeriod: finalDuplicates[0].periodo
            };
            this.isDuplicateModalOpen = true;
            return;
          }

          // Si no hay duplicados reales, guardamos
          this.saveBudget();
        },
        error: (err) => {
          console.error('Error verificando duplicados:', err);
          // En caso de error de red, intentamos guardar igual y que el backend decida
          this.saveBudget();
        }
      });
  }

  saveBudget() {
    this.loading = true;

    // 1. DEFINICIÓN DE LA VARIABLE QUE FALTABA
    // Preparamos el objeto asegurando que los IDs y montos sean números
    const presupuestoToSave = {
      ...this.presupuesto,
      usuarioId: Number(this.presupuesto.usuarioId),
      categoriaId: Number(this.presupuesto.categoriaId),
      monto: parseFloat(this.presupuesto.monto.toString())
    };

    // 2. DECIDIR SI ES CREAR O ACTUALIZAR
    const request = (this.isEditMode && this.presupuesto.id)
      ? this.budgetSvc.update(this.presupuesto.id, presupuestoToSave)
      : this.budgetSvc.create(presupuestoToSave);

    // 3. EJECUTAR LA PETICIÓN
    request.subscribe({
      next: () => {
        alert(this.isEditMode ? '✅ Presupuesto actualizado correctamente' : '✅ Presupuesto creado correctamente');
        this.router.navigate(['/budgets']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al guardar:', err);
        
        // Manejo de errores específicos del Backend
        if (err.status === 400 && err.error?.non_field_errors) {
           alert('⚠️ ' + err.error.non_field_errors[0]);
        } else if (err.status === 400 && err.error?.detail) {
           alert('⚠️ ' + err.error.detail);
        } else {
           alert('❌ Error al guardar el presupuesto. Verifica los datos.');
        }
      }
    });
  }

  closeDuplicateModal() {
    this.isDuplicateModalOpen = false;
  }

  onCancel() {
    this.router.navigate(['/budgets']);
  }
}