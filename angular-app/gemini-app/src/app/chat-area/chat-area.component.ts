import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../chat-message.model';
import { ChatMessageComponent } from '../chat-message/chat-message.component';

@Component({
  selector: 'app-chat-area',
  standalone: true,
  imports: [CommonModule, ChatMessageComponent],
  templateUrl: './chat-area.component.html',
  styleUrls: ['./chat-area.component.css']
})
export class ChatAreaComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  messages: Message[] = [];

  constructor() { }

  ngOnInit(): void {
    this.addMockMessages();
    this.scrollToBottom();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  addMockMessages(): void {
    this.messages = [
      {
        id: '1',
        sender: 'system',
        text: 'This is the beginning of your chat history.',
        timestamp: new Date(new Date().getTime() - 1000 * 60 * 10) // 10 minutes ago
      },
      {
        id: '2',
        sender: 'user',
        text: 'Hello! Can you explain what a Large Language Model is?',
        timestamp: new Date(new Date().getTime() - 1000 * 60 * 9)
      },
      {
        id: '3',
        sender: 'ai',
        isThinking: true, // Example of a thinking bubble
        text: '',
        timestamp: new Date(new Date().getTime() - 1000 * 60 * 9 + 1000)
      }
    ];

    // Simulate the AI finishing its thought and responding
    setTimeout(() => {
      const thinkingMessageIndex = this.messages.findIndex(m => m.isThinking);
      if (thinkingMessageIndex !== -1) {
        this.messages[thinkingMessageIndex] = {
          id: '4',
          sender: 'ai',
          text: "Of course! A Large Language Model (LLM) is a type of artificial intelligence trained on vast amounts of text data to understand and generate human-like language. I am an example of one!",
          timestamp: new Date(new Date().getTime() - 1000 * 60 * 8),
          showCopy: true,
          showFeedback: true,
          showRegenerate: true,
          showShare: true
        };
      }

      // Add another example with a code block
      this.addMessage({
        id: '5',
        sender: 'ai',
        text: "Here's a simple Python 'Hello, World!' example:",
        codeBlock: {
          language: 'python',
          code: `print("Hello, World!")`
        },
        timestamp: new Date(),
        showCopy: true,
        showFeedback: true,
        showRegenerate: true,
        showShare: true
      });

    }, 2500); // Wait 2.5 seconds
  }

  // This method will be called by a parent component later
  public addMessage(message: Message): void {
    this.messages.push(message);
    this.scrollToBottom();
  }

  handleFeedback(feedback: { messageId: string, type: 'positive' | 'negative' }): void {
    console.log(`Feedback received in ChatAreaComponent for message ${feedback.messageId}: ${feedback.type}`);
    // Here you would send this data to your analytics or backend service
  }

  handleRegenerate(message: Message): void {
    console.log(`Regenerate request received in ChatAreaComponent for message:`, message);
    // Here you would trigger the logic to call the Gemini API again
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.warn("Could not scroll to bottom:", err);
    }
  }
}
