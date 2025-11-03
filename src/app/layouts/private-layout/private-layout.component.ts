import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../partials/navbar/navbar.component';
import { SidebarComponent } from '../../partials/sidebar/sidebar.component';
import { FooterComponent } from '../../partials/footer/footer.component';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="layout">
      <app-sidebar></app-sidebar>

      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>

    <app-footer></app-footer>
  `,
  styles: [`
    .layout {
      display: flex;
      min-height: calc(100vh - 120px); /* ajusta según tu navbar/footer */
    }

    .content {
      flex: 1;
      padding: 2rem;
      background: #f5f5f5;
    }
  `]
})
export class PrivateLayoutComponent {}
