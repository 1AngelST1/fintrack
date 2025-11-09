import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.production';
import { Observable, throwError } from 'rxjs';
import { map, delay, switchMap } from 'rxjs/operators';
import { Usuario } from '../shared/interfaces/usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  // LOGIN SIMULADO
  login(correo: string, password: string): Observable<any> {
    return this.http.get<Usuario[]>(`${this.api}?correo=${correo}`).pipe(
      map(users => {
        const user = users[0];
        if (!user) {
          throw new Error('Usuario no encontrado');
        }
        if (user.password !== password) {
          throw new Error('Contraseña incorrecta');
        }

        // Simulamos token JWT
        const token = btoa(`${user.correo}:${new Date().getTime()}`);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        return { token, user };
      }),
      delay(500)
    );
  }

  // VERIFICAR SI CORREO YA EXISTE
  checkEmailExists(correo: string): Observable<boolean> {
    return this.http.get<Usuario[]>(`${this.api}?correo=${correo}`).pipe(
      map(users => users.length > 0)
    );
  }

  // REGISTRO
  register(user: Usuario): Observable<Usuario> {
    // Primero verificamos si el correo ya existe
    return this.checkEmailExists(user.correo).pipe(
      switchMap(exists => {
        if (exists) {
          return throwError(() => new Error('El correo ya está registrado'));
        }
        return this.http.post<Usuario>(this.api, user);
      }),
      delay(500)
    );
  }

  // LOGOUT 
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // OBTENER USUARIO ACTUAL 
  getCurrentUser(): Usuario | null {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }

  // COMPROBAR SESIÓN 
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // ACTUALIZAR PERFIL
  updateProfile(userId: number, updates: Partial<Usuario>): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.api}/${userId}`, updates).pipe(
      map(updatedUser => {
        // Actualizar usuario en localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }),
      delay(300)
    );
  }
}
