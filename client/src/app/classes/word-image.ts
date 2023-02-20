import { Difficulty } from './difficulty';
import { Stroke } from './stroke';

export interface WordImage {
    word: string;
    hints: string[];
    image: Stroke[];
    difficulty: Difficulty;
}
