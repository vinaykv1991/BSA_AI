import { Component, ViewChild, ElementRef, AfterViewChecked, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, Subscription } from 'rxjs'; // Import Subject and Subscription for takeUntil pattern
import { takeUntil } from 'rxjs/operators';

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TextFieldModule } from '@angular/cdk/text-field';

// Services and Models
import { ApiService } from '../services/api.service'; // Correct path
import { ChatStateService } from '../services/chat-state.service'; // Correct path
import { Message } from '../models/message.model';

// Child Components
import { ChatMessage } from '../chat-message/chat-message';
import { TypingIndicator } from '../typing-indicator/typing-indicator';
import { WelcomeMessage } from '../welcome-message/welcome-message';

@Component({
  selector: 'app-chat-interface',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    MatToolbarModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, TextFieldModule,
    ChatMessage, TypingIndicator, WelcomeMessage,
  ],
  templateUrl: './chat-interface.html',
  styleUrls: ['./chat-interface.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatInterface implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('chatArea') private chatAreaRef!: ElementRef<HTMLDivElement>;
  @ViewChild('chatInput') private chatInputRef!: ElementRef<HTMLTextAreaElement>;

  messages: Message[] = [];
  currentMessage: string = '';
  isLoading: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private chatStateService: ChatStateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.chatStateService.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(msgs => {
        this.messages = msgs;
        this.cdr.detectChanges(); // Mark for check when messages array changes
        this.scrollToBottom(); // Scroll after messages are updated and view is checked
      });

    this.apiService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isLoading = loading;
        if (this.isLoading) {
          // Ensure scroll to bottom when "thinking" indicator appears if messages are already present
          this.scrollToBottom();
        }
        this.cdr.detectChanges();
      });

    this.apiService.answer$
      .pipe(takeUntil(this.destroy$))
      .subscribe(answerText => {
        if (answerText) {
          const aiMessage: Message = {
            type: 'ai',
            text: answerText,
            timestamp: new Date(),
          };
          this.chatStateService.addMessage(aiMessage);
        }
      });

    this.apiService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(errorMsg => {
        if (errorMsg) {
          const errorMessage: Message = {
            type: 'ai', // Display errors as AI messages for now
            text: `Error: ${errorMsg}`,
            timestamp: new Date(),
            isError: true, // Mark as error
          };
          this.chatStateService.addMessage(errorMessage);
        }
      });
  }

  ngAfterViewChecked(): void {
    // Only scroll if not loading and there are messages, or if loading just started
    // This avoids scrolling while user might be looking at history and new message comes
    // this.scrollToBottom(); // Re-evaluating this, might be too aggressive
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleExamplePrompt(prompt: string): void {
    this.currentMessage = prompt;
    if (this.chatInputRef?.nativeElement) {
      this.chatInputRef.nativeElement.focus();
    }
    this.cdr.detectChanges();
  }

  sendMessage(): void {
    if (!this.currentMessage.trim() || this.isLoading) return;

    const userMessage: Message = {
      type: 'user',
      text: this.currentMessage.trim(),
      timestamp: new Date(),
    };
    this.chatStateService.addMessage(userMessage);

    const question = this.currentMessage.trim();
    this.currentMessage = ''; // Clear input
    this.cdr.detectChanges(); // Update input field in UI

    this.apiService.getAnswer(question); // ApiService handles isLoading state
  }

  private scrollToBottom(): void {
    // Added a small delay to ensure DOM has updated before scrolling
    setTimeout(() => {
      try {
        if (this.chatAreaRef?.nativeElement) {
          this.chatAreaRef.nativeElement.scrollTop = this.chatAreaRef.nativeElement.scrollHeight;
        }
      } catch (err) { /* console.error('Error scrolling to bottom:', err); */ }
    }, 0);
  }
}
