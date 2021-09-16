import { HealingElement, UIElement } from '.';

type HealerInstance = {
    transform: ( params: { source: string; element: UIElement } ) => {
        source: any;
    };
    toLocator: ( params: { element: UIElement; healing: HealingElement } ) => string;
};

type Healer = ( options?: any ) => HealerInstance;

export default Healer;

export { HealerInstance };
