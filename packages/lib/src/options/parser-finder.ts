import { Parser } from '@healer/common';

import { Requirement } from '../requirement';

const onArray = ( healer: Parser[] ): Parser => {
    return healer[ 0 ];
};

export const parserFinder = new Requirement( { onArray } );
