export interface HeuristicEntry {
    name: string;
    from: string;
}

export interface Config {
    heuristics: HeuristicEntry[];
}
