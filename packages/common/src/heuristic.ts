import HealingElement from './healing-element';
import UIElement from './ui-element';

type Heuristic = ( options?: any ) => {
    name: string;
    run: ( params: { element: UIElement; source: any } ) => HealingElement[];
};

export default Heuristic;
