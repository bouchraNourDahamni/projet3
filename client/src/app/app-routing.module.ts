import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfirmPasswordComponent } from './components/confirm-password/confirm-password.component';
import { CreateAccountComponent } from './components/create-account/create-account.component';
import { EditorPageComponent } from './components/editor-page/editor-page.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { LobbyListPageComponent } from './components/lobby-list-page/lobby-list-page.component';
import { LoginComponent } from './components/login/login.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { ProfilePageComponent } from './components/profile-page/profile-page.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { WaitingGameComponent } from './components/waiting-game/waiting-game.component';
import { WindowedTextchatComponent } from './components/windowed-textchat/windowed-textchat.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: LoginComponent, data: { title: 'connexion', depth: 1 } },
    { path: 'leaderboard', component: LeaderboardComponent, data: { title: 'connexion', depth: 10 } },
    { path: 'polydessin', component: MainPageComponent, data: { title: 'polydessin', depth: 2 } },
    { path: 'editor', component: EditorPageComponent, data: { title: 'éditeur', depth: 5 } },
    { path: 'word-image', component: EditorPageComponent, data: { title: 'paire mot image', depth: 6 } },
    { path: 'createAccount', component: CreateAccountComponent, data: { title: 'créer un compte', depth: 7 } },
    { path: 'forgotPassword', component: ForgotPasswordComponent, data: { title: 'oublier son mot de passe', depth: 8 } },
    { path: 'resetPassWord', component: ResetPasswordComponent, data: { title: 'récupérer son mot de passe' } },
    { path: 'confirmPassword', component: ConfirmPasswordComponent },
    { path: 'chat', component: WindowedTextchatComponent },
    { path: 'lobbylist', component: LobbyListPageComponent, data: { title: 'salle attente', depth: 3 } },
    { path: 'waitingGame', component: WaitingGameComponent, data: { title: 'salle attente du jeu', depth: 4 } },
    { path: 'profile/:user', component: ProfilePageComponent, data: { title: 'profil', depth: 9 } },
    { path: '**', redirectTo: '/home', data: { title: 'maison' } },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy', useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
