import { initDatabase } from '../database';
import { DatabaseOptions, HealerOptions, ServerOptions } from '../models';
import { error } from '../output';
import { initServer } from '../server';

export const server = async ( options: {
    server: ServerOptions;
    database: DatabaseOptions;
    healer: HealerOptions;
} ): Promise<boolean> => {
    try {
        await initDatabase( options.database );
    } catch ( err: any ) {
        error( '    Error on Database connection ' );
        error( err.message );

        return false;
    }

    try {
        initServer( options.server, options.healer );
    } catch ( err: any ) {
        error( '    Error on Server start ' );
        error( err.message );

        return false;
    }

    return true;
};
