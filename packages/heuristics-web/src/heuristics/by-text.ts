import { Heuristic } from '@concordialang-healer/common';

import { UIElement } from '../models/ui-element';

const MULTIPLE_SPACES = /\s+/g;

const sanitizeText = ( text: string ): string => text.replace( MULTIPLE_SPACES, ' ' )
    .trim()
    .toLowerCase();

const getElementsByText = ( locator: string, source: Document, text: string ): Element[] => {
    const textContent = sanitizeText( text );

    return Array.from( source.querySelectorAll( locator ) )
        .filter(
            ( element ) => sanitizeText( element.textContent ) === textContent,
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
