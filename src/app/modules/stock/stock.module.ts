import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router'; 
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';

import { StockPageComponent } from './pages/stock-page.component';
import { OrdersPageComponent } from './pages/orders-page.component';
import { StockInputComponent } from './pages/stock-input.component';
import { QuantityInputComponent } from './components/quantity-input.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { StockService } from './services/stock.service';

const stockRoutes: Routes = [
  { path: '', component: StockPageComponent }, // Ruta relativa: /stock
  { path: 'orders', component: OrdersPageComponent } // Ruta relativa: /stock/orders
];

@NgModule({
  declarations: [
    StockPageComponent,
    OrdersPageComponent,
    StockInputComponent,
    QuantityInputComponent,
    ConfirmationDialogComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCardModule,
    MatDialogModule,
    RouterModule.forChild(stockRoutes)
  ],
  providers: [StockService]
})
export class StockModule { }