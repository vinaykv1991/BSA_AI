import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api'; // Corrected path to api.ts

@Component({
  selector: 'app-question-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './question-form.html',
  styleUrl: './question-form.css'
})
export class QuestionForm {
  questionText: string = '';
  isLoading: boolean = false; // To manage loading state locally if needed, or use ApiService.loading$

  constructor(private apiService: ApiService) {
    // Optionally subscribe to loading state from ApiService
    this.apiService.loading$.subscribe(loading => this.isLoading = loading);
  }

  submitQuestion(): void {
    if (this.questionText.trim()) {
      this.apiService.getAnswer(this.questionText);
      // The ApiService now handles BehaviorSubjects for answer/error.
      // Clearing the text area can be done here or based on successful API call.
      // For now, let's clear it immediately.
      // Consider clearing it only on successful submission or providing user feedback.
      // this.questionText = '';
    }
  }
}
