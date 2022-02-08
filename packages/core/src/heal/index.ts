import { HealingResult, UIElement } from '../database/entities';
import { HealingResultRepository } from '../database/repositories';
import { HealerOptions, HealingRequest, HealingResultStatus } from '../models';
import { colors, error, print, success, table } from '../output';
import { getUIElement } from '../utils';
import { healProcess } from './heal-process';

const saveHealingResult = ( {
    element,
    status,
    newLocator,
    score,
    testPath,
}: Partial<HealingResult> ): Promise<void> => {
    return HealingResultRepository.save(
        new HealingResult( {
            element,
            status,
            testPath,
            newLocator,
            score,
        } ),
    );
};

const findHealingResult = ( { element }: { element: UIElement } ): Promise<HealingResult> => {
    return HealingResultRepository.findOne(
        {
            element,
        },
        {
            orderBy: {
                createdAt: 'DESC',
            },
        },
    );
};

const heal = async (
    { locator, source, feature, testPath }: HealingRequest,
    options: HealerOptions,
): Promise<string> => {
    print( `  Trying to heal "${locator}" element in ${colors.bold( feature )} feature.` );

    const element = await getUIElement( { feature, locator } );

    if ( !element ) {
        error(
            `  Element ${colors.grey.bold(
                locator,
            )} not found. The healing process cannot continue. :(`,
        );

        return null;
    }

    const healingResult = await findHealingResult( { element } );
    const scoredLocator = healingResult
        ? { score: healingResult.score, locator: healingResult.newLocator }
        : healProcess( {
            element,
            options,
            source,
        } );

    if ( scoredLocator ) {
        success( '  The healing process was successful. :)' );
        print( `  Found new locator for "${locator}" element:    ` );
        table( {
            head: [ 'Locator', 'Score' ],
            rows: [ [ scoredLocator.locator, scoredLocator.score.toFixed( 2 ) ] ],
        } );
    } else {
        print( '  The healing process was unable to heal element. :(' );
    }

    if ( !healingResult ) {
        await saveHealingResult( {
            element,
            status: scoredLocator ? HealingResultStatus.SUCCESS : HealingResultStatus.FAIL,
            newLocator: scoredLocator.locator,
            score: scoredLocator.score,
            testPath,
        } );
    }

    return scoredLocator.locator;
};

export { heal };
