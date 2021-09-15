import { UIElement } from '.';

type Healer = {
    transform: ( params: { source: string; element: UIElement } ) => {
        source: any;
    };
    toLocator: ( params: { element: UIElement; node: any } ) => string;
};

export default Healer;
