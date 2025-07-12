import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatAreaComponent } from './chat-area/chat-area.component';
import { ChatInputComponent } from './chat-input/chat-input.component';
import { Message } from './chat-message.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ChatAreaComponent,
    ChatInputComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  @ViewChild(ChatAreaComponent) chatArea!: ChatAreaComponent;

  protected title = 'NovaGem';

  handleMessageSubmit(messageText: string): void {
    console.log('Message submitted from input:', messageText);

    // 1. Add the user's message to the chat area
    const userMessage: Message = {
      id: self.crypto.randomUUID(),
      sender: 'user',
      text: messageText,
      timestamp: new Date()
    };
    this.chatArea.addMessage(userMessage);

    // 2. Add a "thinking" message from the AI
    const thinkingMessage: Message = {
      id: self.crypto.randomUUID(),
      sender: 'ai',
      text: '',
      isThinking: true,
      timestamp: new Date()
    };
    this.chatArea.addMessage(thinkingMessage);

    // 3. TODO: In a future step, call the Gemini API here.
    // For now, we'll simulate a delayed response.
    setTimeout(() => {
      // Replace the "thinking" message with the actual response.
      // This logic will be more complex when we have real API calls.
      const aiResponse: Message = {
        id: thinkingMessage.id, // Use the same ID to replace the thinking bubble
        sender: 'ai',
        text: `This is a simulated AI response to "${messageText}".`,
        timestamp: new Date(),
        showCopy: true,
        showFeedback: true,
        showRegenerate: true,
        showShare: true
      };
      // A more robust way to do this would be to find and replace the message
      // in the chatArea's message array.
      const thinkingIndex = this.chatArea.messages.findIndex(m => m.id === thinkingMessage.id);
      if (thinkingIndex !== -1) {
        this.chatArea.messages[thinkingIndex] = aiResponse;
      }
    }, 2000); // Simulate 2-second delay
  }
}
