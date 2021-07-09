import { Heuristic, Options } from '@healer/models';

import { Config, ConfigException } from './config';
import { explorer, HealerConfig } from './explorer';
import { HeuristicEntry, heuristicFinder } from './heuristic';

const validate = ( heuristic: Heuristic, entry: HeuristicEntry ): boolean => {
    return heuristic?.name === entry.name;
};

const onInvalid = ( message: string ): void => {
    throw new ConfigException( message );
};

const loadHeuristic = async ( entry: HeuristicEntry ): Promise<Heuristic> => {
    const heuristic: Heuristic = await heuristicFinder.find( entry );

    if ( !validate( heuristic, entry ) ) {
        onInvalid( `The "${entry.name}" heuristic was not found in "${entry.from}" package.` );
    }

    return heuristic;
};

const loadHeuristics = ( entries: HeuristicEntry[] ): Promise<Heuristic[]> => {
    return Promise.all( entries.map( loadHeuristic ) );
};

export const getOptions = async (
    configExplorer: Config<HealerConfig> = explorer,
): Promise<Options> => {
    const config: HealerConfig = await configExplorer.load();
    const heuristics: Heuristic[] = await loadHeuristics( config.heuristics );

    return { heuristics };
};
