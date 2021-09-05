import getXPath from '@healer/xpath';

import { HTMLElementData } from './models/html-element-data';

const getAttributes = ( element: Element ): Record<string, string> => {
    return Array.from( element.attributes )
        .reduce(
            ( buffer, attribute ) => ( {
                ...buffer,
                [ attribute.name ]: attribute.value,
            } ),
            {},
        );
};

const getElementContent = ( element: HTMLElement ): HTMLElementData => ( {
    tag: element.localName,
    innerText: element.innerText,
    xpath: getXPath( element, false ),
    attributes: getAttributes( element ),
} );

const getParentsContent = ( element: HTMLElement ): HTMLElementData[] => {
    const parents: HTMLElementData[] = [];
    let node = element.parentElement;

    while ( node ) {
        parents.push( getElementContent( node ) );
        node = node.parentElement;
    }

    return parents;
};

const getElementData = ( element: HTMLElement ): HTMLElementData => {
    const data = getElementContent( element );
    const parents = getParentsContent( element );

    if ( parents.length ) {
        data.parents = parents;
    }

    return data;
};

export default getElementData;
