import { EntityManager, FilterQuery } from '@mikro-orm/core';

import { HealingResult } from '../models/healing-result';

type HealingResultRepositoryType = ( em: EntityManager ) => {
    save: ( healing: HealingResult ) => Promise<void>;
    update: ( healing: HealingResult ) => Promise<void>;
    read: ( where: FilterQuery<HealingResult> ) => Promise<HealingResult[]>;
};

const HealingResultRepository: HealingResultRepositoryType = ( em: EntityManager ) => ( {
    async save( healing: HealingResult ) {
        await em.persistAndFlush( healing );
    },

    async update( healing: HealingResult ) {
        await em.nativeUpdate( HealingResult, { uuid: healing.uuid }, healing );
    },

    read( where: FilterQuery<HealingResult> ) {
        return em.find( HealingResult, where );
    },
} );

export { HealingResultRepository };
