import colors, { Chalk } from 'chalk';

import { log } from './logger';
import { prompt } from './prompt';

const styles = {
    error: colors.bgRed.white.bold,
    success: colors.bgGreen.white.bold,
    basic: colors.white,
    log: colors.grey,
    bold: colors.bold,
};

const print = ( ...msg: string[] ): void => {
    log( ...msg );
};

export = {
    colors,
    styles,
    print,
    prompt,

    error( msg: string ): void {
        print( styles.error( msg ) );
    },

    success( msg: string ): void {
        print( styles.success( msg ) );
    },

    say( msg: string, color: Chalk ): void {
        print( `   ${color( msg )}` );
    },
};
