import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Template01Component } from './template01.component';
import { TemplatesService } from '../templates.service';
import { AuthService } from 'src/app/auth/auth.service';

export interface TemplateCanDeactivate {
    canDeactivate: () => boolean | Observable<boolean>;
}

@Injectable({ providedIn: 'root' })
export class TemplateDeactivateGuard implements CanDeactivate<TemplateCanDeactivate> {
    constructor(private templatesSvc: TemplatesService, private authSvc: AuthService) { }
    canDeactivate(component: Template01Component): boolean | Observable<boolean> {
        // if there are no pending changes, just allow deactivation; else confirm first
        if (component.canDeactivate()) {
            return true
        } else {
            let choice = confirm('WARNING: You have unsaved changes. Press Cancel to go back and save these changes, or OK to lose these changes.')
            if (choice) {
                console.log('has chosen true?')
                let template = component.user.data!.chosenTemplates.find(template => template.uuid === component.uuidCopy);
                let templateIndex = component.user.data!.chosenTemplates.findIndex(template => template.uuid === component.uuidCopy);
                if (template) { // should always be true but typeScript is a weeenie.
                    console.log(template.columns)
                    console.log(component.columnsCopy)
                    template!.title = component.titleCopy;
                    template!.columns = component.columnsCopy;
                    component.user.data!.chosenTemplates[templateIndex] = template;
                    this.authSvc.currentUser.next(component.user);
                    this.templatesSvc.currentTemplateUUID = '';
                }
                return true;
            } else {
                console.log('has chosen false')
                return false
            }
        }
    }
}