import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { 
    path: 'stock',
    loadChildren: () => import('./modules/stock/stock.module').then(m => m.StockModule),
    data: { showDirect: true }
  },
  { path: '', redirectTo: '/stock', pathMatch: 'full' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }