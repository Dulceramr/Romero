import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StockPageComponent } from './pages/stock-page.component';
import { OrdersPageComponent } from './pages/orders-page.component';

const routes: Routes = [
  { path: '', component: StockPageComponent }, // Ruta principal (/stock)
  { path: 'orders', component: OrdersPageComponent } // (/stock/orders)
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StockRoutingModule {}