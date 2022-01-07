import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/auth/user.model';
import { ComponentCanDeactivate } from 'src/app/shared/deactivate/deactivate.guard';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
    user: User | null;
    resetUser: User | null;
    userPhoto: string;
    loading: boolean = false;
    displayNotification: boolean = false;
    form: FormGroup;
    progressPercentage: number | undefined = 0;
    uploading: boolean = false;
    subscriptions: Subscription[] = [];
    @ViewChild('uploadProfilePic') uploadProfilePic: HTMLInputElement;
    constructor(private authService: AuthService, private afStorage: AngularFireStorage, private afStore: AngularFirestore, private afAuth: AngularFireAuth) { }

    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        if (this.form.dirty) {
            this.form.reset({displayName: this.resetUser?.displayName, email: this.resetUser?.email});
            this.authService.currentUser.next(this.resetUser);
            return false;
        }
        return true;
    } //TODO: this is technically not working as clicking cancel will reset their changes anyways. Solution is in template01

    ngOnInit(): void {
        this.subscriptions.push(this.authService.currentUser.subscribe((user: User | null) => {
            this.user = user;
            this.resetUser = {...user};
            if (user?.photoUrl) {
                if (user.provider) {
                    this.userPhoto = user.photoUrl;
                } else {
                    this.afStorage.ref(user.photoUrl).getDownloadURL().subscribe(url => {
                        this.userPhoto = url;
                    })
                }
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
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    async uploadImage(event: any) {
        if (event) {
            this.uploading = true;
            if (this.user?.photoUrl) {
                await this.afStorage.ref(this.user.photoUrl).delete().toPromise().catch(error => {
                    console.error(error)
                    this.uploading = false;
                });
            }
            const file: File = event.target.files[0];
            const filePath = `${this.user?.uId}-profilePic`;
            const task = this.afStorage.upload(filePath, file);
            this.subscriptions.push(task.percentageChanges().subscribe((percent: number | undefined) => {
                this.progressPercentage = percent;
            }, error => this.uploading = false));
            task.then(taskSnapshot => {
                this.afStore.doc(`users/${this.user?.uId}`).update({photoUrl: filePath}).then(() => {
                    this.afStore.doc(`users/${this.user?.uId}`).get().subscribe((document) => {
                        this.user!.photoUrl = document.get('photoUrl');
                        this.authService.currentUser.next(this.user);
                        this.uploading = false;
                    })
                })
                .catch(error => {
                    console.error(error);
                    this.uploading = false;
                })
            })
            .catch(err => {
                console.error(err);
                this.uploading = false;
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
