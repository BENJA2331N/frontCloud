import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-wrapper">
      <div class="login-glass-card">
        <div class="login-header">
          <div class="brand-badge">
            <svg class="ms-logo" viewBox="0 0 21 21" width="28" height="28">
              <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
              <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
              <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
            </svg>
            <span class="portal-badge">Cloud Enterprise</span>
          </div>
          <h1 class="login-title">Pedidos360 Cloud</h1>
          <p class="login-subtitle">Sistema Distribuido con Autenticación Microsoft Entra ID</p>
        </div>

        <div class="login-body">
          <div class="status-indicator">
            <span class="dot"></span>
            <span>Inicio de sesión requerido</span>
          </div>

          <p class="login-desc">
            Accede de forma segura a tus pedidos, catálogo y panel de administración corporativo mediante SSO institucional.
          </p>

          <button id="login-btn" class="ms-login-button" (click)="login()">
            <svg class="btn-ms-icon" viewBox="0 0 21 21" width="20" height="20">
              <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
              <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
              <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
            </svg>
            <span>Iniciar sesión con Microsoft</span>
          </button>

          <div class="mfa-callout">
            <div class="mfa-title">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              <span>Autenticación Multifactor (MFA)</span>
            </div>
            <p class="mfa-text">
              Si se solicita segundo factor, en la pantalla de Microsoft elige <em>"Usar otra aplicación de autenticación"</em> y escanea el código con <strong>Google Authenticator</strong>.
            </p>
          </div>
        </div>

        <div class="login-footer">
          <span>Protegido por Microsoft Authentication Library (MSAL) v5 / v6</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: calc(100vh - 80px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }
    .login-glass-card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1.25rem;
      padding: 2.5rem;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
      animation: fadeIn 0.4s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .brand-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      background: rgba(15, 23, 42, 0.6);
      padding: 0.4rem 0.9rem;
      border-radius: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 1.2rem;
    }
    .portal-badge {
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      color: #94a3b8;
      text-transform: uppercase;
    }
    .login-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #f8fafc;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }
    .login-subtitle {
      font-size: 0.9rem;
      color: #94a3b8;
    }
    .status-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: #f59e0b;
      margin-bottom: 1rem;
    }
    .status-indicator .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #f59e0b;
      box-shadow: 0 0 8px #f59e0b;
    }
    .login-desc {
      font-size: 0.925rem;
      line-height: 1.5;
      color: #cbd5e1;
      text-align: center;
      margin-bottom: 1.8rem;
    }
    .ms-login-button {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 0.875rem 1.5rem;
      background: #2563eb;
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 0.75rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.4);
    }
    .ms-login-button:hover {
      background: #1d4ed8;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px 0 rgba(37, 99, 235, 0.55);
    }
    .ms-login-button:active {
      transform: translateY(0);
    }
    .mfa-callout {
      margin-top: 1.8rem;
      background: rgba(15, 23, 42, 0.6);
      border-left: 3px solid #38bdf8;
      border-radius: 0.5rem;
      padding: 0.875rem;
    }
    .mfa-title {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: #38bdf8;
      margin-bottom: 0.35rem;
    }
    .mfa-text {
      font-size: 0.8rem;
      line-height: 1.4;
      color: #94a3b8;
    }
    .mfa-text strong {
      color: #f1f5f9;
    }
    .login-footer {
      margin-top: 2rem;
      text-align: center;
      font-size: 0.75rem;
      color: #64748b;
    }
  `]
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  login(): void {
    this.authService.login();
  }
}
