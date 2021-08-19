import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

import { generateKey } from '../utils';

@Entity()
export class UIElement {
    @PrimaryKey()
    uuid: string;

    @Property()
    feature: string;

    @Property()
    scenario: string;

    @Property()
    locator: string;

    @Property()
    content: string;

    @Property( { onCreate: () => new Date() } )
    createdAt: Date;

    @Property( { onCreate: () => new Date(), onUpdate: () => new Date() } )
    updatedAt: Date;

    constructor( {
        feature,
        scenario,
        locator,
        content,
    }: {
        feature: string;
        scenario: string;
        locator: string;
        content: string;
    } ) {
        this.uuid = generateKey( feature, scenario, locator );
        this.feature = feature;
        this.scenario = scenario;
        this.locator = locator;
        this.content = content;
    }
}
