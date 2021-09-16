import { Healer } from '@healer/common';

import { Requirement } from '../requirement';

const onArray = ( healer: Healer[] ): Healer => {
    return healer[ 0 ];
};

export const healerFinder = new Requirement( { onArray } );
