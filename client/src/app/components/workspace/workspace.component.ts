import { AfterViewInit, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Difficulty } from '@app/classes/difficulty';
import { GameNotificationComponent } from '@app/components/game-notification/game-notification.component';
import { GameManagementService } from '@app/services/game-management/game-management.service';
import { WorkzoneSizeService } from '@app/services/workzone-size-service/workzone-size.service';
import { CountdownComponent } from 'ngx-countdown';

// tslint:disable:no-magic-numbers
// tslint:disable:no-any

const TOOL_BOX_WIDTH = 268;
const SIDEBARWIDTH = 48;
const TEXTCHATWIDTH = 300;
const NUMBEROFROUNDS = 6;
@Component({
    selector: 'app-workspace',
    templateUrl: './workspace.component.html',
    styleUrls: ['./workspace.component.scss'],
})
export class WorkspaceComponent implements OnInit, AfterViewInit {
    @ViewChild('workzonecontainer', { static: false }) workzoneContainer: ElementRef<HTMLDivElement>;
    @ViewChild('cd', { static: false }) private countdown: CountdownComponent;
    modeClassique: TemplateRef<any> | null = null;
    isChatEnable: boolean = true;
    role: string = '';
    time: number = 0;
    isWordImage: boolean;
    round: number = NUMBEROFROUNDS;
    constructor(
        public workZoneSizeService: WorkzoneSizeService,
        public gameManagementService: GameManagementService,
        public dialog: MatDialog,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.isWordImage = this.router.url === '/word-image';
    }

    ngAfterViewInit(): void {
        this.gameManagementService.soloTimer.subscribe(async (soloTimer) => {
            if (soloTimer) {
                switch (this.gameManagementService.gameToJoin.difficulty) {
                    case Difficulty.Medium: {
                        this.time = 60;
                        this.countdown.restart();
                        this.countdown.begin();
                        break;
                    }
                    case Difficulty.Hard: {
                        this.time = 30;
                        this.countdown.restart();
                        this.countdown.begin();
                        break;
                    }
                    case Difficulty.Easy: {
                        this.time = 120;
                        this.countdown.restart();
                        this.countdown.begin();
                        break;
                    }
                }
            }
        });

        this.workZoneSizeService.currentWorkzoneDimension.subscribe((dimension) => {
            this.workzoneContainer.nativeElement.style.width = (window.innerWidth - TOOL_BOX_WIDTH - SIDEBARWIDTH - TEXTCHATWIDTH).toString() + 'px';
            this.workzoneContainer.nativeElement.style.height = window.innerHeight.toString() + 'px';
        });

        this.gameManagementService.startCountDown.subscribe((startCountDown) => {
            if (!this.gameManagementService.isSoloGame) {
                if (startCountDown) {
                    this.time = 60;
                    this.countdown.restart();
                }
            }
        });

        if (!this.gameManagementService.isSoloGame) {
            this.gameManagementService.openDialogBehaviour.subscribe((openDialogBehaviour) => {
                if (openDialogBehaviour) {
                    this.round--;
                    this.countdown.stop();
                    this.openDialog();
                } else {
                    this.dialog.closeAll();
                }
            });
        }

        this.gameManagementService.addTimeBonus.subscribe((addTimeBonus) => {
            if (addTimeBonus) {
                switch (this.gameManagementService.gameToJoin.difficulty) {
                    case Difficulty.Medium: {
                        const left: number = ((this.countdown.left as number) % 60000) / 1000;
                        this.time = left + 6;
                        break;
                    }
                    case Difficulty.Hard: {
                        const left: number = ((this.countdown.left as number) % 60000) / 1000;
                        this.time = left + 4;
                        break;
                    }
                    case Difficulty.Easy: {
                        const left: number = ((this.countdown.left as number) % 60000) / 1000;
                        this.time = left + 8;
                        break;
                    }
                }
            }
        });

        this.gameManagementService.updateRole.subscribe((role) => {
            if (!this.gameManagementService.isSoloGame) {
                this.role = role;
            }
        });
    }

    openDialog(): void {
        this.dialog.open(GameNotificationComponent, {
            width: '250px',
            data: {
                team1Score: this.gameManagementService.gameToJoin.classicAttributes.teams[0].Score,
                team2Score: this.gameManagementService.gameToJoin.classicAttributes.teams[1].Score,
                round: this.round,
            },
        });
    }

    hideChat(): void {
        const CHAT = document.getElementById('chat-container');
        if (CHAT == null) {
            return;
        }
        if (CHAT.style.display === 'none') {
            CHAT.style.display = 'block';
            this.isChatEnable = true;
        } else {
            CHAT.style.display = 'none';
            this.isChatEnable = false;
        }
        this.adjustSize();
    }

    private adjustSize(): void {
        const CHAT = this.isChatEnable ? TEXTCHATWIDTH : 0;
        this.workzoneContainer.nativeElement.style.width = (window.innerWidth - TOOL_BOX_WIDTH - SIDEBARWIDTH - CHAT).toString() + 'px';
    }

    // tslint:disable-next-line:typedef
    async delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
