import { resolve } from 'path';

import { RequirementData } from './requirement-data';
import { RequirementEntry } from './requirement-entry';
import { RequirementException } from './requirement-exception';

export const fromDirname = ( from: string, dirname?: string ): string => {
    if ( from.startsWith( '.' ) ) {
        return resolve( dirname, from );
    }

    return from;
};

export const arrayFind = ( data: RequirementData[], req: RequirementEntry ): RequirementData => {
    return data.find( ( value: RequirementData ) => value.name === req.name );
};

export const validate = ( data: RequirementData, req: RequirementEntry ): boolean => {
    if ( !data || data.name !== req.name ) {
        return false;
    }

    return true;
};

export const onInvalid = ( req: RequirementEntry ): void => {
    throw new RequirementException(
        `The "${req.name}" data was not found in "${req.from}" package.`,
    );
};
