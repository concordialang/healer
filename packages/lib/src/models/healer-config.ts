export interface HeuristicEntry {
    name: string;
    from: string;
    options?: any;
}

export interface HealerEntry {
    from: string;
    options?: any;
}

export interface HealerConfig {
    healer: HealerEntry;
    heuristics: HeuristicEntry[];
}
