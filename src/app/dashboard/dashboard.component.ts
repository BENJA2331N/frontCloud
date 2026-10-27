import { Component, OnInit, inject, signal } from '@angular/core';
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
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);

  /** Scopes (claim 'scp') del access token de la API protegida. */
  scopes = signal<string[]>([]);

  get nombreUsuario(): string {
    const account = this.authService['msalService'].instance.getActiveAccount();
    return account?.name || account?.username || 'Usuario';
  }

  async ngOnInit(): Promise<void> {
    if (!this.authService.isLoggedIn()) {
      return;
    }
    // Scopes del idToken (si los trae) y, si no, los del access token obtenido silenciosamente con MSAL
    const fromIdToken = this.authService.getScopes();
    this.scopes.set(fromIdToken.length > 0 ? fromIdToken : await this.authService.getAccessTokenScopes());
  }
}
