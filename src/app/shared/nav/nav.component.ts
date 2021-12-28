import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/auth/user.model';
import { ProfileService } from 'src/app/profile/profile.service';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit, OnDestroy {
    burgerActive: boolean = false;
    currentPage: string | undefined;
    userAuthenticated: boolean;
    subscription: Subscription;
    userPhoto: string;
    constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService, private profileScv: ProfileService) { }

    ngOnInit(): void {
        this.userAuthenticated = this.authService.isAuth();
        this.checkPageRoute();

        this.subscription = this.authService.authChange.subscribe((authenticated: boolean) => {
            this.userAuthenticated = authenticated;
            this.checkPageRoute();
        })

        this.subscription.add(
            this.authService.currentUser.subscribe((user) => {
                if (user?.photoUrl) {
                    this.userPhoto = user.photoUrl;
                } else {
                    this.userPhoto = '../../../assets/no_profile.png';
                }
            })
        );
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    checkPageRoute() {
        this.currentPage = this.route.snapshot.routeConfig?.path;
    }

    loginNavigate() {
        this.router.navigate(['/login']);
    }

    logoutNavigate() {
        this.authService.logout();
    }

    navigateToHome() {
        this.router.navigate(['/landing']);
        console.log(this.userAuthenticated)
    }

    profileNavigate() {
        this.router.navigate(['/profile']);
    }

    burgerToggle() {
        this.burgerActive = !this.burgerActive;
    }

    triggerProfileMethod(key: string) {
        this.profileScv.emitData(key);
    }

    dashboardNavigate() {
        this.router.navigate(['/dashboard']);
    }
}
