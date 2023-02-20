import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// tslint:disable-next-line:ordered-imports
import { trigger, transition, group, query, style, animate } from '@angular/animations';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    animations: [
        trigger('routeAnimations', [
            transition('1 <=> 2', [
                style({ height: '!' }),
                query(':enter', style({ transform: 'translateX(100%)' })),
                query(':enter, :leave', style({ position: 'absolute', top: 0, left: 0, right: 0 })),
                group([
                    query(':leave', [animate('0.3s cubic-bezier(.35, 0, .25, 1)', style({ transform: 'translateX(-100%)' }))]),
                    query(':enter', [animate('0.3s cubic-bezier(.35, 0, .25, 1)', style({ transform: 'translateX(0)' }))]),
                ]),
            ]),
            transition('2 <=> 3', [
                style({ height: '!' }),
                query(':enter', style({ transform: 'translateX(100%)' })),
                query(':enter, :leave', style({ position: 'absolute', top: 0, left: 0, right: 0 })),
                group([
                    query(':leave', [animate('0.3s cubic-bezier(.35, 0, .25, 1)', style({ transform: 'translateX(-100%)' }))]),
                    query(':enter', [animate('0.3s cubic-bezier(.35, 0, .25, 1)', style({ transform: 'translateX(0)' }))]),
                ]),
            ]),
            transition('3 <=> 4', [
                style({ height: '!' }),
                query(':enter', style({ transform: 'translateX(100%)' })),
                query(':enter, :leave', style({ position: 'absolute', top: 0, left: 0, right: 0 })),
                group([
                    query(':leave', [animate('0.3s cubic-bezier(.35, 0, .25, 1)', style({ transform: 'translateX(-100%)' }))]),
                    query(':enter', [animate('0.3s cubic-bezier(.35, 0, .25, 1)', style({ transform: 'translateX(0)' }))]),
                ]),
            ]),
            transition('4 <=> 5', [
                style({ height: '!' }),
                query(':enter', style({ transform: 'translateX(100%)' })),
                query(':enter, :leave', style({ position: 'absolute', top: 0, left: 0, right: 0 })),
                group([
                    query(':leave', [animate('0.3s cubic-bezier(.35, 0, .25, 1)', style({ transform: 'translateX(-100%)' }))]),
                    query(':enter', [animate('0.3s cubic-bezier(.35, 0, .25, 1)', style({ transform: 'translateX(0)' }))]),
                ]),
            ]),
            transition('2 <=> 6', [
                style({ height: '!' }),
                query(':enter', style({ transform: 'translateX(100%)' })),
                query(':enter, :leave', style({ position: 'absolute', top: 0, left: 0, right: 0 })),
                group([
                    query(':leave', [animate('0.3s cubic-bezier(.35, 0, .25, 1)', style({ transform: 'translateX(-100%)' }))]),
                    query(':enter', [animate('0.3s cubic-bezier(.35, 0, .25, 1)', style({ transform: 'translateX(0)' }))]),
                ]),
            ]),
            transition('2 <=> 9', [
                style({ height: '!' }),
                query(':enter', style({ transform: 'translateX(100%)' })),
                query(':enter, :leave', style({ position: 'absolute', top: 0, left: 0, right: 0 })),
                group([
                    query(':leave', [animate('0.3s cubic-bezier(.35, 0, .25, 1)', style({ transform: 'translateX(-100%)' }))]),
                    query(':enter', [animate('0.3s cubic-bezier(.35, 0, .25, 1)', style({ transform: 'translateX(0)' }))]),
                ]),
            ]),
            transition('2 <=> 5', [
                style({ height: '!' }),
                query(':enter', style({ transform: 'translateX(100%)' })),
                query(':enter, :leave', style({ position: 'absolute', top: 0, left: 0, right: 0 })),
                group([
                    query(':leave', [animate('0.3s cubic-bezier(.35, 0, .25, 1)', style({ transform: 'translateX(-100%)' }))]),
                    query(':enter', [animate('0.3s cubic-bezier(.35, 0, .25, 1)', style({ transform: 'translateX(0)' }))]),
                ]),
            ]),
            transition('* <=> 2', [
                style({ height: '!' }),
                query(':enter', style({ transform: 'translateX(100%)' })),
                query(':enter, :leave', style({ position: 'absolute', top: 0, left: 0, right: 0 })),
                group([
                    query(':leave', [animate('0.3s cubic-bezier(.35, 0, .25, 1)', style({ transform: 'translateX(-100%)' }))]),
                    query(':enter', [animate('0.3s cubic-bezier(.35, 0, .25, 1)', style({ transform: 'translateX(0)' }))]),
                ]),
            ]),
            transition('2 <=> 10', [
                style({ height: '!' }),
                query(':enter', style({ transform: 'translateX(100%)' })),
                query(':enter, :leave', style({ position: 'absolute', top: 0, left: 0, right: 0 })),
                group([
                    query(':leave', [animate('0.3s cubic-bezier(.35, 0, .25, 1)', style({ transform: 'translateX(-100%)' }))]),
                    query(':enter', [animate('0.3s cubic-bezier(.35, 0, .25, 1)', style({ transform: 'translateX(0)' }))]),
                ]),
            ]),
        ]),
    ],
})
export class AppComponent {
    // tslint:disable-next-line:no-any
    // tslint:disable-next-line:typedef
    getDepth(outlet: RouterOutlet) {
        return outlet.activatedRouteData.depth;
    }
}
