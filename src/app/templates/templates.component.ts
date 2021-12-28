import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
    selector: 'app-templates',
    templateUrl: './templates.component.html',
    styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent implements OnInit, OnDestroy {

    subscriptions: Subscription[] = [];
    constructor(private authSvc: AuthService, private router: Router, private route: ActivatedRoute) { }

    ngOnInit(): void {
        this.subscriptions.push(this.authSvc.currentUser.subscribe(user => {
            console.log(user);
        }))
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    templateChosen(templateID: string) {
        this.router.navigate([`template${templateID}`]);
    }
}
