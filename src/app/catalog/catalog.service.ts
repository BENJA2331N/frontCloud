import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Product {
  id?: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/catalog/products`;

  getAll() {
    return this.http.get<Product[]>(this.baseUrl);
  }

  create(product: Product) {
    return this.http.post<Product>(this.baseUrl, product);
  }

  update(id: number, product: Product) {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, product);
  }
  1
  delete(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
