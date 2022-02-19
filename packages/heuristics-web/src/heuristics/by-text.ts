import { Heuristic } from '@concordialang-healer/common';

import { UIElement } from '../models/ui-element';

const getElementsByText = ( locator: string, source: Document, text: string ): Element[] => {
    return Array.from( source.querySelectorAll( locator ) )
        .filter(
            ( element ) => element.textContent.trim()
                .toLowerCase() === text.trim()
                .toLowerCase(),
        );
};

const byText: Heuristic = () => ( {
    name: 'by-text',
    run: ( { element, source }: { element: UIElement; source: Document } ) => {
        if ( !element.content.textContent?.trim() ) {
            return [];
        }

        const { textContent, tag } = element.content;
        const locator = tag;
        const foundElements = getElementsByText( locator, source, textContent );

        if ( !foundElements.length ) {
            return [];
        }

        return {
            weight: 1 / foundElements.length,
            elements: foundElements.map( ( value ) => ( {
                node: value,
                locator,
                score: 1,
            } ) ),
        };
    },
} );

export default byText;
