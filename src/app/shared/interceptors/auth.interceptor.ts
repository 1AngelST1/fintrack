import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Recuperamos el token que guardamos al hacer login
  const token = localStorage.getItem('token');

  // 2. Si existe, clonamos la petición y le pegamos el "carnet" de autorización
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        // Django espera exactamente "Token <tu_clave>"
        Authorization: `Token ${token}`
      }
    });
    return next(clonedRequest);
  }

  // 3. Si no hay token (ej. Login o Registro), la petición pasa normal
  return next(req);
};