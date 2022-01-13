const isCSS = ( locator: string ): boolean => {
    return locator[ 0 ] === '#' || locator[ 0 ] === '.' || locator[ 0 ] === '[';
};

const isXPath = ( locator: string ): boolean => {
    const trimmed = locator.replace( /^\(+/, '' )
        .substr( 0, 2 );

    return trimmed === '//' || trimmed === './';
};

const locatorType = ( locator: string ): string => {
    if ( isXPath( locator ) ) {
        return 'xpath';
    }
    if ( isCSS( locator ) ) {
        return 'css';
    }

    return 'fuzzy';
};

export default locatorType;
