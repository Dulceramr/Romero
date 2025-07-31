import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router'; 
import { ReactiveFormsModule } from '@angular/forms';

import { StockPageComponent } from './pages/stock-page.component';
import { OrdersPageComponent } from './pages/orders-page.component';
import { StockInputComponent } from './pages/stock-input.component';
//import { StockDisplayComponent } from './components/stock-display.component';
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
   // StockDisplayComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule.forChild(stockRoutes)
  ],
  providers: [StockService]
})
export class StockModule { }