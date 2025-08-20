import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Order } from '../../../core/models/orders.model';
import { OrdersService } from '../services/orders.service';
import { IStock } from '../../../core/models/stock.model';
import { StockService } from '../services/stock.service';
import { switchMap, tap, catchError, finalize } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

@Component({
  selector: 'app-orders-page',
  templateUrl: './orders-page.component.html',
  styleUrls: ['./orders-page.component.scss']
})
export class OrdersPageComponent implements OnInit {
  orderForm: FormGroup;
  stockItems: IStock[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private stockService: StockService,
    private ordersService: OrdersService
  ) {
    this.orderForm = this.fb.group({
      productId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      destination: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadStockItems();
    this.setupFormListeners();
  }

loadStockItems(): void {
  this.isLoading = true;
  this.toggleForm(false);
  const palette = ['#40E0D0', '#9370DB', '#1E90FF', '#FF6B6B'];

  this.stockService.getStockItems().subscribe({
    next: (stocks: IStock[]) => {
      this.stockItems = stocks.map((item, index) => ({
        ...item,
        color: palette[index % palette.length]
      }));
      this.isLoading = false;
      this.toggleForm(true);
    },
    error: (error) => {
      console.error('Error:', error);
      this.isLoading = false;
      this.toggleForm(true);
    }
  });
}

  setupFormListeners(): void {
    this.orderForm.get('productId')?.valueChanges.subscribe(() => {
      this.updateQuantityValidator();
    });
  }

  toggleForm(enable: boolean): void {
    if (enable) {
      this.orderForm.enable();
    } else {
      this.orderForm.disable();
    }
  }

  updateQuantityValidator(): void {
    const selectedProduct = this.getSelectedProduct();
    const quantityControl = this.orderForm.get('quantity');
    
    if (selectedProduct) {
      quantityControl?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(selectedProduct.quantity)
      ]);
    } else {
      quantityControl?.setValidators([Validators.required, Validators.min(1)]);
    }
    quantityControl?.updateValueAndValidity();
  }

  getSelectedProduct(): IStock | undefined {
    const productId = this.orderForm.get('productId')?.value;
    return this.stockItems.find(item => item.id === productId);
  }

  onSubmit(): void {
    if (this.orderForm.valid) {
      this.isLoading = true;
      this.toggleForm(false);
      const selectedProduct = this.getSelectedProduct();

      const orderData: Order = {
        productId: Number(this.orderForm.value.productId),
        productName: selectedProduct?.name || '',
        quantity: this.orderForm.value.quantity,
        destination: this.orderForm.value.destination,
        notes: this.orderForm.value.notes || undefined,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      this.ordersService.createOrder(orderData).pipe(
        tap(createdOrder => {
          alert(`Orden creada para ${createdOrder.quantity} unidades de ${createdOrder.productName}`);
        }),
        switchMap(createdOrder => {
          const selectedProduct = this.getSelectedProduct();
          if (!selectedProduct) {
            return EMPTY;
          }
          const newQuantity = selectedProduct.quantity - createdOrder.quantity;
          return this.stockService.updateStock(
            Number(createdOrder.productId),
            newQuantity
          ).pipe(
            catchError(error => {
              alert('Orden creada pero error actualizando stock');
              return EMPTY;
            })
          );
        }),
        catchError(error => {
          alert('Error al crear la orden');
          return EMPTY;
        }),
        finalize(() => {
          this.isLoading = false;
          this.toggleForm(true);
          this.resetForm();
          this.loadStockItems();
        })
      ).subscribe();
    }
  }

  resetForm(): void {
    this.orderForm.reset({
      quantity: 1
    });
  }
}