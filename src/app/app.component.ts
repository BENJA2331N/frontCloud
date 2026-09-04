import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  constructor(private msal: MsalService) {}

  ngOnInit(): void {
    this.msal.handleRedirectObservable().subscribe();
  }

  isLoggedIn(): boolean {
    return this.msal.instance.getAllAccounts().length > 0;
  }

  login(): void {
    this.msal.loginRedirect({
      scopes: ['openid', 'profile', 'User.Read'],
      prompt: 'select_account'
    });
  }

  logout(): void {
    this.msal.logoutRedirect();
  }

  getAccountName(): string {
    const accounts = this.msal.instance.getAllAccounts();
    return accounts.length > 0 ? (accounts[0].name || accounts[0].username) : '';
  }

  getAccountEmail(): string {
    const accounts = this.msal.instance.getAllAccounts();
    return accounts.length > 0 ? accounts[0].username : '';
  }
}
