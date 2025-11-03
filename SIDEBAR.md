# Sidebar Colapsable - Fintrack2

## 🎯 Características Implementadas

### 1. **Sidebar Colapsable**
- ✅ Sidebar que se puede expandir/colapsar
- ✅ Animaciones suaves con transiciones CSS
- ✅ Estado persistente con Angular Signals
- ✅ Botón de toggle integrado en el sidebar
- ✅ Botón adicional en el navbar (especialmente útil en móviles)

### 2. **Layout con Flexbox**
- ✅ Uso correcto de flexbox para el diseño
- ✅ Contenido principal que se ajusta automáticamente
- ✅ Sidebar fijo con scroll independiente
- ✅ Navbar sticky en la parte superior

### 3. **Responsive Design**
- ✅ En móviles (< 768px), el sidebar se oculta por defecto
- ✅ Los links del navbar se ocultan en móvil
- ✅ El botón de menú es más visible en pantallas pequeñas

## 📦 Archivos Creados/Modificados

### Nuevos Archivos:
- `src/app/services/sidebar.service.ts` - Servicio para manejar el estado del sidebar

### Archivos Modificados:
- `src/app/partials/sidebar/sidebar.component.ts` - Lógica del sidebar
- `src/app/partials/sidebar/sidebar.component.html` - Template con iconos y textos separados
- `src/app/partials/sidebar/sidebar.component.scss` - Estilos con animaciones
- `src/app/partials/navbar/navbar.component.ts` - Agregado método toggleSidebar
- `src/app/partials/navbar/navbar.component.html` - Botón de menú hamburguesa
- `src/app/partials/navbar/navbar.component.scss` - Estilos mejorados con flexbox
- `src/app/layouts/private-layout/private-layout.component.ts` - Layout con margen dinámico

## 🎨 Estados del Sidebar

### Estado Expandido (por defecto):
- Ancho: `220px`
- Muestra iconos + texto
- Contenido principal tiene `margin-left: 220px`

### Estado Colapsado:
- Ancho: `60px`
- Solo muestra iconos
- Contenido principal tiene `margin-left: 60px`
- Los textos se ocultan con `opacity: 0`

## 🖱️ Cómo Usar

### Colapsar/Expandir el Sidebar:
1. **Desde el Sidebar**: Click en el botón `◀` o `▶` dentro del sidebar
2. **Desde el Navbar**: Click en el botón `☰` (hamburguesa) en el navbar

### Navegación:
- Los links del sidebar tienen efecto hover
- El link activo se marca con color de acento
- En estado colapsado, solo se ven los iconos pero siguen siendo clickeables

## 🔧 SidebarService API

```typescript
import { SidebarService } from './services/sidebar.service';

// Inyectar el servicio
sidebarService = inject(SidebarService);

// Métodos disponibles:
sidebarService.toggle();    // Alternar estado
sidebarService.collapse();  // Colapsar
sidebarService.expand();    // Expandir

// Leer estado (Signal):
sidebarService.isCollapsed() // true/false
```

## 🎯 Flexbox Layout Estructura

```
┌─────────────────────────────────────────┐
│           NAVBAR (sticky)               │
│  [☰] Fintrack2    Dashboard Reportes.. │
└─────────────────────────────────────────┘
┌──────────┬──────────────────────────────┐
│          │                              │
│ SIDEBAR  │   CONTENIDO PRINCIPAL        │
│ (fixed)  │   (flex: 1, margin-left)     │
│          │                              │
│  🏠 Dash │   <router-outlet>            │
│  💰 Mov  │                              │
│  📂 Cat  │                              │
│          │                              │
└──────────┴──────────────────────────────┘
```

## 📱 Responsive Breakpoints

- **Desktop** (> 768px): Sidebar visible por defecto
- **Mobile** (≤ 768px): 
  - Sidebar oculto por defecto
  - Se muestra al hacer click en el botón ☰
  - Links del navbar ocultos (solo botón salir)

## 🎨 Personalización

### Cambiar ancho del sidebar:
Edita en `sidebar.component.scss`:
```scss
.sidebar {
  width: 220px; // Ancho expandido
  
  &.collapsed {
    width: 60px; // Ancho colapsado
  }
}
```

Y en `private-layout.component.ts`:
```scss
.content {
  margin-left: 220px; // Debe coincidir con ancho expandido
  
  &.expanded {
    margin-left: 60px; // Debe coincidir con ancho colapsado
  }
}
```

### Cambiar velocidad de animación:
```scss
transition: width 0.3s ease; // Cambiar 0.3s por el tiempo deseado
```

## ✨ Características Adicionales

- **Animaciones suaves**: Todas las transiciones usan `ease` para movimientos naturales
- **Hover effects**: Los links cambian de color al pasar el mouse
- **Active state**: El link actual se resalta automáticamente
- **Iconos emoji**: Fáciles de cambiar por iconos de librerías como Font Awesome
- **Z-index optimizado**: El sidebar y navbar tienen z-index apropiados

## 🚀 Próximas Mejoras Posibles

- [ ] Persistir estado del sidebar en localStorage
- [ ] Agregar overlay en móviles cuando el sidebar está abierto
- [ ] Tooltips en estado colapsado mostrando el texto completo
- [ ] Animación del icono del botón hamburguesa (transformar en X)
- [ ] Soporte para temas (dark/light mode)
