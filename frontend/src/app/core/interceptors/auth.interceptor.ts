import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip auth header for auth endpoints
    if (this.isAuthEndpoint(request.url)) {
      console.log('Skipping auth header for auth endpoint:', request.url);
      return next.handle(request);
    }

    const token = localStorage.getItem('token'); // Get token directly from localStorage
    console.log('Current token:', token); // Debug log

    if (!token) {
      console.log('No token found, redirecting to login'); // Debug log
      this.router.navigate(['/auth/login']);
      return throwError(() => new Error('No authentication token'));
    }

    // Clone request with auth header
    const authReq = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`),
      withCredentials: true
    });
    
    // Debug logs
    console.log('Request headers:', {
      Authorization: authReq.headers.get('Authorization'),
      'Content-Type': authReq.headers.get('Content-Type'),
      Accept: authReq.headers.get('Accept')
    });
    console.log('Request URL:', authReq.url);

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('HTTP Error:', error); // Debug log
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        if (error.status === 401) {
          console.log('401 error detected, logging out');
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        }
        return throwError(() => error);
      }),
      finalize(() => {
        console.log('Request completed'); // Debug log
      })
    );
  }

  private isAuthEndpoint(url: string): boolean {
    const isAuth = url.includes(`${environment.apiUrl}/users/login`) || 
                  url.includes(`${environment.apiUrl}/users/register`);
    console.log('Is auth endpoint:', isAuth, 'for URL:', url);
    return isAuth;
  }
} 