import colors, { Chalk } from 'chalk';
import { prompt } from 'inquirer';

const { log } = console;

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

export default { colors, styles, prompt, setLevel, print, error, success, say };

export { colors, styles, prompt, setLevel, print, error, success, say, OutputLevel };
