import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.css']
})
export class ChatInputComponent {
  @Output() messageSubmit = new EventEmitter<string>();

  textareaValue: string = '';
  isLoading: boolean = false; // This can be an @Input() from a parent component later if needed

  constructor() { }

  // Handles auto-resizing of the textarea
  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto'; // Reset height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
  }

  // Handles keydown events for Enter and Shift+Enter
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent new line on Enter
      this.submitMessage();
    }
    // Shift+Enter will naturally create a new line, so no special handling is needed.
  }

  submitMessage(): void {
    const message = this.textareaValue.trim();
    if (message && !this.isLoading) {
      this.messageSubmit.emit(message);
      this.textareaValue = ''; // Clear textarea
      // Reset height after clearing
      const textarea = document.querySelector('.chat-textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.style.height = 'auto';
      }
    }
  }
}
