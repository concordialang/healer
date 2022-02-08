import { HeuristicInstance, ParserInstance } from '@concordialang-healer/common';

export interface HealerOptions {
    heuristics: HeuristicInstance[];
    parser: ParserInstance;
    minimumScore: number;
}
