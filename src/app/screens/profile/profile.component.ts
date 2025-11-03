import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Usuario } from '../../shared/interfaces/usuario';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  form: FormGroup;
  currentUser: Usuario | null = null;
  showPassword = false;
  
  // Alert state
  showAlert = false;
  alertMessage = '';
  alertType: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      apellidos: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.form.patchValue({
      nombre: this.currentUser.nombre,
      apellidos: this.currentUser.apellidos
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.currentUser || !this.currentUser.id) return;

    const updates: Partial<Usuario> = {
      nombre: this.form.value.nombre,
      apellidos: this.form.value.apellidos
    };

    // Solo actualizar password si se ingresó uno nuevo
    if (this.form.value.password) {
      updates.password = this.form.value.password;
    }

    this.authService.updateProfile(this.currentUser.id, updates).subscribe({
      next: (updatedUser: Usuario) => {
        this.currentUser = updatedUser;
        this.showAlertMessage('Perfil actualizado exitosamente', 'success');
        
        // Limpiar campo de contraseña
        this.form.patchValue({ password: '' });
        this.form.markAsUntouched();
      },
      error: (error: any) => {
        console.error('Error al actualizar perfil:', error);
        this.showAlertMessage('Error al actualizar el perfil', 'error');
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  showAlertMessage(message: string, type: 'success' | 'error') {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }

  closeAlert() {
    this.showAlert = false;
  }

  get f() { return this.form.controls; }
  get isAdmin() { return this.currentUser?.rol === 'admin'; }
}
