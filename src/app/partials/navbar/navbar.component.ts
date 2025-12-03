import { Component, inject, OnInit, OnDestroy } from '@angular/core'; // Agrega OnDestroy
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SidebarService } from '../../services/sidebar.service';
import { Usuario } from '../../shared/interfaces/usuario';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs'; // Importa Subscription

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  sidebarService = inject(SidebarService);
  currentUser: Usuario | null = null;
  userSubscription?: Subscription; // Para guardar la suscripción

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // CAMBIO CLAVE: Nos suscribimos a user$
    // Cada vez que ocurra un login, logout o updateProfile, 
    // este código se ejecutará automáticamente y actualizará la vista.
    this.userSubscription = this.auth.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy() {
    // Buena práctica: desuscribirse cuando el componente se destruye
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  onLogout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }
}