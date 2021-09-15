import { HealingElement, Heuristic, UIElement } from '@healer/common';

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

export default byClasses;
