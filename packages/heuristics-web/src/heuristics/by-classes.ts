import { Heuristic, HeuristicResult, UIElement } from '@concordialang-healer/common';

const byClasses: Heuristic = () => ( {
    name: 'by-classes',
    run: ( { element, source }: { element: UIElement; source: Document } ) => {
        if ( !element.content?.attributes?.class ) {
            return [];
        }

        const classes: string[] = element.content.attributes.class.split( ' ' );

        return classes.reduce( ( buffer, classValue ) => {
            const locator = `.${classValue}`;
            const foundElements = Array.from( source.querySelectorAll( locator ) );

            if ( !foundElements?.length ) {
                return buffer;
            }

            return buffer.concat( {
                weight: 1 / foundElements.length,
                elements: foundElements.map( ( node ) => ( {
                    node,
                    locator,
                    score: 1,
                } ) ),
            } );
        }, <HeuristicResult[]>[] );
    },
} );

export default byClasses;
