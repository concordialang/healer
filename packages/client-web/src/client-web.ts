import getElementData from './element-data';
import WSConnection from './ws-connection';

class ClientWeb {
    private connection: WSConnection;

    constructor( connection: WSConnection ) {
        this.connection = connection;
    }

    saveElement( element: HTMLElement ): Promise<void> {
        return this.connection.send( {
            action: '/element',
            payload: getElementData( element ),
        } );
    }

    healElement( element: HTMLElement, body: HTMLElement ): Promise<string> {
        return new Promise( ( resolve ) => {
            this.connection.send(
                {
                    action: '/heal',
                    payload: {
                        element: getElementData( element ),
                        body: body.outerHTML,
                    },
                },
                resolve,
            );
        } );
    }
}

export default ClientWeb;
