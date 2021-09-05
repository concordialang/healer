class Step {
    value: string;
    optimized: boolean;

    constructor( value: string, optimized: boolean ) {
        this.value = value;
        this.optimized = optimized || false;
    }

    toString(): string {
        return this.value;
    }
}

const areNodesSimilar = ( left: Element, right: Element ): boolean => {
    if ( left === right ) {
        return true;
    }

    if ( left.nodeType === Node.ELEMENT_NODE && right.nodeType === Node.ELEMENT_NODE ) {
        return left.localName === right.localName;
    }

    if ( left.nodeType === right.nodeType ) {
        return true;
    }

    const leftType = left.nodeType === Node.CDATA_SECTION_NODE ? Node.TEXT_NODE : left.nodeType;
    const rightType = right.nodeType === Node.CDATA_SECTION_NODE ? Node.TEXT_NODE : right.nodeType;

    return leftType === rightType;
};

const xPathIndex = ( node: Element ): number => {
    const siblings = node.parentNode ? node.parentNode.children : null;

    if ( !siblings ) {
        return 0;
    }

    let hasSameNamedElements = false;

    for ( let index = 0; index < siblings.length; ++index ) {
        if ( areNodesSimilar( node, siblings[ index ] ) && siblings[ index ] !== node ) {
            hasSameNamedElements = true;
            break;
        }
    }

    if ( !hasSameNamedElements ) {
        return 0;
    }

    let ownIndex = 1;

    for ( let index = 0; index < siblings.length; ++index ) {
        if ( areNodesSimilar( node, siblings[ index ] ) ) {
            if ( siblings[ index ] === node ) {
                return ownIndex;
            }
            ++ownIndex;
        }
    }

    return -1;
};

const xPathValue = ( node: Element, optimized: boolean ): Step => {
    let ownValue = null;
    const ownIndex = xPathIndex( node );

    if ( ownIndex === -1 ) {
        return null;
    }

    switch ( node.nodeType ) {
        case Node.ELEMENT_NODE:
            if ( optimized && node.getAttribute( 'id' ) ) {
                return new Step( `//*[@id="${node.getAttribute( 'id' )}"]`, true );
            }
            ownValue = node.localName;
            break;
        case Node.ATTRIBUTE_NODE:
            ownValue = `@${node.nodeName}`;
            break;
        case Node.TEXT_NODE:
        case Node.CDATA_SECTION_NODE:
            ownValue = 'text()';
            break;
        case Node.PROCESSING_INSTRUCTION_NODE:
            ownValue = 'processing-instruction()';
            break;
        case Node.COMMENT_NODE:
            ownValue = 'comment()';
            break;
        case Node.DOCUMENT_NODE:
            ownValue = '';
            break;
        default:
            ownValue = '';
            break;
    }

    if ( ownIndex > 0 ) {
        ownValue += `[${ownIndex}]`;
    }

    return new Step( ownValue, node.nodeType === Node.DOCUMENT_NODE );
};

const getXPath = ( node: Element, optimized: boolean = true ): string => {
    if ( node.nodeType === Node.DOCUMENT_NODE ) {
        return '/';
    }

    const steps: Step[] = [];
    let contextNode = node;

    while ( contextNode ) {
        const step = xPathValue( contextNode, optimized );

        if ( !step ) {
            break;
        }

        steps.push( step );

        if ( step.optimized ) {
            break;
        }

        contextNode = contextNode.parentNode as Element;
    }

    steps.reverse();

    return ( steps.length && steps[ 0 ].optimized ? '' : '/' ) + steps.join( '/' );
};

export default getXPath;
