// error.interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error instanceof HttpErrorResponse && error.status >= 400) {
        let message = 'An unexpected error occurred!';
        if (error.error?.message) {
          message = error.error.message;   // my mentioned message from the backend directory is taken here
        } else if (error.statusText) {
          message = `${error.status} - ${error.statusText}`;
        }

        snackBar.open(message, 'Close', {
          duration: 4000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snackbar-error'],
        });
      }

      return throwError(() => error);
    })
  );
};
