import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { finalize, timeout } from 'rxjs/operators';
import { UserService } from '../../services/user';
import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-admin-usuarios',
  templateUrl: './admin-usuarios.html',
  styleUrl: './admin-usuarios.css',
  standalone: false
})
export class AdminUsuarios implements OnInit, OnDestroy {
  users: any[] = [];
  error = '';
  loading = false;
  savingUserId = '';
  deletingUserId = '';
  private loadingGuard: any = null;
  private retryTimer: any = null;
  private retryCount = 0;
  private readonly maxRetries = 4;
  private usersRequestSub: Subscription | null = null;

  constructor(
    private userService: UserService,
    private auth: AuthService,
    private notify: NotificationService
  ) {}

  ngOnInit() {
    this.retryCount = 0;
    this.loadUsers();
  }

  ngOnDestroy() {
    if (this.loadingGuard) {
      clearTimeout(this.loadingGuard);
    }
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
    this.usersRequestSub?.unsubscribe();
  }

  private scheduleRetry() {
    if (this.retryCount >= this.maxRetries) {
      return;
    }
    this.retryCount += 1;
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
    const delay = 500 + this.retryCount * 350;
    this.retryTimer = setTimeout(() => this.loadUsers(), delay);
  }

  refreshUsers() {
    if (this.loadingGuard) {
      clearTimeout(this.loadingGuard);
      this.loadingGuard = null;
    }
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    this.usersRequestSub?.unsubscribe();
    this.retryCount = 0;
    this.error = '';
    this.loadUsers();
  }

  loadUsers() {
    const token = this.auth.getToken();
    if (!token) {
      this.error = 'Sesion invalida. Vuelve a iniciar sesion.';
      this.users = [];
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = '';

    if (this.loadingGuard) {
      clearTimeout(this.loadingGuard);
    }
    this.loadingGuard = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.error = 'Tiempo de espera agotado. Verifica backend/token admin.';
        this.scheduleRetry();
      }
    }, 12000);

    const requestTs = Date.now().toString();
    this.usersRequestSub?.unsubscribe();
    this.usersRequestSub = this.userService.getAll(token, requestTs)
      .pipe(
        timeout(10000),
        finalize(() => {
          this.loading = false;
          if (this.loadingGuard) {
            clearTimeout(this.loadingGuard);
            this.loadingGuard = null;
          }
        })
      )
      .subscribe({
        next: (res: any) => {
          this.users = Array.isArray(res) ? res : (res?.users || []);
          if (this.users.length === 0) {
            this.error = this.error || 'No se cargaron usuarios. Reintentando...';
            this.scheduleRetry();
          } else {
            this.retryCount = 0;
          }
        },
        error: (err) => {
          if (err?.status === 401 || err?.status === 403) {
            this.error = 'No autorizado para gestionar usuarios. Inicia sesion como admin.';
            this.users = [];
            return;
          }

          this.error = err.error?.message || 'Error al cargar usuarios';
          this.users = [];
          this.scheduleRetry();
        }
      });
  }

  updateUser(user: any) {
    const token = this.auth.getToken();
    if (!token) {
      this.error = 'Sesion invalida. Vuelve a iniciar sesion.';
      return;
    }

    if (!user?.username || !user?.email || !user?.role) {
      this.notify.show('Completa username, email y rol', 'error');
      return;
    }

    this.savingUserId = user._id;

    this.userService.updateUser(
      user._id,
      { username: user.username, email: user.email, role: user.role },
      token
    ).pipe(
      finalize(() => { this.savingUserId = ''; })
    ).subscribe({
      next: () => this.notify.show('Usuario actualizado', 'success'),
      error: (err) => this.notify.show(err.error?.message || 'Error al actualizar', 'error')
    });
  }

  deleteUser(user: any) {
    const token = this.auth.getToken();
    if (!token) {
      this.error = 'Sesion invalida. Vuelve a iniciar sesion.';
      return;
    }

    if (!confirm('¿Eliminar usuario?')) {
      return;
    }

    this.deletingUserId = user._id;

    this.userService.deleteUser(user._id, token).pipe(
      finalize(() => { this.deletingUserId = ''; })
    ).subscribe({
      next: () => {
        this.notify.show('Usuario eliminado', 'success');
        this.refreshUsers();
      },
      error: (err) => this.notify.show(err.error?.message || 'Error al eliminar', 'error')
    });
  }
}
