import { Component, OnInit, ViewChild } from '@angular/core';
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
    constructor(private authService: AuthService) { }

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

    uploadImage() {
        this.uploadProfilePic.onchange
    }
}
