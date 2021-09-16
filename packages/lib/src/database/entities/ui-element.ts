import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

import { IUIElement } from '../../models';
import { buildUIElementKey } from '../utils';

@Entity()
export class UIElement implements IUIElement {
    @PrimaryKey( { type: 'uuid' } )
    uuid: string;

    @Property()
    feature: string;

    @Property()
    locator: string;

    @Property()
    locatorType: string;

    @Property( { type: 'json' } )
    content: Record<string, any>;

    @Property()
    uiType: string;

    @Property( { onCreate: () => new Date() } )
    createdAt: Date;

    @Property( { onCreate: () => new Date(), onUpdate: () => new Date() } )
    updatedAt: Date;

    constructor( {
        uuid,
        feature,
        locator,
        locatorType,
        content,
        uiType,
    }: {
        uuid?: string;
        feature: string;
        scenario: string;
        locator: string;
        locatorType: string;
        content: any;
        uiType: string;
    } ) {
        this.uuid = uuid || buildUIElementKey( { feature, locator } );
        this.feature = feature;
        this.locator = locator;
        this.locatorType = locatorType;
        this.content = content;
        this.uiType = uiType;
    }
}
