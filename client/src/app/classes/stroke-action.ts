import { Vec2 } from './vec2';

export interface StrokeAction {
    pathData: Vec2[];
    color: string;
    size: number;
    opacity: number;
    action: string;
}
