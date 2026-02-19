import { Component, OnInit } from '@angular/core';
import { NotificationService, Notification } from '../../services/notification';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      <div 
        *ngFor="let notification of notifications"
        [class]="'toast-notification toast-' + notification.type"
      >
        <div class="toast-content">
          <i [class]="'bi ' + getIcon(notification.type)"></i>
          <span class="toast-message">{{ notification.message }}</span>
        </div>
        <button 
          class="btn-close-toast"
          (click)="notificationService.remove(notification.id)"
        >
          ×
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    }

    .toast-notification {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-width: 300px;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.4s ease-out;
      pointer-events: auto;
      font-weight: 500;
      font-size: 0.95rem;
    }

    .toast-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .toast-notification i {
      font-size: 1.3rem;
      flex-shrink: 0;
    }

    .toast-message {
      flex: 1;
    }

    .btn-close-toast {
      background: none;
      border: none;
      color: inherit;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      margin-left: 12px;
      opacity: 0.7;
      transition: opacity 0.2s;
      flex-shrink: 0;
    }

    .btn-close-toast:hover {
      opacity: 1;
    }

    /* Toast Success */
    .toast-success {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }

    /* Toast Error */
    .toast-error {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
    }

    /* Toast Warning */
    .toast-warning {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
    }

    /* Toast Info */
    .toast-info {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(400px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @media (max-width: 768px) {
      .notification-container {
        left: 10px;
        right: 10px;
        top: 10px;
      }

      .toast-notification {
        min-width: auto;
        width: 100%;
      }
    }
  `]
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(public notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(
      (notifications) => {
        this.notifications = notifications;
      }
    );
  }

  getIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'success': 'bi-check-circle-fill',
      'error': 'bi-exclamation-circle-fill',
      'warning': 'bi-exclamation-triangle-fill',
      'info': 'bi-info-circle-fill'
    };
    return icons[type] || 'bi-info-circle-fill';
  }
}
