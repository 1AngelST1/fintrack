import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  sidebarService = inject(SidebarService);

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  onLogout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }
}
