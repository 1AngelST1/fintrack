import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  form: FormGroup;
  errorMsg = '';
  successMsg = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmar: ['', Validators.required],
      rol: ['usuario']
    }, { validators: this.passwordMatch });
  }

  passwordMatch(form: FormGroup) {
    const pass = form.get('password')?.value;
    const confirm = form.get('confirmar')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  get f() { return this.form.controls; }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.auth.register(this.form.value).subscribe({
      next: () => {
        this.successMsg = 'Cuenta creada correctamente';
        setTimeout(() => this.router.navigate(['/auth/login']), 1500);
      },
      error: () => this.errorMsg = 'Error al registrar usuario'
    });
  }
}