import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

import { QuestionForm } from './question-form'; // Component name is QuestionForm
import { ApiService } from '../api'; // Service name is ApiService

// Mock ApiService
class MockApiService {
  loading$ = new BehaviorSubject<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAnswer(question: string) { /* spy on this */ }
  // Add other methods/properties of ApiService if QuestionFormComponent uses them
}

describe('QuestionFormComponent', () => { // Changed describe to use component name consistently
  let component: QuestionForm;
  let fixture: ComponentFixture<QuestionForm>;
  let mockApiService: MockApiService;

  beforeEach(async () => {
    mockApiService = new MockApiService();

    await TestBed.configureTestingModule({
      imports: [
        FormsModule, // FormsModule is used by the component template for ngModel
        QuestionForm // Import the standalone component
      ],
      providers: [
        { provide: ApiService, useValue: mockApiService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionForm);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Initial data binding
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call ApiService.getAnswer when submitQuestion is called with non-empty questionText', () => {
    spyOn(mockApiService, 'getAnswer');
    component.questionText = 'Test question';
    component.submitQuestion();
    expect(mockApiService.getAnswer).toHaveBeenCalledWith('Test question');
  });

  it('should not call ApiService.getAnswer when submitQuestion is called with empty questionText', () => {
    spyOn(mockApiService, 'getAnswer');
    component.questionText = '   '; // Only whitespace
    component.submitQuestion();
    expect(mockApiService.getAnswer).not.toHaveBeenCalled();
  });

  it('should disable textarea and button when loading is true', fakeAsync(() => {
    mockApiService.loading$.next(true);
    tick(); // Allow Microtasks queue to empty
    fixture.detectChanges();

    const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement;
    const button = fixture.debugElement.query(By.css('button')).nativeElement;

    expect(textarea.disabled).toBeTrue();
    expect(button.disabled).toBeTrue();
    expect(button.textContent.trim()).toBe('Asking...');
  }));

  it('should enable textarea and button when loading is false', fakeAsync(() => {
    mockApiService.loading$.next(false); // Initial state is false, explicitly set again
    tick();
    fixture.detectChanges();

    const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement;
    const button = fixture.debugElement.query(By.css('button')).nativeElement;

    expect(textarea.disabled).toBeFalse();
    // Button should also be enabled if questionText is not empty, or disabled if it is
    // Test initial state (empty questionText)
    expect(button.disabled).toBeTrue(); // Disabled because questionText is empty

    component.questionText = "A question";
    fixture.detectChanges();
    expect(button.disabled).toBeFalse(); // Now enabled
    expect(button.textContent.trim()).toBe('Ask Gemini');
  }));

  it('should bind questionText to textarea value', async () => {
    const testText = 'Hello Gemini!';
    component.questionText = testText;
    fixture.detectChanges();
    await fixture.whenStable(); // Wait for ngModel to update

    const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement;
    expect(textarea.value).toBe(testText);

    // Also test the other way around (user input)
    textarea.value = 'New input';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.questionText).toBe('New input');
  });
});
