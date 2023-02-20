import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Action } from '@app/classes/action-line';
import { GameNotification } from '@app/classes/game-notification';
import { SERVER_HOSTNAME } from '@app/classes/server-ip';
import { ServerNotification } from '@app/classes/ServerNotification';
import { Stroke } from '@app/classes/stroke';
import { StrokeAction } from '@app/classes/stroke-action';
import { EndgamenotificationComponent } from '@app/components/endgamenotification/endgamenotification.component';
import { DrawingStateTrackerService } from '@app/services/drawing-state-tracker/drawing-state-tracker.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { BehaviorSubject } from 'rxjs';

// tslint:disable:object-literal-shorthand
// tslint:disable:only-arrow-functions
// tslint:disable:no-any
// tslint:disable:typedef
// tslint:disable:triple-equals
// tslint:disable:no-empty
// tslint:disable:max-file-line-count
// tslint:disable:cyclomatic-complexity

const WATINGNOTIFICATION = 3000;
const CONNECTIONWAIT = 1000;

@Injectable({
    providedIn: 'root',
})
export class GameManagementService {
    wsDrawing: WebSocket; // Websocket pour le envoyer et recevoir les dessins sur le canvas
    wsSession: WebSocket; // WebSocket pour se connecter à la session
    gameId: string = ''; // Id de la partie relier au wsDrawing
    image: Stroke[];
    openDialogBehaviour = new BehaviorSubject(false);
    openEndGameDialogBehaviour = new BehaviorSubject(false);
    wordToDrow: any;
    gameToJoin: any;
    gameInfo: any;
    isSoloGame: boolean = false;
    gameInfoBehaviour: BehaviorSubject<any>;
    clearSurprise = new BehaviorSubject(false);
    soloTimer = new BehaviorSubject(false);
    gamePlayersBehaviour: BehaviorSubject<any>;
    startCountDown = new BehaviorSubject(false);
    updateRole = new BehaviorSubject('');
    activateDrawing: BehaviorSubject<boolean>;
    addTimeBonus = new BehaviorSubject(false);
    inGame: boolean = false;

    constructor(
        private drawingService: DrawingService,
        private httpClient: HttpClient,
        private router: Router,
        private drawingTracker: DrawingStateTrackerService,
        private snackBar: MatSnackBar,
        public dialog: MatDialog,
    ) {
        this.image = [];
        this.gamePlayersBehaviour = new BehaviorSubject({});
        this.gameInfoBehaviour = new BehaviorSubject({});
        this.activateDrawing = new BehaviorSubject(true);
    }

    async sendGuess(guess: string) {
        await this.httpClient.post<string>('http://' + SERVER_HOSTNAME + '/game/guess/' + this.gameId, guess).toPromise();
    }

    continueGame(): void {
        this.httpClient
            .get<JSON>('http://' + SERVER_HOSTNAME + '/game/next-turn/' + this.gameId)
            .toPromise()
            .then(() => {});
    }

    // Permet de se connecter au Websocket pour le dessin et connect au jeu.
    async joinDrawing(roomId: string, userEmail: string) {
        this.gameId = roomId;
        this.connectTogame(roomId, userEmail);
        this.inGame = true;
    }

    connectTogame(roomId: string, userEmail: string): void {
        this.wsDrawing = new WebSocket('ws://' + SERVER_HOSTNAME + '/game/connect/' + this.gameId + '/' + userEmail);
        this.waitForConnection(this.wsDrawing, roomId);
        this.receiveDrawing();
    }

    playVictory(): void {
        const audio = new Audio();
        audio.src = 'assets/audio/victory.mp3';
        audio.load();
        audio.play();
    }
    playDefeat(): void {
        const audio = new Audio();
        audio.src = 'assets/audio/defeat.mp3';
        audio.load();
        audio.play();
    }
    playWrongAnswer(): void {
        const audio = new Audio();
        audio.src = 'assets/audio/wrong.mp3';
        audio.load();
        audio.play();
    }
    playCorrectAnswer(): void {
        const audio = new Audio();
        audio.src = 'assets/audio/word.mp3';
        audio.load();
        audio.play();
    }
    playAchievement(): void {
        const audio = new Audio();
        audio.src = 'assets/audio/sheeshButLoud.mp3';
        audio.load();
        audio.play();
    }

    async startGame(): Promise<void> {
        await this.httpClient
            .get<JSON>('http://' + SERVER_HOSTNAME + '/game/start/' + this.gameId)
            .toPromise()
            .then(() => {});
    }

