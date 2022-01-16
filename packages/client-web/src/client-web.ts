import locatorType from './locator-type';
import WSConnection from './ws-connection';

class ClientWeb {
    private connection: WSConnection;

    constructor( connection: WSConnection ) {
        this.connection = connection;
    }

    saveElement( {
        data,
        feature,
        locator,
    }: {
        data: any;
        feature: string;
        locator: string;
    } ): Promise<void> {
        return this.connection.send( {
            action: '/element',
            payload: {
                feature,
                locator,
                uiType: 'html',
                locatorType: locatorType( locator ),
                content: data,
            },
        } );
    }

    healElement( {
        body,
        feature,
        locator,
    }: {
        body: string;
        feature: string;
        locator: string;
    } ): Promise<string[]> {
        return new Promise( ( resolve ) => {
            this.connection.send(
                {
                    action: '/heal',
                    payload: {
                        source: body,
                        feature,
                        locator,
                    },
                },
                resolve,
            );
        } );
    }
}

export default ClientWeb;
