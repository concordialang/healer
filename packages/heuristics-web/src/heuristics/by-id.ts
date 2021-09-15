import { Heuristic } from '@healer/common';

import { UIElement } from '../models/ui-element';

const byId: Heuristic = () => ( {
    name: 'by-id',
    run: ( { element, source }: { element: UIElement; source: Document } ) => {
        if ( !element.content.attributes?.id ) {
            return [];
        }

        const { id } = element.content.attributes;
        const locator = `#${id}`;
        const foundElements = Array.from( source.querySelectorAll( locator ) );

        return foundElements.map( ( node ) => ( {
            node,
            locator,
            score: 1,
            weight: 1 / foundElements.length,
        } ) );
    },
} );

export default byId;
