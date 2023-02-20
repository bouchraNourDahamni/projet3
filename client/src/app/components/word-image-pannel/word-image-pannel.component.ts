import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Reconstruction, ReconstructionCentre, ReconstructionPanoramique } from '@app/classes/reconstruction';
import { ModalSaveComponent } from '@app/components/modal/modal-save/modal-save.component';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { WordImageService } from '@app/services/word-image/word-image.service';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-word-image-pannel',
    templateUrl: './word-image-pannel.component.html',
    styleUrls: ['./word-image-pannel.component.scss'],
})
export class WordImagePannelComponent implements OnInit {
    reconstruction: typeof Reconstruction = Reconstruction;
    reconstructionPanoramique: typeof ReconstructionPanoramique = ReconstructionPanoramique;
    reconstructionCentre: typeof ReconstructionCentre = ReconstructionCentre;

    constructor(public wordImageService: WordImageService, public dialog: MatDialog, private drawingService: DrawingService) {}

    ngOnInit(): void {
        this.wordImageService.reconstruction = Reconstruction.Conventionnel;
        this.wordImageService.reconstructionCentre = ReconstructionCentre.InsideOut;
        this.wordImageService.reconstructionPanoramique = ReconstructionPanoramique.LeftRight;
    }

    sendImage(): void {
        this.drawingService.shortcutEnable = false;
        this.dialog.open(ModalSaveComponent);
        // tslint:disable-next-line: deprecation
        this.dialog.afterAllClosed.pipe(take(1)).subscribe(() => {
            this.drawingService.shortcutEnable = true;
        });
    }

    previewImage(): void {
        this.wordImageService.previewImage();
    }

    setReconstruction(reconstruction: Reconstruction): void {
        this.wordImageService.reconstruction = reconstruction;
    }

    setReconstructionPanoramique(reconstruction: ReconstructionPanoramique): void {
        this.wordImageService.reconstructionPanoramique = reconstruction;
    }

    setReconstructionCentre(reconstruction: ReconstructionCentre): void {
        this.wordImageService.reconstructionCentre = reconstruction;
    }
}
