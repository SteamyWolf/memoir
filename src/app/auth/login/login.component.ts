import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthData } from '../auth-data.model';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
    onSignInPage: boolean = true;
    form: FormGroup;
    loading: boolean = false;
    authError: boolean = false;
    subscriptions: Subscription[] = [];
    constructor(private authService: AuthService) {}

    ngOnInit(): void {
        this.form = new FormGroup({
            'email': new FormControl('', Validators.email),
            'password': new FormControl('', [Validators.maxLength(50), Validators.minLength(8)])
        })

        this.subscriptions.push(this.authService.appLoading.subscribe((loading: boolean) => {
            this.loading = loading;
        }))
        
        this.subscriptions.push(this.authService.authError.subscribe((authError: boolean) => {
            this.authError = authError;
        }))
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    authDeleteIcon() {
        this.authService.authError.next(false);
    }

    changeSignIn() {
        this.onSignInPage = !this.onSignInPage;
    }

    chooseAuthMethod() {
        this.loading = true;
        const data: AuthData = {
            email: this.form.controls.email.value,
            password: this.form.controls.password.value
        }
        if (this.onSignInPage) {
            this.signInNormal(data)
        } else {
            this.signUpNormal(data);
        }
    }

    signInNormal(data: AuthData) {
        console.log('sign in')
        this.authService.signInUser(data);
    }

    signUpNormal(data: AuthData) {
        console.log('sign up');
        this.authService.registerUser(data);
    }

    googleLogin() {
        this.loading = true;
        this.authService.googleSignIn();
    }

    facebookLogin() {
        //BE SURE TO ADD THE REAL URL IN FACEBOOK DEVELOPER WHEN APP IS DEPLOYED OFFICIALLY!
        this.loading = true;
        this.authService.facebookSignIn();
    }
}

//make notificartions for when the password is invalid etc,.
