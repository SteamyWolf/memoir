import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { AngularFireStorage } from "@angular/fire/compat/storage";
import { AuthService } from "src/app/auth/auth.service";
import { User } from "src/app/auth/user.model";
import { v4 as uuid } from 'uuid';

@Injectable({providedIn: 'root'})
export class TemplatesService {
    public currentTemplateUUID: string;
    user: User;
    constructor(private afStore: AngularFirestore, private authSvc: AuthService, private afStorage: AngularFireStorage) {
        this.authSvc.currentUser.subscribe((user: User) => {
            this.user = user;
        })
    }

    updateUserOnFireStore() {
        this.afStore.doc(`users/${this.user.uId}`).update(JSON.parse(JSON.stringify(this.user)))
            .then(() => {
                console.log('SUCCESS')
            })
            .catch(err => {
                console.error(err);
            })
    }

    uploadTemplateImage(event: any, content: any, previousImageUrl: string, columnIndex: number, rowIndex?: number) {
        const file: File = event.target.files[0];
        let filePath: string;
        if (content.heroImage) {
            filePath = `columnHeroImage=${this.currentTemplateUUID}=${uuid()}`;
            this.afStorage.upload(filePath, file).then(taskSnapshot => {
                if (!previousImageUrl.includes('../../../../assets/image-placeholder.jpeg')) {
                    this.afStorage.refFromURL(previousImageUrl).delete().toPromise().catch(err => console.error(err));
                }
                let currentTemplate = this.user.data!.chosenTemplates.find(template => template.uuid === this.currentTemplateUUID);
                let currentTemplateIndex = this.user.data!.chosenTemplates.findIndex(template => template.uuid === this.currentTemplateUUID)
                let column = currentTemplate!.columns[columnIndex]
                this.afStorage.ref(taskSnapshot.metadata.fullPath).getDownloadURL().subscribe(url => {
                    column.heroImage = url;
                    this.user.data!.chosenTemplates[currentTemplateIndex].columns[columnIndex] = column;
                    this.authSvc.currentUser.next(this.user);
                })
            }).catch(err => {
                console.error(err)
            })
        } else {
            if (rowIndex) {
                filePath = `rowImage=${this.currentTemplateUUID}=${uuid()}`
                this.afStorage.upload(filePath, file).then(taskSnapshot => {
                    if (!previousImageUrl.includes('../../../../assets/image-placeholder.jpeg')) {
                        this.afStorage.refFromURL(previousImageUrl).delete().toPromise().catch(err => console.error(err));
                    }
                    let currentTemplate = this.user.data!.chosenTemplates.find(template => template.uuid === this.currentTemplateUUID);
                    let currentTemplateIndex = this.user.data!.chosenTemplates.findIndex(template => template.uuid === this.currentTemplateUUID)
                    let column = currentTemplate!.columns[columnIndex];
                    let row = column.content![rowIndex];
                    this.afStorage.ref(taskSnapshot.metadata.fullPath).getDownloadURL().subscribe(url => {
                        row.image = url;
                        this.user.data!.chosenTemplates[currentTemplateIndex].columns[columnIndex].content![rowIndex] = row;
                        this.authSvc.currentUser.next(this.user);
                    })
                }).catch(err => {
                    console.error(err)
                })
            }
        }
        
    }
}