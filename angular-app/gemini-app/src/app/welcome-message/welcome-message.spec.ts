import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations'; // For Material components
import { MatChipsModule } from '@angular/material/chips'; // Import MatChipsModule

import { WelcomeMessage } from './welcome-message.component'; // Corrected component name

describe('WelcomeMessageComponent', () => { // Corrected describe name
  let component: WelcomeMessage;
  let fixture: ComponentFixture<WelcomeMessage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatChipsModule, // MatChipsModule is used by the template
        WelcomeMessage // Standalone component
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WelcomeMessage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit examplePromptClicked event with the correct prompt text when a chip is clicked', () => {
    spyOn(component.examplePromptClicked, 'emit');

    const chipDebugElements = fixture.debugElement.queryAll(By.css('mat-chip-option'));
    expect(chipDebugElements.length).toBeGreaterThan(0); // Ensure chips are found

    // Click the first chip
    const firstChipNativeElement = chipDebugElements[0].nativeElement as HTMLElement;
    firstChipNativeElement.click(); // Simulate click
    fixture.detectChanges();

    // The text content of the first chip. Be careful if this text changes.
    // It's better to assign specific IDs or data-attributes for more robust testing.
    const expectedPromptText = chipDebugElements[0].nativeElement.textContent.trim();

    expect(component.examplePromptClicked.emit).toHaveBeenCalledWith(expectedPromptText);
  });

  it('onPromptClick method should emit the passed prompt', () => {
    spyOn(component.examplePromptClicked, 'emit');
    const testPrompt = 'Test prompt from method';
    component.onPromptClick(testPrompt);
    expect(component.examplePromptClicked.emit).toHaveBeenCalledWith(testPrompt);
  });
});
