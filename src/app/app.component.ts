import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG } from '@azure/msal-angular';
import { InteractionStatus, EventType, EventMessage, AuthenticationResult } from '@azure/msal-browser';
import { Subject, filter, takeUntil } from 'rxjs';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  public authService = inject(AuthService);
  private msalService = inject(MsalService);
  private broadcastService = inject(MsalBroadcastService);
  private router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    // 1. Suscribirse al observable de redirect — procesa la respuesta tras el retorno de Microsoft
    this.msalService.handleRedirectObservable().subscribe({
      next: (result: AuthenticationResult | null) => {
        if (result && result.account) {
          this.msalService.instance.setActiveAccount(result.account);
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err: unknown) => {
        console.error('Error en autenticación MSAL redirect:', err);
      }
    });

    // 2. Cuando MSAL termina de procesar cualquier interacción (InteractionStatus.None),
    //    verificamos si hay sesión activa para redirigir desde /login al dashboard.
    this.broadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        const accounts = this.msalService.instance.getAllAccounts();
        if (accounts.length > 0) {
          if (!this.msalService.instance.getActiveAccount()) {
            this.msalService.instance.setActiveAccount(accounts[0]);
          }
          const currentUrl = this.router.url;
          if (currentUrl === '/login' || currentUrl === '/' || currentUrl.startsWith('/login')) {
            this.router.navigate(['/dashboard']);
          }
        }
      });

    // 3. Escuchar el evento LOGIN_SUCCESS como respaldo adicional
    this.broadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS),
        takeUntil(this.destroy$)
      )
      .subscribe((result: EventMessage) => {
        const payload = result.payload as AuthenticationResult;
        if (payload?.account) {
          this.msalService.instance.setActiveAccount(payload.account);
          this.router.navigate(['/dashboard']);
        }
      });
  }

  onRoleChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.authService.setSimulatedRole(target.value);
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
