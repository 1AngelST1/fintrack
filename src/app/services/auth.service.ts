import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment'; 
import { Observable, tap, map, catchError, throwError, BehaviorSubject } from 'rxjs';
import { Usuario } from '../shared/interfaces/usuario';

interface LoginResponse {
  token: string;
  user: Usuario;
}

interface CheckEmailResponse {
  exists: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // La URL base: http://127.0.0.1:8000/api/users
  private api = `${environment.apiUrl}/users`;

  // --- LÓGICA REACTIVA (Para actualizar Navbar en tiempo real) ---
  // 1. Inicializamos con lo que haya en localStorage (o null)
  private userSubject = new BehaviorSubject<Usuario | null>(this.getCurrentUser());
  
  // 2. Exponemos el observable para que el Navbar se suscriba
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  // --- HELPER: Obtener cabeceras con Token ---
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      // IMPORTANTE: Si usas JWT cambia 'Token' por 'Bearer'
      headers = headers.set('Authorization', `Token ${token}`);
    }
    return headers;
  }

  // --- LOGIN ---
  login(correo: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.api}/login`, { correo, password }).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          // AVISAR A LOS COMPONENTES QUE EL USUARIO CAMBIÓ
          this.userSubject.next(response.user);
        }
      }),
      catchError(error => {
        return throwError(() => new Error('Credenciales incorrectas o error en el servidor'));
      })
    );
  }

  // --- REGISTRO ---
  register(user: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.api}/register`, user).pipe(
      catchError(error => {
        let errorMsg = 'Error al registrar usuario';
        if (error.error && typeof error.error === 'object') {
          const firstKey = Object.keys(error.error)[0];
          errorMsg = `${firstKey}: ${error.error[firstKey]}`;
        }
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  // --- VERIFICAR EMAIL ---
  checkEmailExists(correo: string): Observable<boolean> {
    return this.http.get<CheckEmailResponse>(`${this.api}/check-email?correo=${correo}`).pipe(
      map(response => response.exists)
    );
  }

  // --- ACTUALIZAR PERFIL ---
  updateProfile(id: number, data: Partial<Usuario>): Observable<Usuario> {
    const headers = this.getAuthHeaders();
    
    // NOTA: Sin barra "/" al final para evitar error 404 en Django
    return this.http.patch<Usuario>(`${this.api}/${id}`, data, { headers }).pipe(
      map(user => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // IMPORTANTE: AVISAR AL NAVBAR QUE EL NOMBRE CAMBIÓ
        this.userSubject.next(updatedUser);
        
        return updatedUser;
      })
    );
  }

  // --- UTILIDADES ---
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // LIMPIAR EL ESTADO REACTIVO
    this.userSubject.next(null);
  }

  getCurrentUser(): Usuario | null {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}