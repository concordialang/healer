import { DatabaseOptions } from './database-options';
import { ServerOptions } from './server-options';

export interface HeuristicEntry {
    name: string;
    from: string;
    options?: any;
}

export interface ParserEntry {
    from: string;
    options?: any;
}

export interface PluginEntry {
    from: string;
    options?: any;
}

export interface HealerConfig {
    parser: ParserEntry;
    heuristics: HeuristicEntry[];
    database: DatabaseOptions;
    server: ServerOptions;
    plugin: PluginEntry;
    minimumScore: number;
}