    async getGameInfo() {
        const data = await this.httpClient.get<JSON>('http://' + SERVER_HOSTNAME + '/info/games').toPromise();
        this.gameInfo = data;
        this.selectGameInfo();
    }

    selectGameInfo(): void {
        this.gameInfo.forEach(async (element: any) => {
            if (element.gameID == this.gameId) {
                this.gameToJoin = element;
                this.gameInfoBehaviour.next(this.gameToJoin);
                this.fetchGamePlayers();
                if (this.gameToJoin.type == 'Solo') {
                    this.isSoloGame = true;
                    await this.startGame();
                    this.router.navigate(['/editor']);
                } else {
                    this.isSoloGame = false;
                    this.router.navigate(['/waitingGame']);
                }
            }
        });
    }

    async updateGameInfo() {
        const data = await this.httpClient.get<JSON>('http://' + SERVER_HOSTNAME + '/info/games').toPromise();
        if (data) {
            this.gameInfo = data;
        }
        this.gameInfo.forEach((element: any) => {
            if (element.gameID == this.gameId) {
                this.gameToJoin = element;
                this.wordToDrow = this.gameToJoin.pair.word;
                this.gameInfoBehaviour.next(this.gameToJoin);
            }
        });
    }

    waitForConnection(socket: WebSocket, id: string): void {
        const SELF = this;
        setTimeout(function (): void {
            if (socket.readyState === 1) {
                console.log('Connection is made to game ' + id);
                SELF.getGameInfo();
            } else {
                SELF.waitForConnection(socket, id);
            }
        }, CONNECTIONWAIT);
    }

    // Reçoit les lignes de dessin pour le canvas
    // Utilise drawLine pour les appliquer sur le canvas
    receiveDrawing(): void {
        const SELF = this;
        this.wsDrawing.addEventListener('message', function (e: MessageEvent): void {
            const data = JSON.parse(e.data);
            const stroke: Stroke = { opacity: data.opacity, size: data.size, color: data.color, pathData: data.pathdata };
            switch (data.action) {
                case Action.stroke:
                    SELF.drawLine(SELF.drawingService.baseCtx, stroke);
                    break;
                case Action.undo:
                    SELF.drawingTracker.undo();
                    break;
                case Action.redo:
                    SELF.drawingTracker.redo();
                    break;
                case Action.save:
                    SELF.drawingTracker.addAction(stroke);
                    break;
                default:
                    SELF.drawLine(SELF.drawingService.baseCtx, stroke);
                    break;
            }
        });
    }

    fetchGamePlayers(): void {
        this.httpClient
            .get<JSON>('http://' + SERVER_HOSTNAME + '/game/lobbyUpdate/' + this.gameId)
            .toPromise()
            .then((data) => {
                this.gamePlayersBehaviour.next(data);
            });
    }

    sendUndo(): void {
        if (this.wsDrawing) {
            this.wsDrawing.send(JSON.stringify({ pathdata: [], color: '', size: 0, opacity: 0, action: Action.undo }));
        } else {
            this.drawingTracker.undo();
            this.image = this.drawingTracker.actions;
        }
    }

    sendRedo(): void {
        if (this.wsDrawing) {
            this.wsDrawing.send(JSON.stringify({ pathdata: [], color: '', size: 0, opacity: 0, action: Action.redo }));
        } else {
            this.drawingTracker.redo();
            this.image = this.drawingTracker.actions;
        }
    }

    // Connect to session with the email of the user
    connectToSession(email: string): void {
        this.wsSession = new WebSocket('ws://' + SERVER_HOSTNAME + '/session/' + email);
        this.waitForConnectionToSession(this.wsSession, email);
        this.receiveMessageSession();
    }

    waitForConnectionToSession(socket: WebSocket, id: string): void {
        const SELF = this;
        setTimeout(function (): void {
            if (socket.readyState === 1) {
                console.log('Connection is made to session ' + id);
                SELF.router.navigate(['/polydessin']);
            } else {
                SELF.waitForConnectionToSession(socket, id);
            }
        }, CONNECTIONWAIT);
    }

