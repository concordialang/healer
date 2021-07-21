export interface HeuristicEntry {
    name: string;
    from: string;
}

export interface HealerConfig {
    heuristics: HeuristicEntry[];
}
