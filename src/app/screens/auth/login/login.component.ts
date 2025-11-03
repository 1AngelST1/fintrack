import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  form: FormGroup;
  errorMsg = '';
  returnUrl = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    const q = this.route.snapshot.queryParamMap.get('returnUrl');
    if (q) this.returnUrl = q;
  }

  get f() { return this.form.controls; }

  onSubmit() {
    if (this.form.invalid) { 
      this.form.markAllAsTouched(); 
      return; 
    }
    
    const correo = this.form.value.correo as string;
    const password = this.form.value.password as string;
    
    this.auth.login(correo, password).subscribe({
      next: () => this.router.navigateByUrl(this.returnUrl),
      error: err => this.errorMsg = err.message || 'Error de inicio de sesión'
    });
  }
}