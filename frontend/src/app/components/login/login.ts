import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user';
import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: false
})
export class Login {
  username = '';
  password = '';
  loginLoading = false;
  loginError = '';

  constructor(
    private userService: UserService,
    private auth: AuthService,
    private router: Router,
    private notify: NotificationService
  ) {}

  onLogin() {
    this.loginLoading = true;
    this.loginError = '';
    this.userService.login(this.username, this.password).subscribe({
      next: (res) => {
        this.auth.setUser({
          username: res.user.username,
          email: res.user.email,
          role: res.user.role,
          token: res.token
        });
        this.notify.show('¡Bienvenido!', 'success');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loginError = err.error?.message || 'Error al iniciar sesión';
        this.loginLoading = false;
      },
      complete: () => {
        this.loginLoading = false;
      }
    });
  }
}
