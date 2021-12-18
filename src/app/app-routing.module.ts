import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './auth/login/login.component';
import { StoriesComponent } from './stories/stories.component';
import { AuthGuard } from './auth/auth.guard';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './profile/settings/settings.component';
import { SubscriptionComponent } from './profile/subscription/subscription.component';

const routes: Routes = [
    {
        path: 'landing',
        component: LandingComponent,

    },
    {
        path: 'stories',
        component: StoriesComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: 'settings',
                component: SettingsComponent
            },
            {
                path: 'subscription',
                component: SubscriptionComponent
            },
            {
                path: '',
                redirectTo: 'settings',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '',
        redirectTo: 'landing',
        pathMatch: 'full'
    }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule {}
