const getElementData = ( element: HTMLElement ): any => {
    const getXPath = ( el: HTMLElement ): string => {
        let nodeElem = el;

        const parts: string[] = [];

        while ( nodeElem && Node.ELEMENT_NODE === nodeElem.nodeType ) {
            let nbOfPreviousSiblings = 0;
            let hasNextSiblings = false;
            let sibling = nodeElem.previousSibling;

            while ( sibling ) {
                if (
                    sibling.nodeType !== Node.DOCUMENT_TYPE_NODE
                    && sibling.nodeName === nodeElem.nodeName
                ) {
                    nbOfPreviousSiblings++;
                }
                sibling = sibling.previousSibling;
            }
            sibling = nodeElem.nextSibling;
            while ( sibling ) {
                if ( sibling.nodeName === nodeElem.nodeName ) {
                    hasNextSiblings = true;
                    break;
                }
                sibling = sibling.nextSibling;
            }
            const prefix = nodeElem.prefix ? `${nodeElem.prefix}:` : '';
            const nth
                = nbOfPreviousSiblings || hasNextSiblings ? `[${nbOfPreviousSiblings + 1}]` : '';

            parts.push( prefix + nodeElem.localName + nth );
            nodeElem = nodeElem.parentNode as HTMLElement;
        }

        return parts.length
            ? `/${parts.reverse()
                .join( '/' )}`
            : '';
    };

    const getAttributes = ( el: Element ): Record<string, string> => {
        return Array.from( el.attributes )
            .reduce(
                ( buffer, attribute ) => ( {
                    ...buffer,
                    [ attribute.name ]: attribute.value.trim(),
                } ),
                {},
            );
    };

    return {
        tag: element.localName,
        textContent: element.textContent?.trim(),
        xpath: getXPath( element ),
        attributes: getAttributes( element ),
    };
};

export default getElementData;
