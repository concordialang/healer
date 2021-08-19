import { EntityManager, MikroORM } from '@mikro-orm/core';
import { IMigrator } from '@mikro-orm/core/typings';

import { HealingResult } from '../models/healing-result';
import { UIElement } from '../models/ui-element';

type DatabaOptions = {
    user: string;
    password: string;
    type: 'postgresql';
};

let manager: EntityManager = null;

const runMigrations = async ( migrator: IMigrator ): Promise<void> => {
    await migrator.up();
};

const initDatabase = async ( databaseOptions: DatabaOptions ): Promise<EntityManager> => {
    const orm = await MikroORM.init( {
        ...databaseOptions,
        entities: [ UIElement, HealingResult ],
        dbName: 'healer',
        migrations: {
            path: `${__dirname}/migrations/${databaseOptions.type}`,
            safe: true,
            emit: 'ts',
        },
    } );

    await runMigrations( orm.getMigrator() );

    manager = orm.em;

    return orm.em;
};

const getManager = (): EntityManager => {
    return manager;
};

export { initDatabase, getManager };
