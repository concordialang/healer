import fs from 'fs';

import { HealingResult } from '../database/entities';
import { HealingResultRepository } from '../database/repositories';
import { HealingResultStatus } from '../models';
import { colors, print, prompt, success, table } from '../output';
import { healFeature } from './heal-feature';

const indexId = ( index: number, length: number ): string => index.toString()
    .padStart( length.toString().length, '0' );

const findSuccessHealingResult = (): Promise<HealingResult[]> => {
    return HealingResultRepository.find(
        {
            status: HealingResultStatus.SUCCESS,
        },
        {
            orderBy: {
                testPath: 'ASC',
            },
            populate: [ 'element' ],
        },
    );
};

const updateHealingResults = async (
    results: HealingResult[],
    status: HealingResultStatus,
): Promise<void> => {
    await Promise.all(
        results.map( ( result ) => {
            result.status = status;

            return HealingResultRepository.update( result );
        } ),
    );
};

const confirmAdjustment = async (
    results: HealingResult[],
): Promise<[HealingResult[], HealingResult[]]> => {
    const confirmed: HealingResult[] = [];
    const notConfirmed: HealingResult[] = [];

    for await ( const [ index, result ] of results.entries() ) {
        const { response } = await prompt( {
            prefix: colors.bold( `${indexId( index, results.length )} -` ),
            message:
                `Do you want change ${colors.magenta( result.element.locator )}`
                + ` to ${colors.green( result.newLocator )}?`,
            name: 'response',
            type: 'list',
            choices: [
                {
                    name: 'Yes',
                    value: true,
                },
                {
                    name: 'No',
                    value: false,
                },
            ],
        } );

        if ( response ) {
            confirmed.push( result );
        } else {
            notConfirmed.push( result );
        }
    }

    return [ confirmed, notConfirmed ];
};

const askToContinue = async (): Promise<boolean> => {
    const { resolve } = await prompt( {
        message: 'Would you like to adjust now?',
        name: 'resolve',
        type: 'confirm',
    } );

    if ( !resolve ) {
        print( '  Ok! We can adjust later. ;)' );

        return false;
    }

    return true;
};

const afterReporting = async (
    splitResults = confirmAdjustment,
    shouldContinue = askToContinue,
    fileSystem: any = fs,
): Promise<void> => {
    print( '  Looking for healing results...' );

    const results = await findSuccessHealingResult();

    if ( !results?.length ) {
        print( '  No healing results to resolve. :)' );

        return;
    }

    print( `  There are ${colors.bold( results.length.toString() )} issues.` );
    print();

    if ( !await shouldContinue() ) {
        return;
    }

    print();
    print( 'Let\'s begin...' );
    print();
    table( {
        head: [ 'Id', 'Feature', 'Locator', 'Healed locator', 'Score' ],
        rows: results.map( ( { element, newLocator, score }, index ) => [
            indexId( index, results.length ),
            element.feature,
            element.locator,
            newLocator,
            score.toFixed( 2 ),
        ] ),
        colWidths: [ 5, 25, 30, 30, 11 ],
    } );

    const [ confirmed, notConfirmed ] = await splitResults( results );

    print();

    if ( notConfirmed?.length ) {
        await updateHealingResults( notConfirmed, HealingResultStatus.SUCCESS_NOT_ACCEPTED );
    }

    if ( !confirmed?.length ) {
        print( '  No healing result were accepted for adjustment. :(' );

        return;
    }

    print( `  Nice! ${confirmed.length} were been accepted for adjustment.` );
    print( '  Let\'s adjust your features...' );

    const healed = confirmed.reduce(
        ( buffer, { element, newLocator, testPath } ) => ( {
            ...buffer,
            [ testPath ]: {
                ...buffer[ testPath ],
                [ element.locator ]: newLocator,
            },
        } ),
        {} as Record<string, Record<string, string>>,
    );

    Object.keys( healed )
        .map( ( path ) => healFeature( path, healed[ path ], fileSystem ) );

    await updateHealingResults( confirmed, HealingResultStatus.SUCCESS_ACCEPTED );

    success( '  Ok! Everything is right now. ;)' );
};

export { findSuccessHealingResult, afterReporting };
