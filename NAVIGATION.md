# Estructura de Navegación - Fintrack2

## 📋 Resumen

La aplicación ahora tiene dos layouts claramente diferenciados:

### 🌐 Layout Público (Sin autenticación)
- **Landing Page** (`/`)
- **Login** (`/auth/login`)
- **Registro** (`/auth/register`)

**Características:**
- Sin navbar ni sidebar
- Si el usuario ya está autenticado, redirige automáticamente al dashboard
- Diseño minimalista para la experiencia de entrada

### 🔒 Layout Privado (Requiere autenticación)
- **Dashboard** (`/dashboard`)
- **Transacciones** (`/transactions`, `/transactions/form`)
- **Categorías** (`/categories` - solo admin)
- **Reportes** (`/reports`)
- **Perfil** (`/profile`)

**Características:**
- Incluye navbar, sidebar y footer
- Todas las rutas están protegidas por `AuthGuard`
- Las rutas de categorías tienen protección adicional de `RoleGuard` (solo admin)

## 🛡️ Guards Implementados

1. **AuthGuard** - Protege rutas privadas
   - Redirige a `/auth/login` si no está autenticado
   - Guarda la URL solicitada para redirigir después del login

2. **PublicGuard** - Protege rutas públicas
   - Redirige a `/dashboard` si ya está autenticado
   - Evita que usuarios logueados vean login/registro

3. **RoleGuard** - Protección por roles
   - Valida roles específicos (ej: admin para categorías)

## 🚀 Flujo de Navegación

### Usuario No Autenticado
```
/ (Landing) → /auth/login → Login exitoso → /dashboard
```

### Usuario Autenticado
```
Cualquier ruta pública (/auth/login) → Redirige a /dashboard
/dashboard → Navega libremente por rutas privadas
Logout → Redirige a /
```

## 📁 Estructura de Archivos

```
src/app/
├── layouts/
│   ├── public-layout/      # Layout para rutas públicas
│   └── private-layout/     # Layout para rutas privadas (con navbar/sidebar)
├── shared/
│   └── guards/
│       ├── auth.guard.ts      # Protege rutas privadas
│       ├── public.guard.ts    # Protege rutas públicas
│       └── role.guard.ts      # Protege por roles
└── app.routes.ts              # Configuración de rutas
```

## 🔧 Lazy Loading

Todas las rutas utilizan lazy loading para optimizar el rendimiento:
- Las vistas se cargan solo cuando se navega a ellas
- Mejora el tiempo de carga inicial de la aplicación

## 💡 Notas Importantes

- El token se guarda en `localStorage` con la clave `token`
- El usuario se guarda en `localStorage` con la clave `user`
- Al hacer logout, se limpian ambos datos y se redirige a la landing page
