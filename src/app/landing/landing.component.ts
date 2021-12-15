import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
    burgerActive: boolean = false;
    constructor() { }

    ngOnInit(): void {
  }

    loginNavigate() {
        console.log('login')
    }

    navigateToHome() {

    }

    burgerClick() {
        this.burgerActive = !this.burgerActive;
    }

}
