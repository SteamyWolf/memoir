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
    canEditTitle: boolean = false;
    title: string = 'Click to Change Title';
    columns: Column[] = [
        // {
        //     heroImage: 'https://popmenucloud.com/evjymlcr/f7fa6f74-a8ee-479e-9e71-bf20a51ff3d4.jpg',
        //     content: [
        //         {
        //             image: 'https://imagesvc.meredithcorp.io/v3/mm/image?q=85&c=sc&poi=face&w=2000&h=1000&url=https%3A%2F%2Fstatic.onecms.io%2Fwp-content%2Fuploads%2Fsites%2F43%2F2021%2F04%2F13%2FGettyImages-504780334-2000.jpg',
        //             text: 'Cheese enters the burger!'
        //         },
        //         {
        //             image: 'https://cdn.britannica.com/77/170677-050-F7333D51/lettuce.jpg',
        //             text: 'Lettuce in the bun!'
        //         }
        //     ]
        // },
        // {
        //     heroImage: 'https://popmenucloud.com/evjymlcr/f7fa6f74-a8ee-479e-9e71-bf20a51ff3d4.jpg',
        //     content: [
        //         {
        //             image: 'https://imagesvc.meredithcorp.io/v3/mm/image?q=85&c=sc&poi=face&w=2000&h=1000&url=https%3A%2F%2Fstatic.onecms.io%2Fwp-content%2Fuploads%2Fsites%2F43%2F2021%2F04%2F13%2FGettyImages-504780334-2000.jpg',
        //             text: 'Cheese enters the burger!'
        //         }
        //     ]
        // }
    ];
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
    }

    @HostListener('window:unload')
    unloadHandler() {
        console.log('unload event')
    }

    ngOnInit(): void {
        this.authService.currentUser.subscribe((user: User) => {
            let template = user.data?.chosenTemplates.find(template => template.uuid === this.templatesSvc.currentTemplateUUID);
            if (template !== undefined && template) {
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
                this.addColumn();
                this.initializedColumnsCopy = [...this.columns];
                this.titleCopy = this.title;
            }
        })
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

}
