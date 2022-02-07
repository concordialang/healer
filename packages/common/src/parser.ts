import { HealingElement, UIElement } from '.';

type ParserInstance = {
    transform: ( params: { source: string; element: UIElement } ) => {
        source: any;
    };
    toLocator: ( params: { element: UIElement; healing: HealingElement } ) => string;
};

type Parser = ( options?: any ) => ParserInstance;

export default Parser;

export { ParserInstance };
