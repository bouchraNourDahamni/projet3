import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Difficulty } from '@app/classes/difficulty';
import { TICK_RATE } from '@app/classes/drawing-info';
import { Reconstruction, ReconstructionCentre, ReconstructionPanoramique } from '@app/classes/reconstruction';
import { SERVER_HOSTNAME } from '@app/classes/server-ip';
import { Stroke } from '@app/classes/stroke';
import { Vec2 } from '@app/classes/vec2';
import { WordImage } from '@app/classes/word-image';
import * as lodash from 'lodash';
import { take } from 'rxjs/operators';
// tslint:disable-next-line: no-relative-imports
import { DrawingService } from '../drawing/drawing.service';
// tslint:disable-next-line: no-relative-imports
import { GameManagementService } from '../game-management/game-management.service';

interface TimeCalcultaion {
    TIME_PER_STROKE: number;
    MAX_TIME: number;
}

@Injectable({
    providedIn: 'root',
})
export class WordImageService {
    wordImage: WordImage;
    reconstruction: Reconstruction;
    reconstructionPanoramique: ReconstructionPanoramique;
    reconstructionCentre: ReconstructionCentre;

    private readonly panoramiqueAlgo: Map<ReconstructionPanoramique, (x: Stroke, y: Stroke) => number> = new Map([
        [ReconstructionPanoramique.LeftRight, (strokeA: Stroke, strokeB: Stroke): number => strokeA.pathData[0].x - strokeB.pathData[0].x],
        [ReconstructionPanoramique.RightLeft, (strokeA: Stroke, strokeB: Stroke): number => strokeB.pathData[0].x - strokeA.pathData[0].x],
        [ReconstructionPanoramique.UpDown, (strokeA: Stroke, strokeB: Stroke): number => strokeA.pathData[0].y - strokeB.pathData[0].y],
        [ReconstructionPanoramique.DownUp, (strokeA: Stroke, strokeB: Stroke): number => strokeB.pathData[0].y - strokeA.pathData[0].y],
    ]);
    private centreAlgo: Map<ReconstructionCentre, (x: Stroke, y: Stroke) => number>;

    private drawer: NodeJS.Timeout;

    constructor(private gameManagementService: GameManagementService, private httpClient: HttpClient, private drawingService: DrawingService) {
        this.wordImage = { word: '', image: [], hints: [], difficulty: Difficulty.Medium }; // zero value
    }

    private defineCentreAlgo(): void {
        const { x: xC, y: yC } = this.drawingService.getCenter();
        const distanceFromCenter = (stroke: Stroke): number => {
            const point = stroke.pathData[0];
            if (point == null) return 0;
            const { x, y } = point;
            return Math.hypot(x - xC, y - yC);
        };
        const insideOut = (strokeA: Stroke, strokeB: Stroke): number => {
            const distA = distanceFromCenter(strokeA);
            const distB = distanceFromCenter(strokeB);
            return distA - distB;
        };
        const outsideIn = (strokeA: Stroke, strokeB: Stroke): number => {
            const distA = distanceFromCenter(strokeA);
            const distB = distanceFromCenter(strokeB);
            return distB - distA;
        };
        this.centreAlgo = new Map([
            [ReconstructionCentre.InsideOut, insideOut],
            [ReconstructionCentre.OutsideIn, outsideIn],
        ]);
    }

    saveImage(word: string, clues: string[]): void {
        const image = this.expandImage(this.sortImage(this.gameManagementService.image, this.reconstruction));
        const difficulty = this.wordImage.difficulty;
        this.wordImage = { word, hints: clues, image, difficulty };
    }

    sendImage(): void {
        this.httpClient.post(`http://${SERVER_HOSTNAME}/game/newPair`, this.wordImage).pipe(take(1)).subscribe(console.log, console.log);
    }

    previewImage(): void {
        clearInterval(this.drawer); // clear previous drawer
        const image = this.sortImage(this.gameManagementService.image, this.reconstruction);
        try {
            this.drawingService.resetDrawing();
        } finally {
            this.drawPreview(image);
        }
    }

    private sortImage(data: Stroke[], reconstruction: Reconstruction): Stroke[] {
        const image = lodash.cloneDeep(data);
        switch (reconstruction) {
            case Reconstruction.Conventionnel: {
                return image;
            }
            case Reconstruction.Panoramique: {
                return image.sort(this.panoramiqueAlgo.get(this.reconstructionPanoramique));
            }
            case Reconstruction.Centre: {
                this.defineCentreAlgo(); // need to redifine center
                return image.sort(this.centreAlgo.get(this.reconstructionCentre));
            }
            case Reconstruction.Aleatoire: {
                return this.shuffle(image);
            }
            default: {
                return image;
            }
        }
    }

    private drawPreview(imageOriginal: Stroke[]): void {
        const image = this.expandImage(imageOriginal);
        const { TIME_PER_STROKE } = this.drawingTime(image);
        let i = 0;
        this.drawer = setInterval(() => {
            if (i < image.length) {
                const { pathData, color, size, opacity } = image[i];
                this.drawingService.drawLine(pathData, color, size, opacity);
            } else {
                clearInterval(this.drawer);
            }
            i++;
        }, TIME_PER_STROKE);
    }

    private expandImage(image: Stroke[]): Stroke[] {
        const accumulator: Stroke[] = [];
        const SLICE_SIZE = 3; // * Define resolution
        for (const stroke of image) {
            const { pathData, color, size, opacity } = stroke;
            const NB_SLICE = Math.floor(stroke.pathData.length / SLICE_SIZE);
            if (NB_SLICE > 1) {
                for (let i = 0; i < NB_SLICE; i++) {
                    accumulator.push({ pathData: this.getPathSlice(i, SLICE_SIZE, NB_SLICE, pathData), color, size, opacity });
                }
            } else {
                accumulator.push(stroke);
            }
        }
        return accumulator;
    }

    private getPathSlice(i: number, SLICE_SIZE: number, NB_SLICE: number, pathData: Vec2[]): Vec2[] {
        const [min, max] = [i * SLICE_SIZE, (i + 1) * SLICE_SIZE];
        if (i === 0) {
            return pathData.slice(min, max + 1);
        } else if (i === NB_SLICE - 1) {
            return pathData.slice(min - 1, max);
        } else {
            return pathData.slice(min - 1, max + 1);
        }
    }

    private drawingTime(image: Stroke[]): TimeCalcultaion {
        const SECOND = 1000;
        const NUMEBER_OF_STROKES = image.length;
        const MAX_SECONDS = 5;
        const MAX_TIME = MAX_SECONDS * SECOND;
        const REAL_TIME = SECOND / TICK_RATE;
        const ACCELERATED_TIME_PER_STROKE = MAX_TIME / NUMEBER_OF_STROKES;
        const TIME_PER_STROKE = ACCELERATED_TIME_PER_STROKE > REAL_TIME ? REAL_TIME : ACCELERATED_TIME_PER_STROKE;
        return { TIME_PER_STROKE, MAX_TIME };
    }

    /**
     * Shuffles array in place. ES6 version.
     * inspo: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
     * @param a items An array containing the items.
     */
    shuffle(a: Stroke[]): Stroke[] {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
}
