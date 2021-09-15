import { Heuristic } from '@healer/common';

import { UIElement } from '../models/ui-element';
import { XPathResult } from '../models/x-path-result';

const byText: Heuristic = () => ( {
    name: 'by-text',
    run: ( { element, source }: { element: UIElement; source: Document } ) => {
        if ( !element.content.innerText ) {
            return [];
        }

        const { innerText } = element.content;
        const foundElements: Element[] = [];
        const locator = `//*[text()="${innerText}"]`;
        const nodes = source.evaluate( locator, source, null, XPathResult.ANY_TYPE, null );

        let node = nodes.iterateNext();

        while ( node ) {
            foundElements.push( node as Element );
            node = nodes.iterateNext();
        }

        return foundElements.map( ( value ) => ( {
            node: value,
            locator: `//${value.localName}[text()="${innerText}"]`,
            score: 1,
            weight: 1 / foundElements.length,
        } ) );
    },
} );

export default byText;
