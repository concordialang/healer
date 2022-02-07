import { Heuristic } from '@concordialang-healer/common';

import { UIElement } from '../models/ui-element';

const byTag: Heuristic = () => ( {
    name: 'by-tag',
    run: ( { element, source }: { element: UIElement; source: Document } ) => {
        const { tag } = element.content;
        const locator = tag;
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

export default byTag;
