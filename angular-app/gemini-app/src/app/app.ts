import { Component, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
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
    HttpClientModule,
    ChatAreaComponent,
    ChatInputComponent
  ],
  providers: [ApiService],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  @ViewChild(ChatAreaComponent) chatArea!: ChatAreaComponent;
  @ViewChild(ChatInputComponent) chatInput!: ChatInputComponent;

  private apiService = inject(ApiService);
  private ref = inject(ChangeDetectorRef); // Injected ChangeDetectorRef
  protected title = 'NovaGem';
  private thinkingMessageId: string | null = null;

  constructor() {
    this.apiService.loading$.pipe(takeUntilDestroyed()).subscribe(isLoading => {
      if (this.chatInput) {
        this.chatInput.isLoading = isLoading;
      }
    });

    this.apiService.answer$.pipe(takeUntilDestroyed()).subscribe(answer => {
      if (answer && this.thinkingMessageId) {
        this.updateAiMessage(answer);
      }
    });

    this.apiService.error$.pipe(takeUntilDestroyed()).subscribe(error => {
      if (error && this.thinkingMessageId) {
        this.updateAiMessage(error, true);
      }
    });
  }

  handleMessageSubmit(messageText: string): void {
    this.chatArea.addMessage({
      id: self.crypto.randomUUID(),
      sender: 'user',
      text: messageText,
      timestamp: new Date()
    });

    const thinkingMessage: Message = {
      id: self.crypto.randomUUID(),
      sender: 'ai',
      text: '',
      isThinking: true,
      timestamp: new Date()
    };
    this.thinkingMessageId = thinkingMessage.id;
    this.chatArea.addMessage(thinkingMessage);

    this.apiService.getAnswer(messageText);
  }

  private updateAiMessage(text: string, isError: boolean = false): void {
    if (!this.thinkingMessageId) return;

    const targetId = this.thinkingMessageId;

    const thinkingIndex = this.chatArea.messages.findIndex(m => m.id === targetId);
    if (thinkingIndex !== -1) {
      // Update the message in place
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

    // Manually trigger change detection to ensure the UI updates
    this.ref.detectChanges();

    this.thinkingMessageId = null;
  }
}
