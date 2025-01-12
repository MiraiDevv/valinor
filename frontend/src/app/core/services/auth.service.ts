import { Injectable, signal, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { ILoginResponse, IUser, IUserRegistration } from '../interfaces/auth.interface';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private currentUserSignal = signal<IUser | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.checkInitialAuth();
    }
  }

  private checkInitialAuth(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    console.log('Initial auth check - Token:', !!token, 'User:', !!user);
    
    if (token && user) {
      try {
        this.currentUserSignal.set(JSON.parse(user));
      } catch (e) {
        console.error('Error parsing stored user:', e);
        this.logout();
      }
    }
  }

  login(email: string, password: string): Observable<ILoginResponse> {
    console.log('Attempting login for:', email);
    return this.http.post<ILoginResponse>(`${this.API_URL}/users/login`, { email, password })
      .pipe(
        tap(response => {
          console.log('Login successful');
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
          }
          this.currentUserSignal.set(response.user);
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    console.log('Logging out user');
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
  }

  isAuthenticated(): boolean {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    const user = this.currentUserSignal();
    const isAuth = !!token && !!user;
    console.log('Auth check:', { hasToken: !!token, hasUser: !!user, isAuth });
    return isAuth;
  }

  getCurrentUser(): IUser | null {
    return this.currentUserSignal();
  }

  register(userData: IUserRegistration): Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>(`${this.API_URL}/users/register`, userData)
      .pipe(
        tap(response => {
          console.log('Registration successful');
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
          }
          this.currentUserSignal.set(response.user);
        }),
        catchError(error => {
          console.error('Registration error:', error);
          return throwError(() => error);
        })
      );
  }
} 
