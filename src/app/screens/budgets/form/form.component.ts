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
    
    if (this.currentUser?.id) {
      this.presupuesto.usuarioId = this.currentUser.id;
    }
  }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
    }
    
    // Cargar usuarios si es admin
    if (this.isAdmin) {
      this.loadUsuarios();
    }
    
    // Cargar categorías primero, luego cargar el presupuesto si es edición
    this.loadCategorias();
  }

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

  loadCategorias() {
    // Si es admin, cargar las categorías del usuario seleccionado
    // Si no es admin, cargar solo las del usuario actual
    const userId = this.presupuesto.usuarioId;
    
    if (!userId) {
      console.warn('No hay usuario seleccionado');
      return;
    }

    this.categoriesSvc.getByUserId(userId).subscribe({
      next: (cats) => {
        // Filtrar solo categorías de tipo "Gasto" y activas
        this.categorias = cats.filter(c => c.tipo === 'Gasto' && c.estado);
        
        // Si es modo edición, cargar el presupuesto después de cargar las categorías
        const id = this.route.snapshot.params['id'];
        if (this.isEditMode && id) {
          this.loadPresupuesto(+id);
        }
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
      }
    });
  }

  onCategoriaChange(categoriaId: number) {
    const categoria = this.categorias.find(c => c.id === categoriaId);
    if (categoria) {
      this.presupuesto.categoriaId = categoria.id!;
      this.presupuesto.categoria = categoria.nombre;
    }
  }

  onUsuarioChange(usuarioId: number) {
    // Cuando cambia el usuario (solo para admin), recargar las categorías de ese usuario
    this.presupuesto.usuarioId = usuarioId;
    this.presupuesto.categoriaId = 0; // Resetear la categoría seleccionada
    this.presupuesto.categoria = '';
    this.loadCategorias(); // Recargar categorías del nuevo usuario
  }

  loadPresupuesto(id: number) {
    this.loading = true;
    //console.log('📝 Cargando presupuesto ID:', id);
    //console.log('📋 Categorías disponibles:', this.categorias);
    
    this.budgetSvc.getById(id).subscribe({
      next: (budget) => {
        //console.log('💾 Presupuesto cargado:', budget);
        
        // Verificar que el usuario actual puede editar este presupuesto
        const isAdmin = this.currentUser?.rol === 'admin';
        const isOwner = budget.usuarioId === this.currentUser?.id;

        if (!isAdmin && !isOwner) {
          alert('No tienes permisos para editar este presupuesto');
          this.router.navigate(['/budgets']);
          return;
        }

        this.presupuesto = { ...budget };
        
        // Asegurar que el ID se mantiene
        //console.log('💾 ID del presupuesto después de asignación:', this.presupuesto.id);
        
        // Actualizar el nombre de la categoría desde las categorías cargadas
        //console.log('🔍 Buscando categoría con ID:', budget.categoriaId, 'Tipo:', typeof budget.categoriaId);
        //console.log('🔍 Categorías disponibles:', this.categorias.map(c => ({ id: c.id, tipo: typeof c.id, nombre: c.nombre })));
        
        // Convertir categoriaId a número para asegurar la comparación
        const categoriaIdNum = typeof budget.categoriaId === 'string' ? parseInt(budget.categoriaId) : budget.categoriaId;
        const categoria = this.categorias.find(c => c.id === categoriaIdNum);
       // console.log('✅ Categoría encontrada:', categoria);
        
        if (categoria) {
          this.presupuesto.categoria = categoria.nombre;
          this.presupuesto.categoriaId = categoria.id!;
        }
        
        //console.log('📦 Presupuesto final:', this.presupuesto);
        this.loading = false;
      },
      error: (err) => {
        //console.error('❌ Error al cargar presupuesto:', err);
        alert('Error al cargar el presupuesto');
        this.loading = false;
        this.router.navigate(['/budgets']);
      }
    });
  }

  onSubmit() {
    // Validaciones
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

    // Validar que no exista ya un presupuesto para esta categoría
    this.loading = true;
    this.checkDuplicateAndSave();
  }

  checkDuplicateAndSave() {
    // Usar el usuarioId del presupuesto (que puede ser seleccionado por admin)
    // Convertir a número si es string
    const targetUserId = typeof this.presupuesto.usuarioId === 'string' 
      ? parseInt(this.presupuesto.usuarioId, 10) 
      : this.presupuesto.usuarioId;
    
    if (!targetUserId || targetUserId === 0) {
      alert('⚠️ Debe seleccionar un usuario');
      this.loading = false;
      return;
    }

    // Convertir categoriaId a número también
    const categoriaId = typeof this.presupuesto.categoriaId === 'string'
      ? parseInt(this.presupuesto.categoriaId, 10)
      : this.presupuesto.categoriaId;

    console.log('🔍 Verificando duplicados:', { 
      isEditMode: this.isEditMode, 
      presupuestoId: this.presupuesto.id,
      categoriaId,
      targetUserId 
    });

    // Buscar presupuestos existentes para esta categoría y usuario
    this.budgetSvc.getByCategoryAndUser(categoriaId, targetUserId)
      .subscribe({
        next: (existingBudgets) => {
          //console.log('📋 Presupuestos encontrados:', existingBudgets);
          
          // Si es modo edición, excluir el presupuesto actual
          const duplicates = this.isEditMode 
            ? existingBudgets.filter(b => b.id !== this.presupuesto.id)
            : existingBudgets;

          //console.log('🔎 Duplicados después del filtro:', duplicates);

          if (duplicates.length > 0) {
            // Ya existe un presupuesto para esta categoría - mostrar modal
            this.loading = false;
            this.duplicateData = {
              categoryName: this.presupuesto.categoria,
              existingAmount: duplicates[0].monto,
              existingPeriod: duplicates[0].periodo
            };
            this.isDuplicateModalOpen = true;
            return;
          }

          // No hay duplicados, continuar con el guardado
          this.saveBudget();
        },
        error: (err) => {
          console.error('Error al verificar duplicados:', err);
          // En caso de error, continuar con el guardado
          this.saveBudget();
        }
      });
  }

  closeDuplicateModal() {
    this.isDuplicateModalOpen = false;
  }

  saveBudget() {
    this.loading = true;

    // Asegurar que categoriaId y usuarioId sean números
    const presupuestoToSave = {
      ...this.presupuesto,
      usuarioId: typeof this.presupuesto.usuarioId === 'string' 
        ? parseInt(this.presupuesto.usuarioId, 10) 
        : this.presupuesto.usuarioId,
      categoriaId: typeof this.presupuesto.categoriaId === 'string' 
        ? parseInt(this.presupuesto.categoriaId, 10) 
        : this.presupuesto.categoriaId,
      monto: typeof this.presupuesto.monto === 'string'
        ? parseFloat(this.presupuesto.monto)
        : this.presupuesto.monto
    };

    if (this.isEditMode && this.presupuesto.id) {
      // Actualizar
      this.budgetSvc.update(this.presupuesto.id, presupuestoToSave).subscribe({
        next: () => {
          alert('✅ Presupuesto actualizado correctamente');
          this.router.navigate(['/budgets']);
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          alert('❌ Error al actualizar el presupuesto');
          this.loading = false;
        }
      });
    } else {
      // Crear
      this.budgetSvc.create(presupuestoToSave).subscribe({
        next: () => {
          alert('✅ Presupuesto creado correctamente');
          this.router.navigate(['/budgets']);
        },
        error: (err) => {
          console.error('Error al crear:', err);
          alert('❌ Error al crear el presupuesto');
          this.loading = false;
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/budgets']);
  }
}
