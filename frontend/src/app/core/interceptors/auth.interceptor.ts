import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const AuthInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Skip auth header for auth endpoints
  if (isAuthEndpoint(request.url)) {
    console.log('Skipping auth header for auth endpoint:', request.url);
    return next(request);
  }

  const token = localStorage.getItem('token');
  console.log('=== Auth Interceptor Debug ===');
  console.log('Token from localStorage:', token);
  console.log('Original request headers:', request.headers.keys());
  console.log('Original request URL:', request.url);

  if (!token) {
    console.log('No token found, redirecting to login');
    router.navigate(['/auth/login']);
    return throwError(() => new Error('No authentication token'));
  }

  // Clone request with auth header
  const authReq = request.clone({
    headers: request.headers.set('Authorization', `Bearer ${token}`),
    withCredentials: true
  });
  
  // Debug logs
  console.log('=== Modified Request Details ===');
  console.log('Modified request headers:', {
    Authorization: authReq.headers.get('Authorization'),
    'Content-Type': authReq.headers.get('Content-Type'),
    Accept: authReq.headers.get('Accept')
  });
  console.log('Modified request URL:', authReq.url);
  console.log('withCredentials:', authReq.withCredentials);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('=== Request Error ===');
      console.error('Error status:', error.status);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      if (error.status === 401) {
        console.log('401 error detected, logging out');
        authService.logout();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    }),
    finalize(() => {
      console.log('Request completed');
    })
  );
};

function isAuthEndpoint(url: string): boolean {
  const isAuth = url.includes(`${environment.apiUrl}/users/login`) || 
                url.includes(`${environment.apiUrl}/users/register`);
  console.log('Is auth endpoint check:', { url, isAuth });
  return isAuth;
} 