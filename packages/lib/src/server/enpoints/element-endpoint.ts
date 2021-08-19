import { error } from '../../output';
import { getManager } from '../database';
import { UIElement } from '../models/ui-element';
import { UIElementRepository } from '../repositories/ui-element-repository';
import { RequestListener } from '../server';

export const elementEndpoint: RequestListener = async ( req ) => {
    const uiElement = new UIElement( req.body );

    try {
        await UIElementRepository( getManager() )
            .upsert( uiElement );
    } catch {
        const errorMessage = `Error on save element: ${JSON.stringify( {
            feature: uiElement.feature,
            scenario: uiElement.scenario,
            locator: uiElement.locator,
            content: uiElement.content,
        } )}`;

        error( errorMessage );
        throw new Error( errorMessage );
    }
};
