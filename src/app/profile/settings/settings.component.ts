import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/auth/user.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
    user: User | null;
    resetUser: User | null;
    userPhoto: string;
    loading: boolean = false;
    displayNotification: boolean = false;
    form: FormGroup;
    subscriptions: Subscription[] = [];
    @ViewChild('uploadProfilePic') uploadProfilePic: HTMLInputElement;
    constructor(private authService: AuthService, private afStorage: AngularFireStorage, private afStore: AngularFirestore, private afAuth: AngularFireAuth) { }

    // @HostListener allows us to also guard against browser refresh, close, etc.
    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        // insert logic to check if there are pending changes here;
        // returning true will navigate without confirmation
        // returning false will show a confirm dialog before navigating away
        if (this.form.dirty) {
            this.form.reset({displayName: this.resetUser?.displayName, email: this.resetUser?.email});
            this.authService.currentUser.next(this.resetUser);
            return false;
        }
        return true;
    }

    ngOnInit(): void {
        this.subscriptions.push(this.authService.currentUser.subscribe((user: User | null) => {
            this.user = user;
            this.resetUser = {...user};
            if (user?.photoUrl) {
                this.userPhoto = user.photoUrl;
            } else {
                this.userPhoto = '../../../assets/no_profile.png';
            }
        }));

        this.form = new FormGroup({
            'displayName': new FormControl(this.user?.displayName ? this.user.displayName : '', [Validators.maxLength(50)]),
            'email': new FormControl(this.user?.email ? this.user.email : '', [Validators.email, Validators.maxLength(100)])
        })

        this.subscriptions.push(this.form.controls.displayName.valueChanges.subscribe((value: string) => {
            this.user!.displayName = value;
        }));
        this.subscriptions.push(this.form.controls.email.valueChanges.subscribe((value: string) => {
            this.user!.email = value;
        }));


    }

    ngOnDestroy(): void {
        
    }

    uploadImage(event: any) {
        if (event) {
            const file: File = event.target.files[0];
            const filePath = `${this.user?.uId}-profilePic`;
            const task = this.afStorage.upload(filePath, file);
            this.subscriptions.push(task.percentageChanges().subscribe(percent => {
                console.log(percent);
            }));
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
        this.loading = true;
        this.afAuth.currentUser.then(user => {
            if (this.resetUser?.email !== this.form.controls.email.value) {
                user?.updateEmail(this.form.controls.email.value).then(() => {
                    this.afStore.doc<User>(`users/${this.user?.uId}`).update({displayName: this.form.controls.displayName.value, email: this.form.controls.email.value})
                    .then(() => {
                        this.authService.currentUser.next(this.user);
                        this.loading = false;
                        this.form.markAsPristine();
                        this.displayNotification = true;
                        setTimeout(() => {
                            this.displayNotification = false;
                        }, 3000)
                    })
                    .catch(error => {
                        console.error(error, 'from the firestore');
                        this.loading = false;
                    })
                })
                .catch(error => {
                    console.error(error);
                })
            }
        })
        .catch(error => {
            console.error(error, 'from the firebase auth');
            this.loading = false;
        })
        
    }

    cancel() {
        this.form.reset({displayName: this.resetUser?.displayName, email: this.resetUser?.email});
    }


}
