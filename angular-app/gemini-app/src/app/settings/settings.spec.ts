import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Location } from '@angular/common';
import { BehaviorSubject, Subscription } from 'rxjs';

import { SettingsComponent } from './settings.component'; // Component class is SettingsComponent
import { ThemeService, Theme } from '../services/theme.service';
import { ChatStateService } from '../services/chat-state.service';

// Mocks for services
class MockThemeService {
  currentTheme$ = new BehaviorSubject<Theme>('system');
  setTheme = jasmine.createSpy('setTheme');
}

class MockChatStateService {
  clearMessages = jasmine.createSpy('clearMessages');
}

class MockLocation {
  back = jasmine.createSpy('back');
}

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let mockThemeService: MockThemeService;
  let mockChatStateService: MockChatStateService;
  let mockLocation: MockLocation;

  beforeEach(async () => {
    mockThemeService = new MockThemeService();
    mockChatStateService = new MockChatStateService();
    mockLocation = new MockLocation();

    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        NoopAnimationsModule,
        SettingsComponent // Standalone component
      ],
      providers: [
        { provide: ThemeService, useValue: mockThemeService },
        { provide: ChatStateService, useValue: mockChatStateService },
        { provide: Location, useValue: mockLocation }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges(); // Initial detectChanges, moved to tests where needed for ngOnInit
  });

  it('should create', () => {
    fixture.detectChanges(); // Trigger ngOnInit
    expect(component).toBeTruthy();
  });

  it('should subscribe to ThemeService currentTheme$ on init and update selectedTheme', () => {
    mockThemeService.currentTheme$.next('dark');
    fixture.detectChanges(); // ngOnInit
    expect(component.selectedTheme).toBe('dark');
  });

  it('onThemeSettingChange should call ThemeService.setTheme', () => {
    fixture.detectChanges(); // ngOnInit
    const newTheme: Theme = 'dark';
    component.onThemeSettingChange(newTheme);
    expect(mockThemeService.setTheme).toHaveBeenCalledWith(newTheme);
  });

  it('goBack should call Location.back', () => {
    fixture.detectChanges(); // ngOnInit
    component.goBack();
    expect(mockLocation.back).toHaveBeenCalled();
  });

  describe('confirmClearChatHistory', () => {
    let confirmSpy: jasmine.Spy;

    beforeEach(() => {
      fixture.detectChanges(); // ngOnInit
      confirmSpy = spyOn(window, 'confirm');
    });

    it('should call ChatStateService.clearMessages if user confirms', () => {
      confirmSpy.and.returnValue(true);
      component.confirmClearChatHistory();
      expect(mockChatStateService.clearMessages).toHaveBeenCalled();
    });

    it('should NOT call ChatStateService.clearMessages if user cancels', () => {
      confirmSpy.and.returnValue(false);
      component.confirmClearChatHistory();
      expect(mockChatStateService.clearMessages).not.toHaveBeenCalled();
    });
  });

  it('openLink should call window.open', () => {
    fixture.detectChanges();
    spyOn(window, 'open');
    const testUrl = 'https://example.com';
    component.openLink(testUrl);
    expect(window.open).toHaveBeenCalledWith(testUrl, '_blank');
  });

  it('should unsubscribe from themeSubscription on ngOnDestroy', () => {
    fixture.detectChanges(); // ngOnInit to set up subscription
    spyOn(component['themeSubscription'], 'unsubscribe'); // Access private for spying

    component.ngOnDestroy();

    expect(component['themeSubscription'].unsubscribe).toHaveBeenCalled();
  });
});
