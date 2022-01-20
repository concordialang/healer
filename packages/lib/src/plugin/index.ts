import fs from 'fs';

import { HealingResult } from '../database/entities';
import { HealingResultRepository } from '../database/repositories';
import { HealingResultStatus } from '../models';
import { colors, print, prompt, success, table } from '../output';
import { healFeature } from './heal-feature';

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

    for ( const result of results ) {
        // eslint-disable-next-line no-await-in-loop
        const { response } = await prompt( {
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
        head: [ 'Feature', 'Locator', 'Healed locator', 'Score' ],
        rows: results.map( ( { element, newLocator, score } ) => [
            element.feature,
            element.locator,
            newLocator,
            score.toFixed( 2 ),
        ] ),
        colWidths: [ 25, 30, 30, 11 ],
    } );

    const [ confirmed, notConfirmed ] = await splitResults( results );

    print();

    if ( notConfirmed?.length ) {
        await updateHealingResults( notConfirmed, HealingResultStatus.SUCCESS_DISPLAYED );
    }

    if ( !confirmed?.length ) {
        print( '  No healing result were accepted for adjustment. :(' );

        return;
    }

    print( `  Nice! ${confirmed.length} were been accepted for adjustment.` );
    print( '  Let\'s adjust your features...' );

    await updateHealingResults( confirmed, HealingResultStatus.SUCCESS_ACCEPTED );

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

    success( '  Ok! Everything is right now. ;)' );
};

export { findSuccessHealingResult, afterReporting };
