import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HighlightModule, HighlightLoader, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs'; // Import for testing highlight directive

import { ChatMessage } from './chat-message.component'; // Corrected component name
import { Message } from '../models/message.model';
import { of } from 'rxjs';

// Mock HighlightLoader for testing purposes if needed, or rely on actual imports if simple
class MockHighlightLoader {
  getLanguages() {
    return of({}); // Return an empty map or mock specific languages
  }
}

describe('ChatMessageComponent', () => { // Corrected describe name
  let component: ChatMessage;
  let fixture: ComponentFixture<ChatMessage>;

  const mockUserMessage: Message = {
    type: 'user',
    text: 'Hello there',
    timestamp: new Date(),
  };

  const mockAiMessage: Message = {
    type: 'ai',
    text: 'Hi, I am NovaGem.',
    timestamp: new Date(),
    code: 'console.log("Hello");',
    formattedText: 'Hi, I am <b>NovaGem</b>.'
  };

  const mockErrorMessage: Message = {
    type: 'ai',
    text: 'An error occurred.',
    timestamp: new Date(),
    isError: true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DatePipe, // DatePipe is used in the template
        MatIconModule,
        MatButtonModule,
        HighlightModule, // Needed because [highlight] is in the template
        ChatMessage // Standalone component
      ],
      providers: [
        // Provide HIGHLIGHT_OPTIONS if not already globally provided in a way tests can see
        // or if you need specific test overrides.
        // For default setup, if app.config.ts provides it, it might be available.
        // If not, provide a minimal mock:
        {
          provide: HIGHLIGHT_OPTIONS,
          useValue: {
            coreLibraryLoader: () => import('highlight.js/lib/core'),
            languages: {
              // Mock languages needed for tests, or ensure they are loaded
              javascript: () => import('highlight.js/lib/languages/javascript'),
            }
          }
        },
        // Mock HighlightLoader if necessary, though often not needed for basic directive presence tests
        // { provide: HighlightLoader, useClass: MockHighlightLoader }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatMessage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.message = mockUserMessage; // Provide a default message
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display user message correctly', () => {
    component.message = mockUserMessage;
    fixture.detectChanges();
    const bubble = fixture.debugElement.query(By.css('.message-bubble.user-message'));
    expect(bubble).toBeTruthy();
    const textContent = fixture.debugElement.query(By.css('.text-content'));
    expect(textContent.nativeElement.innerHTML).toContain(mockUserMessage.text); // Basic text check
  });

  it('should display AI message with formatted text and code block', () => {
    component.message = mockAiMessage;
    fixture.detectChanges();
    const bubble = fixture.debugElement.query(By.css('.message-bubble.ai-message'));
    expect(bubble).toBeTruthy();
    const textContent = fixture.debugElement.query(By.css('.text-content'));
    expect(textContent.nativeElement.innerHTML).toBe(mockAiMessage.formattedText); // Check formatted text
    const codeBlock = fixture.debugElement.query(By.css('.code-block-container code'));
    expect(codeBlock).toBeTruthy();
    expect(codeBlock.nativeElement.textContent).toBe(mockAiMessage.code);
  });

  it('should display error message with error styling', () => {
    component.message = mockErrorMessage;
    fixture.detectChanges();
    const bubble = fixture.debugElement.query(By.css('.message-bubble.ai-message.error-message'));
    expect(bubble).toBeTruthy();
    const textContent = fixture.debugElement.query(By.css('.text-content'));
    // getProcessedText will process the text, check its output
    expect(textContent.nativeElement.innerHTML).toContain(mockErrorMessage.text);
  });

  it('getProcessedText should use formattedText if available', () => {
    component.message = mockAiMessage;
    expect(component.getProcessedText()).toBe(mockAiMessage.formattedText!);
  });

  it('getProcessedText should process raw text with markdown-like replacements', () => {
    const rawTextMessage: Message = { type: 'ai', text: '**Bold** and _italic_ and \nnewline.', timestamp: new Date() };
    component.message = rawTextMessage;
    const expectedHtml = '<strong>Bold</strong> and <em>italic</em> and <br>newline.';
    expect(component.getProcessedText()).toBe(expectedHtml);
  });

  describe('copyCode', () => {
    let clipboardSpy: jasmine.Spy;
    beforeEach(() => {
      clipboardSpy = spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
      component.message = mockAiMessage; // Message with code
    });

    it('should call navigator.clipboard.writeText with message code', async () => {
      await component.copyCode();
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockAiMessage.code!);
    });
  });

  describe('copyResponseText', () => {
    let clipboardSpy: jasmine.Spy;
    beforeEach(() => {
      clipboardSpy = spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
      component.message = mockAiMessage; // AI message
    });

    it('should call navigator.clipboard.writeText with message text for AI messages', async () => {
      await component.copyResponseText();
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockAiMessage.text);
    });

    it('should not call navigator.clipboard.writeText for user messages', async () => {
      component.message = mockUserMessage; // User message
      await component.copyResponseText();
      expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    });
  });
});
