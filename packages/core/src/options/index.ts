import { Heuristic, HeuristicInstance, Parser, ParserInstance } from '@concordialang-healer/common';

import { Config, ConfigException } from '../config';
import {
    DatabaseOptions,
    HealerConfig,
    HealerOptions,
    HeuristicEntry,
    ParserEntry,
    ServerOptions,
} from '../models';
import { explorer } from './explorer';
import { heuristicFinder } from './heuristic-finder';
import { parserFinder } from './parser-finder';
import { getPlugin } from './plugin';

const onInvalid = ( message: string ): void => {
    throw new ConfigException( message );
};

const loadHeuristic = async ( entry: HeuristicEntry ): Promise<HeuristicInstance> => {
    const heuristic: Heuristic = await heuristicFinder.find( entry );
    const instance: HeuristicInstance = heuristic?.( entry.options );

    if ( instance?.name !== entry.name ) {
        onInvalid( `The "${entry.name}" heuristic was not found in "${entry.from}" package.` );
    }

    if ( !instance.run ) {
        onInvalid( `The "${entry.name}" heuristic does not implement the "run" method.` );
    }

    return instance;
};

const loadHeuristics = ( entries: HeuristicEntry[] ): Promise<HeuristicInstance[]> => {
    return Promise.all( entries.map( loadHeuristic ) );
};

const loadParser = async ( entry: ParserEntry ): Promise<ParserInstance> => {
    const parser: Parser = await parserFinder.find( entry );
    const instance: ParserInstance = parser?.( entry.options );

    if ( !instance ) {
        onInvalid( `The healer was not found in "${entry.from}" package.` );
    }

    if ( !instance.transform ) {
        onInvalid( 'The healer was does not implement the "transform" method.' );
    }

    if ( !instance.toLocator ) {
        onInvalid( 'The healer was does not implement the "toLocator" method.' );
    }

    return instance;
};

const loadMinimumScore = ( score: number ): number => {
    if ( !score && score !== 0 ) {
        onInvalid( 'MinimumScore option not provided in configuration file.' );
    }

    if ( score < 0 || score > 1 ) {
        onInvalid( 'The minimumScore option must be between 0 and 1.' );
    }

    return score;
};

const getDatabaseOptions = async (): Promise<DatabaseOptions> => {
    return ( await explorer.load() ).database;
};

const getOptions = async (
    configExplorer: Config<HealerConfig> = explorer,
): Promise<{
    healer: HealerOptions;
    server: ServerOptions;
    database: DatabaseOptions;
}> => {
    const config: HealerConfig = await configExplorer.load();
    const heuristics: HeuristicInstance[] = await loadHeuristics( config.heuristics );
    const parser: ParserInstance = await loadParser( config.parser );
    const minimumScore: number = loadMinimumScore( config.minimumScore );

    return {
        healer: {
            heuristics,
            parser,
            minimumScore,
        },
        server: config.server,
        database: config.database,
    };
};

export { getDatabaseOptions, getOptions, getPlugin };
