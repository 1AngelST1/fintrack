import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SidebarService } from '../../services/sidebar.service';
import { Usuario } from '../../shared/interfaces/usuario';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  sidebarService = inject(SidebarService);
  currentUser: Usuario | null = null;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.auth.getCurrentUser();
  }

  onLogout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }
}
