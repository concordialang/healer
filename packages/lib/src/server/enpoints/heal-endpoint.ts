import { heal } from '../../heal';
import { HealerOptions, HealingRequest } from '../../models';
import { colors, error } from '../../output';
import { RequestListener } from '../server';

export const healEndpoint
    = ( options: HealerOptions ): RequestListener => async ( req, res ) => {
        const healRequest: HealingRequest = req.body;

        try {
            const locators = await heal( healRequest, options );

            res.send( locators );
        } catch ( err ) {
            error( `${colors.bold( 'Error on heal element:' )} ${err}` );
        }
    };
