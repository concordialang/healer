import fs from 'fs';
import { join } from 'path';

import { fromDirname } from '../utils';

const healReplaces = (
    oldLocator: string,
    newLocator: string,
): { regex: RegExp; replace: string }[] => {
    return [
        {
            regex: new RegExp( `<${oldLocator}>`, 'g' ),
            replace: `<${newLocator}>`,
        },
        {
            regex: new RegExp( `(- ?[A-zÀ-ú ]+ (["']))${oldLocator}(\\2)` ),
            replace: `$1${newLocator}$3`,
        },
    ];
};

const featurePathByTest = ( testPath: string, fileSystem = fs ): string => {
    const path = fromDirname( testPath, process.cwd() );
    const testFile = fileSystem.readFileSync( path, { encoding: 'utf-8' } );
    const [ , testCasePath ] = testFile.match( /\/\/ source: (\/.+\.testcase)\n/ );

    return testCasePath.replace( '.testcase', '.feature' );
};

const executeHealFromPath = (
    featurePath: string,
    healed: Record<string, string>,
    fileSystem = fs,
): void => {
    const feature = fileSystem.readFileSync( featurePath, { encoding: 'utf-8' } ) as string;
    const newFeature = Object.keys( healed )
        .reduce( ( buffer, key ) => {
            return healReplaces( key, healed[ key ] )
                .reduce(
                    ( value, { regex, replace } ) => value.replace( regex, replace ),
                    buffer,
                );
        }, feature );

    fileSystem.writeFileSync( featurePath, newFeature, { encoding: 'utf-8' } );

    // TODO: i18n import
    const imported = feature.match( /importe? "(.+\.feature)"/ )?.[ 1 ];

    if ( imported ) {
        const path = join( featurePath.split( '/' )
            .slice( 0, -1 )
            .join( '/' ), imported );

        executeHealFromPath( path, healed, fileSystem );
    }
};

const healFeature = (
    testPath: string,
    healed: Record<string, string>,
    fileSystem: any = fs,
): void => {
    const featurePath = featurePathByTest( testPath, fileSystem );

    executeHealFromPath( featurePath, healed, fileSystem );
};

export { healFeature };
