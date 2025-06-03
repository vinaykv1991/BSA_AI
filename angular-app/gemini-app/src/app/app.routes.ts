import { Routes } from '@angular/router';
import { ChatInterface } from './chat-interface/chat-interface';
import { SettingsComponent } from './settings/settings.component';
import { SplashScreenComponent } from './splash-screen/splash-screen.component'; // Import SplashScreenComponent

export const routes: Routes = [
  { path: 'splash', component: SplashScreenComponent },
  { path: 'chat', component: ChatInterface },
  { path: 'settings', component: SettingsComponent },
  { path: '', redirectTo: '/splash', pathMatch: 'full' }, // Default route is now splash
  // Example of a wildcard route for a PageNotFoundComponent (create it if needed)
  // { path: '**', component: PageNotFoundComponent },
];
