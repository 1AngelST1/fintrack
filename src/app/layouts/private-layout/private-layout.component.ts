import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../partials/navbar/navbar.component';
import { SidebarComponent } from '../../partials/sidebar/sidebar.component';
import { FooterComponent } from '../../partials/footer/footer.component';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="layout">
      <app-sidebar></app-sidebar>

      <main class="content" [class.expanded]="sidebarService.isCollapsed()">
        <router-outlet></router-outlet>
      </main>
    </div>

    <app-footer></app-footer>
  `,
  styles: [`
    .layout {
      display: flex;
      min-height: calc(100vh - 60px);
      margin-top: 60px; /* Altura del navbar fixed */
      position: relative;
    }

    .content {
      flex: 1;
      margin-left: 220px; /* Ancho del sidebar expandido */
      padding: 2rem;
      background: #f5f5f5;
      transition: margin-left 0.3s ease;
      min-height: calc(100vh - 60px);

      &.expanded {
        margin-left: 60px; /* Ancho del sidebar colapsado */
      }
    }

    @media (max-width: 768px) {
      .content {
        margin-left: 0;

        &.expanded {
          margin-left: 0;
        }
      }
    }
  `]
})
export class PrivateLayoutComponent {
  sidebarService = inject(SidebarService);
}
