import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { AngularFireStorage } from "@angular/fire/compat/storage";
import { AuthService } from "src/app/auth/auth.service";
import { User } from "src/app/auth/user.model";
import { v4 as uuid } from 'uuid';
import { tap } from 'rxjs/operators';
import { Subject } from "rxjs";

@Injectable({providedIn: 'root'})
export class TemplatesService {
    public currentTemplateUUID: string;
    user: User;
    notificationMessage: Subject<string> = new Subject<string>();
    constructor(private afStore: AngularFirestore, private authSvc: AuthService, private afStorage: AngularFireStorage) {
        this.authSvc.currentUser.subscribe((user: User) => {
            this.user = user;
        })
    }

    updateUserOnFireStore() {
        this.afStore.doc(`users/${this.user.uId}`).update(JSON.parse(JSON.stringify(this.user)))
            .then(() => {
                console.log('SUCCESS')
                this.authSvc.currentUser.next(this.user);
                this.notificationMessage.next('Successfully Updated')
            })
            .catch(err => {
                console.error(err);
            })
    }

    async uploadTemplateImage(event: any, content: any, previousImageUrl: string, columnIndex: number, rowIndex?: number) {
        const file: File = event.target.files[0];
        let filePath: string;
        // if a column --->
        if (content.heroImage) {
            filePath = `columnHeroImage=${this.currentTemplateUUID}=${uuid()}`;

            let taskSnapshot = await this.afStorage.upload(filePath, file);

            if (!previousImageUrl.includes('image-placeholder.jpeg') && !previousImageUrl.includes('blob')) {
                await this.afStorage.refFromURL(previousImageUrl).delete().toPromise().catch(err => console.error(err));
            }
            let currentTemplate = this.user.data!.chosenTemplates.find(template => template.uuid === this.currentTemplateUUID);
            let currentTemplateIndex = this.user.data!.chosenTemplates.findIndex(template => template.uuid === this.currentTemplateUUID)
            let column = currentTemplate!.columns[columnIndex]
            return this.afStorage.ref(taskSnapshot.metadata.fullPath).getDownloadURL().pipe(
                tap((url => {
                    column.heroImage = url;
                    this.user.data!.chosenTemplates[currentTemplateIndex].columns[columnIndex] = column;
                    this.authSvc.currentUser.next(this.user);
            }))).toPromise();
        } else {
            // if a row ----->
            if (rowIndex! > -1) {
                filePath = `rowImage=${this.currentTemplateUUID}=${uuid()}`
                let taskSnapshot = await this.afStorage.upload(filePath, file);
                if (!previousImageUrl.includes('image-placeholder.jpeg') && !previousImageUrl.includes('blob')) {
                    await this.afStorage.refFromURL(previousImageUrl).delete().toPromise().catch(err => console.error(err));
                }
                let currentTemplate = this.user.data!.chosenTemplates.find(template => template.uuid === this.currentTemplateUUID);
                let currentTemplateIndex = this.user.data!.chosenTemplates.findIndex(template => template.uuid === this.currentTemplateUUID)
                let column = currentTemplate!.columns[columnIndex];
                let row = column.content![rowIndex!];
                return this.afStorage.ref(taskSnapshot.metadata.fullPath).getDownloadURL().pipe(
                    tap((url => {
                        row.image = url;
                        this.user.data!.chosenTemplates[currentTemplateIndex].columns[columnIndex].content![rowIndex!] = row;
                        this.authSvc.currentUser.next(this.user);
                }))).toPromise();
            } else {
                return null;
            }
        }
    }

    deleteImages(url: string) {
        return this.afStorage.refFromURL(url).delete().toPromise()
    }
}