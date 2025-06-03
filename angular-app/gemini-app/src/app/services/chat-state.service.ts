import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Message } from '../models/message.model'; // Import the Message interface

@Injectable({
  providedIn: 'root'
})
export class ChatStateService {
  private readonly messagesSubject = new BehaviorSubject<Message[]>([]);
  public readonly messages$ = this.messagesSubject.asObservable();

  // Optional: For persisting messages to localStorage
  private readonly storageKey = 'novagem-chat-history';
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    if (this.isBrowser) {
      this.loadMessagesFromLocalStorage();
    }
  }

  private loadMessagesFromLocalStorage(): void {
    const savedMessages = localStorage.getItem(this.storageKey);
    if (savedMessages) {
      const parsedMessages: Message[] = JSON.parse(savedMessages);
      // Dates are stored as strings in JSON, convert them back to Date objects
      parsedMessages.forEach(msg => msg.timestamp = new Date(msg.timestamp));
      this.messagesSubject.next(parsedMessages);
    }
  }

  private saveMessagesToLocalStorage(messages: Message[]): void {
    if (this.isBrowser) {
      localStorage.setItem(this.storageKey, JSON.stringify(messages));
    }
  }

  addMessage(message: Message): void {
    const currentMessages = this.messagesSubject.getValue();
    const updatedMessages = [...currentMessages, message];
    this.messagesSubject.next(updatedMessages);
    this.saveMessagesToLocalStorage(updatedMessages);
  }

  clearMessages(): void {
    this.messagesSubject.next([]);
    if (this.isBrowser) {
      localStorage.removeItem(this.storageKey);
    }
    console.log('Chat history cleared.');
  }

  // Optional: Method to replace all messages, e.g., when loading a conversation
  setMessages(messages: Message[]): void {
    this.messagesSubject.next(messages);
    this.saveMessagesToLocalStorage(messages);
  }

  // Optional: Get current messages snapshot
  getCurrentMessages(): Message[] {
    return this.messagesSubject.getValue();
  }
}
