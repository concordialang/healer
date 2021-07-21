import colors, { Chalk } from 'chalk';
import { prompt } from 'inquirer';

const { log } = console;

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

const error = ( msg: string ): void => {
    print( styles.error( msg ) );
};

const success = ( msg: string ): void => {
    print( styles.success( msg ) );
};

const say = ( msg: string, color: Chalk ): void => {
    print( `   ${color( msg )}` );
};

export { colors, styles, prompt, print, error, success, say };
