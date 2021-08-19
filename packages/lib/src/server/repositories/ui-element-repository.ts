import { EntityManager, wrap } from '@mikro-orm/core';

import { UIElement } from '../models/ui-element';

type UIElementRepositoryType = ( em: EntityManager ) => {
    upsert: ( element: UIElement ) => Promise<void>;
};

const UIElementRepository: UIElementRepositoryType = ( em: EntityManager ) => ( {
    async upsert( element: UIElement ) {
        const existing = await em.findOne( UIElement, { uuid: element.uuid } );

        if ( existing ) {
            wrap( existing )
                .assign( element );
        } else {
            em.persist( element );
        }

        await em.flush();
    },
} );

export { UIElementRepository };
