import { join } from 'path';

import { ClientWebConfig } from './models/client-web.config';

const requireConfig = ( configFile: string, cwd: string ): ClientWebConfig => {
    try {
        return require( join( cwd, configFile ) );
    } catch ( error: any ) {
        if ( error.code === 'MODULE_NOT_FOUND' ) {
            throw new Error( `  Cannot find configuration file "${configFile}"` );
        }

        throw error;
    }
};

const loadConfig = ( configFile: string, cwd = process.cwd() ): string => {
    const config = requireConfig( configFile, cwd );

    if ( !config.server ) {
        throw new Error( `  Server option not provided in configuration file "${configFile}"` );
    }

    if ( !config.server.port ) {
        throw new Error(
            `  Port option not provided in server option in configuration file "${configFile}"`,
        );
    }

    const { port, host = 'localhost' } = config.server;

    return `ws://${host}:${port}`;
};

export default loadConfig;
