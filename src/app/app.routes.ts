import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrdersComponent } from './orders/orders.component';
import { CatalogComponent } from './catalog/catalog.component';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'catalog', component: CatalogComponent },
  { path: 'orders', component: OrdersComponent, canActivate: [MsalGuard] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];
