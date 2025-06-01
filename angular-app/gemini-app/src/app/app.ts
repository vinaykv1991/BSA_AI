import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service'; // Import ThemeService

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'NovaGem';

  constructor(private themeService: ThemeService) {
    // By injecting ThemeService here, its constructor will run when AppComponent is created.
    // The ThemeService constructor handles loading the initial theme.
    console.log('App component constructor: ThemeService injected and initialized.');
  }
}
