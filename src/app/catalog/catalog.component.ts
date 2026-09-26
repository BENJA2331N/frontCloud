import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CatalogService, Product } from './catalog.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css'
})
export class CatalogComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  authService = inject(AuthService);

  products: Product[] = [];
  nuevoProducto: Product = { nombre: '', precio: 0, stock: 0 };
  loading = false;
  feedbackMessage = '';

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos() {
    console.log('[CatalogComponent] Iniciando cargarProductos...');
    this.loading = true;
    this.catalogService.getAll().subscribe({
      next: (data) => {
        console.log('[CatalogComponent] Productos recibidos con éxito:', data);
        this.products = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[CatalogComponent] Error cargando productos:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  crearProducto() {
    if (!this.nuevoProducto.nombre.trim() || this.nuevoProducto.precio <= 0) return;
    this.catalogService.create(this.nuevoProducto).subscribe({
      next: () => {
        this.nuevoProducto = { nombre: '', precio: 0, stock: 0 };
        this.showFeedback('¡Producto agregado exitosamente!');
        this.cargarProductos();
      },
      error: (err) => {
        console.error('Error creando producto', err);
        this.showFeedback('Error al agregar el producto');
      }
    });
  }

  ajustarStock(producto: Product, delta: number) {
    if (!producto.id) return;
    const nuevoStock = Math.max(0, (producto.stock || 0) + delta);
    const updated: Product = { ...producto, stock: nuevoStock };
    this.catalogService.update(producto.id, updated).subscribe({
      next: () => {
        producto.stock = nuevoStock;
        this.showFeedback(`Stock de "${producto.nombre}" actualizado a ${nuevoStock}`);
      },
      error: (err) => {
        console.error('Error actualizando stock', err);
        this.showFeedback('Error al actualizar el stock');
      }
    });
  }

  eliminarProducto(id: number) {
    if (!confirm('¿Seguro que deseas eliminar este producto del catálogo?')) return;
    this.catalogService.delete(id).subscribe({
      next: () => {
        this.showFeedback('Producto eliminado correctamente');
        this.cargarProductos();
      },
      error: (err) => {
        console.error('Error eliminando producto', err);
        this.showFeedback('Error al eliminar producto');
      }
    });
  }

  pedirProducto(producto: Product) {
    this.router.navigate(['/orders'], { queryParams: { productoId: producto.id, precio: producto.precio } });
  }

  private showFeedback(msg: string) {
    this.feedbackMessage = msg;
    setTimeout(() => (this.feedbackMessage = ''), 3500);
  }
}

