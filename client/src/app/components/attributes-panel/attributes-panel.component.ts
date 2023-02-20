import { Component } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { GridOpacityService } from '@app/services/tool-modifier/grid-opacity/grid-opacity.service';
import { SpacingService } from '@app/services/tool-modifier/spacing/spacing.service';
import { StyleService } from '@app/services/tool-modifier/style/style.service';
import { TracingService } from '@app/services/tool-modifier/tracing/tracing.service';
import { WidthService } from '@app/services/tool-modifier/width/width.service';
import { ToolboxService } from '@app/services/toolbox/toolbox.service';

@Component({
    selector: 'app-attributes-panel',
    templateUrl: './attributes-panel.component.html',
    styleUrls: ['./attributes-panel.component.scss'],
})
export class AttributesPanelComponent {
    constructor(
        private toolboxService: ToolboxService,
        private spacingService: SpacingService,
        private gridOpacityService: GridOpacityService,
        private widthService: WidthService,
        private styleService: StyleService,
        private tracingService: TracingService,
    ) {}

    get currentTool(): Tool {
        return this.toolboxService.getCurrentTool();
    }

    capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    needsSpacingAttribute(): boolean {
        return this.currentTool.needsModifierManager(this.spacingService);
    }

    needsGridOpacityAttribute(): boolean {
        return this.currentTool.needsModifierManager(this.gridOpacityService);
    }

    needsWidthAttribute(): boolean {
        return this.currentTool.needsModifierManager(this.widthService);
    }

    needsTracingAttribute(): boolean {
        return this.currentTool.needsModifierManager(this.tracingService);
    }
    needsStyleAttribute(): boolean {
        return this.currentTool.needsModifierManager(this.styleService);
    }

    needsGridDisplayAttribute(): boolean {
        return this.currentTool.name === 'grille';
    }
}
