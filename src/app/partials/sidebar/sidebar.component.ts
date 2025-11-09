import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../services/sidebar.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  sidebarService = inject(SidebarService);
  authService = inject(AuthService);
  isAdmin: boolean = false;

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.isAdmin = user?.rol === 'admin';
  }

  onLinkClick() {
    // En móvil, cerrar el sidebar al hacer clic en un enlace
    if (window.innerWidth <= 768) {
      this.sidebarService.toggle();
    }
  }
}
