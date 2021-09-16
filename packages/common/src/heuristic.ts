import HealingResult from './heuristic-result';
import UIElement from './ui-element';

type HeuristicInstance = {
    name: string;
    run: ( params: { element: UIElement; source: any } ) => HealingResult | HealingResult[];
};

type Heuristic = ( options?: any ) => HeuristicInstance;

export default Heuristic;

export { HeuristicInstance };
