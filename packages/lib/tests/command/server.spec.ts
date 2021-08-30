import { expect } from 'chai';

import { server } from '../../src/command/server';
import { closeConnection } from '../../src/database';
import { OutputLevel, setLevel } from '../../src/output';
import { closeServer } from '../../src/server';

describe( 'Server command', () => {
    before( () => {
        setLevel( OutputLevel.TEST );
    } );

    after( async () => {
        closeServer();
        await closeConnection();
    } );

    it( 'Should correct init database and server', async () => {
        const ok = await server( {
            databaseOptions: {
                type: 'sqlite',
                dbName: ':memory:',
            },
            serverOptions: {
                port: 5000,
            },
        } );

        expect( ok ).to.be.true;
    } );

    it( 'Should not init on database connection error', async () => {
        const ok = await server( {
            databaseOptions: {
                type: 'postgresql',
                dbName: ':memory:',
            },
            serverOptions: {
                port: 5000,
            },
        } );

        expect( ok ).to.be.false;
    } );
} );
