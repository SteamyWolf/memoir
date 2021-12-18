import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
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
        console.log(this.currentPage)

        this.subscription = this.authService.authChange.subscribe((authenticated: boolean) => {
            console.log(authenticated)
            this.userAuthenticated = authenticated;
            this.checkPageRoute();
            console.log(this.currentPage, this.userAuthenticated)
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
        console.log('login');
        this.router.navigate(['/login']);
    }

    logoutNavigate() {
        this.authService.logout();
    }

    navigateToHome() {
        console.log('go to landing')
        this.router.navigate(['/landing']);
        console.log(this.userAuthenticated)
    }

    profileNavigate() {
        console.log('profile')
        this.router.navigate(['/profile']);
    }

    burgerToggle() {
        this.burgerActive = !this.burgerActive;
    }

    triggerProfileMethod(key: string) {
        this.profileScv.emitData(key);
    }
}
