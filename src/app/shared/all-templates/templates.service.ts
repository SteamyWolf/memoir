import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { AuthService } from "src/app/auth/auth.service";
import { User } from "src/app/auth/user.model";
import { map } from 'rxjs/operators';
import { BehaviorSubject } from "rxjs";

@Injectable({providedIn: 'root'})
export class TemplatesService {
    public currentTemplateUUID: string;
    constructor(private afStore: AngularFirestore, private authSvc: AuthService) {}

    saveTemplateToFirebase(templateType: string) {
        this.authSvc.currentUser.subscribe((user: User) => {
            this.afStore.doc(`users/${user.uId}`).get().subscribe(document => {
                console.log(document.get('data'));
            })
        })
    }
}