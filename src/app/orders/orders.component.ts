import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrdersService, Order } from './orders.service';
import { CatalogService, Product } from '../catalog/catalog.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  private ordersService = inject(OrdersService);
  private catalogService = inject(CatalogService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  authService = inject(AuthService);

  orders: Order[] = [];
  products: Product[] = [];
  selectedProduct: Product | null = null;
  nuevoProductoId = 0;
  nuevaCantidad = 1;
  nuevoPrecioUnitario = 0;
  loading = false;
  feedbackMessage = '';

  ngOnInit(): void {
    this.cargarCatalogo();
    this.cargarPedidos();
    this.verificarQueryParams();
  }

  cargarCatalogo() {
    this.catalogService.getAll().subscribe({
      next: (prods) => {
        this.products = prods || [];
        // Si venía un queryParam y ya cargó el catálogo, sincronizar
        if (this.nuevoProductoId) {
          this.onProductSelected(this.nuevoProductoId);
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar catálogo en órdenes', err)
    });
  }

  verificarQueryParams() {
    this.route.queryParams.subscribe((params) => {
      if (params['productoId']) {
        this.nuevoProductoId = Number(params['productoId']);
        if (params['precio']) {
          this.nuevoPrecioUnitario = Number(params['precio']);
        }
        if (this.products.length > 0) {
          this.onProductSelected(this.nuevoProductoId);
        }
        this.cdr.detectChanges();
      }
    });
  }

  onProductSelected(prodId: number) {
    const id = Number(prodId);
    this.selectedProduct = this.products.find((p) => p.id === id) || null;
    if (this.selectedProduct) {
      this.nuevoProductoId = this.selectedProduct.id!;
      this.nuevoPrecioUnitario = this.selectedProduct.precio;
      if (this.nuevaCantidad <= 0) this.nuevaCantidad = 1;
      this.cdr.detectChanges();
    }
  }

  get totalCalculado(): number {
    return (this.nuevaCantidad || 0) * (this.nuevoPrecioUnitario || 0);
  }

  get canCreateOrder(): boolean {
    return this.authService.isAdmin() || this.authService.isOperador();
  }

  cargarPedidos() {
    this.loading = true;
    // Operador ve todas las órdenes; Cliente y Admin ven sus propias órdenes
    const obs = this.authService.isOperador()
      ? this.ordersService.getAll()
      : this.ordersService.getMine();

    obs.subscribe({
      next: (data) => {
        this.orders = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando pedidos', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  crearPedido() {
    if (!this.nuevoProductoId || this.nuevaCantidad <= 0 || this.nuevoPrecioUnitario <= 0) {
      this.showFeedback('Por favor selecciona un producto válido y una cantidad mayor a 0');
      return;
    }

    const nuevo: Order = {
      items: [{
        productoId: this.nuevoProductoId,
        cantidad: this.nuevaCantidad,
        precioUnitario: this.nuevoPrecioUnitario
      }]
    };

    this.ordersService.create(nuevo).subscribe({
      next: () => {
        this.nuevoProductoId = 0;
        this.selectedProduct = null;
        this.nuevaCantidad = 1;
        this.nuevoPrecioUnitario = 0;
        this.showFeedback('¡Pedido creado exitosamente!');
        this.cargarPedidos();
      },
      error: (err) => {
        console.error('Error creando pedido', err);
        this.showFeedback('Error al crear el pedido en el servidor');
      }
    });
  }

  cambiarEstado(id: number, nuevoEstado: string) {
    this.ordersService.updateStatus(id, nuevoEstado).subscribe({
      next: () => {
        this.showFeedback(`Estado de la orden #${id} actualizado a ${nuevoEstado}`);
        this.cargarPedidos();
      },
      error: (err) => {
        console.error('Error cambiando estado', err);
        this.showFeedback('Error al cambiar el estado del pedido');
      }
    });
  }

  getStatusClass(estado?: string): string {
    if (!estado) return 'status-creado';
    const s = estado.toLowerCase().replace('ó', 'o').replace(' ', '_');
    if (s === 'pendiente') return 'status-creado';
    return 'status-' + s;
  }

  formatStatus(estado?: string): string {
    if (!estado || estado === 'PENDIENTE') return 'CREADO';
    if (estado === 'EN_PREPARACION') return 'EN PREPARACIÓN';
    return estado;
  }

  private showFeedback(msg: string) {
    this.feedbackMessage = msg;
    setTimeout(() => (this.feedbackMessage = ''), 3500);
  }
}

