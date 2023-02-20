import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-tab',
    template: '',
})
export class TabComponent {
    // tslint:disable-next-line:typedef
    @Input() label = '';
    // tslint:disable-next-line:typedef
    @Input() value = '';
}
