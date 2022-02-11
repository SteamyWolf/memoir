import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Template, User } from 'src/app/auth/user.model';
import { ProfileService } from 'src/app/profile/profile.service';
import { Column } from '../all-templates/column.model';
import { TemplatesService } from '../all-templates/templates.service';

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
    user: User;
    @Input() uuid: string;
    @Input() columns: Column[];
    @Input() type: string;
    @Input() title: string;
    @Input() saveDisabled: boolean;
    @Input() imagesToUpload: any[];
    @Output() imagesToUploadChange: EventEmitter<any[]> = new EventEmitter<any[]>();
    constructor(
        private router: Router, 
        private route: ActivatedRoute, 
        private authService: AuthService, 
        private profileScv: ProfileService, 
        private afStorage: AngularFireStorage,
        private templatesSvc: TemplatesService
        ) {}

    ngOnInit(): void {
        this.userAuthenticated = this.authService.isAuth();
        this.checkPageRoute();

        this.subscription = this.authService.authChange.subscribe((authenticated: boolean) => {
            this.userAuthenticated = authenticated;
            this.checkPageRoute();
        })

        this.subscription.add(
            this.authService.currentUser.subscribe((user: User) => {
                this.user = user;
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

    async saveTemplate() {
        // these if checks are because firestore is picky about what data changes so deleting unnecessary data with checks.
        if (!this.user.data?.chosenTemplates) {
            this.user.data = {chosenTemplates: []}
        }
        if (!this.user.photoUrl) {
            delete this.user.photoUrl;
        }
        if (!this.user.displayName) {
            delete this.user.displayName;
        }
        if (this.user.data.chosenTemplates) {
            this.user.data.chosenTemplates.forEach(template => {
                template.columns.forEach(column => {
                    if (column.hasEditBtn) {
                        delete column.hasEditBtn
                    }
                })
            })
        }
        //end 
        const columns = JSON.parse(JSON.stringify(this.columns));
        let template = this.user.data!.chosenTemplates.find((template) => template.uuid === this.uuid);
        let index = this.user.data!.chosenTemplates.findIndex(template => template.uuid === this.uuid);
        if (template) {
            template.columns = columns;
            template.title = this.title;
            template.type = this.type;
            this.user.data!.chosenTemplates.splice(index, 1, template);
        } else {
            template = {
                uuid: this.uuid,
                type: this.type,
                title: this.title,
                columns: columns
            }
            this.user.data?.chosenTemplates.push(template);
        }
        // The following section uploads Input images
        if (this.imagesToUpload.length) {
            await this.uploadImages().catch(err => console.error(err));
        }
        // end
        
        console.log(this.user)
        this.templatesSvc.updateUserOnFireStore();
    }

    async uploadImages() {
        await Promise.all(this.imagesToUpload.map(image => {
            return this.templatesSvc.uploadTemplateImage(image.event, image.content, image.previousImageUrl, image.columnIndex, image.rowIndex)
        })).then(() => {
            this.imagesToUploadChange.next([]);
        })
    }
}
