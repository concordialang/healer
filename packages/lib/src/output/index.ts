import colors, { Chalk } from 'chalk';
import { prompt } from 'inquirer';

const { log, table: consoleTable } = console;

const styles = {
    error: colors.bgRed.white.bold,
    success: colors.bgGreen.white.bold,
    warn: colors.bgHex( '#fb8c00' ).white.bold,
    basic: colors.white,
    log: colors.grey,
    bold: colors.bold,
};

enum OutputLevel {
    TEST,
    LOG,
}

let outputLevel: OutputLevel = OutputLevel.LOG;

const print = ( ...msg: string[] ): void => {
    if ( outputLevel === OutputLevel.TEST ) {
        return;
    }
    log( ...msg );
};

const table = ( data: any ): void => {
    if ( outputLevel === OutputLevel.TEST ) {
        return;
    }
    consoleTable( data );
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

const levelIsAvailable = ( level: OutputLevel ): boolean => {
    return Object.values( OutputLevel )
        .includes( level );
};

const setLevel = ( level: OutputLevel ): void => {
    if ( levelIsAvailable( level ) ) {
        outputLevel = level;
    }
};

export default { colors, styles, prompt, setLevel, print, table, error, success, say };

export { colors, styles, prompt, setLevel, print, table, error, success, say, OutputLevel };
