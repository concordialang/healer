import { Heuristic } from '@healer/models';

import { Requirement } from '../requirement';
import { HeuristicEntry } from './heuristic-entry';

const onArray = ( heuristic: Heuristic[], entry: HeuristicEntry ): Heuristic => {
    return heuristic.find( ( value: Heuristic ) => value.name === entry.name );
};

export const heuristicFinder = new Requirement( { onArray } );
