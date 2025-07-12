import { Component, ViewChild, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ChatAreaComponent } from './chat-area/chat-area.component';
import { ChatInputComponent } from './chat-input/chat-input.component';
import { Message } from './chat-message.model';
import { ApiService } from './api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HttpClientModule, // Import HttpClientModule
    ChatAreaComponent,
    ChatInputComponent
  ],
  providers: [ApiService], // Provide the service
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  @ViewChild(ChatAreaComponent) chatArea!: ChatAreaComponent;
  @ViewChild(ChatInputComponent) chatInput!: ChatInputComponent;

  private apiService = inject(ApiService);
  protected title = 'NovaGem';
  private thinkingMessageId: string | null = null;

  constructor() {
    // Subscribe to loading state
    this.apiService.loading$.pipe(takeUntilDestroyed()).subscribe(isLoading => {
      this.chatInput.isLoading = isLoading;
    });

    // Subscribe to answer stream
    this.apiService.answer$.pipe(takeUntilDestroyed()).subscribe(answer => {
      if (answer && this.thinkingMessageId) {
        this.updateAiMessage(answer);
      }
    });

    // Subscribe to error stream
    this.apiService.error$.pipe(takeUntilDestroyed()).subscribe(error => {
      if (error && this.thinkingMessageId) {
        this.updateAiMessage(error, true);
      }
    });
  }

  handleMessageSubmit(messageText: string): void {
    // 1. Add user's message
    this.chatArea.addMessage({
      id: self.crypto.randomUUID(),
      sender: 'user',
      text: messageText,
      timestamp: new Date()
    });

    // 2. Add a "thinking" message and store its ID
    const thinkingMessage: Message = {
      id: self.crypto.randomUUID(),
      sender: 'ai',
      text: '',
      isThinking: true,
      timestamp: new Date()
    };
    this.thinkingMessageId = thinkingMessage.id;
    this.chatArea.addMessage(thinkingMessage);

    // 3. Call the real API
    this.apiService.getAnswer(messageText);
  }

  private updateAiMessage(text: string, isError: boolean = false): void {
    if (!this.thinkingMessageId) return;

    const thinkingIndex = this.chatArea.messages.findIndex(m => m.id === this.thinkingMessageId);
    if (thinkingIndex !== -1) {
      this.chatArea.messages[thinkingIndex] = {
        ...this.chatArea.messages[thinkingIndex],
        text: text,
        isThinking: false,
        isError: isError,
        timestamp: new Date(),
        showCopy: !isError,
        showFeedback: !isError,
        showRegenerate: !isError,
        showShare: !isError,
      };
    }
    this.thinkingMessageId = null; // Reset for the next message
  }
}
