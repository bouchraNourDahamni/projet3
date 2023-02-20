import { Vec2 } from './vec2';

export interface Stroke {
    pathData: Vec2[];
    color: string;
    size: number;
    opacity: number;
}
