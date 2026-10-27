import { Injectable, inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  public msalService = inject(MsalService);

  login(): void {
    // Para el login inicial en Entra ID usamos scopes estándar.
    // Los scopes de la API protegida ('api://...') solo se usan para llamadas al backend
    // mediante el MsalInterceptor, evitando que el login falle si el scope aún no está expuesto en Azure.
    this.msalService.loginRedirect({
      scopes: ['user.read', 'openid', 'profile']
    });
  }

  logout(): void {
    this.msalService.logoutRedirect({
      postLogoutRedirectUri: environment.azure.postLogoutRedirectUri
    });
  }

  getActiveAccount() {
    return this.msalService.instance.getActiveAccount();
  }

  isLoggedIn(): boolean {
    return !!this.getActiveAccount() || this.msalService.instance.getAllAccounts().length > 0;
  }

  getUserName(): string {
    const account = this.getActiveAccount() || this.msalService.instance.getAllAccounts()[0];
    return account?.name || account?.username || 'Usuario';
  }

  getUserEmail(): string {
    const account = this.getActiveAccount() || this.msalService.instance.getAllAccounts()[0];
    return account?.username || '';
  }

  private simulatedRole: string | null = localStorage.getItem('pedidos360_simulated_role');

  getRoles(): string[] {
    // Si no está autenticado, su único rol posible es CLIENTE (Modo Invitado / Consulta)
    if (!this.isLoggedIn()) {
      return ['CLIENTE'];
    }
    if (this.simulatedRole) {
      return [this.simulatedRole.toUpperCase()];
    }
    const account = this.getActiveAccount() || this.msalService.instance.getAllAccounts()[0];
    const roles: string[] = (account?.idTokenClaims as any)?.roles || [];
    if (roles.length === 0) {
      // Si el usuario corporativo inicia sesión pero aún no tiene roles en Azure, por defecto es ADMIN
      return ['ADMIN'];
    }
    return roles.map(r => r.toUpperCase());
  }

  /** Scopes (claim 'scp') presentes en el idToken; vacío si el idToken no los incluye. */
  getScopes(): string[] {
    const account = this.getActiveAccount() || this.msalService.instance.getAllAccounts()[0];
    const scp: string = (account?.idTokenClaims as any)?.scp || '';
    return scp ? scp.split(' ').filter(s => !!s) : [];
  }

  /** Scopes concedidos en el accessToken de la API protegida (obtenidos silenciosamente con MSAL). */
  async getAccessTokenScopes(): Promise<string[]> {
    const account = this.getActiveAccount() || this.msalService.instance.getAllAccounts()[0];
    if (!account) {
      return [];
    }
    try {
      const result = await this.msalService.instance.acquireTokenSilent({
        account,
        scopes: environment.azure.protectedResourceScopes
      });
      return result.scopes || [];
    } catch {
      return [];
    }
  }

  setSimulatedRole(role: string | null): void {
    this.simulatedRole = role;
    if (role) {
      localStorage.setItem('pedidos360_simulated_role', role);
    } else {
      localStorage.removeItem('pedidos360_simulated_role');
    }
  }

  getSimulatedRole(): string | null {
    return this.simulatedRole;
  }

  hasRole(role: string): boolean {
    const cleanRole = role.toUpperCase().replace(/^ROLE_/, '');
    const currentRoles = this.getRoles().map(r => r.replace(/^ROLE_/, ''));
    return currentRoles.includes(cleanRole);
  }

  isAdmin(): boolean {
    // Solo puede ser ADMIN si está autenticado
    return this.isLoggedIn() && this.hasRole('ADMIN');
  }

  isOperador(): boolean {
    // Solo puede ser OPERADOR si está autenticado
    return this.isLoggedIn() && this.hasRole('OPERADOR');
  }

  isCliente(): boolean {
    // Es CLIENTE si no está logueado (invitado) o si está logueado con rol CLIENTE
    return !this.isLoggedIn() || this.hasRole('CLIENTE');
  }

  getUserId(): string | undefined {
    return (this.getActiveAccount() || this.msalService.instance.getAllAccounts()[0])?.homeAccountId;
  }
}
