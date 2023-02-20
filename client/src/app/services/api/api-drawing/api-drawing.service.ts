import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SERVER_HOSTNAME } from '@app/classes/server-ip';
import { DrawingToDatabase } from '@common/communication/drawing-to-database';
import { DrawingToEmail } from '@common/communication/drawing-to-email';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const BASE_URL = `http://${SERVER_HOSTNAME}/api/drawing/`;
export const EMAIL_BASE_URL = `http://${SERVER_HOSTNAME}/api/email/`;
export const FILE_SERVER_BASE_URL = `http://${SERVER_HOSTNAME}/files/`;

@Injectable({
    providedIn: 'root',
})
export class ApiDrawingService {
    constructor(private http: HttpClient) {}

    getAll(): Observable<DrawingToDatabase[]> {
        return this.http.get<DrawingToDatabase[]>(BASE_URL).pipe(catchError(this.handleError<DrawingToDatabase[]>('getAll')));
    }

    getById(id: string): Observable<DrawingToDatabase> {
        return this.http.get<DrawingToDatabase>(BASE_URL + id).pipe(catchError(this.handleError<DrawingToDatabase>('getByID')));
    }

    getByName(name: string): Observable<DrawingToDatabase[]> {
        return this.http.get<DrawingToDatabase[]>(BASE_URL + 'name/' + name).pipe(catchError(this.handleError<DrawingToDatabase[]>('getByName')));
    }

    getByTag(tag: string): Observable<DrawingToDatabase[]> {
        return this.http.get<DrawingToDatabase[]>(BASE_URL + 'tag/' + tag).pipe(catchError(this.handleError<DrawingToDatabase[]>('getByTag')));
    }

    save(drawingtodatabase: DrawingToDatabase): Observable<void> {
        return this.http.post<void>(BASE_URL, drawingtodatabase).pipe(catchError(this.handleError<void>('save')));
    }

    sendEmail(drawingtoemail: DrawingToEmail): Observable<void> {
        return this.http.post<void>(EMAIL_BASE_URL, drawingtoemail).pipe(catchError(this.handleError<void>('email')));
    }

    delete(id: string): Observable<string> {
        return this.http.delete<string>(BASE_URL + id).pipe(catchError(this.handleError<string>('delete')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return (error: Error): Observable<T> => {
            alert(error.message);
            return of(result as T);
        };
    }
}
