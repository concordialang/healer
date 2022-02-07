import { Parser } from '@healer/common';
import { JSDOM } from 'jsdom';
import uniqueSelector from 'unique-selector';

const parser: Parser = () => ( {
    transform: ( { source } ) => ( {
        source: new JSDOM( source.trim() ).window.document,
    } ),
    toLocator: ( { healing } ) => uniqueSelector( healing.node, {
        selectorTypes: [ 'ID', 'Class', 'Attributes', 'Tag', 'NthChild' ],
    } ),
} );

export default parser;
