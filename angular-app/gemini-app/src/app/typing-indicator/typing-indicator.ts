import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-typing-indicator',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './typing-indicator.html',
  styleUrls: ['./typing-indicator.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypingIndicator {
  constructor() { }
}
