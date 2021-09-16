import { EntityManager, FilterQuery } from '@mikro-orm/core';

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
    manager: EntityManager = getManager(),
): Promise<HealingResult[]> => {
    return manager.find( HealingResult, where || {} );
};

const findOne = (
    where: FilterQuery<HealingResult>,
    manager: EntityManager = getManager(),
): Promise<HealingResult> => {
    return manager.findOne( HealingResult, where );
};

const HealingResultRepository = { save, update, find, findOne };

export { HealingResultRepository };