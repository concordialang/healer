import { DatabaseOptions, initDatabase } from '../database';
import { error } from '../output';
import { initServer, ServerOptions } from '../server';

type ServerConfig = {
    serverOptions: ServerOptions;
    databaseOptions: DatabaseOptions;
};

const defaults: ServerConfig = {
    databaseOptions: {
        type: 'sqlite',
        dbName: ':memory:',
    },
    serverOptions: {
        port: 5000,
    },
};

export const server = async ( {
    serverOptions,
    databaseOptions,
}: ServerConfig = defaults ): Promise<boolean> => {
    try {
        await initDatabase( databaseOptions );
    } catch ( err ) {
        error( '    Error on Database connection ' );
        error( err );

        return false;
    }

    try {
        initServer( serverOptions );
    } catch ( err ) {
        error( '    Error on Server start ' );
        error( err );

        return false;
    }

    return true;
};
