import { NgModule } from "@angular/core";
import { FacebookIconComponent } from "./facebook-icon/facebook-icon.component";
import { GoogleIconComponent } from "./google-icon/google-icon.component";
import { InstagramIconComponent } from "./instagram-icon /instagram-icon.component";

@NgModule ({
    declarations: [GoogleIconComponent, FacebookIconComponent, InstagramIconComponent],
    exports: [GoogleIconComponent, FacebookIconComponent, InstagramIconComponent]
})

export class IconsModule {

};

