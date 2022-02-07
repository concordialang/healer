import { DatabaseOptions } from './database-options';
import { ServerOptions } from './server-options';

export interface HeuristicEntry {
    name: string;
    from: string;
    options?: any;
}

export interface HealerEntry {
    from: string;
    options?: any;
}

export interface PluginEntry {
    from: string;
    options?: any;
}

export interface HealerConfig {
    healer: HealerEntry;
    heuristics: HeuristicEntry[];
    database: DatabaseOptions;
    server: ServerOptions;
    plugin: PluginEntry;
    minimumScore: number;
}
