import clientWeb from '@healer/client-web';
import getElementData from '@healer/element-data';
import ElementNotFound from 'codeceptjs/lib/helper/errors/ElementNotFound';

class HelperUtils {
    private lastFeature = '';
    private lastTestPath = '';

    async assertElementExists(
        context: any,
        res: any,
        locator: string,
        prefix?: string,
        suffix?: string,
    ): Promise<any> {
        if ( !res || res.length === 0 ) {
            const healed = await this.heal( context, locator );

            if ( !healed ) {
                throw new ElementNotFound( locator, prefix, suffix );
            }

            return healed;
        }

        this.saveElement( res[ 0 ], locator );

        return res;
    }

    onTest( test: Mocha.Test ) {
        this.lastTestPath = test.file;
        [ this.lastFeature ] = test.titlePath();
    }

    private async heal( context: any, locator: string ) {
        const locators = await clientWeb.healElement( {
            body: await context.$eval( 'body', ( el ) => el.outerHTML ),
            feature: this.lastFeature,
            testPath: this.lastTestPath,
            locator,
        } );

        if ( !locators?.length ) {
            return null;
        }

        return context.$$( locators[ 0 ] );
    }

    private async saveElement( el: any, locator: string ) {
        const data = await el.evaluate( getElementData );

        return clientWeb.saveElement( { data, feature: this.lastFeature, locator } );
    }
}

export default HelperUtils;
