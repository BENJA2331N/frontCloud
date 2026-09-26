import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  authService = inject(AuthService);

  get nombreUsuario(): string {
    const account = this.authService['msalService'].instance.getActiveAccount();
    return account?.name || account?.username || 'Usuario';
  }
}
