import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      tipo: ['Gasto', Validators.required],
      categoria: ['', Validators.required],
      monto: [0, [Validators.required, Validators.min(1)]],
      fecha: ['', Validators.required],
      descripcion: ['']
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log('Movimiento:', this.form.value);
  }

  get f() { return this.form.controls; }
}
