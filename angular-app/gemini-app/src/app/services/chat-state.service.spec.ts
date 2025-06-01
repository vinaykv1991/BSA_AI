import { TestBed } from '@angular/core/testing';
import { ChatStateService } from './chat-state.service';
import { Message } from '../models/message.model';

describe('ChatStateService', () => {
  let service: ChatStateService;
  let mockLocalStorage: { [key: string]: string };

  const initialMessages: Message[] = [
    { type: 'user', text: 'Hello', timestamp: new Date(Date.now() - 10000) },
    { type: 'ai', text: 'Hi there!', timestamp: new Date() },
  ];

  beforeEach(() => {
    mockLocalStorage = {};

    spyOn(localStorage, 'getItem').and.callFake((key) => mockLocalStorage[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key, value) => (mockLocalStorage[key] = value));
    spyOn(localStorage, 'removeItem').and.callFake((key) => delete mockLocalStorage[key]);

    // Simulate browser environment for the service's constructor check
    (service as any).isBrowser = true;

    TestBed.configureTestingModule({
      providers: [ChatStateService],
    });
    service = TestBed.inject(ChatStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with messages from localStorage if available', () => {
    const messagesWithDateAsString = initialMessages.map(m => ({...m, timestamp: m.timestamp.toISOString()}));
    mockLocalStorage['novagem-chat-history'] = JSON.stringify(messagesWithDateAsString);

    // Re-create service to trigger constructor logic with primed localStorage
    service = TestBed.inject(ChatStateService);

    let currentMessages: Message[] = [];
    service.messages$.subscribe(msgs => currentMessages = msgs);

    expect(currentMessages.length).toBe(2);
    expect(currentMessages[0].text).toBe('Hello');
    expect(currentMessages[0].timestamp).toEqual(jasmine.any(Date)); // Check if it's converted back to Date
    expect(currentMessages[1].text).toBe('Hi there!');
  });

  it('should initialize with an empty array if no messages in localStorage', () => {
    // localStorage is already empty by default in these tests unless primed
    service = TestBed.inject(ChatStateService); // Re-create
    let currentMessages: Message[] = [];
    service.messages$.subscribe(msgs => currentMessages = msgs);
    expect(currentMessages).toEqual([]);
  });

  it('addMessage should add a message and save to localStorage', () => {
    const newMessage: Message = { type: 'user', text: 'New message', timestamp: new Date() };
    service.addMessage(newMessage);

    let currentMessages: Message[] = [];
    service.messages$.subscribe(msgs => currentMessages = msgs);

    expect(currentMessages.length).toBe(1);
    expect(currentMessages[0].text).toBe('New message');
    expect(JSON.parse(mockLocalStorage['novagem-chat-history']).length).toBe(1);
  });

  it('addMessage should append to existing messages', () => {
    service.addMessage({ type: 'user', text: 'First', timestamp: new Date() });
    service.addMessage({ type: 'ai', text: 'Second', timestamp: new Date() });

    let currentMessages: Message[] = [];
    service.messages$.subscribe(msgs => currentMessages = msgs);

    expect(currentMessages.length).toBe(2);
    expect(currentMessages[1].text).toBe('Second');
    expect(JSON.parse(mockLocalStorage['novagem-chat-history']).length).toBe(2);
  });

  it('clearMessages should clear messages and remove from localStorage', () => {
    // Add some messages first
    service.addMessage({ type: 'user', text: 'Test', timestamp: new Date() });
    expect(JSON.parse(mockLocalStorage['novagem-chat-history']).length).toBe(1);

    service.clearMessages();

    let currentMessages: Message[] = [];
    service.messages$.subscribe(msgs => currentMessages = msgs);
    expect(currentMessages.length).toBe(0);
    expect(mockLocalStorage['novagem-chat-history']).toBeUndefined();
  });

  it('setMessages should replace all messages and save to localStorage', () => {
    service.addMessage({ type: 'user', text: 'Old message', timestamp: new Date() });
    const newMessages: Message[] = [
      { type: 'ai', text: 'Completely new history', timestamp: new Date() }
    ];
    service.setMessages(newMessages);

    let currentMessages: Message[] = [];
    service.messages$.subscribe(msgs => currentMessages = msgs);
    expect(currentMessages.length).toBe(1);
    expect(currentMessages[0].text).toBe('Completely new history');
    expect(JSON.parse(mockLocalStorage['novagem-chat-history'])[0].text).toBe('Completely new history');
  });

  it('getCurrentMessages should return the current snapshot of messages', () => {
    service.addMessage({ type: 'user', text: 'Snapshot test', timestamp: new Date() });
    const snapshot = service.getCurrentMessages();
    expect(snapshot.length).toBe(1);
    expect(snapshot[0].text).toBe('Snapshot test');
  });

});
