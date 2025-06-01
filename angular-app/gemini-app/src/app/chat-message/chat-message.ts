import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common'; // NgClass, NgIf, DatePipe are part of CommonModule
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HighlightModule } from 'ngx-highlightjs'; // Import HighlightModule
import { Message } from '../models/message.model'; // Import Message from central location

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [
    CommonModule, // Includes NgClass, NgIf, DatePipe
    MatIconModule,
    MatButtonModule,
    HighlightModule, // Add HighlightModule here for standalone component
  ],
  templateUrl: './chat-message.html',
  styleUrls: ['./chat-message.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatMessage {
  @Input() message!: Message;

  constructor() { }

  getProcessedText(): string {
    if (this.message.formattedText) {
      return this.message.formattedText;
    }
    let processed = this.message.text;
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
    processed = processed.replace(/\n/g, '<br>');
    return processed;
  }

  copyCode(): void {
    if (this.message.code) {
      navigator.clipboard.writeText(this.message.code)
        .then(() => console.log('Code copied to clipboard!'))
        .catch(err => console.error('Failed to copy code:', err));
    }
  }

  copyResponseText(): void {
    if (this.message.type === 'ai' && this.message.text) {
       navigator.clipboard.writeText(this.message.text)
        .then(() => console.log('Response text copied to clipboard!'))
        .catch(err => console.error('Failed to copy response text:', err));
    }
  }
}
