import { error } from '../output';
import { initDatabase, initServer } from '../server';

const defaultPort: number = 3000;

export const server = async (): Promise<void> => {
    try {
        await initDatabase( {
            user: 'healer_user',
            password: '7MR9v2ghLUQS8h7Q',
            type: 'postgresql',
        } );
    } catch ( err ) {
        error( '    Error on Database connection ' );
        error( err );

        return;
    }

    initServer( defaultPort );
};

server();
