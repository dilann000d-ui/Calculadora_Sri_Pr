import { Injectable } from '@angular/core';

export interface User {
  username: string;
  email: string;
  role: 'user' | 'admin';
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userKey = 'sri_user';

  getUser(): User | null {
    const data = localStorage.getItem(this.userKey);
    return data ? JSON.parse(data) : null;
  }

  setUser(user: User) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  clearUser() {
    localStorage.removeItem(this.userKey);
  }

  isLoggedIn(): boolean {
    return !!this.getUser();
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  }

  getToken(): string | null {
    return this.getUser()?.token || null;
  }
}
