import { NgModule } from "@angular/core";
import { NotificationBarComponent } from "./notification-bar/notification-bar.component";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    declarations: [
        NotificationBarComponent
    ],
    exports: [
        NotificationBarComponent
    ],
    imports: [
        BrowserAnimationsModule
    ]
})
export class ComponentsModule {}