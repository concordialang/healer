import { Healer } from '@healer/common';
import { JSDOM } from 'jsdom';
import uniqueSelector from 'unique-selector';

const healer: Healer = {
    transform: ( { source } ) => ( {
        source: new JSDOM( source.trim() ).window.document,
    } ),
    toLocator: ( { node }: { node: HTMLElement } ) => uniqueSelector( node, {
        selectorTypes: [ 'ID', 'Class', 'Attributes', 'Tag', 'NthChild' ],
    } ),
};

export default healer;
