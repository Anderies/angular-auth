import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError, Subject, BehaviorSubject } from 'rxjs';
import { User } from './user.model';

export interface AuthResponseData {
    idToken: string,
    email: string,
    refreshToken: string,
    expiresIn: string,
    localId: string,
    registered?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    // this subject is a subject to which we can subscribe and well get information whenever
    // new data emitted
    // user = new Subject<User>();
    user = new BehaviorSubject<User>(null);
    

    constructor(private http: HttpClient) { }
    APIKEY = "AIzaSyAcS-HA98lrib11VdRHj0uTdBe5PdAiJeU";
    signup(email: string, password: string) {
        return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.APIKEY}`,
            {
                email: email,
                password: password,
                returnSecureToken: true
            }
        ).pipe(catchError(this.handleError), tap(resData => {
            this.handleAuthentication(resData.email,
                resData.localId,
                resData.idToken,
                +resData.expiresIn);
        })
        );
    }

    private handleAuthentication(email: string, userId: string, token: string, expiresIn: number) {
        const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
        const user = new User(
            email,
            userId,
            token,
            expirationDate
        );
        this.user.next(user);
    }

    login(email: string, password: string) {
        return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.APIKEY}`, {
            email: email,
            password: password,
            returnSecureToken: true,
        }).pipe(catchError(this.handleError), tap(resData => {
            this.handleAuthentication(resData.email,
                resData.localId,
                resData.idToken,
                +resData.expiresIn);
        }));
    }



    private handleError(errorRes: HttpErrorResponse) {
        let errorMessage = 'An Unknown error occured!';
        if (!errorRes.error || !errorRes.error.error) {
            return throwError(errorMessage);
        }
        switch (errorRes.error.error.message) {
            case 'EMAIL_EXISTS':
                errorMessage = "Email already been used";
                break;
            case 'EMAIL_NOT_FOUND':
                errorMessage = "Email not Found";
                break;
            case 'INVALID_PASSWORD':
                errorMessage = "Password is not correct";
                break;
        }
        return throwError(errorMessage);
    }
}
