import { HealingResult, UIElement } from '../database/entities';
import { HealingResultRepository } from '../database/repositories';
import { HealerOptions, HealingRequest, HealingResultStatus, ScoredLocator } from '../models';
import { colors, error, print, success, table } from '../output';
import { getUIElement } from '../utils';
import { healProcess } from './heal-process';

const saveHealingResult = ( {
    element,
    status,
    scoredLocators,
}: {
    element: UIElement;
    status: HealingResultStatus;
    scoredLocators: ScoredLocator[];
} ): Promise<void> => {
    return HealingResultRepository.save(
        new HealingResult( {
            element,
            status,
            scoredLocators,
        } ),
    );
};

const heal = async ( request: HealingRequest, options: HealerOptions ): Promise<string[]> => {
    print();
    print( `  Trying to heal the locator "${request.locator}"` );
    print();

    const element = await getUIElement( request );

    if ( !element ) {
        const locator = colors.grey.bold( request.locator );

        error( `  Element ${locator} not found. So the healing process cannot continue. :(` );

        return [];
    }

    const scoredLocators = healProcess( {
        element,
        options,
        source: request.source,
    } );

    if ( scoredLocators.length ) {
        success( '  The healing process was successful. :)' );
        print();
        print( `  Found new locators for the locator "${request.locator}":    ` );
        table( scoredLocators );
    } else {
        print( '  The healing process was unable to heal the locator. :(' );
    }

    await saveHealingResult( {
        element,
        status: scoredLocators.length ? HealingResultStatus.SUCCESS : HealingResultStatus.FAIL,
        scoredLocators: scoredLocators.length ? scoredLocators : null,
    } );

    return scoredLocators.map( ( value ) => value.locator );
};

export { heal };
