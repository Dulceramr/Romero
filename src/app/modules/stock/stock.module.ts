import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockPageComponent } from './pages/stock-page.component';
import { OrdersPageComponent } from './pages/orders-page.component';
import { StockRoutingModule } from './stock-routing.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    StockPageComponent,
    OrdersPageComponent 
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StockRoutingModule
  ]
})
export class StockModule { }
