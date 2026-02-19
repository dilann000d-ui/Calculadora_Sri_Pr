import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './auth';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://13.59.191.40:3000/api/users';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password });
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  getAll(token: string, ts?: string) {
    return this.http.get<User[] | { users: User[] }>(`${this.apiUrl}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: ts ? { _ts: ts } : {}
    });
  }

  updateUser(id: string, data: any, token: string) {
    return this.http.put(`${this.apiUrl}/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  deleteUser(id: string, token: string) {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
