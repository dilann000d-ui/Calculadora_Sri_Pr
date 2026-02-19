import { Component, signal } from '@angular/core';
import { AuthService, User } from './services/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  title = 'frontend';
  user: User | null = null;

  constructor(private auth: AuthService) {
    this.user = this.auth.getUser();
  }
}
