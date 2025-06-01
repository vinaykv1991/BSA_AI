import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon'; // For the greeting icon

@Component({
  selector: 'app-welcome-message',
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './welcome-message.html',
  styleUrls: ['./welcome-message.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeMessage {
  @Output() examplePromptClicked = new EventEmitter<string>();

  constructor() { }

  onPromptClick(prompt: string): void {
    this.examplePromptClicked.emit(prompt);
  }
}
