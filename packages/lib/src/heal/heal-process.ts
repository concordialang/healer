import { HealingElement, HeuristicInstance, HeuristicResult } from '@healer/common';

import { UIElement } from '../database/entities';
import { HealerOptions, ScoredLocator } from '../models';

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

const healProcess = ( request: {
    element: UIElement;
    source: any;
    options: HealerOptions;
} ): ScoredLocator => {
    const { heuristics, healer, minimumScore } = request.options;
    const { source } = healer.transform( {
        element: request.element,
        source: request.source,
    } );
    const { healing, maximumWeight } = runHeuristics( heuristics, request.element, source );

    if ( !healing?.length ) {
        return null;
    }

    const [ healingResult ] = healing
        .map( ( value ) => ( {
            ...value,
            totalScore: value.totalScore / maximumWeight,
        } ) )
        .filter( ( value ) => value.totalScore > minimumScore )
        .sort( ( valueA, valueB ) => valueB.totalScore - valueA.totalScore );

    return {
        locator: healer.toLocator( {
            element: request.element,
            healing: healingResult,
        } ),
        score: healingResult.totalScore,
    };
};

export { healProcess };
