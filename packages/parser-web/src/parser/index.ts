import { Parser } from '@concordialang-healer/common';
import { JSDOM } from 'jsdom';
import uniqueSelector from 'unique-selector';

type LocatorOptions = uniqueSelector.Options & {
    exclude: string[];
};

type Options = {
    locator?: LocatorOptions;
};

const parser: Parser = ( { locator }: Options = {} ) => ( {
    transform: ( { source } ) => ( {
        source: new JSDOM( source.trim() ).window.document,
    } ),
    toLocator: ( { healing } ) => uniqueSelector( healing.node, {
        selectorTypes: locator?.selectorTypes || [
            'ID',
            'Class',
            'Attributes',
            'Tag',
            'NthChild',
        ],
        attributesToIgnore: [ 'id', 'class' ].concat( locator?.attributesToIgnore || [ 'length' ] ),
        excludeRegex: locator?.exclude && RegExp( locator.exclude.join( '|' ) ),
    } ),
} );

export default parser;
