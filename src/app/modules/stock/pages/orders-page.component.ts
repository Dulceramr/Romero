import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Order } from '../../../core/models/orders.model';
import { OrdersService } from '../services/orders.service';
import { IStock } from '../../../core/models/stock.model';
import { StockService } from '../services/stock.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-orders-page',
  templateUrl: './orders-page.component.html',
  styleUrl: './orders-page.component.scss'
})
export class OrdersPageComponent implements OnInit {
  products: IStock[] = []; 
  isLoading = true; // Para mostrar un spinner
// Formulario reactivo
  orderForm = this.fb.group({
    productId: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    destination: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private stockService: StockService,
    private ordersService: OrdersService
  ) {}

   ngOnInit(): void {
   // this.loadProducts();
  }
/*
  loadProducts(): void {
    this.isLoading = true;
    this.stockService.getStock().subscribe({
      next: (products) => {
        this.products = products;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error loading products', err);
        this.isLoading = false;
      }
    });
  }
    */

  onSubmit(): void {
    if (this.orderForm.valid) {
      const formValue = this.orderForm.value;
      const newOrder: Order = {
        productId: Number(formValue.productId), // Convertir a número
        quantity: formValue.quantity || 1, // Valor por defecto si es null/undefined
        destination: formValue.destination || '', // Valor por defecto
        status: 'pending'
      };
      
      this.ordersService.createOrder(newOrder).subscribe({
        next: () => alert('¡Orden creada!'),
        error: (err: HttpErrorResponse) => console.error('Error:', err)
      });
    }
  }
}