    // Receive cyle notification
    async receiveMessageSession() {
        const SELF = this;
        this.wsSession.addEventListener('message', async function (e: MessageEvent): Promise<void> {
            const data = JSON.parse(e.data);
            switch (data) {
                case ServerNotification.StartGame: {
                    SELF.addTimeBonus.next(false);
                    await SELF.updateGameInfo();
                    SELF.inGame = true;
                    SELF.openEndGameDialogBehaviour.next(false);
                    SELF.router.navigate(['/editor']);
                    if (SELF.gameToJoin.type == 'Solo') {
                        SELF.soloTimer.next(true);
                    }
                    break;
                }
                case ServerNotification.StartTurn: {
                    SELF.inGame = true;
                    await SELF.updateGameInfo();
                    SELF.addTimeBonus.next(false);
                    SELF.openEndGameDialogBehaviour.next(false);
                    SELF.openDialogBehaviour.next(false);
                    if (SELF.gameToJoin.type == 'Classique') {
                        SELF.startCountDown.next(true);
                    }
                    break;
                }
                case ServerNotification.CorrectAnswer: {
                    SELF.inGame = true;
                    SELF.addTimeBonus.next(true);
                    await SELF.updateGameInfo();
                    SELF.playCorrectAnswer();
                    SELF.snackBar.open(GameNotification.GoodAnswer, GameNotification.Action, {
                        duration: WATINGNOTIFICATION,
                    });
                    break;
                }
                case ServerNotification.EndTurn: {
                    await SELF.updateGameInfo();
                    SELF.openDialogBehaviour.next(true);
                    SELF.addTimeBonus.next(false);
                    SELF.openEndGameDialogBehaviour.next(false);
                    SELF.startCountDown.next(false);
                    SELF.soloTimer.next(false);
                    SELF.drawingService.clearCanvas(SELF.drawingService.baseCtx);
                    SELF.drawingTracker.reset();
                    SELF.snackBar.open(GameNotification.EndTurn, GameNotification.Action, {
                        duration: WATINGNOTIFICATION,
                    });
                    break;
                }
                case ServerNotification.EndGame: {
                    SELF.openEndGameDialogBehaviour.next(true);
                    SELF.openEndGameModal();
                    SELF.activateDrawing.next(true);
                    SELF.soloTimer.next(false);
                    SELF.inGame = false;
                    SELF.addTimeBonus.next(false);
                    break;
                }
                case ServerNotification.youWon: {
                    SELF.playVictory();
                    break;
                }
                case ServerNotification.youLost: {
                    SELF.playDefeat();
                    break;
                }
                case ServerNotification.GameLobbyStateUpdate: {
                    SELF.updateGameInfo();
                    SELF.fetchGamePlayers();
                    break;
                }
                case ServerNotification.RightOfReply: {
                    SELF.startCountDown.next(false);
                    SELF.snackBar.open(GameNotification.RightOfReply, GameNotification.Action, {
                        duration: WATINGNOTIFICATION,
                    });
                    break;
                }
                case ServerNotification.WrongAnswer: {
                    SELF.addTimeBonus.next(false);
                    await SELF.updateGameInfo();
                    SELF.playWrongAnswer();
                    SELF.snackBar.open(GameNotification.wrongAnswer, GameNotification.Action, {
                        duration: WATINGNOTIFICATION,
                    });
                    break;
                }
                case ServerNotification.YouGuess: {
                    SELF.activateDrawing.next(false);
                    SELF.updateRole.next(GameNotification.youGuess);
                    break;
                }
                case ServerNotification.YouDraw: {
                    SELF.activateDrawing.next(true);
                    await SELF.updateGameInfo();
                    SELF.updateRole.next(GameNotification.youDraw + SELF.wordToDrow + ' !!');
                    break;
                }
                case ServerNotification.NotYourTurn: {
                    SELF.updateRole.next(GameNotification.notYourTurn);
                    SELF.activateDrawing.next(false);
                    break;
                }
                case ServerNotification.FirstGame: {
                    SELF.playAchievement();
                    SELF.snackBar.open(ServerNotification.NewTrophy + ServerNotification.FirstGame + ' 🏆', GameNotification.Action, {
                        duration: WATINGNOTIFICATION,
                        verticalPosition: 'top',
                    });
                    break;
                }
                case ServerNotification.SecondGame: {
                    SELF.playAchievement();
                    SELF.snackBar.open(ServerNotification.NewTrophy + ServerNotification.SecondGame + ' 🏆', GameNotification.Action, {
                        duration: WATINGNOTIFICATION,
                        verticalPosition: 'top',
                    });
                    break;
                }
                case ServerNotification.BetterThanAverage: {
                    SELF.playAchievement();
                    SELF.snackBar.open(ServerNotification.NewTrophy + ServerNotification.BetterThanAverage + ' 🏆', GameNotification.Action, {
                        duration: WATINGNOTIFICATION,
                        verticalPosition: 'top',
                    });
                    break;
                }
                case ServerNotification.FiveMin: {
                    SELF.playAchievement();
                    SELF.snackBar.open(ServerNotification.NewTrophy + ServerNotification.FiveMin + ' 🏆', GameNotification.Action, {
                        duration: WATINGNOTIFICATION,
                        verticalPosition: 'top',
                    });
                    break;
                }
                case ServerNotification.TutoMaster: {
                    SELF.playAchievement();
                    SELF.snackBar.open(ServerNotification.NewTrophy + ServerNotification.TutoMaster + ' 🏆', GameNotification.Action, {
                        duration: WATINGNOTIFICATION,
                        verticalPosition: 'top',
                    });
                    break;
                }
                case ServerNotification.WithMyFriends: {
                    SELF.playAchievement();
                    SELF.snackBar.open(ServerNotification.NewTrophy + ServerNotification.WithMyFriends + ' 🏆', GameNotification.Action, {
                        duration: WATINGNOTIFICATION,
                        verticalPosition: 'top',
                    });
                    break;
                }
                case ServerNotification.LoneWolf: {
                    SELF.playAchievement();
                    SELF.snackBar.open(ServerNotification.NewTrophy + ServerNotification.LoneWolf + ' 🏆', GameNotification.Action, {
                        duration: WATINGNOTIFICATION,
                        verticalPosition: 'top',
                    });
                    break;
                }
                case ServerNotification.Picasso: {
                    SELF.playAchievement();
                    SELF.snackBar.open(ServerNotification.NewTrophy + ServerNotification.Picasso + ' 🏆', GameNotification.Action, {
                        duration: WATINGNOTIFICATION,
                        verticalPosition: 'top',
                    });
                    break;
                }
                case ServerNotification.ZeroInArt: {
                    SELF.playAchievement();
                    SELF.snackBar.open(ServerNotification.NewTrophy + ServerNotification.ZeroInArt + ' 🏆', GameNotification.Action, {
                        duration: WATINGNOTIFICATION,
                        verticalPosition: 'top',
                    });
                    break;
                }
            }
        });
    }

