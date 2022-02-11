import { NgModule } from "@angular/core";
import { FacebookIconComponent } from "./facebook-icon/facebook-icon.component";
import { GoogleIconComponent } from "./google-icon/google-icon.component";
import { InstagramIconComponent } from "./instagram-icon /instagram-icon.component";
import { PlusIconComponent } from "./plus-icon/plus-icon.component";

@NgModule ({
    declarations: [
        GoogleIconComponent, 
        FacebookIconComponent, 
        InstagramIconComponent,
        PlusIconComponent
    ],
    exports: [
        GoogleIconComponent, 
        FacebookIconComponent, 
        InstagramIconComponent,
        PlusIconComponent
    ]
})

export class IconsModule {};

