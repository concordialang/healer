import { v4 as uuid4, v5 as uuid5 } from 'uuid';

export const generateKey = ( ...seeds: string[] ): string => {
    if ( seeds.length ) {
        return uuid5( seeds.join( '' ), uuid5.URL );
    }

    return uuid4();
};
