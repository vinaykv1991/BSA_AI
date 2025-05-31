import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService, ApiResponse } from './api'; // Adjusted import to ApiService

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const flaskApiUrl = 'http://localhost:5000/api/ask';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Make sure that there are no outstanding requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAnswer', () => {
    const testQuestion = 'What is Angular?';
    const mockSuccessResponse: ApiResponse = { answer: 'Angular is a platform and framework for building single-page client applications.' };
    const mockErrorResponseText = 'Internal Server Error';

    it('should return an answer and update BehaviorSubjects on successful API call', (done) => {
      let answer: string | null = null;
      let error: string | null = null;
      let loading: boolean = false;
      let loadingUpdates: boolean[] = [];

      service.answer$.subscribe(ans => answer = ans);
      service.error$.subscribe(err => error = err);
      service.loading$.subscribe(load => {
        loading = load;
        loadingUpdates.push(load);
      });

      service.getAnswer(testQuestion);

      const req = httpMock.expectOne(flaskApiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ question: testQuestion });
      req.flush(mockSuccessResponse);

      // Expect loading to go true then false
      expect(loadingUpdates).toEqual([false, true, false]); // Initial(false) -> true -> false
      expect(answer).toBe(mockSuccessResponse.answer!);
      expect(error).toBeNull();
      expect(loading).toBeFalse();
      done();
    });

    it('should handle a 500 HTTP error and update BehaviorSubjects', (done) => {
      let answer: string | null = null;
      let error: string | null = null;
      let loading: boolean = false;
      let loadingUpdates: boolean[] = [];

      service.answer$.subscribe(ans => answer = ans);
      service.error$.subscribe(err => error = err);
      service.loading$.subscribe(load => {
          loading = load;
          loadingUpdates.push(load);
      });

      service.getAnswer(testQuestion);

      const req = httpMock.expectOne(flaskApiUrl);
      expect(req.request.method).toBe('POST');
      req.flush({ error: mockErrorResponseText }, { status: 500, statusText: 'Internal Server Error' });

      expect(loadingUpdates).toEqual([false, true, false]); // Initial(false) -> true -> false
      expect(answer).toBeNull();
      expect(error).toContain(mockErrorResponseText); // User-friendly message will contain this
      expect(error).toContain('500');
      expect(loading).toBeFalse();
      done();
    });

    it('should handle a network error and update BehaviorSubjects', (done) => {
      let answer: string | null = null;
      let error: string | null = null;
      let loading: boolean = false;
      let loadingUpdates: boolean[] = [];

      service.answer$.subscribe(ans => answer = ans);
      service.error$.subscribe(err => error = err);
      service.loading$.subscribe(load => {
          loading = load;
          loadingUpdates.push(load);
      });

      service.getAnswer(testQuestion);

      const req = httpMock.expectOne(flaskApiUrl);
      expect(req.request.method).toBe('POST');
      // Simulate a network error
      req.error(new ProgressEvent('network error'), { status: 0, statusText: 'Network Error' });

      expect(loadingUpdates).toEqual([false, true, false]); // Initial(false) -> true -> false
      expect(answer).toBeNull();
      expect(error).toBe('Could not connect to the server. Please check your network connection.');
      expect(loading).toBeFalse();
      done();
    });

    it('should clear previous answer and error on new call', (done) => {
        // First set some initial values
        service['answerSubject'].next("previous answer");
        service['errorSubject'].next("previous error");

        let answer: string | null = null;
        let error: string | null = null;
        service.answer$.subscribe(ans => answer = ans);
        service.error$.subscribe(err => error = err);

        service.getAnswer(testQuestion);

        // Before flushing, check if they are cleared
        expect(answer).toBeNull();
        expect(error).toBeNull();

        const req = httpMock.expectOne(flaskApiUrl);
        req.flush(mockSuccessResponse); // Complete the call

        expect(answer).toBe(mockSuccessResponse.answer!);
        done();
    });

  });

  describe('clearState', () => {
    it('should reset answer, error, and loading states', () => {
      // Set initial states
      service['answerSubject'].next('Some answer');
      service['errorSubject'].next('Some error');
      service['loadingSubject'].next(true);

      service.clearState();

      expect(service['answerSubject'].getValue()).toBeNull();
      expect(service['errorSubject'].getValue()).toBeNull();
      expect(service['loadingSubject'].getValue()).toBeFalse();
    });
  });

});