    // Envoie les lignes de dessins au serveur
    sendPath(stroke: StrokeAction): void {
        if (this.wsDrawing && this.wsDrawing.readyState === WebSocket.OPEN) {
            this.wsDrawing.send(JSON.stringify(stroke));
        }
    }

    savePath(stroke: StrokeAction): void {
        if (this.wsDrawing && this.wsDrawing.readyState === WebSocket.OPEN) {
            this.wsDrawing.send(JSON.stringify(stroke));
        } else {
            // Pour paire mot/image
            this.drawLine(this.drawingService.baseCtx, stroke);
            this.drawingTracker.addAction(stroke);
            this.image = this.drawingTracker.actions;
        }
    }

    resetImage(): void {
        this.drawingTracker.reset();
        this.image = [];
    }

    openEndGameModal(): void {
        if (this.isSoloGame) {
            this.dialog.open(EndgamenotificationComponent, {
                width: '250px',
                data: {
                    team1Score: 0,
                    team2Score: 0,
                    score: this.gameToJoin.soloAttributes.score,
                },
            });
            if (this.gameToJoin.soloAttributes.score === 0) {
                this.playDefeat();
            } else {
                this.playVictory();
            }
            // tslint:disable-next-line:no-empty
        } else {
            this.dialog.open(EndgamenotificationComponent, {
                width: '250px',
                data: {
                    team1Score: this.gameToJoin.classicAttributes.teams[0].Score,
                    team2Score: this.gameToJoin.classicAttributes.teams[1].Score,
                    score: 0,
                },
            });
        }
    }

    private drawLine(ctx: CanvasRenderingContext2D, stroke: Stroke): void {
        const { opacity, size, color, pathData } = stroke;
        ctx.beginPath();
        ctx.globalAlpha = opacity;
        ctx.lineWidth = size;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;

        if (2 >= pathData.length) {
            const { x, y } = pathData[0];
            ctx.fillRect(x - size / 2, y - size / 2, size, size);
        }
        for (const point of pathData) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }
}
