import fs from 'fs';
import { join } from 'path';
import { v4 as uuid4, v5 as uuid5 } from 'uuid';

import { UIElement } from '../database/entities';
import { UIElementRepository } from '../database/repositories';
import { buildUIElementKey } from '../database/utils';

export const requireDefault = async ( from: string ): Promise<any> => {
    const obj = await import( from );

    return obj.default;
};

export const fileExists = ( filePath: string, fileSystem: any = fs ): boolean => {
    try {
        return fileSystem.lstatSync( filePath )
            .isFile();
    } catch ( error ) {
        return false;
    }
};

export const searchConfigFile = (
    fileNames: string[],
    path: string,
    isFile: ( filePath: string ) => boolean = fileExists,
): string | null => {
    for ( const configFile of fileNames ) {
        const filePath: string = join( path, configFile );

        if ( isFile( filePath ) ) {
            return filePath;
        }
    }

    return null;
};

export const generateKey = ( ...seeds: string[] ): string => {
    if ( seeds.length ) {
        return uuid5( seeds.join( '' ), uuid5.URL );
    }

    return uuid4();
};

export const getUIElement = ( {
    feature,
    locator,
}: {
    feature: string;
    locator: string;
} ): Promise<UIElement> => {
    const uuid = buildUIElementKey( {
        feature,
        locator,
    } );

    return UIElementRepository.findOne( {
        uuid,
    } );
};
