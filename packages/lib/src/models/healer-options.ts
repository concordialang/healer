import { HeuristicInstance, ParserInstance } from '@healer/common';

export interface HealerOptions {
    heuristics: HeuristicInstance[];
    parser: ParserInstance;
    minimumScore: number;
}
