import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StockPageComponent } from './pages/stock-page.component';



@NgModule({
  declarations: [StockPageComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([ // Configura rutas hijas
      { path: '', component: StockPageComponent }, // Ruta principal del módulo
      // Añadir más rutas de ser necesario.
    ])
  ]
})
export class StockModule { }
