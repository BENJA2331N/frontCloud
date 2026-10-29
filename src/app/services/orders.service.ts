import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface OrderItem {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}

export interface Order {
  id?: number;
  estado?: string;
  items: OrderItem[];
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/orders`;

  getMine() {
    return this.http.get<Order[]>(`${this.baseUrl}/mine`);
  }

  getAll() {
    return this.http.get<Order[]>(this.baseUrl);
  }

  create(order: Order) {
    return this.http.post<Order>(this.baseUrl, order);
  }

  updateStatus(id: number, estado: string) {
    return this.http.patch(`${this.baseUrl}/${id}/status`, { estado });
  }
}
