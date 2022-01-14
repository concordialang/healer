import { heal } from '../../heal';
import { HealerOptions, HealingRequest } from '../../models';
import { colors, error, print } from '../../output';
import { RequestListener } from '../server';

export const healEndpoint
    = ( options: HealerOptions ): RequestListener => async ( req, res ) => {
        const healRequest: HealingRequest = req.body;

        print( `  Heal request -> ${healRequest.feature} - ${healRequest.locator}` );

        try {
            const locators = await heal( healRequest, options );

            res.send( locators );
        } catch ( err: any ) {
            error( `    ${colors.bold( 'Error on heal element:' )} ${err.message}` );
        }
    };
