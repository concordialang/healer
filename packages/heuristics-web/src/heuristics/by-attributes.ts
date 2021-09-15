import { HealingElement, Heuristic } from '@healer/common';

import { UIElement } from '../models/ui-element';

const byAttributes: Heuristic = () => ( {
    name: 'by-attributes',
    run: ( { element, source }: { element: UIElement; source: Document } ): HealingElement[] => {
        const { attributes } = element.content;

        if ( !attributes || !Object.keys( attributes ).length ) {
            return [];
        }

        const toIgnore = [ 'class', 'id' ];

        return Object.keys( attributes )
            .reduce( ( buffer, attribute ) => {
                if ( toIgnore.includes( attribute ) ) {
                    return buffer;
                }

                const attributeValue = attributes[ attribute ];
                const locator = `[${attribute}="${attributeValue}"]`;
                const foundElements = Array.from( source.querySelectorAll( locator ) );

                return buffer.concat(
                    foundElements.map( ( node ) => ( {
                        node,
                        locator,
                        score: 1,
                        weight: 1 / foundElements.length,
                    } ) ),
                );
            }, <HealingElement[]>[] );
    },
} );

export default byAttributes;
