import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CategoriesService } from '../../../services/categories.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})

export class FormComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private categoriesService: CategoriesService,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      tipo: ['Gasto', Validators.required],
      color: ['#4f8ef7', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    const categoria = {
      ...this.form.value,
      usuarioId: currentUser?.id,
      activo: true
    };

    this.categoriesService.create(categoria).subscribe({
      next: (data) => {
        console.log('Categoría creada:', data);
        this.router.navigate(['/categories']);
      },
      error: (err) => {
        console.error('Error al crear categoría:', err);
      }
    });
  }

  get f() { return this.form.controls; }
}