import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface ApiResponse {
  answer?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private flaskApiUrl = 'http://localhost:5000/api/ask'; // Flask backend URL

  private answerSubject = new BehaviorSubject<string | null>(null);
  answer$ = this.answerSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) { }

  getAnswer(question: string): void {
    this.loadingSubject.next(true);
    this.answerSubject.next(null);
    this.errorSubject.next(null);

    this.http.post<ApiResponse>(this.flaskApiUrl, { question })
      .pipe(
        tap((response: ApiResponse) => {
          if (response.answer) {
            this.answerSubject.next(response.answer);
          } else if (response.error) {
            this.errorSubject.next(response.error);
          }
          // Consider logging if response is successful but structure is unexpected
          this.loadingSubject.next(false);
        }),
        catchError((error: HttpErrorResponse) => {
          let userFriendlyMessage = 'An unexpected error occurred. Please try again.';
          if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred.
            userFriendlyMessage = 'Could not connect to the server. Please check your network connection.';
            console.error('Client-side error:', error.error.message);
          } else {
            // The backend returned an unsuccessful response code.
            console.error(`Backend returned code ${error.status}, body was: `, error.error);
            const serverError = error.error?.error; // Assuming backend sends { "error": "message" }

            switch (error.status) {
              case 400: // Bad Request
                userFriendlyMessage = serverError || 'The request was invalid. Please check your input.';
                break;
              case 401: // Unauthorized
                userFriendlyMessage = serverError || 'You are not authorized. Please check your API key.';
                break;
              case 403: // Forbidden
                userFriendlyMessage = serverError || 'Access denied.';
                break;
              case 500: // Internal Server Error
                userFriendlyMessage = serverError || 'A server error occurred. Please try again later.';
                break;
              case 503: // Service Unavailable
                userFriendlyMessage = serverError || 'The service is temporarily unavailable. Please try again later.';
                break;
              default:
                userFriendlyMessage = serverError || `Something went wrong (Error ${error.status}). Please try again.`;
            }
          }
          this.errorSubject.next(userFriendlyMessage);
          this.loadingSubject.next(false);
          return throwError(() => new Error(userFriendlyMessage));
        })
      )
      .subscribe();
  }

  // Method to allow components to manually trigger a clear of errors/answers if needed
  clearState(): void {
    this.answerSubject.next(null);
    this.errorSubject.next(null);
    this.loadingSubject.next(false);
  }
}
