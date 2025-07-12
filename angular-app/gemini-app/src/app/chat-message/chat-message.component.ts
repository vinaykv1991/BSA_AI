import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../chat-message.model';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.css']
})
export class ChatMessageComponent implements OnInit {
  @Input() message!: Message;
  @Output() regenerate = new EventEmitter<Message>();
  @Output() feedback = new EventEmitter<{ messageId: string, type: 'positive' | 'negative' }>();

  constructor() { }

  ngOnInit(): void {
    // Basic validation for the input
    if (!this.message) {
      this.message = {
        id: 'error-' + Math.random(),
        text: 'Error: Message data is missing.',
        sender: 'system',
        isError: true,
        timestamp: new Date()
      };
      console.error("ChatMessageComponent: Input 'message' is missing!");
    }
  }

  onCopyText(): void {
    // If there's a code block, copy only the introductory text. Otherwise, copy the whole text.
    const textToCopy = this.message.codeBlock ? this.message.text.replace(this.message.codeBlock.code, '').trim() : this.message.text;
    navigator.clipboard.writeText(textToCopy)
      .then(() => this.showFeedbackAnimation('Copied!'))
      .catch(err => console.error('Failed to copy message text: ', err));
  }

  onCopyCode(): void {
    if (this.message.codeBlock) {
      navigator.clipboard.writeText(this.message.codeBlock.code)
        .then(() => this.showFeedbackAnimation('Code Copied!'))
        .catch(err => console.error('Failed to copy code: ', err));
    }
  }

  onShare(): void {
    if (navigator.share) {
      navigator.share({
        title: 'NovaGem AI Response',
        text: this.message.text,
      })
      .then(() => console.log('Shared successfully'))
      .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      this.onCopyText();
    }
  }

  onFeedback(type: 'positive' | 'negative'): void {
    this.feedback.emit({ messageId: this.message.id, type });
    this.showFeedbackAnimation(type === 'positive' ? 'Thanks!' : 'Got it.');
  }

  onRegenerate(): void {
    this.regenerate.emit(this.message);
  }

  // Helper for user feedback, can be expanded later
  private showFeedbackAnimation(text: string): void {
    console.log(`User feedback: ${text}`);
    // In a real app, you might implement a small toast or animation here.
  }
}
