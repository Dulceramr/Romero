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
      productId: ['', Validators.required],
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
    // Usamos el observable de estado del StockService
    this.stockService.state$.subscribe({
      next: (state) => {
        this.stockItems = state.stocks;
        this.isLoading = false;
      },
      error: (error: Error) => {
        console.error('Error loading stock items:', error.message);
        this.isLoading = false;
      }
    });
    // Disparamos la carga de items
    this.stockService.loadStockItems();
  }

  setupFormListeners(): void {
    this.orderForm.get('productId')?.valueChanges.subscribe(() => {
      this.updateQuantityValidator();
    });
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
      const selectedProduct = this.getSelectedProduct();

      const orderData: Order = {
        productId: this.orderForm.value.productId,
        productName: selectedProduct?.name || '',
        quantity: this.orderForm.value.quantity,
        destination: this.orderForm.value.destination,
        notes: this.orderForm.value.notes || undefined,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      this.ordersService.createOrder(orderData).pipe(
        tap((createdOrder: Order) => {
          console.log('Orden creada:', createdOrder);
          alert(`Orden creada para ${createdOrder.quantity} unidades de ${createdOrder.productName}`);
        }),
        switchMap((createdOrder: Order) => {
          return this.stockService.updateStockQuantity(
            createdOrder.productId, 
            -createdOrder.quantity
          ).pipe(
            catchError((error: Error) => {
              console.error('Error actualizando stock:', error.message);
              alert('Orden creada pero error actualizando stock');
              return EMPTY;
            })
          );
        }),
        catchError((error: Error) => {
          console.error('Error creando orden:', error.message);
          alert('Error al crear la orden');
          return EMPTY;
        }),
        finalize(() => {
          this.isLoading = false;
          this.resetForm();
          this.loadStockItems(); // Recargar stock después de la operación
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