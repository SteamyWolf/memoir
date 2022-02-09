import { Component, DoCheck, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Column, Content } from '../column.model';
import { v4 as uuid } from 'uuid';
import { TemplatesService } from '../templates.service';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/auth/user.model';
import { Observable } from 'rxjs';
import { TemplateCanDeactivate } from './deactivate-template01.guard';

@Component({
    selector: 'app-template01',
    templateUrl: './template01.component.html',
    styleUrls: ['./template01.component.scss']
})
export class Template01Component implements OnInit, TemplateCanDeactivate, DoCheck {
    user: User;
    canEditTitle: boolean = false;
    title: string = 'Click to Change Title';
    columns: Column[] = [];
    titleCopy: string = '';
    columnsCopy: any[] = [];
    uuidCopy: string;
    saveDisabled: boolean = false;
    imagesToUpload: any[] = [];
    @ViewChild('titleInput') titleInput: ElementRef;

    constructor(private templatesSvc: TemplatesService, private authService: AuthService) { }

    @HostListener('window:beforeunload') canDeactivate(): Observable<boolean> | boolean {
        this.templatesSvc.currentTemplateUUID = '';
        // console.log(JSON.stringify(this.columns[1].content))
        // console.log(JSON.stringify(this.columnsCopy[1].content))
        if (JSON.stringify(this.columnsCopy) !== JSON.stringify(this.columns) || this.titleCopy !== this.title) {
            return false;
        }
        return true;
    }

    ngOnInit(): void {
        this.authService.currentUser.subscribe((user: User) => {
            if (user) {
                this.user = user;
                console.log(user);
                this.loadNewOrSavedTemplate();
            }  
        })
    }

    ngDoCheck(): void {
        if (JSON.stringify(this.columns) !== JSON.stringify(this.columnsCopy)) {
            this.saveDisabled = false;
        } else {
            this.saveDisabled = true;
        }
    }

    loadNewOrSavedTemplate() {
        let template = this.user.data?.chosenTemplates.find(template => template.uuid === this.templatesSvc.currentTemplateUUID);
        if (template) {
            // if user has a saved template with this template in their database
            this.templatesSvc.currentTemplateUUID = template.uuid;
            this.uuidCopy = template.uuid;
            this.title = template!.title;
            this.columns = template!.columns;
            this.columnsCopy = JSON.parse(JSON.stringify(template!.columns));
            // this.columnsCopy = this.columns.map((column: any) => {
            //     let newColumn = {};
            //     Object.keys(column).forEach((key: string) => {
            //         (newColumn as any)[key] = column[key]
            //     })
            //     return newColumn;
            // })
            this.titleCopy = template!.title;
        } else {
            // user has created a new project
            this.templatesSvc.currentTemplateUUID = uuid();
            this.uuidCopy = this.templatesSvc.currentTemplateUUID;
            this.addColumn();
            this.columnsCopy = [];
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
        let deletedColumn = this.columns.pop();
        if (deletedColumn?.heroImage.includes('blob')) {
            let index = this.imagesToUpload.findIndex(localImage => localImage.temporaryUrl === deletedColumn?.heroImage);
            this.imagesToUpload.splice(index, 1);
        }
        if (deletedColumn?.content && deletedColumn.content.length) {
            deletedColumn?.content?.forEach(row => {
                if (row.image.includes('blob')) {
                    let index = this.imagesToUpload.findIndex(localImage => localImage.temporaryUrl === row.image);
                    this.imagesToUpload.splice(index, 1);
                }
            })
        }
        // find a way to delete all of the images that the user has deleted if they exist on firebase. But only once the user hits save. Probably best in the nav component.
    }

    deleteRow(index: number) {
        let deletedRow = this.columns[index].content!.pop();
        if (deletedRow?.image.includes('blob')) {
            this.imagesToUpload.findIndex(localImage => localImage.temporaryUrl === deletedRow?.image);
        }
    }

    mouseEnterImage(column: Column) {
        column.hasEditBtn = true;
    }

    mouseLeaveImage(column: Column) {
        column.hasEditBtn = false;
    }

    mouseEnterImageRow(row: Content) {
        row.hasEditBtn = true;
    }

    mouseLeaveImageRow(row: Content) {
        row.hasEditBtn = false;
    }

    setImageLocally(event: any, content: any, previousImageUrl: string, columnIndex: number, rowIndex?: number) {
        let url = URL.createObjectURL(event.target.files[0]);

        let localImage = {
            event: event,
            content: content,
            previousImageUrl: previousImageUrl,
            columnIndex: columnIndex,
            rowIndex: rowIndex,
            temporaryUrl: url 
        }

        if (localImage.content.heroImage) {
            this.columns[columnIndex].heroImage = url;
        } else {
            this.columns[columnIndex].content![rowIndex!].image = url;
        }

        this.imagesToUpload.push(localImage);
    }
}
