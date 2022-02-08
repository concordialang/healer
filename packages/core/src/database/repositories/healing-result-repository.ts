import { EntityManager, FilterQuery, FindOneOptions } from '@mikro-orm/core';

import { HealingResult } from '../entities/healing-result';
import { getManager } from '../manager';

const save = async (
    healing: HealingResult,
    manager: EntityManager = getManager(),
): Promise<void> => {
    await manager.persistAndFlush( healing );
};

const update = async (
    healing: HealingResult,
    manager: EntityManager = getManager(),
): Promise<void> => {
    await manager.nativeUpdate( HealingResult, { uuid: healing.uuid }, healing );
};

const find = (
    where?: FilterQuery<HealingResult>,
    options: FindOneOptions<HealingResult> = null,
    manager: EntityManager = getManager(),
): Promise<HealingResult[]> => {
    return manager.find( HealingResult, where || {}, options );
};

const findOne = (
    where: FilterQuery<HealingResult>,
    options: FindOneOptions<HealingResult> = null,
    manager: EntityManager = getManager(),
): Promise<HealingResult> => {
    return manager.findOne( HealingResult, where, options );
};

const HealingResultRepository = { save, update, find, findOne };

export { HealingResultRepository };
