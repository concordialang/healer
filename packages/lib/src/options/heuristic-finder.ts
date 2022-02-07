import { Heuristic } from '@healer/common';

import { HeuristicEntry } from '../models';
import { Requirement } from '../requirement';

const onArray = ( heuristic: Heuristic[], entry: HeuristicEntry ): Heuristic => {
    return heuristic.find( ( value: Heuristic ) => value?.().name === entry.name );
};

export const heuristicFinder = new Requirement( { onArray } );
