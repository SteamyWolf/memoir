import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Column, Content } from '../column.model';
import { v4 as uuid } from 'uuid';
import { TemplatesService } from '../templates.service';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/auth/user.model';
import { ComponentCanDeactivate } from '../../deactivate/deactivate.guard';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-template01',
    templateUrl: './template01.component.html',
    styleUrls: ['./template01.component.scss']
})
export class Template01Component implements OnInit, ComponentCanDeactivate {
    user: User;
    canEditTitle: boolean = false;
    title: string = 'Click to Change Title';
    columns: Column[] = [];
    titleCopy: string = '';
    initializedColumnsCopy: Column[] = [];
    uuidCopy: string;
    @ViewChild('titleInput') titleInput: ElementRef;

    constructor(private templatesSvc: TemplatesService, private authService: AuthService) {}

    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        this.templatesSvc.currentTemplateUUID = '';
        if (JSON.stringify(this.initializedColumnsCopy) !== JSON.stringify(this.columns) || this.titleCopy !== this.title) {
            console.log('MADE IT INSIDE')
            setTimeout(() => {
                console.log('STAYED!!!')
                this.templatesSvc.currentTemplateUUID = this.uuidCopy;
            }, 10)
            return false;
        }
        return true;
    } // still broken

    @HostListener('window:unload')
    unloadHandler() {
        console.log('unload event')
    }

    ngOnInit(): void {
        this.authService.currentUser.subscribe((user: User) => {
            this.user = user;
        })
        this.loadNewOrSavedTemplate();
    }

    loadNewOrSavedTemplate() {
        let template = this.user.data?.chosenTemplates.find(template => template.uuid === this.templatesSvc.currentTemplateUUID);
        if (template) {
            // if user has a saved template with this template in their database
            this.templatesSvc.currentTemplateUUID = template.uuid;
            this.uuidCopy = template.uuid;
            this.title = template!.title;
            this.columns = template!.columns;
            this.initializedColumnsCopy = [...template!.columns];
            this.titleCopy = template!.title
        } else {
            // user has created a new project
            this.templatesSvc.currentTemplateUUID = uuid();
            this.uuidCopy = this.templatesSvc.currentTemplateUUID;
            this.addColumn();
            this.initializedColumnsCopy = [...this.columns];
            this.titleCopy = this.title;
        }
    }

    editTitle() {
        if (this.title === '') {
            this.title = 'Click to Change Title'
        }
        this.canEditTitle = !this.canEditTitle;
        setTimeout(() => {
            if (this.canEditTitle) {
                this.titleInput.nativeElement.focus();
            }
        }, 0)
    }

    addRow(index: number) {
        this.columns[index].content!.push(new Content('../../../../assets/image-placeholder.jpeg', 'Change this text'));
    }

    addColumn() {
        this.columns.push(new Column('../../../../assets/image-placeholder.jpeg', []));
    }

    deleteColumn() {
        this.columns.pop();
    }

    deleteRow(index: number) {
        this.columns[index].content!.pop();
    }

    mouseEnterImage(column: Column) {
        column.hasEditBtn = true;
    }

    mouseLeaveImage(column: Column) {
        column.hasEditBtn = false;
    }

    uploadImage(event: any, content: any, previousImageUrl: string, index: number) {
        this.templatesSvc.uploadTemplateImage(event, content, previousImageUrl, index);
    }

}
