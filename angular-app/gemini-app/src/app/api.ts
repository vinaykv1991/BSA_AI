import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../environments/environment'; // For API URL

export interface AskResponse {
  answer: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Using BehaviorSubjects to stream data to components
  private readonly answerSubject = new BehaviorSubject<string>('');
  private readonly errorSubject = new BehaviorSubject<string>('');
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  // Expose observables for components to subscribe to
  public readonly answer$ = this.answerSubject.asObservable();
  public readonly error$ = this.errorSubject.asObservable();
  public readonly loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Sends a question to the backend API and updates observables.
   * @param question The user's question as a string.
   */
  public getAnswer(question: string): void {
    // Reset previous state
    this.loadingSubject.next(true);
    this.answerSubject.next('');
    this.errorSubject.next('');

    const body = { question };

    this.http.post<AskResponse>(`${environment.apiUrl}/api/ask`, body).pipe(
      tap(response => {
        // On success, update the answer and stop loading
        this.answerSubject.next(response.answer);
        this.loadingSubject.next(false);
      }),
      catchError((error: HttpErrorResponse) => {
        // On error, update the error message and stop loading
        const errorMessage = error.error?.error || error.message || 'An unknown error occurred.';
        this.errorSubject.next(errorMessage);
        this.loadingSubject.next(false);
        return throwError(() => new Error(errorMessage));
      })
    ).subscribe(); // Subscribe here to trigger the request
  }
}
