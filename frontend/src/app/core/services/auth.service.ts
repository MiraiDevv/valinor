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
    console.log('=== Initial Auth Check ===');
    console.log('Token exists:', !!token);
    console.log('Token value:', token);
    console.log('User exists:', !!user);
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        console.log('Parsed user:', parsedUser);
        this.currentUserSignal.set(parsedUser);
      } catch (e) {
        console.error('Error parsing stored user:', e);
        this.logout();
      }
    }
  }

  login(email: string, password: string): Observable<ILoginResponse> {
    console.log('=== Login Attempt ===');
    console.log('Login attempt for email:', email);
    return this.http.post<ILoginResponse>(`${this.API_URL}/users/login`, { email, password })
      .pipe(
        tap(response => {
          console.log('=== Login Response ===');
          console.log('Login successful');
          console.log('Access token:', response.access_token);
          console.log('User:', response.user);
          
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            // Verify storage
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            console.log('=== Storage Verification ===');
            console.log('Token stored correctly:', storedToken === response.access_token);
            console.log('User stored correctly:', storedUser === JSON.stringify(response.user));
          }
          this.currentUserSignal.set(response.user);
        }),
        catchError(error => {
          console.error('=== Login Error ===');
          console.error('Error details:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    console.log('=== Logout ===');
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('Local storage cleared');
    }
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    console.log('=== Get Token ===');
    console.log('Token retrieved:', token);
    return token;
  }

  isAuthenticated(): boolean {
    const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
    const user = this.currentUserSignal();
    const isAuth = !!token && !!user;
    console.log('=== Auth Check ===');
    console.log('Auth state:', { hasToken: !!token, tokenValue: token, hasUser: !!user, isAuth });
    return isAuth;
  }

  getCurrentUser(): IUser | null {
    const user = this.currentUserSignal();
    console.log('=== Get Current User ===');
    console.log('Current user:', user);
    return user;
  }

  register(userData: IUserRegistration): Observable<ILoginResponse> {
    console.log('=== Registration Attempt ===');
    console.log('Registration data:', { ...userData, password: '[REDACTED]' });
    return this.http.post<ILoginResponse>(`${this.API_URL}/users/register`, userData)
      .pipe(
        tap(response => {
          console.log('=== Registration Success ===');
          console.log('Access token:', response.access_token);
          console.log('User:', response.user);
          
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            // Verify storage
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            console.log('=== Storage Verification ===');
            console.log('Token stored correctly:', storedToken === response.access_token);
            console.log('User stored correctly:', storedUser === JSON.stringify(response.user));
          }
          this.currentUserSignal.set(response.user);
        }),
        catchError(error => {
          console.error('=== Registration Error ===');
          console.error('Error details:', error);
          return throwError(() => error);
        })
      );
  }
} 
