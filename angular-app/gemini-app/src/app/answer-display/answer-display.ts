import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ApiService } from '../api'; // Corrected path to api.ts
// import { DomSanitizer, SafeHtml } from '@angular/platform-browser'; // For Markdown later

@Component({
  selector: 'app-answer-display',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './answer-display.html',
  styleUrl: './answer-display.css'
})
export class AnswerDisplay implements OnDestroy {
  answerText: string | null = null;
  errorText: string | null = null;
  isLoading: boolean = false;
  hasAttempted: boolean = false; // To know if an API call has been made

  // formattedAnswer: SafeHtml | string = ''; // For Markdown later

  private subscriptions: Subscription = new Subscription();

  constructor(
    private apiService: ApiService,
    // private sanitizer: DomSanitizer // For Markdown later
  ) {
    this.subscriptions.add(
      this.apiService.answer$.subscribe(answer => {
        this.answerText = answer;
        // if (answer) this.formattedAnswer = this.sanitizer.bypassSecurityTrustHtml(this.processNewlines(answer)); // For Markdown
        if (answer) {
          this.errorText = null;
          this.hasAttempted = true;
        }
      })
    );
    this.subscriptions.add(
      this.apiService.error$.subscribe(error => {
        this.errorText = error;
        if (error) {
          this.answerText = null;
          this.hasAttempted = true;
        }
      })
    );
    this.subscriptions.add(
      this.apiService.loading$.subscribe(loading => {
        this.isLoading = loading;
        if (loading) {
          this.answerText = null;
          this.errorText = null;
          this.hasAttempted = true; // An attempt is being made
        }
      })
    );
  }

  get formattedAnswer(): string {
    return this.answerText ? this.processNewlines(this.answerText) : '';
  }

  private processNewlines(text: string): string {
    // Basic processing for newlines, can be expanded for markdown later
    return text.replace(/\n/g, '<br>');
  }

  clearErrorAndPromptRetry(): void {
    this.apiService.clearState(); // Clears error, answer, loading in service
    // The UI will revert to a state where the user can re-enter a question.
    // No direct retry of the same question from here to keep it simple.
    // User is prompted to use the form again.
    this.hasAttempted = false; // Reset attempt state
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
