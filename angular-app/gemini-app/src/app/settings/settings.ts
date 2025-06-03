import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
// import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // For confirmation dialog later

// Services
import { ThemeService, Theme } from '../services/theme.service';
import { ChatStateService } from '../services/chat-state.service'; // Import ChatStateService

export type TextSizeSetting = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatToolbarModule, MatListModule, MatIconModule, MatButtonModule, MatButtonToggleModule, MatSelectModule, MatDividerModule,
    // MatDialogModule, // For confirmation dialog
  ],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit, OnDestroy {
  selectedTheme: Theme = 'system';
  selectedTextSize: TextSizeSetting = 'medium';

  private themeSubscription!: Subscription;

  constructor(
    private location: Location,
    private themeService: ThemeService,
    private chatStateService: ChatStateService, // Inject ChatStateService
    private cdr: ChangeDetectorRef
    // public dialog: MatDialog // For confirmation dialog
  ) {}

  ngOnInit(): void {
    this.themeSubscription = this.themeService.currentTheme$.subscribe(theme => {
      this.selectedTheme = theme;
      this.cdr.markForCheck();
    });
    // console.log('SettingsComponent initialized. Current theme from service:', this.selectedTheme);
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  goBack(): void {
    this.location.back();
  }

  onThemeSettingChange(theme: Theme): void {
    this.themeService.setTheme(theme);
    // console.log('Theme changed to:', theme);
  }

  onTextSizeChange(size: TextSizeSetting): void {
    this.selectedTextSize = size;
    console.log('Text size changed to:', size);
    // TODO: Call a service to apply text size
  }

  confirmClearChatHistory(): void {
    // For now, using a simple browser confirm. Replace with MatDialog for better UX later.
    if (typeof window !== 'undefined' && window.confirm('Are you sure you want to delete all chat history? This action cannot be undone.')) {
      this.chatStateService.clearMessages();
      console.log('Chat history cleared.');
      // Optionally, navigate back to chat or show a toast message
      // this.location.back(); // Example: Navigate back after clearing
    }
  }

  openLink(url: string): void {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  }

  noop(): void {
    console.log('Action not implemented yet.');
  }
}
