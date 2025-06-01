import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations'; // For Material progress bar
import { MatProgressBarModule } from '@angular/material/progress-bar'; // Import if used by component
import { MatIconModule } from '@angular/material/icon';


import { SplashScreenComponent } from './splash-screen.component'; // Corrected component class name

// Mock Router
class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('SplashScreenComponent', () => { // Corrected describe name
  let component: SplashScreenComponent;
  let fixture: ComponentFixture<SplashScreenComponent>;
  let mockRouter: MockRouter;

  beforeEach(async () => {
    mockRouter = new MockRouter();

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule, // Handles animations from MatProgressBar
        MatProgressBarModule, // Ensure MatProgressBarModule is imported if used in template
        MatIconModule,      // Ensure MatIconModule is imported
        SplashScreenComponent // Standalone component
      ],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SplashScreenComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges(); // ngOnInit is called here, which starts the timer. Moved to tests.
  });

  it('should create', () => {
    fixture.detectChanges(); // Call ngOnInit
    expect(component).toBeTruthy();
  });

  it('should navigate to /chat after timeout', fakeAsync(() => {
    fixture.detectChanges(); // ngOnInit starts the timer

    expect(mockRouter.navigate).not.toHaveBeenCalled(); // Not called immediately

    tick(2499); // Advance time just before timeout
    expect(mockRouter.navigate).not.toHaveBeenCalled();

    tick(100); // Advance time past the 2500ms timeout (total 2599ms)
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/chat']);
  }));

  it('should clear timeout on ngOnDestroy', fakeAsync(() => {
    fixture.detectChanges(); // ngOnInit starts the timer
    spyOn(window, 'clearTimeout'); // Spy on global clearTimeout

    component.ngOnDestroy();

    // Expect clearTimeout to have been called with the timerId from setTimeout
    // The actual timerId is not easily accessible without making it a public property,
    // but we can check if clearTimeout was called at all.
    expect(clearTimeout).toHaveBeenCalled();

    tick(3000); // Advance time well past the original timeout
    // If clearTimeout worked, navigate should not have been called
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  }));
});
