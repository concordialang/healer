import { UIElement } from '../../database/entities/ui-element';
import { UIElementRepository } from '../../database/repositories';
import { colors, error, print } from '../../output';
import { RequestListener } from '../server';

export const elementEndpoint: RequestListener = async ( req ) => {
    const uiElement = new UIElement( req.body );

    print( `  Received element -> ${uiElement.feature} - ${uiElement.locator}` );

    try {
        await UIElementRepository.upsert( uiElement );
    } catch ( err: any ) {
        error( `     ${colors.bold( 'Error on save element:' )} ${err.message}` );
    }
};
