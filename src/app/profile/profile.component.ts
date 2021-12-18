import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ProfileService } from './profile.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
    currentRoute: string | undefined;
    modalOpen: boolean = false;
    subscriptions: Subscription[] = [];
    constructor(private router: Router, private route: ActivatedRoute, private authSvc: AuthService, private profileSvc: ProfileService) {}

    ngOnInit(): void {
        this.subscriptions.push(
            this.authSvc.currentRoute.subscribe((navObj: NavigationEnd | null) => {
                if (navObj && navObj.urlAfterRedirects) {
                    this.currentRoute = navObj.urlAfterRedirects;
                }
            })
        )

        this.subscriptions.push(
            this.profileSvc.callProfileMethod.subscribe((key: string) => {
                if (key === 'settings') {
                    this.settingsNavigate();
                }
                if (key === 'subscription') {
                    this.subscriptionNavigate();
                }
                if (key === 'logout') {
                    this.openLogoutModal();
                }
            })
        )
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    settingsNavigate() {
        this.router.navigate(['settings'], { relativeTo: this.route });
    }

    subscriptionNavigate() {
        this.router.navigate(['subscription'], { relativeTo: this.route });
    }

    openLogoutModal() {
        this.modalOpen = true;
    }

    closeLogoutModal() {
        this.modalOpen = false;
    }

    logout() {
        this.authSvc.logout();
    }
}
