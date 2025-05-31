import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

import { AnswerDisplay } from './answer-display'; // Component name is AnswerDisplay
import { ApiService } from '../api'; // Service name is ApiService

// Mock ApiService
class MockApiService {
  answer$ = new BehaviorSubject<string | null>(null);
  error$ = new BehaviorSubject<string | null>(null);
  loading$ = new BehaviorSubject<boolean>(false);
  clearState() { /* spy on this */ }
}

describe('AnswerDisplayComponent', () => { // Changed describe to use component name consistently
  let component: AnswerDisplay;
  let fixture: ComponentFixture<AnswerDisplay>;
  let mockApiService: MockApiService;

  beforeEach(async () => {
    mockApiService = new MockApiService();

    await TestBed.configureTestingModule({
      imports: [AnswerDisplay], // Import standalone component
      providers: [
        { provide: ApiService, useValue: mockApiService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnswerDisplay);
    component = fixture.componentInstance;
    // fixture.detectChanges(); // Initial detectChanges. We'll control it more precisely in tests.
  });

  it('should create', () => {
    fixture.detectChanges(); // Needed for ngOnInit and initial subscriptions
    expect(component).toBeTruthy();
  });

  it('should display placeholder initially when no attempt has been made', () => {
    component.hasAttempted = false; // Explicitly set
    fixture.detectChanges();
    const placeholder = fixture.debugElement.query(By.css('.placeholder p'));
    expect(placeholder).toBeTruthy();
    expect(placeholder.nativeElement.textContent).toContain('Your answer will appear here');
    expect(component.isLoading).toBeFalse();
    expect(component.answerText).toBeNull();
    expect(component.errorText).toBeNull();
  });

  it('should display loading indicator when loading$ is true', fakeAsync(() => {
    fixture.detectChanges(); // Initial subscriptions
    mockApiService.loading$.next(true);
    tick();
    fixture.detectChanges();

    const loadingIndicator = fixture.debugElement.query(By.css('.loading-indicator p'));
    expect(loadingIndicator).toBeTruthy();
    expect(loadingIndicator.nativeElement.textContent).toContain('Asking Gemini... please wait.');
    expect(component.isLoading).toBeTrue();
  }));

  it('should display answer when answer$ emits and not loading', fakeAsync(() => {
    fixture.detectChanges(); // Initial subscriptions
    const testAnswer = 'This is a test answer.\nWith newlines.';
    const expectedFormattedAnswer = 'This is a test answer.<br>With newlines.';

    mockApiService.loading$.next(false); // Ensure not loading
    mockApiService.answer$.next(testAnswer);
    tick();
    fixture.detectChanges();

    const answerTextElement = fixture.debugElement.query(By.css('.answer-text p'));
    expect(answerTextElement).toBeTruthy();
    expect(answerTextElement.nativeElement.innerHTML).toBe(expectedFormattedAnswer); // Check innerHTML due to <br>
    expect(component.answerText).toBe(testAnswer);
    expect(component.errorText).toBeNull(); // Error should be cleared
  }));

  it('should display error when error$ emits and not loading', fakeAsync(() => {
    fixture.detectChanges(); // Initial subscriptions
    const testError = 'This is a test error.';

    mockApiService.loading$.next(false); // Ensure not loading
    mockApiService.error$.next(testError);
    tick();
    fixture.detectChanges();

    const errorElement = fixture.debugElement.query(By.css('.error-message p'));
    expect(errorElement).toBeTruthy();
    expect(errorElement.nativeElement.textContent).toContain(testError);
    expect(component.errorText).toBe(testError);
    expect(component.answerText).toBeNull(); // Answer should be cleared
  }));

  it('should clear previous answer/error when loading starts', fakeAsync(() => {
    fixture.detectChanges();
    mockApiService.answer$.next("Old Answer");
    mockApiService.error$.next("Old Error");
    tick();
    fixture.detectChanges();

    expect(component.answerText).toBe("Old Answer");
    expect(component.errorText).toBe("Old Error");

    mockApiService.loading$.next(true);
    tick();
    fixture.detectChanges();

    expect(component.isLoading).toBeTrue();
    expect(component.answerText).toBeNull();
    expect(component.errorText).toBeNull();
  }));

  it('should call ApiService.clearState when clearErrorAndPromptRetry is called', () => {
    spyOn(mockApiService, 'clearState');
    component.clearErrorAndPromptRetry();
    expect(mockApiService.clearState).toHaveBeenCalled();
    expect(component.hasAttempted).toBeFalse();
  });

  it('should unsubscribe on destroy', () => {
    fixture.detectChanges(); // to set up subscriptions
    spyOn(component['subscriptions'], 'unsubscribe'); // Access private property for spying
    component.ngOnDestroy();
    expect(component['subscriptions'].unsubscribe).toHaveBeenCalled();
  });
});
