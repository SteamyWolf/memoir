import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/auth/user.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
    user: User | null;
    userPhoto: string;
    form: FormGroup;
    @ViewChild('uploadProfilePic') uploadProfilePic: HTMLInputElement;
    constructor(private authService: AuthService, private afStorage: AngularFireStorage, private afStore: AngularFirestore) { }

    ngOnInit(): void {
        this.authService.currentUser.subscribe((user: User | null) => {
            this.user = user
            console.log(user)
            if (user?.photoUrl) {
                this.userPhoto = user.photoUrl;
            } else {
                this.userPhoto = '../../../assets/no_profile.png';
            }
        });

        this.form = new FormGroup({
            'displayName': new FormControl(this.user?.displayName ? this.user.displayName : '', [Validators.maxLength(100)]),
            'email': new FormControl(this.user?.email ? this.user.email : '', [Validators.email, Validators.maxLength(100)])
        })
    }

    uploadImage(event: any) {
        if (event) {
            const file: File = event.target.files[0];
            const filePath = `${this.user?.uId}-profilePic`;
            const task = this.afStorage.upload(filePath, file);
            task.percentageChanges().subscribe(percent => {
                console.log(percent);
            })
            task.then(taskSnapshot => {
                console.log('%%%%%%%%', taskSnapshot);
                if (this.user?.photoUrl) {
                    this.afStorage.refFromURL(this.user.photoUrl).delete();
                }
                this.afStore.doc(`users/${this.user?.uId}`).update({photoUrl: filePath}).then(success => {
                    console.log('(((((', success);
                    taskSnapshot.ref.getDownloadURL().then((url: string) => {
                        this.user!.photoUrl = url;
                        this.authService.currentUser.next(this.user);
                    })
                })
                
            })
            .catch(err => {
                console.error(err);
            })
            
        }
    }

    saveForm() {
        console.log(this.form);
    }
}
