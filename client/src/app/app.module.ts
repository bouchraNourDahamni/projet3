import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CountdownModule } from 'ngx-countdown';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
// Attribute components
import { AttributeColorComponent } from './components/attributes-panel/attribute-color/attributes-color.component';
import { AttributeGridDisplayComponent } from './components/attributes-panel/attribute-grid-display/attribute-grid-display.component';
import { AttributeGridOpacityComponent } from './components/attributes-panel/attribute-grid-opacity/attributes-grid-opacity.component';
import { AttributeSpacingComponent } from './components/attributes-panel/attribute-spacing/attributes-spacing.component';
import { AttributeStyleComponent } from './components/attributes-panel/attribute-style/attributes-style.component';
import { AttributeTracingComponent } from './components/attributes-panel/attribute-tracing/attributes-tracing.component';
import { AttributeWidthComponent } from './components/attributes-panel/attribute-width/attributes-width.component';
import { AttributesPanelComponent } from './components/attributes-panel/attributes-panel.component';
import { ChooseAvatarComponent } from './components/choose-avatar/choose-avatar.component';
import { ConfirmPasswordComponent } from './components/confirm-password/confirm-password.component';
import { CreateAccountComponent } from './components/create-account/create-account.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { EditorPageComponent } from './components/editor-page/editor-page.component';
import { EndgamenotificationComponent } from './components/endgamenotification/endgamenotification.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { GameNotificationComponent } from './components/game-notification/game-notification.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { LobbyListPageComponent } from './components/lobby-list-page/lobby-list-page.component';
import { LoginComponent } from './components/login/login.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { ModalAddMemberComponent } from './components/modal/modal-add-member/modal-add-member.component';
import { ModalChatroomCreationComponent } from './components/modal/modal-chatroom-creation/modal-chatroom-creation.component';
import { DrawingCarouselComponent } from './components/modal/modal-drawing-carousel/modal-drawing-carousel.component';
import { ExportComponent } from './components/modal/modal-export/modal-export.component';
import { ModalGameSetupComponent } from './components/modal/modal-game-setup/modal-game-setup.component';
import { ModalSaveComponent } from './components/modal/modal-save/modal-save.component';
import { UserGuideModalComponent } from './components/modal/modal-user-guide/modal-user-guide.component';
import { ProfilePageComponent } from './components/profile-page/profile-page.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TabComponent } from './components/tabs/tab.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { TextchatComponent } from './components/textchat/textchat.component';
import { TooltipComponent } from './components/tooltip/tooltip.component';
import { WaitingGameComponent } from './components/waiting-game/waiting-game.component';
import { WindowedTextchatComponent } from './components/windowed-textchat/windowed-textchat.component';
import { WordImagePannelComponent } from './components/word-image-pannel/word-image-pannel.component';
import { WorkspaceComponent } from './components/workspace/workspace.component';

@NgModule({
    declarations: [
        AppComponent,
        AttributesPanelComponent,
        AttributeSpacingComponent,
        AttributeGridDisplayComponent,
        AttributeGridOpacityComponent,
        AttributeTracingComponent,
        AttributeWidthComponent,
        AttributeColorComponent,
        EditorPageComponent,
        ExportComponent,
        SidebarComponent,
        DrawingComponent,
        DrawingCarouselComponent,
        MainPageComponent,
        TooltipComponent,
        WorkspaceComponent,
        UserGuideModalComponent,
        ModalSaveComponent,
        AttributeStyleComponent,
        TextchatComponent,
        LoginComponent,
        CreateAccountComponent,
        ForgotPasswordComponent,
        ResetPasswordComponent,
        WindowedTextchatComponent,
        ModalGameSetupComponent,
        LobbyListPageComponent,
        GameNotificationComponent,
        WaitingGameComponent,
        WordImagePannelComponent,
        ProfilePageComponent,
        ModalChatroomCreationComponent,
        ModalAddMemberComponent,
        TabComponent,
        TabsComponent,
        EndgamenotificationComponent,
        ConfirmPasswordComponent,
        LeaderboardComponent,
        ChooseAvatarComponent,
    ],

    exports: [MatChipsModule, MatSnackBarModule, MatExpansionModule, MatListModule],

    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        MatCheckboxModule,
        MatIconModule,
        MatProgressSpinnerModule,
        HttpClientModule,
        AppRoutingModule,
        MatDialogModule,
        MatChipsModule,
        MatFormFieldModule,
        MatTableModule,
        MatButtonModule,
        FormsModule,
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule,
        MatTabsModule,
        CountdownModule,
        MatExpansionModule,
        MatListModule,
        MatButtonToggleModule,
    ],
    entryComponents: [ModalSaveComponent, ExportComponent, GameNotificationComponent],
    providers: [{ provide: MAT_DIALOG_DATA, useValue: [] }],
    bootstrap: [AppComponent],
})
export class AppModule {}
