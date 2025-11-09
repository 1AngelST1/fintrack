import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  // Usamos signals de Angular para reactividad
  // Iniciar colapsado en móvil, expandido en desktop
  isCollapsed = signal(this.isMobile());

  private isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= 768;
  }

  toggle() {
    this.isCollapsed.update(value => !value);
  }

  collapse() {
    this.isCollapsed.set(true);
  }

  expand() {
    this.isCollapsed.set(false);
  }
}
