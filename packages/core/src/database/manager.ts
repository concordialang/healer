import { EntityManager, MikroORM } from '@mikro-orm/core';
import { ISchemaGenerator } from '@mikro-orm/core/typings';

import { DatabaseOptions } from '../models';
import { HealingResult, UIElement } from './entities';

let connection: MikroORM = null;

const updateSchema = async ( generator: ISchemaGenerator ): Promise<void> => {
    await generator.updateSchema( true, true );
};

const initDatabase = async ( databaseOptions: DatabaseOptions ): Promise<EntityManager> => {
    const orm = await MikroORM.init( {
        ...databaseOptions,
        dbName: databaseOptions.dbName || 'healer',
        entities: [ UIElement, HealingResult ],
    } );

    await updateSchema( orm.getSchemaGenerator() );

    connection = orm;

    return orm.em;
};

const closeConnection = (): Promise<void> => {
    return connection.close();
};

const getManager = (): EntityManager => {
    return connection.em.fork();
};

export { initDatabase, closeConnection, getManager };
