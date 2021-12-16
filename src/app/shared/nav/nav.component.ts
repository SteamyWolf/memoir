import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/auth/user.model';

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
    constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService) { }

    ngOnInit(): void {
        console.log(this.route.snapshot.routeConfig?.path, this.userAuthenticated)
        this.userAuthenticated = this.authService.isAuth();
        this.checkPageRoute();

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
        )
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
}
