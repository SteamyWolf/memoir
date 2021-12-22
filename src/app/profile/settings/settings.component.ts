import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/auth/user.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
    user: User | null | undefined;
    userPhoto: string;
    @ViewChild('uploadProfilePic') uploadProfilePic: HTMLInputElement;
    constructor(private authService: AuthService, private afStorage: AngularFireStorage, private afStore: AngularFirestore) { }

    ngOnInit(): void {
        this.authService.currentUser.subscribe((user: User | null | undefined) => {
            this.user = user
            console.log(user)
            if (user?.photoUrl) {
                this.userPhoto = user.photoUrl;
            } else {
                this.userPhoto = '../../../assets/no_profile.png';
            }
        })
    }

    uploadImage(event: any) {
        console.log(event);
        if (event) {
            const file = event.target.files[0];
            const filePath = 'name-your-file-path-here';
            const task = this.afStorage.upload(filePath, file);
            task.percentageChanges().subscribe(percent => {
                console.log(percent);
            })
        }
        // const filePath = 'filesW';
        // const ref = this.afStorage.ref(filePath);
        // const task = ref.put(file);
    }
}
