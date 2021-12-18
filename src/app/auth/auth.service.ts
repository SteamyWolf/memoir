import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { NavigationEnd, NavigationStart, Router } from "@angular/router";
import { BehaviorSubject, Subject } from "rxjs";
import { AuthData } from "./auth-data.model";
import { User } from "./user.model";
import { AngularFirestore, AngularFirestoreDocument } from "@angular/fire/compat/firestore";
import firebase from 'firebase/compat/app';

@Injectable({providedIn: 'root'})
export class AuthService {
    currentUser: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
    currentRoute: BehaviorSubject<NavigationEnd | null> = new BehaviorSubject<NavigationEnd | null>(null);
    appLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    authChange: Subject<boolean> = new Subject<boolean>();
    authError: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private isAuthenticated: boolean = false;
    constructor(private afAuth: AngularFireAuth, private router: Router, private afStore: AngularFirestore) {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                console.log(event)
                this.currentRoute.next(event);
            }
        })
    }

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
                this.currentUser.next(data);
                this.authenticationSuccessful();
                this.afStore.doc(`users/${result.user?.uid}`).set(data);
            })
            .catch(err => {
                console.log(err)
                this.appLoading.next(false);
                this.authError.next(true);
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
                this.appLoading.next(false);
                this.authError.next(true);
            })
    }

    authenticationSuccessful() {
        this.appLoading.next(false);
        this.router.navigate(['/stories']);
        this.isAuthenticated = true;
        this.authChange.next(true);
    }

    logout() {
        this.authChange.next(false);
        this.isAuthenticated = false;
        this.currentUser.next(null);
        this.router.navigate(['/login']);
    }

    async googleSignIn() {
        try {
            const credential = await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
            let photoUrlArray = credential.user?.photoURL?.split('=');
            let photoUrl = photoUrlArray ? photoUrlArray[0] : null;
            console.log(credential)
            const data: User = {
                uId: credential.user?.uid,
                email: credential.user?.email,
                photoUrl: `${photoUrl}=s500-c`,
                displayName: credential.user?.displayName,
                provider: credential.credential?.signInMethod
            }
            return this.updateUserData(data).then(() => {
                this.authenticationSuccessful();
                this.currentUser.next(data);
            })
            .catch(err => {
                console.log(err)
                this.appLoading.next(false);
                this.authError.next(true);
            })
        } catch (error) {
            this.appLoading.next(false);
            this.authError.next(true);
        } 
    }

    async facebookSignIn() {
        try {
            const credential = await this.afAuth.signInWithPopup(new firebase.auth.FacebookAuthProvider());
            console.log(credential)
            const data: User = {
                uId: credential.user?.uid,
                email: credential.user?.email,
                photoUrl: `${credential.user?.photoURL}?height=500`,
                displayName: credential.user?.displayName,
                provider: credential.credential?.signInMethod
            }
            return this.updateUserData(data).then(() => {
                this.authenticationSuccessful();
                this.currentUser.next(data);
            }).catch(err => {
                console.log(err);
                this.appLoading.next(false);
                this.authError.next(true);
            })
        } catch (error) {
            this.appLoading.next(false);
            this.authError.next(true);
        }
    }

    private updateUserData(data: User) {
        const userRef: AngularFirestoreDocument<User> = this.afStore.doc(`users/${data.uId}`);
        return userRef.set(data, { merge: true });
    }
}