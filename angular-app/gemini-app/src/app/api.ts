import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
//import { environment } from '../../environments/environment'; // Import environment

export interface ApiResponse {
  answer?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Construct the full API URL for the /ask endpoint
  private askEndpointUrl = `https://bsa-ai.onrender.com//api/ask`;

  private answerSubject = new BehaviorSubject<string | null>(null);
  answer$ = this.answerSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('API Service initialized. API URL: https://bsa-ai.onrender.com//api');
    console.log('Full /api/ask endpoint URL:', this.askEndpointUrl);
  }

  getAnswer(question: string): void {
    this.loadingSubject.next(true);
    this.answerSubject.next(null);
    this.errorSubject.next(null);

    this.http.post<ApiResponse>(this.askEndpointUrl, { question }) // Use the constructed URL
      .pipe(
        tap((response: ApiResponse) => {
          if (response.answer) {
            this.answerSubject.next(response.answer);
          } else if (response.error) {
            this.errorSubject.next(response.error);
          }
          this.loadingSubject.next(false);
        }),
        catchError((error: HttpErrorResponse) => {
          let userFriendlyMessage = 'An unexpected error occurred. Please try again.';
          if (error.error instanceof ErrorEvent) {
            userFriendlyMessage = 'Could not connect to the server. Please check your network connection.';
            console.error('Client-side error:', error.error.message);
          } else {
            console.error(`Backend returned code ${error.status}, body was: `, error.error);
            const serverError = error.error?.error;

            switch (error.status) {
              case 400:
                userFriendlyMessage = serverError || 'The request was invalid. Please check your input.';
                break;
              case 401:
                userFriendlyMessage = serverError || 'You are not authorized. Please check your API key.';
                break;
              case 403:
                userFriendlyMessage = serverError || 'Access denied.';
                break;
              case 500:
                userFriendlyMessage = serverError || 'A server error occurred. Please try again later.';
                break;
              case 503:
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

  clearState(): void {
    this.answerSubject.next(null);
    this.errorSubject.next(null);
    this.loadingSubject.next(false);
  }
}
