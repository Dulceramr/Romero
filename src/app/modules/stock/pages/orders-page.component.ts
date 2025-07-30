import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Order } from '../../../core/models/orders.model';
import { OrdersService } from '../services/orders.service';
import { StockService } from '../services/stock.service';

@Component({
  selector: 'app-orders-page',
  templateUrl: './orders-page.component.html',
  styleUrl: './orders-page.component.scss'
})
export class OrdersPageComponent {
// Formulario reactivo
  orderForm = this.fb.group({
    productId: ['', Validators.required],
    quantity: [0, [Validators.required, Validators.min(1)]],
    destination: ['', Validators.required]
  });

    // Lista de productos disponibles (desde stock)
   products$ = this.stockService.getStock();

  constructor(
    private fb: FormBuilder,
    private ordersService: OrdersService,
    private stockService: StockService
  ) {}

  onSubmit(): void {
    if (this.orderForm.valid) {
      const newOrder: Order = {
        ...this.orderForm.value,
        status: 'pending'
      };
      this.ordersService.createOrder(newOrder).subscribe({
        next: () => alert('¡Orden creada!'),
        error: (err) => console.error('Error:', err)
      });
    }
  }
}
