import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { Router } from "@angular/router";
import { BehaviorSubject, Subject } from "rxjs";
import { AuthData } from "./auth-data.model";
import { User } from "./user.model";
import { AngularFirestore, AngularFirestoreDocument } from "@angular/fire/compat/firestore";
import firebase from 'firebase/compat/app';

@Injectable({providedIn: 'root'})
export class AuthService {
    currentUser: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
    authChange: Subject<boolean> = new Subject<boolean>();
    private isAuthenticated: boolean = false;
    constructor(private afAuth: AngularFireAuth, private router: Router, private afStore: AngularFirestore) {}

    isAuth() {
        return this.isAuthenticated;
    }

    registerUser(authData: AuthData) {
        this.afAuth.createUserWithEmailAndPassword(authData.email, authData.password)
            .then(result => {
                console.log(result)
                const data: User = {
                    uId: result.user?.uid,
                    email: authData.email,
                }
                this.authenticationSuccessful();
                this.afStore.doc(`users/${result.user?.uid}`).set(data);
            })
            .catch(err => {
                console.log(err)
            })
    }

    signInUser(authData: AuthData) {
        this.afAuth.signInWithEmailAndPassword(authData.email, authData.password)
            .then(result => {
                console.log(result);
                this.authenticationSuccessful();
                this.afStore.doc<User>(`users/${result.user?.uid}`).get().subscribe(doc => {
                    const user: User = {
                        uId: doc.get('uId'),
                        email: doc.get('email'),
                        photoUrl: doc.get('photoUrl'),
                        displayName: doc.get('displayName')
                    }
                    this.currentUser.next(user)
                })
            })
            .catch(err => {
                console.log(err);
            })
    }

    authenticationSuccessful() {
        this.router.navigate(['/stories']);
        this.isAuthenticated = true;
        this.authChange.next(true);
    }

    logout() {
        this.authChange.next(false);
        this.isAuthenticated = false;
        this.router.navigate(['/login']);
    }

    async googleSignIn() {
        const credential = await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
        const data: User = {
            uId: credential.user?.uid,
            email: credential.user?.email,
            photoUrl: credential.user?.photoURL,
            displayName: credential.user?.displayName
        }
        return this.updateUserData(data).then(() => {
            this.authenticationSuccessful();
            this.currentUser.next(data);
        })
        .catch(err => {
            console.log(err)
        })
    }

    private updateUserData(data: User) {
        const userRef: AngularFirestoreDocument<User> = this.afStore.doc(`users/${data.uId}`);
        return userRef.set(data, { merge: true });
    }
}