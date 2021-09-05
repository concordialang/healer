import { join } from 'path';

import { ClientWebConfig } from './models/client-web.config';

const requireConfig = ( configFile: string, cwd: string ): ClientWebConfig => {
    try {
        return require( join( cwd, configFile ) );
    } catch ( error ) {
        if ( error.code === 'MODULE_NOT_FOUND' ) {
            throw new Error( `  Cannot find configuration file "${configFile}"` );
        }

        throw error;
    }
};

const loadConfig = ( configFile: string, cwd = process.cwd() ): ClientWebConfig => {
    const config = requireConfig( configFile, cwd );

    if ( !config.server ) {
        throw new Error( `  Server option not provided in configuration file "${configFile}"` );
    }

    return config;
};

export default loadConfig;
