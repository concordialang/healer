import { Heuristic } from '@concordialang-healer/common';

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

        if ( !foundElements?.length ) {
            return [];
        }

        return {
            weight: 1 / foundElements.length,
            elements: foundElements.map( ( node ) => ( {
                node,
                locator,
                score: 1,
            } ) ),
        };
    },
} );

export default byId;
