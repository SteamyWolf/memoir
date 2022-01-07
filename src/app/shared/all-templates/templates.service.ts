import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { AuthService } from "src/app/auth/auth.service";
import { User } from "src/app/auth/user.model";

@Injectable({providedIn: 'root'})
export class TemplatesService {
    public currentTemplateUUID: string;
    user: User;
    constructor(private afStore: AngularFirestore, private authSvc: AuthService) {
        this.authSvc.currentUser.subscribe((user: User) => {
            this.user = user;
        })
    }

    saveTemplateToFirebase() {
        this.afStore.doc(`users/${this.user.uId}`).update(this.user)
            .then(() => {
                console.log('SUCCESS')
            })
            .catch(err => {
                console.error(err);
            })
    }
}