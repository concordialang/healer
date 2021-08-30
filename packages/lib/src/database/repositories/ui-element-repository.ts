import { EntityManager, FilterQuery, wrap } from '@mikro-orm/core';

import { UIElement } from '../entities/ui-element';
import { getManager } from '../manager';

const update = async (
    uuid: string,
    element: UIElement,
    manager: EntityManager = getManager(),
): Promise<void> => {
    await manager.nativeUpdate(
        UIElement,
        {
            uuid,
        },
        element,
    );
};

const upsertOne = async ( element: UIElement, manager: EntityManager ): Promise<void> => {
    const existing = await manager.findOne( UIElement, { uuid: element.uuid } );

    if ( existing ) {
        wrap( existing )
            .assign( element );
    } else {
        manager.persist( element );
    }
};

const upsert = async (
    element: UIElement | UIElement[],
    manager: EntityManager = getManager(),
): Promise<void> => {
    const elements: UIElement[] = [].concat( element );

    await Promise.all( elements.map( ( value ) => upsertOne( value, manager ) ) );

    await manager.flush();
};

const findOne = (
    where: FilterQuery<UIElement>,
    manager: EntityManager = getManager(),
): Promise<UIElement> => {
    return manager.findOne( UIElement, where );
};

const find = (
    where?: FilterQuery<UIElement>,
    manager: EntityManager = getManager(),
): Promise<UIElement[]> => {
    return manager.find( UIElement, where || {}, { cache: false } );
};

const UIElementRepository = {
    update,
    upsert,
    findOne,
    find,
};

export { UIElementRepository };
