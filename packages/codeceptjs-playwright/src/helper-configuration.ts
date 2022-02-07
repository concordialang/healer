import { HelperConfiguration } from 'concordialang-codeceptjs-core';
import { TestScriptExecutionOptions } from 'concordialang-plugin';

export class PlaywrightHelperConfiguration implements HelperConfiguration {
    readonly _helperName = 'Playwright';
    readonly _require = './node_modules/@concordialang-healer/codeceptjs-playwright/dist/helper';
    readonly _browser = 'chromium';
    readonly _url = 'http://localhost';

    name() {
        return this._helperName;
    }

    generate( execOptions: TestScriptExecutionOptions ) {
        const [ browser ] = execOptions.target
            ? execOptions.target.split( ',' )
                .map( ( value ) => value.trim() )
            : [ this._browser ];

        return {
            require: this._require,
            browser,
            url: this._url,
            show: !( execOptions.headless === true ),
            restart: true,
            waitForNavigation: 'networkidle0',
        };
    }
}
