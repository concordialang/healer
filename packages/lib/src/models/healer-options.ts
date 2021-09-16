import { HealerInstance, HeuristicInstance } from '@healer/common';

export interface HealerOptions {
    heuristics: HeuristicInstance[];
    healer: HealerInstance;
}
