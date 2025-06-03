import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// Angular Material Modules
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './splash-screen.html',
  styleUrls: ['./splash-screen.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplashScreenComponent implements OnInit, OnDestroy {
  private timerId: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // console.log('Splash screen initialized');
    this.timerId = setTimeout(() => {
      // console.log('Navigating to /chat from splash');
      this.router.navigate(['/chat']); // Or your default main route after splash
    }, 2500); // Adjust delay as needed (e.g., 2000-3000ms)
  }

  ngOnDestroy(): void {
    // Clear the timeout if the component is destroyed before navigation
    // (e.g., user navigates away manually, though unlikely for a splash screen)
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
    // console.log('Splash screen destroyed');
  }
}
