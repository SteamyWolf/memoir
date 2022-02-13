import { animate, state, style, transition, trigger } from "@angular/animations";
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { TemplatesService } from "../../all-templates/templates.service";

@Component({
    selector: 'app-notification',
    templateUrl: './notification-bar.component.html',
    animations: [
        trigger('notification', [
            state('start', style({
                height: '0px',
                opacity: 0
            })),
            state('finish', style({
                height: '100%',
                opacity: 1
            })),
            transition('start <=> finish', [
                animate('0.5s')
            ])
        ])
    ]
})
export class NotificationBarComponent implements AfterViewInit, OnInit {
    animationState: boolean = true;
    @Input() type: string;
    @Input() message: string;
    @Output() close: EventEmitter<boolean> = new EventEmitter<boolean>();
    @ViewChild('notification') notification: ElementRef;

    constructor(private templatesSvc: TemplatesService) {}

    ngOnInit(): void {
        this.templatesSvc.notificationMessage.subscribe((message: string) => {
            this.animationState = false;
        })
        setTimeout(() => {
            this.animationState = !this.animationState;
        }, 10);
        setTimeout(() => {
            this.closeNotification();
        }, 5000)
    }

    ngAfterViewInit(): void {
        this.notification.nativeElement.classList.add(this.type);
    }

    closeNotification() {
        this.animationState = !this.animationState;
        setTimeout(() => {
            this.close.next(true);
        }, 500)
    }
}