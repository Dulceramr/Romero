import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { HomeComponent } from '../modules/stock/components/home.component';
import { MatButtonModule } from '@angular/material/button';

interface NavLink {
  path: string;
  label: string;
  icon: string;
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatToolbarModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    HomeComponent,
    MatButtonModule
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {
  @ViewChild('mainContent') mainContent!: ElementRef;
  showScrollButton = false;

  navLinks: NavLink[] = [
    { path: '/stock', label: 'Stock', icon: 'science' },
    { path: '/stock/orders', label: 'Órdenes', icon: 'list_alt' }
  ];

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (window.pageYOffset > 300) {
      this.showScrollButton = true;
    } else {
      this.showScrollButton = false;
    }
  }

  scrollToMainContent(): void {
    this.mainContent.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}