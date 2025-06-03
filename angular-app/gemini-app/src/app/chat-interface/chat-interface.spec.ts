import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, Subject } from 'rxjs';

import { ChatInterface } from './chat-interface';
import { ApiService } from '../services/api.service';
import { ChatStateService } from '../services/chat-state.service';
import { Message } from '../models/message.model';

// Mocks for services
class MockApiService {
  loading$ = new BehaviorSubject<boolean>(false);
  answer$ = new BehaviorSubject<string | null>(null);
  error$ = new BehaviorSubject<string | null>(null);
  getAnswer = jasmine.createSpy('getAnswer');
}

class MockChatStateService {
  messages$ = new BehaviorSubject<Message[]>([]);
  addMessage = jasmine.createSpy('addMessage');
  clearMessages = jasmine.createSpy('clearMessages');
  // getCurrentMessages = jasmine.createSpy('getCurrentMessages').and.returnValue([]);
}

describe('ChatInterfaceComponent', () => {
  let component: ChatInterface;
  let fixture: ComponentFixture<ChatInterface>;
  let mockApiService: MockApiService;
  let mockChatStateService: MockChatStateService;

  beforeEach(async () => {
    mockApiService = new MockApiService();
    mockChatStateService = new MockChatStateService();

    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        NoopAnimationsModule, // Disable animations for easier testing
        ChatInterface // Standalone component imports its own dependencies
      ],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: ChatStateService, useValue: mockChatStateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatInterface);
    component = fixture.componentInstance;
    // fixture.detectChanges(); // Initial detectChanges, might trigger ngOnInit early
  });

  it('should create', () => {
    fixture.detectChanges(); // Trigger ngOnInit
    expect(component).toBeTruthy();
  });

  it('should subscribe to ChatStateService messages$ on init', () => {
    const testMessages: Message[] = [{ type: 'user', text: 'Test', timestamp: new Date() }];
    mockChatStateService.messages$.next(testMessages);
    fixture.detectChanges(); // Trigger ngOnInit for subscriptions
    expect(component.messages).toEqual(testMessages);
  });

  it('should subscribe to ApiService loading$ on init', () => {
    fixture.detectChanges();
    mockApiService.loading$.next(true);
    expect(component.isLoading).toBeTrue();
    mockApiService.loading$.next(false);
    expect(component.isLoading).toBeFalse();
  });

  it('should add AI message to ChatStateService when ApiService answer$ emits', () => {
    fixture.detectChanges(); // ngOnInit
    const aiAnswer = 'This is an AI answer.';
    mockApiService.answer$.next(aiAnswer);
    expect(mockChatStateService.addMessage).toHaveBeenCalled();
    const lastCallArgs = mockChatStateService.addMessage.calls.mostRecent().args[0] as Message;
    expect(lastCallArgs.type).toBe('ai');
    expect(lastCallArgs.text).toBe(aiAnswer);
    expect(lastCallArgs.isError).toBeUndefined();
  });

  it('should add error message to ChatStateService when ApiService error$ emits', () => {
    fixture.detectChanges(); // ngOnInit
    const errorText = 'This is an error.';
    mockApiService.error$.next(errorText);
    expect(mockChatStateService.addMessage).toHaveBeenCalled();
    const lastCallArgs = mockChatStateService.addMessage.calls.mostRecent().args[0] as Message;
    expect(lastCallArgs.type).toBe('ai'); // Errors are displayed as AI messages
    expect(lastCallArgs.text).toBe(`Error: ${errorText}`);
    expect(lastCallArgs.isError).toBeTrue();
  });

  describe('sendMessage', () => {
    beforeEach(() => {
      fixture.detectChanges(); // Ensure ngOnInit runs and subscriptions are set up
    });

    it('should not do anything if currentMessage is empty or whitespace', () => {
      component.currentMessage = '   ';
      component.sendMessage();
      expect(mockChatStateService.addMessage).not.toHaveBeenCalled();
      expect(mockApiService.getAnswer).not.toHaveBeenCalled();
    });

    it('should not do anything if isLoading is true', () => {
      mockApiService.loading$.next(true); // Simulate loading state
      fixture.detectChanges(); // Update component.isLoading based on observable
      component.currentMessage = 'Test message';
      component.sendMessage();
      expect(mockChatStateService.addMessage).not.toHaveBeenCalled();
      expect(mockApiService.getAnswer).not.toHaveBeenCalled();
    });

    it('should add user message to ChatStateService and call ApiService.getAnswer', () => {
      component.currentMessage = 'Hello NovaGem';
      component.sendMessage();

      expect(mockChatStateService.addMessage).toHaveBeenCalled();
      const userMessageArgs = mockChatStateService.addMessage.calls.mostRecent().args[0] as Message;
      expect(userMessageArgs.type).toBe('user');
      expect(userMessageArgs.text).toBe('Hello NovaGem');

      expect(mockApiService.getAnswer).toHaveBeenCalledWith('Hello NovaGem');
      expect(component.currentMessage).toBe(''); // Input should be cleared
    });
  });

  it('handleExamplePrompt should update currentMessage and focus input', () => {
    fixture.detectChanges(); // To get ViewChild references
    const promptText = 'Explain quantum computing';
    spyOn(component['chatInputRef'].nativeElement, 'focus'); // Spy on the native element's focus

    component.handleExamplePrompt(promptText);

    expect(component.currentMessage).toBe(promptText);
    expect(component['chatInputRef'].nativeElement.focus).toHaveBeenCalled();
  });

  it('should call scrollToBottom when messages change', fakeAsync(() => {
    fixture.detectChanges(); // ngOnInit
    spyOn(component as any, 'scrollToBottom'); // Spy on private method

    mockChatStateService.messages$.next([{ type: 'user', text: 'New message', timestamp: new Date() }]);
    tick(); // Allow time for async operations like detectChanges if any were triggered by cdr
    fixture.detectChanges(); // To process the new message in the component's view if needed

    expect((component as any).scrollToBottom).toHaveBeenCalled();
  }));

  it('should unsubscribe from observables on ngOnDestroy', () => {
    fixture.detectChanges(); // ngOnInit
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
