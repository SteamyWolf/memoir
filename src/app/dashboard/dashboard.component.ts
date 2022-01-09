import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Template, User } from '../auth/user.model';
import { TemplatesService } from '../shared/all-templates/templates.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    user: User;
    savedTemplates: Template[] = [];
    deleteModal: boolean = false;
    constructor(private authService: AuthService, private router: Router, private templatesSvc: TemplatesService) { }

    ngOnInit(): void {
        this.authService.currentUser.subscribe((user: User) => {
            this.user = user;
            if (user && user.data?.chosenTemplates) {
                this.savedTemplates = user.data.chosenTemplates;
            }
        })
    }

    navigateToTemplates() {
        this.router.navigate(['/templates']);
    }

    navigateToSavedTemplate(template: Template) {
        this.templatesSvc.currentTemplateUUID = template.uuid;
        this.router.navigate([`/${template.type}`]);
    }

    mouseEnterImage(template: Template) {
        template.showDeleteBtn = true
    }

    mouseLeaveImage(template: Template) {
        template.showDeleteBtn = false;
    }

    openDeleteModal() {
        console.log('delete')
        this.deleteModal = true;
    }

    closeModal() {
        this.deleteModal = false;
    }

    deleteTemplate(template: Template) {
        this.savedTemplates = this.savedTemplates?.filter(tem => tem.uuid !== template.uuid);
        this.user.data!.chosenTemplates = this.savedTemplates;
        this.authService.currentUser.next(this.user);
        this.templatesSvc.updateUserOnFireStore();
        this.deleteModal = false;
    }
}
