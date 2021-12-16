import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthData } from '../auth-data.model';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    onSignInPage: boolean = true;
    form: FormGroup;

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.form = new FormGroup({
            'email': new FormControl('', Validators.email),
            'password': new FormControl('', [Validators.maxLength(50), Validators.minLength(8)])
        })
    }

    changeSignIn() {
        this.onSignInPage = !this.onSignInPage;
    }

    chooseAuthMethod() {
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
        this.authService.googleSignIn();
    }

}
