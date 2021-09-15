import { Heuristic } from '@healer/common';

import { UIElement } from '../models/ui-element';
import { XPathResult } from '../models/x-path-result';

const byXPath: Heuristic = () => ( {
    name: 'by-xpath',
    run: ( { element, source }: { element: UIElement; source: Document } ) => {
        if ( !element.content.xpath ) {
            return [];
        }

        const { xpath } = element.content;
        const foundElements: Element[] = [];
        const locator = xpath;
        const nodes = source.evaluate( locator, source, null, XPathResult.ANY_TYPE, null );

        if ( !nodes ) {
            return [];
        }

        let node = nodes.iterateNext();

        while ( node ) {
            foundElements.push( node as Element );
            node = nodes.iterateNext();
        }

        return foundElements.map( ( value ) => ( {
            node: value,
            locator,
            score: 1,
            weight: 1 / foundElements.length,
        } ) );
    },
} );

export default byXPath;
