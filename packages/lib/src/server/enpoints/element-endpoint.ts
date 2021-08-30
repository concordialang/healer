import { UIElement } from '../../database/entities/ui-element';
import { UIElementRepository } from '../../database/repositories';
import { error } from '../../output';
import { RequestListener } from '../server';

export const elementEndpoint: RequestListener = async ( req ) => {
    const uiElement = new UIElement( req.body );

    try {
        await UIElementRepository.upsert( uiElement );
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
