import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';

import { HealingResultStatus, IHealingResult } from '../../models';
import { buildHealingResultKey } from '../utils';
import { UIElement } from './ui-element';

@Entity()
export class HealingResult implements IHealingResult {
    @PrimaryKey( { type: 'uuid' } )
    uuid: string;

    @Property()
    newLocator: string;

    @Property()
    score: number;

    @Enum()
    status: HealingResultStatus;

    @Property( { onCreate: () => new Date() } )
    createdAt: Date;

    @ManyToOne( () => UIElement, { nullable: false } )
    element: UIElement;

    constructor( {
        newLocator,
        score,
        status,
        element,
    }: {
        newLocator: string;
        score: number;
        status: HealingResultStatus;
        element: UIElement;
    } ) {
        this.uuid = buildHealingResultKey();
        this.newLocator = newLocator;
        this.score = score;
        this.status = status;
        this.element = element;
    }
}
