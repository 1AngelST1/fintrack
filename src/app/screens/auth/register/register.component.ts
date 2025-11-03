import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged, first } from 'rxjs/operators';

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
  isLoading = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      correo: ['', 
        {
          validators: [Validators.required, Validators.email],
          asyncValidators: [this.emailExistsValidator()],
          updateOn: 'blur' // Valida al perder el foco, no en cada tecla
        }
      ],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmar: ['', Validators.required],
      rol: ['usuario']
    }, { validators: this.passwordMatch });
  }

  /** Validador asíncrono para verificar si el correo ya existe */
  emailExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      return this.auth.checkEmailExists(control.value).pipe(
        debounceTime(500),
        distinctUntilChanged(),
        map(exists => exists ? { emailExists: true } : null),
        catchError(() => of(null)),
        first()
      );
    };
  }

  passwordMatch(form: FormGroup) {
    const pass = form.get('password')?.value;
    const confirm = form.get('confirmar')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  get f() { return this.form.controls; }

  onSubmit() {
    // Verificar si hay validaciones asíncronas en proceso
    if (this.form.pending) {
      console.log('Esperando validación asíncrona...');
      return;
    }

    if (this.form.invalid || this.isLoading) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.auth.register(this.form.value).subscribe({
      next: () => {
        this.successMsg = 'Cuenta creada correctamente';
        this.form.reset(); // Limpiar el formulario
        setTimeout(() => this.router.navigate(['/auth/login']), 1500);
      },
      error: (err) => {
        this.errorMsg = err.message || 'Error al registrar usuario';
        this.isLoading = false;
      }
    });
  }
}