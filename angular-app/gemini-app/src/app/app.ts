import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service'; // Import ThemeService

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
import { QuestionForm } from './question-form/question-form'; // Import QuestionForm
import { AnswerDisplay } from './answer-display/answer-display'; // Import AnswerDisplay

@Component({
  selector: 'app-root',
  standalone: true, // Ensure App component is also marked standalone
  imports: [
    RouterOutlet,
    QuestionForm,   // Add QuestionForm to imports
    AnswerDisplay   // Add AnswerDisplay to imports
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
