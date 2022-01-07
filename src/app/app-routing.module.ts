import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './auth/auth.guard';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './profile/settings/settings.component';
import { SubscriptionComponent } from './profile/subscription/subscription.component';
import { DeactivateGuard } from './shared/deactivate/deactivate.guard';
import { TemplatesComponent } from './templates/templates.component';
import { Template01Component } from './shared/all-templates/template01/template01.component';
import { Template02Component } from './shared/all-templates/template02/template02.component';

const routes: Routes = [
    {
        path: 'landing',
        component: LandingComponent,
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'templates',
        component: TemplatesComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'template01',
        component: Template01Component,
        canActivate: [AuthGuard],
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'template02',
        component: Template02Component,
        canActivate: [AuthGuard],
        canDeactivate: [DeactivateGuard]
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
                component: SettingsComponent,
                canDeactivate: [DeactivateGuard]
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
