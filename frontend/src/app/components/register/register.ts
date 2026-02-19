import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrl: './register.css',
  standalone: false
})

export class Register {
  username = '';
  email = '';
  password = '';
  cedulaOrRuc = '';
  registerLoading = false;
  registerError = '';
  registerSuccess = '';

  constructor(
    private userService: UserService,
    private router: Router,
    private notify: NotificationService
  ) {}

  onRegister() {
    this.registerLoading = true;
    this.registerError = '';
    this.registerSuccess = '';
    this.userService.register({
      username: this.username,
      email: this.email,
      password: this.password,
      cedulaOrRuc: this.cedulaOrRuc
    }).subscribe({
      next: (res) => {
        this.registerSuccess = 'Usuario registrado correctamente. Ahora puedes iniciar sesión.';
        this.notify.show('Registro exitoso', 'success');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.registerError = err.error?.message || 'Error al registrar usuario';
        this.registerLoading = false;
      },
      complete: () => {
        this.registerLoading = false;
      }
    });
  }
}
