import { HealingElement, HeuristicInstance, HeuristicResult } from '@healer/common';

import { UIElement } from '../database/entities';
import { UIElementRepository } from '../database/repositories';
import { buildUIElementKey } from '../database/utils';
import { HealerOptions } from '../models';
import { HealingRequest } from '../models/healing-request';
import { ScoredLocator } from '../models/scored-locator';
import { colors, error } from '../output';

const getUIElement = ( { feature, locator }: HealingRequest ): Promise<UIElement> => {
    const uuid = buildUIElementKey( {
        feature,
        locator,
    } );

    return UIElementRepository.findOne( {
        uuid,
    } );
};

const runHeuristics = (
    heuristics: HeuristicInstance[],
    uiElement: UIElement,
    source: any,
): {
    healing: HealingElement[];
    maximumWeight: number;
} => {
    let maximumWeight: number = 0;
    const healing = heuristics.reduce( ( map, heuristic ) => {
        const result = heuristic.run( {
            element: uiElement,
            source,
        } );

        if ( !result ) {
            return map;
        }

        if ( Array.isArray( result ) && !result.length ) {
            return map;
        }

        [].concat( result )
            .forEach( ( value: HeuristicResult ) => {
                value.elements.forEach( ( scoredElement ) => {
                    const score = scoredElement.score * value.weight;
                    const applied = {
                        name: heuristic.name,
                        locator: scoredElement.locator,
                        score,
                    };

                    if ( map.has( scoredElement.node ) ) {
                        const data = map.get( scoredElement.node );

                        data.appliedHeuristics.push( applied );
                        data.totalScore += score;
                    } else {
                        map.set( scoredElement.node, {
                            node: scoredElement.node,
                            appliedHeuristics: [ applied ],
                            totalScore: score,
                        } );
                    }
                } );

                maximumWeight += value.weight;
            } );

        return map;
    }, new Map<any, HealingElement>() );

    return {
        healing: Array.from( healing.values() ),
        maximumWeight,
    };
};

const heal = async (
    request: HealingRequest & {
        options: HealerOptions;
    },
): Promise<ScoredLocator[]> => {
    const element = await getUIElement( request );

    if ( !element ) {
        const locator = colors.grey.bold( request.locator );

        error( `    Element ${locator} not found. So the healing process cannot continue. :(` );

        return [];
    }

    const { heuristics, healer } = request.options;
    const { source } = healer.transform( {
        element,
        source: request.source,
    } );
    const { healing, maximumWeight } = runHeuristics( heuristics, element, source );

    const healingResult = healing
        .map( ( value ) => ( {
            ...value,
            totalScore: value.totalScore / maximumWeight,
        } ) )
        // TODO: Use minimal score from options
        .filter( ( value ) => value.totalScore > 0.5 )
        .sort( ( valueA, valueB ) => valueB.totalScore - valueA.totalScore );

    return healingResult.map( ( value ) => ( {
        locator: healer.toLocator( {
            element,
            healing: value,
        } ),
        score: value.totalScore,
    } ) );
};

export { heal };
