import { Heuristic } from '@healer/common';

import { UIElement } from '../models/ui-element';

const byTag: Heuristic = () => ( {
    name: 'by-tag',
    run: ( { element, source }: { element: UIElement; source: Document } ) => {
        const { tag } = element.content;
        const locator = tag;
        const foundElements = Array.from( source.querySelectorAll( locator ) );

        return foundElements.map( ( node ) => ( {
            node,
            locator,
            score: 1,
            weight: 1 / foundElements.length,
        } ) );
    },
} );

export default byTag;
