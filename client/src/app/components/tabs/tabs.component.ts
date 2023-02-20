import { AfterContentInit, Component, ContentChildren, EventEmitter, Input, Output, QueryList } from '@angular/core';
import { delay } from 'rxjs/operators';
import { TabComponent } from './tab.component';

export interface Tab {
    label: string;
    value: string;
}

@Component({
    selector: 'app-tabs',
    templateUrl: './tabs.component.html',
    styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent implements AfterContentInit {
    tabs: Tab[] = [];
    // tslint:disable-next-line:typedef
    @Input() value = '';
    @Input() variant: 'vertical' | 'horizontal' = 'vertical';
    // tslint:disable-next-line:typedef
    @Output() change = new EventEmitter<string>();

    @ContentChildren(TabComponent)
    tabsQuery: QueryList<TabComponent>;

    ngAfterContentInit(): void {
        this.routine();
        this.tabsQuery.changes.pipe(delay(0)).subscribe(() => {
            this.routine();
        });
    }

    routine(): void {
        const tabsQueryArray = this.tabsQuery.toArray();
        this.tabs = tabsQueryArray.map((aTab) => {
            return {
                label: aTab.label,
                value: aTab.value,
            };
        });
        const tab = tabsQueryArray.find(({ value }) => value === this.value);
        if (tabsQueryArray.length > 0 && !tab) {
            this.value = this.tabs[0].value;
        }
    }
}
