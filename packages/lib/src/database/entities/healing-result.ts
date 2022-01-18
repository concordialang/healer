import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';

import { HealingResultStatus, IHealingResult, ScoredLocator } from '../../models';
import { buildHealingResultKey } from '../utils';
import { UIElement } from './ui-element';

@Entity()
export class HealingResult implements IHealingResult {
    @PrimaryKey( { type: 'uuid' } )
    uuid: string;

    @Property( { nullable: true } )
    newLocator: string;

    @Property( { nullable: true } )
    score: number;

    @Property()
    testPath: string;

    @Enum()
    status: HealingResultStatus;

    @Property( { type: 'json', nullable: true } )
    scoredLocators: ScoredLocator[];

    @Property( { onCreate: () => new Date() } )
    createdAt: Date;

    @ManyToOne( () => UIElement, { nullable: false } )
    element: UIElement;

    constructor( {
        newLocator,
        score,
        status,
        element,
        scoredLocators,
        testPath,
    }: {
        newLocator?: string;
        score?: number;
        scoredLocators?: ScoredLocator[];
        status: HealingResultStatus;
        element: UIElement;
        testPath: string;
    } ) {
        this.uuid = buildHealingResultKey();
        this.newLocator = newLocator;
        this.score = score;
        this.status = status;
        this.element = element;
        this.scoredLocators = scoredLocators;
        this.testPath = testPath;
    }
}
