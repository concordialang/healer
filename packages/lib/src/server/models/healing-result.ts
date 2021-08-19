import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';

import { generateKey } from '../utils';
import { UIElement } from './ui-element';

@Entity()
export class HealingResult {
    @PrimaryKey()
    uuid: string;

    @Property()
    newLocator: string;

    @Property()
    score: number;

    @Property()
    successful: boolean = true;

    @Property()
    applied: boolean = false;

    @Property()
    logged: boolean = false;

    @Property( { onCreate: () => new Date() } )
    createdAt: Date;

    @ManyToOne( () => UIElement, { nullable: false } )
    element: UIElement;

    constructor( {
        newLocator,
        score,
        successful,
        applied,
        logged,
        createdAt,
        element,
    }: {
        newLocator: string;
        score?: number;
        successful?: boolean;
        applied?: boolean;
        logged?: boolean;
        createdAt?: Date;
        element?: UIElement;
    } ) {
        this.uuid = generateKey();
        this.newLocator = newLocator;
        this.score = score;
        this.successful = successful;
        this.applied = applied;
        this.logged = logged;
        this.createdAt = createdAt;
        this.element = element;
    }
}
