import { empty } from 'codeceptjs/lib/assert/empty';
import { equals, urlEquals } from 'codeceptjs/lib/assert/equal';
import { includes as stringIncludes } from 'codeceptjs/lib/assert/include';
import { truth } from 'codeceptjs/lib/assert/truth';
import { convertColorToRGBA, isColorProperty } from 'codeceptjs/lib/colorUtils';
import Helper from 'codeceptjs/lib/helper';
import RemoteBrowserConnectionRefused from 'codeceptjs/lib/helper/errors/RemoteBrowserConnectionRefused';
import Console from 'codeceptjs/lib/helper/extras/Console';
import {
    createDisabledEngine,
    createValueEngine,
} from 'codeceptjs/lib/helper/extras/PlaywrightPropEngine';
import Popup from 'codeceptjs/lib/helper/extras/Popup';
import findReact from 'codeceptjs/lib/helper/extras/React';
import Locator from 'codeceptjs/lib/locator';
import recorder from 'codeceptjs/lib/recorder';
import {
    chunkArray,
    clearString,
    convertCssPropertiesToCamelCase,
    fileExists,
    getNormalizedKeyAttributeValue,
    isModifierKey,
    screenshotOutputFolder,
    ucfirst,
    xpathLocator,
} from 'codeceptjs/lib/utils';
import fs from 'fs';
import path from 'path';
import {
    Browser,
    BrowserContext,
    Cookie,
    ElectronApplication,
    ElementHandle,
    Page,
    Request,
    Response,
    Route,
} from 'playwright';

import HelperUtils from './utils';

let playwright;
let perfTiming;
let defaultSelectorEnginesInitialized = false;

const popupStore = new Popup();
const consoleLogStore = new Console();
const availableBrowsers = ['chromium', 'webkit', 'firefox', 'electron'];
const CodeceptJSHelper: any = Helper;

class Playwright extends CodeceptJSHelper {
    public options: any = null;

    protected isRemoteBrowser = false;
    protected isRunning = false;
    protected isAuthenticated = false;
    protected sessionPages = {};
    protected activeSessionName = '';
    protected isElectron = false;
    protected electronSessions = [];
    protected storageState = null;

    protected playwrightOptions: any;
    protected userDataDir: string;
    protected browserContext: BrowserContext;
    protected browser: Browser | ElectronApplication;
    protected withinLocator: Locator;
    protected page: Page;
    protected context: any;
    protected contextLocator: any;

    protected helperUtils: HelperUtils;

    constructor(config: any, HelperUtilsClass = HelperUtils) {
        super(config);

        playwright = require('playwright');

        this.isRemoteBrowser = false;
        this.isRunning = false;
        this.isAuthenticated = false;
        this.sessionPages = {};
        this.activeSessionName = '';
        this.isElectron = false;
        this.electronSessions = [];
        this.storageState = null;

        this._setConfig(config);

        this.helperUtils = new HelperUtilsClass();
    }

    _validateConfig(config: any) {
        const defaults = {
            emulate: {},
            browser: 'chromium',
            waitForAction: 100,
            waitForTimeout: 1000,
            pressKeyDelay: 10,
            fullPageScreenshots: false,
            disableScreenshots: false,
            uniqueScreenshotNames: false,
            manualStart: false,
            getPageTimeout: 0,
            waitForNavigation: 'load',
            restart: false,
            keepCookies: false,
            keepBrowserState: false,
            show: false,
            defaultPopupAction: 'accept',
            ignoreHTTPSErrors: false,
        };

        config = Object.assign(defaults, config);

        if (availableBrowsers.indexOf(config.browser) < 0) {
            throw new Error(
                `Invalid config. Can't use browser "${
                    config.browser
                }". Accepted values: ${availableBrowsers.join(', ')}`,
            );
        }

        return config;
    }

    _getOptionsForBrowser(config: any) {
        if (config[config.browser]) {
            if (
                config[config.browser].browserWSEndpoint &&
                config[config.browser].browserWSEndpoint.wsEndpoint
            ) {
                config[config.browser].browserWSEndpoint =
                    config[config.browser].browserWSEndpoint.wsEndpoint;
            }

            return {
                ...config[config.browser],
                wsEndpoint: config[config.browser].browserWSEndpoint,
            };
        }

        return {};
    }

    _setConfig(config: any) {
        this.options = this._validateConfig(config);
        this.playwrightOptions = {
            headless: !this.options.show,
            ...this._getOptionsForBrowser(config),
        };
        if (this.options.video) {
            this.options.recordVideo = { size: parseWindowSize(this.options.windowSize) };
        }
        if (this.options.recordVideo && !this.options.recordVideo.dir) {
            this.options.recordVideo.dir = `${(global as any).output_dir}/videos/`;
        }
        this.isRemoteBrowser = Boolean(this.playwrightOptions.browserWSEndpoint);
        this.isElectron = this.options.browser === 'electron';
        this.userDataDir = this.playwrightOptions.userDataDir;
        popupStore.defaultAction = this.options.defaultPopupAction;
    }

    static _config() {
        return [
            { name: 'url', message: 'Base url of site to be tested', default: 'http://localhost' },
            {
                name: 'show',
                message: 'Show browser window',
                default: true,
                type: 'confirm',
            },
            {
                name: 'browser',
                message:
                    'Browser in which testing will be performed. Possible options: chromium, firefox, webkit or electron',
                default: 'chromium',
            },
        ];
    }

    static _checkRequirements() {
        try {
            require('playwright');
        } catch (err) {
            return ['playwright@^1'];
        }
    }

    async _init() {
        // register an internal selector engine for reading value property of elements in a selector
        if (defaultSelectorEnginesInitialized) {
            return;
        }
        defaultSelectorEnginesInitialized = true;
        try {
            await playwright.selectors.register('__value', createValueEngine);
            await playwright.selectors.register('__disabled', createDisabledEngine);
        } catch (err) {
            console.warn(err);
        }
    }

    _beforeSuite() {
        if (!this.options.restart && !this.options.manualStart && !this.isRunning) {
            this.debugSection('Session', 'Starting singleton browser session');

            return this._startBrowser();
        }
    }

    async _before() {
        recorder.retry({
            retries: 5,
            when: (err) => {
                if (!err || typeof err.message !== 'string') {
                    return false;
                }

                // ignore context errors
                return err.message.includes('context');
            },
        });
        if (this.options.restart && !this.options.manualStart) {
            await this._startBrowser();
        }
        if (!this.isRunning && !this.options.manualStart) {
            await this._startBrowser();
        }

        this.isAuthenticated = false;
        if (this.isElectron) {
            this.browserContext = (this.browser as ElectronApplication).context();
        } else if (this.userDataDir) {
            this.browserContext = this.browser as any;
        } else {
            const contextOptions = {
                ignoreHTTPSErrors: this.options.ignoreHTTPSErrors,
                acceptDownloads: true,
                ...this.options.emulate,
            };

            if (this.options.basicAuth) {
                contextOptions.httpCredentials = this.options.basicAuth;
                this.isAuthenticated = true;
            }
            if (this.options.recordVideo) {
                contextOptions.recordVideo = this.options.recordVideo;
            }
            if (this.storageState) {
                contextOptions.storageState = this.storageState;
            }
            this.browserContext = await (this.browser as Browser).newContext(contextOptions);
        }

        let mainPage;

        if (this.isElectron) {
            mainPage = await (this.browser as ElectronApplication).firstWindow();
        } else {
            const existingPages = await this.browserContext.pages();

            mainPage = existingPages[0] || (await this.browserContext.newPage());
        }
        targetCreatedHandler.call(this, mainPage);

        await this._setPage(mainPage);

        if (this.options.trace) {
            await this.browserContext.tracing.start({ screenshots: true, snapshots: true });
        }

        return this.browser;
    }

    async _after() {
        if (!this.isRunning) {
            return;
        }

        if (this.isElectron) {
            this.browser.close();
            this.electronSessions.forEach((session) => session.close());

            return;
        }

        if (this.options.restart) {
            this.isRunning = false;

            return this._stopBrowser();
        }

        // close other sessions
        try {
            const contexts = await (this.browser as Browser).contexts();
            const currentContext = contexts[0];

            if (currentContext && (this.options.keepCookies || this.options.keepBrowserState)) {
                this.storageState = await currentContext.storageState();
            }

            await Promise.all(contexts.map((c) => c.close()));
        } catch (e) {
            console.log(e);
        }

        // await this.closeOtherTabs();
        return this.browser;
    }

    _afterSuite() {}

    _finishTest() {
        if (!this.options.restart && this.isRunning) {
            return this._stopBrowser();
        }
    }

    _session() {
        const defaultContext = this.browserContext;

        return {
            start: async (sessionName = '', config) => {
                this.debugSection('New Context', config ? JSON.stringify(config) : 'opened');
                this.activeSessionName = sessionName;

                let browserContext;
                let page;

                if (this.isElectron) {
                    const browser = await playwright._electron.launch(this.playwrightOptions);

                    this.electronSessions.push(browser);
                    browserContext = browser.context();
                    page = await browser.firstWindow();
                } else {
                    browserContext = await (this.browser as Browser).newContext(config);
                    page = await browserContext.newPage();
                }

                targetCreatedHandler.call(this, page);
                this._setPage(page);

                // Create a new page inside context.
                return browserContext;
            },
            stop: async () => {
                // is closed by _after
            },
            loadVars: async (context) => {
                this.browserContext = context;
                const existingPages = await context.pages();

                this.sessionPages[this.activeSessionName] = existingPages[0];

                return this._setPage(this.sessionPages[this.activeSessionName]);
            },
            restoreVars: async (session) => {
                this.withinLocator = null;
                this.browserContext = defaultContext;

                if (!session) {
                    this.activeSessionName = '';
                } else {
                    this.activeSessionName = session;
                }
                const existingPages = await this.browserContext.pages();

                await this._setPage(existingPages[0]);

                return this._waitForAction();
            },
        };
    }

    /**
     * Use Playwright API inside a test.
     *
     * First argument is a description of an action.
     * Second argument is async function that gets this helper as parameter.
     *
     * { [`page`](https://github.com/microsoft/playwright/blob/master/docs/api.md#class-page), [`context`](https://github.com/microsoft/playwright/blob/master/docs/api.md#class-context) [`browser`](https://github.com/microsoft/playwright/blob/master/docs/api.md#class-browser) } objects from Playwright API are available.
     *
     * ```js
     * I.usePlaywrightTo('emulate offline mode', async ({ context }) {
     *   await context.setOffline(true);
     * });
     * ```
     */
    usePlaywrightTo(description: string, fn: any) {
        return this._useTo(description, fn);
    }

    /**
     * Set the automatic popup response to Accept.
     * This must be set before a popup is triggered.
     *
     * ```js
     * I.amAcceptingPopups();
     * I.click('#triggerPopup');
     * I.acceptPopup();
     * ```
     */
    amAcceptingPopups() {
        popupStore.actionType = 'accept';
    }

    /**
     * Accepts the active JavaScript native popup window, as created by window.alert|window.confirm|window.prompt.
     * Don't confuse popups with modal windows, as created by [various
     * libraries](http://jster.net/category/windows-modals-popups).
     */
    acceptPopup() {
        popupStore.assertPopupActionType('accept');
    }

    /**
     * Set the automatic popup response to Cancel/Dismiss.
     * This must be set before a popup is triggered.
     *
     * ```js
     * I.amCancellingPopups();
     * I.click('#triggerPopup');
     * I.cancelPopup();
     * ```
     */
    amCancellingPopups() {
        popupStore.actionType = 'cancel';
    }

    /**
     * Dismisses the active JavaScript popup, as created by window.alert|window.confirm|window.prompt.
     */
    cancelPopup() {
        popupStore.assertPopupActionType('cancel');
    }

    /**
     * {{> seeInPopup }}
     */
    async seeInPopup(text: string) {
        popupStore.assertPopupVisible();
        const popupText = await popupStore.popup.message();

        stringIncludes('text in popup').assert(text, popupText);
    }

    /**
     * Set current page
     * @param {object} page page to set
     */
    async _setPage(page: Page) {
        page = await page;
        this._addPopupListener(page);
        this.page = page;
        if (!page) {
            return;
        }
        page.setDefaultNavigationTimeout(this.options.getPageTimeout);
        this.context = await this.page;
        this.contextLocator = null;
        if (this.options.browser === 'chrome') {
            await page.bringToFront();
        }
    }

    /**
     * Add the 'dialog' event listener to a page
     * @page {playwright.Page}
     *
     * The popup listener handles the dialog with the predefined action when it appears on the page.
     * It also saves a reference to the object which is used in seeInPopup.
     */
    _addPopupListener(page) {
        if (!page) {
            return;
        }
        page.removeAllListeners('dialog');
        page.on('dialog', async (dialog) => {
            popupStore.popup = dialog;
            const action = popupStore.actionType || this.options.defaultPopupAction;

            await this._waitForAction();

            switch (action) {
                case 'accept':
                    return dialog.accept();

                case 'cancel':
                    return dialog.dismiss();

                default: {
                    throw new Error(
                        'Unknown popup action type. Only "accept" or "cancel" are accepted',
                    );
                }
            }
        });
    }

    /**
     * Gets page URL including hash.
     */
    async _getPageUrl() {
        return this.executeScript(() => window.location.href) as Promise<string>;
    }

    /**
     * Grab the text within the popup. If no popup is visible then it will return null
     *
     * ```js
     * await I.grabPopupText();
     * ```
     */
    async grabPopupText(): Promise<string | null> {
        if (popupStore.popup) {
            return popupStore.popup.message();
        }

        return null;
    }

    async _startBrowser() {
        if (this.isElectron) {
            this.browser = await playwright._electron.launch(this.playwrightOptions);
        } else if (this.isRemoteBrowser) {
            try {
                this.browser = await playwright[this.options.browser].connect(
                    this.playwrightOptions,
                );
            } catch (err) {
                if (err.toString().indexOf('ECONNREFUSED')) {
                    throw new RemoteBrowserConnectionRefused(err);
                }
                throw err;
            }
        } else if (this.userDataDir) {
            this.browser = await playwright[this.options.browser].launchPersistentContext(
                this.userDataDir,
                this.playwrightOptions,
            );
        } else {
            this.browser = await playwright[this.options.browser].launch(this.playwrightOptions);
        }

        this.isRunning = true;
    }

    _getType() {
        return (this.browser as any)._type;
    }

    async _stopBrowser() {
        this.withinLocator = null;
        this._setPage(null);
        this.context = null;
        popupStore.clear();

        await this.browser.close();
    }

    async _evaluateHandeInContext(...args) {
        const context = await this._getContext();

        return context.evaluateHandle(...args);
    }

    async _withinBegin(locator: string) {
        if (this.withinLocator) {
            throw new Error("Can't start within block inside another within block");
        }

        const frame = isFrameLocator(locator);

        if (frame) {
            if (Array.isArray(frame)) {
                await this.switchTo(null);

                return frame.reduce(
                    (p, frameLocator) => p.then(() => this.switchTo(frameLocator)),
                    Promise.resolve(),
                );
            }
            await this.switchTo(locator);
            this.withinLocator = new Locator(locator);

            return;
        }

        let els = await this._locate(locator);
        els = await this.helperUtils.assertElementExists(this.context, els, locator);

        this.context = els[0];
        this.contextLocator = locator;

        this.withinLocator = new Locator(locator);
    }

    async _withinEnd() {
        this.withinLocator = null;
        this.context = await this.page;
        this.contextLocator = null;
    }

    _extractDataFromPerformanceTiming(timing, ...dataNames) {
        const { navigationStart } = timing;

        const extractedData = {};

        dataNames.forEach((name) => {
            extractedData[name] = timing[name] - navigationStart;
        });

        return extractedData;
    }

    /**
     * {{> amOnPage }}
     */
    async amOnPage(url: string) {
        if (this.isElectron) {
            throw new Error('Cannot open pages inside an Electron container');
        }
        if (!/^\w+\:\/\//.test(url)) {
            url = this.options.url + url;
        }

        if (this.options.basicAuth && this.isAuthenticated !== true) {
            if (url.includes(this.options.url)) {
                await this.browserContext.setHTTPCredentials(this.options.basicAuth);
                this.isAuthenticated = true;
            }
        }

        await this.page.goto(url, { waitUntil: this.options.waitForNavigation });

        const performanceTiming = JSON.parse(
            await this.page.evaluate(() => JSON.stringify(window.performance.timing)),
        );

        perfTiming = this._extractDataFromPerformanceTiming(
            performanceTiming,
            'responseEnd',
            'domInteractive',
            'domContentLoadedEventEnd',
            'loadEventEnd',
        );

        return this._waitForAction();
    }

    /**
     * {{> resizeWindow }}
     *
     * Unlike other drivers Playwright changes the size of a viewport, not the window!
     * Playwright does not control the window of a browser so it can't adjust its real size.
     * It also can't maximize a window.
     *
     * Update configuration to change real window size on start:
     *
     * ```js
     * // inside codecept.conf.js
     * // @codeceptjs/configure package must be installed
     * { setWindowSize } = require('@codeceptjs/configure');
     * ````
     */
    async resizeWindow(width: 'maximize'): Promise<void>;
    async resizeWindow(width: number, height: number): Promise<void>;
    async resizeWindow(width: number | string, height?: number) {
        if (width === 'maximize') {
            await this.page.setViewportSize(null);
        }

        await this.page.setViewportSize({ width: width as number, height });

        return this._waitForAction();
    }

    /**
     * Set headers for all next requests
     *
     * ```js
     * I.haveRequestHeaders({
     *    'X-Sent-By': 'CodeceptJS',
     * });
     * ```
     */
    async haveRequestHeaders(customHeaders: { [key: string]: string }) {
        if (!customHeaders) {
            throw new Error('Cannot send empty headers.');
        }

        await this.browserContext.setExtraHTTPHeaders(customHeaders);
    }

    /**
     * {{> moveCursorTo }}
     */
    async moveCursorTo(locator: string, offsetX = 0, offsetY = 0) {
        let els = await this._locate(locator);
        els = await this.helperUtils.assertElementExists(this.context, els, locator);

        // Use manual mouse.move instead of .hover() so the offset can be added to the coordinates
        const { x, y } = await clickablePoint(els[0], locator);

        await this.page.mouse.move(x + offsetX, y + offsetY);

        return this._waitForAction();
    }

    /**
     * {{> dragAndDrop }}
     */
    async dragAndDrop(srcElement: string, destElement: string) {
        return proceedDragAndDrop.call(this, srcElement, destElement);
    }

    /**
     * {{> refreshPage }}
     */
    async refreshPage() {
        return this.page.reload({
            timeout: this.options.getPageTimeout,
            waitUntil: this.options.waitForNavigation,
        });
    }

    /**
     * {{> scrollPageToTop }}
     */
    scrollPageToTop() {
        return this.executeScript(() => {
            window.scrollTo(0, 0);
        });
    }

    /**
     * {{> scrollPageToBottom }}
     */
    scrollPageToBottom() {
        return this.executeScript(() => {
            const { body } = document;
            const html = document.documentElement;

            window.scrollTo(
                0,
                Math.max(
                    body.scrollHeight,
                    body.offsetHeight,
                    html.clientHeight,
                    html.scrollHeight,
                    html.offsetHeight,
                ),
            );
        });
    }

    /**
     * {{> scrollTo }}
     */
    async scrollTo(offsetX: number, offsetY: number): Promise<void>;
    async scrollTo(locator: string, offsetX?: number, offsetY?: number): Promise<void>;
    async scrollTo(locator: string | number, offsetX = 0, offsetY = 0) {
        if (typeof locator === 'number' && typeof offsetX === 'number') {
            offsetY = offsetX;
            offsetX = locator;
            locator = null;
        }

        if (locator) {
            let els = await this._locate(locator as string);
            els = await this.helperUtils.assertElementExists(
                this.context,
                els,
                locator as string,
                'Element',
            );

            await els[0].scrollIntoViewIfNeeded();
            const elementCoordinates = await clickablePoint(els[0], locator as string);

            await this.executeScript((offsetX, offsetY) => window.scrollBy(offsetX, offsetY), {
                offsetX: elementCoordinates.x + offsetX,
                offsetY: elementCoordinates.y + offsetY,
            });
        } else {
            await this.executeScript(({ offsetX, offsetY }) => window.scrollTo(offsetX, offsetY), {
                offsetX,
                offsetY,
            });
        }

        return this._waitForAction();
    }

    /**
     * {{> seeInTitle }}
     */
    async seeInTitle(text: string) {
        const title = await this.page.title();

        stringIncludes('web page title').assert(text, title);
    }

    /**
     * {{> grabPageScrollPosition }}
     */
    async grabPageScrollPosition() {
        function getScrollPosition() {
            return {
                x: window.pageXOffset,
                y: window.pageYOffset,
            };
        }

        /* eslint-enable comma-dangle */
        return this.executeScript(getScrollPosition);
    }

    /**
     * {{> seeTitleEquals }}
     */
    async seeTitleEquals(text: string) {
        const title = await this.page.title();

        return equals('web page title').assert(title, text);
    }

    /**
     * {{> dontSeeInTitle }}
     */
    async dontSeeInTitle(text: string) {
        const title = await this.page.title();

        stringIncludes('web page title').negate(text, title);
    }

    /**
     * {{> grabTitle }}
     */
    async grabTitle() {
        return this.page.title();
    }

    /**
     * Get elements by different locator types, including strict locator
     * Should be used in custom helpers:
     *
     * ```js
     * const elements = await this.helpers['Playwright']._locate({name: 'password'});
     * ```
     */
    async _locate(locator: string) {
        const context = (await this.context) || (await this._getContext());

        return findElements(context, locator);
    }

    /**
     * Find a checkbox by providing human readable text:
     * NOTE: Assumes the checkable element exists
     *
     * ```js
     * this.helpers['Playwright']._locateCheckable('I agree with terms and conditions').then // ...
     * ```
     */
    async _locateCheckable(locator: string, providedContext: string = null) {
        const context = providedContext || (await this._getContext());
        let els = await findCheckable.call(this, locator, context);
        els = await this.helperUtils.assertElementExists(
            this.context,
            els,
            locator,
            'Checkbox or radio',
        );

        return els[0];
    }

    /**
     * Find a clickable element by providing human readable text:
     *
     * ```js
     * this.helpers['Playwright']._locateClickable('Next page').then // ...
     * ```
     */
    async _locateClickable(locator: string) {
        const context = await this._getContext();

        return findClickable.call(this, context, locator);
    }

    /**
     * Find field elements by providing human readable text:
     *
     * ```js
     * this.helpers['Playwright']._locateFields('Your email').then // ...
     * ```
     */
    async _locateFields(locator) {
        return findFields.call(this, locator);
    }

    /**
     * Switch focus to a particular tab by its number. It waits tabs loading and then switch tab
     *
     * ```js
     * I.switchToNextTab();
     * I.switchToNextTab(2);
     * ```
     */
    async switchToNextTab(num = 1) {
        if (this.isElectron) {
            throw new Error('Cannot switch tabs inside an Electron container');
        }
        const pages = await this.browserContext.pages();

        const index = pages.indexOf(this.page);

        this.withinLocator = null;
        const page = pages[index + num];

        if (!page) {
            throw new Error(`There is no ability to switch to next tab with offset ${num}`);
        }
        await this._setPage(page);

        return this._waitForAction();
    }

    /**
     * Switch focus to a particular tab by its number. It waits tabs loading and then switch tab
     *
     * ```js
     * I.switchToPreviousTab();
     * I.switchToPreviousTab(2);
     * ```
     */
    async switchToPreviousTab(num = 1) {
        if (this.isElectron) {
            throw new Error('Cannot switch tabs inside an Electron container');
        }
        const pages = await this.browserContext.pages();
        const index = pages.indexOf(this.page);

        this.withinLocator = null;
        const page = pages[index - num];

        if (!page) {
            throw new Error(`There is no ability to switch to previous tab with offset ${num}`);
        }

        await this._setPage(page);

        return this._waitForAction();
    }

    /**
     * Close current tab and switches to previous.
     *
     * ```js
     * I.closeCurrentTab();
     * ```
     */
    async closeCurrentTab() {
        if (this.isElectron) {
            throw new Error('Cannot close current tab inside an Electron container');
        }
        const oldPage = this.page;

        await this.switchToPreviousTab();
        await oldPage.close();

        return this._waitForAction();
    }

    /**
     * Close all tabs except for the current one.
     *
     * ```js
     * I.closeOtherTabs();
     * ```
     */
    async closeOtherTabs() {
        const pages = await this.browserContext.pages();
        const otherPages = pages.filter((page) => page !== this.page);

        if (otherPages.length) {
            this.debug(`Closing ${otherPages.length} tabs`);

            return Promise.all(otherPages.map((p) => p.close()));
        }

        return Promise.resolve();
    }

    /**
     * Open new tab and automatically switched to new tab
     *
     * ```js
     * I.openNewTab();
     * ```
     */
    async openNewTab() {
        if (this.isElectron) {
            throw new Error('Cannot open new tabs inside an Electron container');
        }
        await this._setPage(await this.browserContext.newPage());

        return this._waitForAction();
    }

    /**
     * {{> grabNumberOfOpenTabs }}
     */
    async grabNumberOfOpenTabs() {
        const pages = await this.browserContext.pages();

        return pages.length;
    }

    /**
     * {{> seeElement }}
     */
    async seeElement(locator: string) {
        let els = await this._locate(locator);
        els = await this.helperUtils.assertElementExists(this.context, els, locator);

        els = await Promise.all(els.map((el) => el.isVisible()));

        return empty('visible elements').negate(els.filter((v) => v).fill('ELEMENT'));
    }

    /**
     * {{> dontSeeElement }}
     */
    async dontSeeElement(locator: string) {
        let els = await this._locate(locator);

        els = await Promise.all(els.map((el) => el.isVisible()));

        return empty('visible elements').assert(els.filter((v) => v).fill('ELEMENT'));
    }

    /**
     * {{> seeElementInDOM }}
     */
    async seeElementInDOM(locator: string) {
        let els = await this._locate(locator);
        els = await this.helperUtils.assertElementExists(this.context, els, locator);

        return empty('elements on page').negate(els.filter((v) => v).fill('ELEMENT'));
    }

    /**
     * {{> dontSeeElementInDOM }}
     */
    async dontSeeElementInDOM(locator: string) {
        const els = await this._locate(locator);

        return empty('elements on a page').assert(els.filter((v) => v).fill('ELEMENT'));
    }

    /**
     * Handles a file download.Aa file name is required to save the file on disk.
     * Files are saved to "output" directory.
     *
     * Should be used with [FileSystem helper](https://codecept.io/helpers/FileSystem) to check that file were downloaded correctly.
     *
     * ```js
     * I.handleDownloads('downloads/avatar.jpg');
     * I.click('Download Avatar');
     * I.amInPath('output/downloads');
     * I.waitForFile('downloads/avatar.jpg', 5);
     * ```
     */
    async handleDownloads(fileName = 'downloads') {
        this.page.waitForEvent('download').then(async (download) => {
            const filePath = await download.path();
            const downloadPath = path.join(
                (global as any).output_dir,
                fileName || path.basename(filePath),
            );

            if (!fs.existsSync(path.dirname(downloadPath))) {
                fs.mkdirSync(path.dirname(downloadPath), '0777');
            }
            fs.copyFileSync(filePath, downloadPath);
            this.debug('Download completed');
            this.debugSection('Downloaded From', await download.url());
            this.debugSection('Downloaded To', downloadPath);
        });
    }

    /**
     * {{> click }}
     */
    async click(locator: string, context: string = null) {
        return proceedClick.call(this, locator, context);
    }

    /**
     * {{> forceClick }}
     */
    async forceClick(locator: string, context: string = null) {
        return proceedClick.call(this, locator, context, { force: true });
    }

    /**
     * {{> doubleClick }}
     */
    async doubleClick(locator: string, context: string = null) {
        return proceedClick.call(this, locator, context, { clickCount: 2 });
    }

    /**
     * {{> rightClick }}
     */
    async rightClick(locator: string, context: string = null) {
        return proceedClick.call(this, locator, context, { button: 'right' });
    }

    /**
     * {{> checkOption }}
     */
    async checkOption(field: string, context: string = null) {
        const elm = await this._locateCheckable(field, context);
        const curentlyChecked = await elm
            .getProperty('checked')
            .then((checkedProperty) => checkedProperty.jsonValue());

        // Only check if NOT currently checked
        if (!curentlyChecked) {
            await elm.click();

            return this._waitForAction();
        }
    }

    /**
     * {{> uncheckOption }}
     */
    async uncheckOption(field: string, context: string = null) {
        const elm = await this._locateCheckable(field, context);
        const curentlyChecked = await elm
            .getProperty('checked')
            .then((checkedProperty) => checkedProperty.jsonValue());

        // Only uncheck if currently checked
        if (curentlyChecked) {
            await elm.click();

            return this._waitForAction();
        }
    }

    /**
     * {{> seeCheckboxIsChecked }}
     */
    async seeCheckboxIsChecked(field: string) {
        return proceedIsChecked.call(this, 'assert', field);
    }

    /**
     * {{> dontSeeCheckboxIsChecked }}
     */
    async dontSeeCheckboxIsChecked(field: string) {
        return proceedIsChecked.call(this, 'negate', field);
    }

    /**
     * {{> pressKeyDown }}
     */
    async pressKeyDown(key: string) {
        key = getNormalizedKey.call(this, key);
        await this.page.keyboard.down(key);

        return this._waitForAction();
    }

    /**
     * {{> pressKeyUp }}
     */
    async pressKeyUp(key: string) {
        key = getNormalizedKey.call(this, key);
        await this.page.keyboard.up(key);

        return this._waitForAction();
    }

    /**
     * {{> pressKeyWithKeyNormalization }}
     *
     * _Note:_ Shortcuts like `'Meta'` + `'A'` do not work on macOS ([GoogleChrome/Puppeteer#1313](https://github.com/GoogleChrome/puppeteer/issues/1313)).
     */
    async pressKey(key: string | string[]) {
        const modifiers = [];

        if (Array.isArray(key)) {
            for (let k of key) {
                k = getNormalizedKey.call(this, k);
                if (isModifierKey(k)) {
                    modifiers.push(k);
                } else {
                    key = k;
                    break;
                }
            }
        } else {
            key = getNormalizedKey.call(this, key);
        }
        for (const modifier of modifiers) {
            await this.page.keyboard.down(modifier);
        }
        await this.page.keyboard.press(key as string);
        for (const modifier of modifiers) {
            await this.page.keyboard.up(modifier);
        }

        return this._waitForAction();
    }

    /**
     * {{> type }}
     */
    async type(keys: string | string[], delay: number = null) {
        if (!Array.isArray(keys)) {
            keys = keys.split('');
        }

        for (const key of keys) {
            await this.page.keyboard.press(key);
            if (delay) {
                await this.wait(delay / 1000);
            }
        }
    }

    /**
     * {{> fillField }}
     */
    async fillField(field: string, value: string) {
        let els = await findFields.call(this, field);
        els = await this.helperUtils.assertElementExists(this.context, els, field, 'Field');

        const el = els[0];
        const tag = await el.getProperty('tagName').then((el) => el.jsonValue());
        const editable = await el.getProperty('contenteditable').then((el) => el.jsonValue());

        if (tag === 'INPUT' || tag === 'TEXTAREA') {
            await this._evaluateHandeInContext((el) => (el.value = ''), el);
        } else if (editable) {
            await this._evaluateHandeInContext((el) => (el.innerHTML = ''), el);
        }
        await el.type(value.toString(), { delay: this.options.pressKeyDelay });

        return this._waitForAction();
    }

    /**
     * {{> clearField }}
     */
    async clearField(field: string) {
        return this.fillField(field, '');
    }

    /**
     * {{> appendField }}
     */
    async appendField(field: string, value: string) {
        let els = await findFields.call(this, field);
        els = await this.helperUtils.assertElementExists(this.context, els, field, 'Field');

        await els[0].press('End');
        await els[0].type(value, { delay: this.options.pressKeyDelay });

        return this._waitForAction();
    }

    /**
     * {{> seeInField }}
     */
    async seeInField(field: string, value: string) {
        return proceedSeeInField.call(this, 'assert', field, value);
    }

    /**
     * {{> dontSeeInField }}
     */
    async dontSeeInField(field: string, value: string) {
        return proceedSeeInField.call(this, 'negate', field, value);
    }

    /**
     * {{> attachFile }}
     */
    async attachFile(locator: string, pathToFile: string) {
        const file = path.join((global as any).codecept_dir, pathToFile);

        if (!fileExists(file)) {
            throw new Error(`File at ${file} can not be found on local system`);
        }
        let els = await findFields.call(this, locator);
        els = await this.helperUtils.assertElementExists(this.context, els, locator, 'Field');

        await els[0].setInputFiles(file);

        return this._waitForAction();
    }

    /**
     * {{> selectOption }}
     */
    async selectOption(select: string, option: string | string[]) {
        let els = await findFields.call(this, select);
        els = await this.helperUtils.assertElementExists(
            this.context,
            els,
            select,
            'Selectable field',
        );

        const el = els[0];

        if ((await el.getProperty('tagName').then((t) => t.jsonValue())) !== 'SELECT') {
            throw new Error('Element is not <select>');
        }
        if (!Array.isArray(option)) {
            option = [option];
        }

        for (const key in option) {
            const opt = xpathLocator.literal(option[key]);
            let optEl = await findElements.call(this, el, {
                xpath: Locator.select.byVisibleText(opt),
            });

            if (optEl.length) {
                this._evaluateHandeInContext((el) => (el.selected = true), optEl[0]);
                continue;
            }
            optEl = await findElements.call(this, el, { xpath: Locator.select.byValue(opt) });
            if (optEl.length) {
                this._evaluateHandeInContext((el) => (el.selected = true), optEl[0]);
            }
        }
        await this._evaluateHandeInContext((element) => {
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
        }, el);

        return this._waitForAction();
    }

    /**
     * {{> grabNumberOfVisibleElements }}
     */
    async grabNumberOfVisibleElements(locator: string): Promise<number> {
        let els = await this._locate(locator);

        els = await Promise.all(els.map((el) => el.isVisible()));

        return els.filter((v) => v).length;
    }

    /**
     * {{> seeInCurrentUrl }}
     */
    async seeInCurrentUrl(url: string) {
        stringIncludes('url').assert(url, await this._getPageUrl());
    }

    /**
     * {{> dontSeeInCurrentUrl }}
     */
    async dontSeeInCurrentUrl(url: string) {
        stringIncludes('url').negate(url, await this._getPageUrl());
    }

    /**
     * {{> seeCurrentUrlEquals }}
     */
    async seeCurrentUrlEquals(url: string) {
        urlEquals(this.options.url).assert(url, await this._getPageUrl());
    }

    /**
     * {{> dontSeeCurrentUrlEquals }}
     */
    async dontSeeCurrentUrlEquals(url: string) {
        urlEquals(this.options.url).negate(url, await this._getPageUrl());
    }

    /**
     * {{> see }}
     */
    async see(text: string, context: string = null) {
        return proceedSee.call(this, 'assert', text, context);
    }

    /**
     * {{> seeTextEquals }}
     */
    async seeTextEquals(text: string, context: string = null) {
        return proceedSee.call(this, 'assert', text, context, true);
    }

    /**
     * {{> dontSee }}
     */
    async dontSee(text: string, context: string = null) {
        return proceedSee.call(this, 'negate', text, context);
    }

    /**
     * {{> grabSource }}
     */
    async grabSource() {
        return this.page.content();
    }

    /**
     * Get JS log from browser.
     *
     * ```js
     * let logs = await I.grabBrowserLogs();
     * console.log(JSON.stringify(logs))
     * ```
     */
    async grabBrowserLogs(): Promise<any[]> {
        const logs = consoleLogStore.entries;

        consoleLogStore.clear();

        return logs;
    }

    /**
     * {{> grabCurrentUrl }}
     */
    async grabCurrentUrl(): Promise<string> {
        return this._getPageUrl();
    }

    /**
     * {{> seeInSource }}
     */
    async seeInSource(text: string) {
        const source = await this.page.content();

        stringIncludes('HTML source of a page').assert(text, source);
    }

    /**
     * {{> dontSeeInSource }}
     */
    async dontSeeInSource(text: string) {
        const source = await this.page.content();

        stringIncludes('HTML source of a page').negate(text, source);
    }

    /**
     * {{> seeNumberOfElements }}
     */
    async seeNumberOfElements(locator: string, num: number) {
        const elements = await this._locate(locator);

        return equals(
            `expected number of elements (${locator}) is ${num}, but found ${elements.length}`,
        ).assert(elements.length, num);
    }

    /**
     * {{> seeNumberOfVisibleElements }}
     */
    async seeNumberOfVisibleElements(locator: string, num: number) {
        const res = await this.grabNumberOfVisibleElements(locator);

        return equals(
            `expected number of visible elements (${locator}) is ${num}, but found ${res}`,
        ).assert(res, num);
    }

    /**
     * {{> setCookie }}
     */
    async setCookie(cookie: Cookie | Cookie[]) {
        if (Array.isArray(cookie)) {
            return this.browserContext.addCookies(cookie);
        }

        return this.browserContext.addCookies([cookie]);
    }

    /**
     * {{> seeCookie }}
     */
    async seeCookie(name: string) {
        const cookies = await this.browserContext.cookies();

        empty(`cookie ${name} to be set`).negate(cookies.filter((c) => c.name === name));
    }

    /**
     * {{> dontSeeCookie }}
     */
    async dontSeeCookie(name: string) {
        const cookies = await this.browserContext.cookies();

        empty(`cookie ${name} to be set`).assert(cookies.filter((c) => c.name === name));
    }

    /**
     * {{> grabCookie }}
     *
     * Returns cookie in JSON format. If name not passed returns all cookies for this domain.
     */
    async grabCookie(name: string): Promise<Cookie>;
    async grabCookie(): Promise<Cookie[]>;
    async grabCookie(name?: string) {
        const cookies = await this.browserContext.cookies();

        if (!name) {
            return cookies;
        }
        const cookie = cookies.filter((c) => c.name === name);

        if (cookie[0]) {
            return cookie[0];
        }
    }

    /**
     * {{> clearCookie }}
     */
    async clearCookie() {
        if (!this.browserContext) {
            return;
        }

        return this.browserContext.clearCookies();
    }

    /**
     * Executes a script on the page:
     *
     * ```js
     * I.executeScript(() => window.alert('Hello world'));
     * ```
     *
     * Additional parameters of the function can be passed as an object argument:
     *
     * ```js
     * I.executeScript(({x, y}) => x + y, {x, y});
     * ```
     * You can pass only one parameter into a function
     * but you can pass in array or object.
     *
     * ```js
     * I.executeScript(([x, y]) => x + y, [x, y]);
     * ```
     * If a function returns a Promise it will wait for its resolution.
     */
    async executeScript(fn: string | ((...args: any) => any), arg?: any) {
        let context = this.page;

        if (this.context && this.context.constructor.name === 'Frame') {
            context = this.context; // switching to iframe context
        }

        return context.evaluate.apply(context, [fn, arg]);
    }

    /**
     * Grab Locator if called within Context
     */
    _contextLocator(locator) {
        locator = buildLocatorString(new Locator(locator, 'css'));

        if (this.contextLocator) {
            const contextLocator = buildLocatorString(new Locator(this.contextLocator, 'css'));

            locator = `${contextLocator} >> ${locator}`;
        }

        return locator;
    }

    /**
     * {{> grabTextFrom }}
     */
    async grabTextFrom(locator: string) {
        const texts = await this.grabTextFromAll(locator);

        this.debugSection('Text', texts[0]);

        return texts[0];
    }

    /**
     * {{> grabTextFromAll }}
     */
    async grabTextFromAll(locator: string): Promise<string[]> {
        let els = await this._locate(locator);
        els = await this.helperUtils.assertElementExists(this.context, els, locator);

        const texts = [];

        for (const el of els) {
            texts.push(await (await el.getProperty('innerText')).jsonValue());
        }
        this.debug(`Matched ${els.length} elements`);

        return texts;
    }

    /**
     * {{> grabValueFrom }}
     */
    async grabValueFrom(locator: string) {
        const values = await this.grabValueFromAll(locator);

        this.debugSection('Value', values[0]);

        return values[0];
    }

    /**
     * {{> grabValueFromAll }}
     */
    async grabValueFromAll(locator: string): Promise<string[]> {
        let els = await findFields.call(this, locator);
        els = await this.helperUtils.assertElementExists(this.context, els, locator);

        this.debug(`Matched ${els.length} elements`);

        return Promise.all(els.map((el) => el.getProperty('value').then((t) => t.jsonValue())));
    }

    /**
     * {{> grabHTMLFrom }}
     */
    async grabHTMLFrom(locator: string) {
        const html = await this.grabHTMLFromAll(locator);

        this.debugSection('HTML', html[0]);

        return html[0];
    }

    /**
     * {{> grabHTMLFromAll }}
     */
    async grabHTMLFromAll(locator: string): Promise<string[]> {
        let els = await this._locate(locator);
        els = await this.helperUtils.assertElementExists(this.context, els, locator);

        this.debug(`Matched ${els.length} elements`);

        return Promise.all(
            els.map((el) => el.$eval('xpath=.', (element) => element.innerHTML, el)),
        );
    }

    /**
     * {{> grabCssPropertyFrom }}
     */
    async grabCssPropertyFrom(locator: string, cssProperty: string) {
        const cssValues = await this.grabCssPropertyFromAll(locator, cssProperty);

        this.debugSection('CSS', cssValues[0]);

        return cssValues[0];
    }

    /**
     * {{> grabCssPropertyFromAll }}
     */
    async grabCssPropertyFromAll(locator: string, cssProperty: string): Promise<string[]> {
        let els = await this._locate(locator);
        els = await this.helperUtils.assertElementExists(this.context, els, locator);

        this.debug(`Matched ${els.length} elements`);

        return Promise.all(
            els.map((el) =>
                el.$eval(
                    'xpath=.',
                    (el, cssProperty) => getComputedStyle(el).getPropertyValue(cssProperty),
                    cssProperty,
                ),
            ),
        );
    }

    /**
     * {{> seeCssPropertiesOnElements }}
     */
    async seeCssPropertiesOnElements(locator: string, cssProperties: { [key: string]: any }) {
        let res = await this._locate(locator);
        res = await this.helperUtils.assertElementExists(this.context, res, locator);

        const cssPropertiesCamelCase = convertCssPropertiesToCamelCase(cssProperties);
        const elemAmount = res.length;
        const commands = [];

        res.forEach((el) => {
            Object.keys(cssPropertiesCamelCase).forEach((prop) => {
                commands.push(
                    el
                        .$eval(
                            'xpath=.',
                            (el) => {
                                const style = window.getComputedStyle
                                    ? getComputedStyle(el)
                                    : el.currentStyle;

                                return JSON.parse(JSON.stringify(style));
                            },
                            el,
                        )
                        .then((props) => {
                            if (isColorProperty(prop)) {
                                return convertColorToRGBA(props[prop]);
                            }

                            return props[prop];
                        }),
                );
            });
        });
        let props = await Promise.all(commands);
        const values = Object.keys(cssPropertiesCamelCase).map(
            (key) => cssPropertiesCamelCase[key],
        );

        if (!Array.isArray(props)) {
            props = [props];
        }
        let chunked = chunkArray(props, values.length);

        chunked = chunked.filter((val) => {
            for (let i = 0; i < val.length; ++i) {
                if (val[i] !== values[i]) {
                    return false;
                }
            }

            return true;
        });

        return equals(
            `all elements (${locator}) to have CSS property ${JSON.stringify(cssProperties)}`,
        ).assert(chunked.length, elemAmount);
    }

    /**
     * {{> seeAttributesOnElements }}
     */
    async seeAttributesOnElements(locator: string, attributes: { [key: string]: any }) {
        let res = await this._locate(locator);
        res = await this.helperUtils.assertElementExists(this.context, res, locator);

        const elemAmount = res.length;
        const commands = [];

        res.forEach((el) => {
            Object.keys(attributes).forEach((prop) => {
                commands.push(
                    el.$eval('xpath=.', (el, attr) => el[attr] || el.getAttribute(attr), prop),
                );
            });
        });
        let attrs = await Promise.all(commands);
        const values = Object.keys(attributes).map((key) => attributes[key]);

        if (!Array.isArray(attrs)) {
            attrs = [attrs];
        }
        let chunked = chunkArray(attrs, values.length);

        chunked = chunked.filter((val) => {
            for (let i = 0; i < val.length; ++i) {
                if (val[i] !== values[i]) {
                    return false;
                }
            }

            return true;
        });

        return equals(
            `all elements (${locator}) to have attributes ${JSON.stringify(attributes)}`,
        ).assert(chunked.length, elemAmount);
    }

    /**
     * {{> dragSlider }}
     */
    async dragSlider(locator: string, offsetX = 0) {
        let src = await this._locate(locator);
        src = await this.helperUtils.assertElementExists(
            this.context,
            src,
            locator,
            'Slider Element',
        );

        const sliderSource = await clickablePoint(src[0], locator);

        // Drag start point
        await this.page.mouse.move(sliderSource.x, sliderSource.y, { steps: 5 });
        await this.page.mouse.down();

        // Drag destination
        await this.page.mouse.move(sliderSource.x + offsetX, sliderSource.y, { steps: 5 });
        await this.page.mouse.up();

        return this._waitForAction();
    }

    /**
     * {{> grabAttributeFrom }}
     */
    async grabAttributeFrom(locator: string, attr: string) {
        const attrs = await this.grabAttributeFromAll(locator, attr);

        this.debugSection('Attribute', attrs[0]);

        return attrs[0];
    }

    /**
     * {{> grabAttributeFromAll }}
     */
    async grabAttributeFromAll(locator: string, attr: string): Promise<string[]> {
        let els = await this._locate(locator);
        els = await this.helperUtils.assertElementExists(this.context, els, locator);

        this.debug(`Matched ${els.length} elements`);
        const array = [];

        for (let index = 0; index < els.length; index++) {
            const a = await this._evaluateHandeInContext(
                ([el, attr]) => el[attr] || el.getAttribute(attr),
                [els[index], attr],
            );

            array.push(await a.jsonValue());
        }

        return array;
    }

    /**
     * {{> saveElementScreenshot }}
     */
    async saveElementScreenshot(locator: string, fileName: string): Promise<Buffer> {
        const outputFile = screenshotOutputFolder(fileName);
        let res = await this._locate(locator);
        res = await this.helperUtils.assertElementExists(this.context, res, locator);

        if (res.length > 1) {
            this.debug(`[Elements] Using first element out of ${res.length}`);
        }
        const elem = res[0];

        this.debug(`Screenshot of ${locator} element has been saved to ${outputFile}`);

        return elem.screenshot({ path: outputFile, type: 'png' });
    }

    /**
     * {{> saveScreenshot }}
     */
    async saveScreenshot(fileName: string, fullPage?: boolean): Promise<Buffer> {
        const fullPageOption = fullPage || this.options.fullPageScreenshots;
        const outputFile = screenshotOutputFolder(fileName);

        this.debug(`Screenshot is saving to ${outputFile}`);

        if (this.activeSessionName) {
            const activeSessionPage = this.sessionPages[this.activeSessionName];

            if (activeSessionPage) {
                return activeSessionPage.screenshot({
                    path: outputFile,
                    fullPage: fullPageOption,
                    type: 'png',
                });
            }
        }

        return this.page.screenshot({ path: outputFile, fullPage: fullPageOption, type: 'png' });
    }

    _test(test) {
        this.helperUtils.onTest(test);
    }

    async _failed(test) {
        // await this.helperUtils.onFailed(test, this.context);

        await this._withinEnd();

        if (!test.artifacts) {
            test.artifacts = {};
        }

        if (this.options.recordVideo && this.page.video()) {
            test.artifacts.video = await this.page.video().path();
        }

        if (this.options.trace) {
            const path = `${(global as any).output_dir}/trace/${clearString(test.title).slice(
                0,
                255,
            )}.zip`;

            await this.browserContext.tracing.stop({ path });
            test.artifacts.trace = path;
        }
    }

    _beforeStep(step) {}

    async _passed(test) {
        if (this.options.recordVideo && this.page.video()) {
            if (this.options.keepVideoForPassedTests) {
                test.artifacts.video = await this.page.video().path();
            } else {
                this.page
                    .video()
                    .delete()
                    .catch((e) => {});
            }
        }

        if (this.options.trace) {
            if (this.options.keepTraceForPassedTests) {
                const path = `${(global as any).output_dir}/trace/${clearString(test.title)}.zip`;

                await this.browserContext.tracing.stop({ path });
                test.artifacts.trace = path;
            } else {
                await this.browserContext.tracing.stop();
            }
        }
    }

    /**
     * {{> wait }}
     */
    async wait(sec: number): Promise<void> {
        return new Promise((done) => {
            setTimeout(done, sec * 1000);
        });
    }

    /**
     * {{> waitForEnabled }}
     */
    async waitForEnabled(locator: string | Locator, sec?: number) {
        const waitTimeout = sec ? sec * 1000 : this.options.waitForTimeout;

        locator = new Locator(locator, 'css');
        let waiter;
        const context = await this._getContext();

        if (!locator.isXPath()) {
            const valueFn = function ([locator]) {
                return (
                    Array.from(document.querySelectorAll(locator)).filter((el) => !el.disabled)
                        .length > 0
                );
            };

            waiter = context.waitForFunction(valueFn, [locator.value], { timeout: waitTimeout });
        } else {
            const enabledFn = function ([locator, $XPath]) {
                eval($XPath); // eslint-disable-line no-eval

                return $XPath(null, locator).filter((el) => !el.disabled).length > 0;
            };

            waiter = context.waitForFunction(enabledFn, [locator.value, $XPath.toString()], {
                timeout: waitTimeout,
            });
        }

        return waiter.catch((err) => {
            throw new Error(
                `element (${locator.toString()}) still not enabled after ${
                    waitTimeout / 1000
                } sec\n${err.message}`,
            );
        });
    }

    /**
     * {{> waitForValue }}
     */
    async waitForValue(field: string, value: string, sec?: number) {
        const waitTimeout = sec ? sec * 1000 : this.options.waitForTimeout;
        const locator = new Locator(field, 'css');
        let waiter;
        const context = await this._getContext();

        if (!locator.isXPath()) {
            const valueFn = function ([locator, value]) {
                return (
                    Array.from(document.querySelectorAll(locator)).filter(
                        (el) => (el.value || '').indexOf(value) !== -1,
                    ).length > 0
                );
            };

            waiter = context.waitForFunction(valueFn, [locator.value, value], {
                timeout: waitTimeout,
            });
        } else {
            const valueFn = function ([locator, $XPath, value]) {
                eval($XPath); // eslint-disable-line no-eval

                return (
                    $XPath(null, locator).filter((el) => (el.value || '').indexOf(value) !== -1)
                        .length > 0
                );
            };

            waiter = context.waitForFunction(valueFn, [locator.value, $XPath.toString(), value], {
                timeout: waitTimeout,
            });
        }

        return waiter.catch((err) => {
            const loc = locator.toString();

            throw new Error(
                `element (${loc}) is not in DOM or there is no element(${loc}) with value "${value}" after ${
                    waitTimeout / 1000
                } sec\n${err.message}`,
            );
        });
    }

    /**
     * {{> waitNumberOfVisibleElements }}
     */
    async waitNumberOfVisibleElements(locator: string | Locator, num: number, sec?: number) {
        const waitTimeout = sec ? sec * 1000 : this.options.waitForTimeout;

        locator = new Locator(locator, 'css');
        await this.context;
        let waiter;
        const context = await this._getContext();

        if (locator.isCSS()) {
            const visibleFn = function ([locator, num]) {
                const els = document.querySelectorAll(locator);

                if (!els || els.length === 0) {
                    return false;
                }

                return (
                    Array.prototype.filter.call(els, (el) => el.offsetParent !== null).length ===
                    num
                );
            };

            waiter = context.waitForFunction(visibleFn, [locator.value, num], {
                timeout: waitTimeout,
            });
        } else {
            const visibleFn = function ([locator, $XPath, num]) {
                eval($XPath); // eslint-disable-line no-eval

                return (
                    $XPath(null, locator).filter((el) => el.offsetParent !== null).length === num
                );
            };

            waiter = context.waitForFunction(visibleFn, [locator.value, $XPath.toString(), num], {
                timeout: waitTimeout,
            });
        }

        return waiter.catch((err) => {
            throw new Error(
                `The number of elements (${locator.toString()}) is not ${num} after ${
                    waitTimeout / 1000
                } sec\n${err.message}`,
            );
        });
    }

    /**
     * {{> waitForElement }}
     */
    async waitForElement(locator: string | Locator, sec?: number) {
        const waitTimeout = sec ? sec * 1000 : this.options.waitForTimeout;

        locator = new Locator(locator, 'css');

        const context = await this._getContext();
        const waiter = context.waitForSelector(buildLocatorString(locator), {
            timeout: waitTimeout,
            state: 'attached',
        });

        return waiter.catch((err) => {
            throw new Error(
                `element (${locator.toString()}) still not present on page after ${
                    waitTimeout / 1000
                } sec\n${err.message}`,
            );
        });
    }

    /**
     * {{> waitForVisible }}
     */
    async waitForVisible(locator: string | Locator, sec?: number) {
        const waitTimeout = sec ? sec * 1000 : this.options.waitForTimeout;

        locator = new Locator(locator, 'css');
        const context = await this._getContext();
        const waiter = context.waitForSelector(buildLocatorString(locator), {
            timeout: waitTimeout,
            state: 'visible',
        });

        return waiter.catch((err) => {
            throw new Error(
                `element (${locator.toString()}) still not visible after ${
                    waitTimeout / 1000
                } sec\n${err.message}`,
            );
        });
    }

    /**
     * {{> waitForInvisible }}
     */
    async waitForInvisible(locator: string | Locator, sec?: number) {
        const waitTimeout = sec ? sec * 1000 : this.options.waitForTimeout;

        locator = new Locator(locator, 'css');
        const context = await this._getContext();
        const waiter = context.waitForSelector(buildLocatorString(locator), {
            timeout: waitTimeout,
            state: 'hidden',
        });

        return waiter.catch((err) => {
            throw new Error(
                `element (${locator.toString()}) still visible after ${waitTimeout / 1000} sec\n${
                    err.message
                }`,
            );
        });
    }

    /**
     * {{> waitToHide }}
     */
    async waitToHide(locator: string | Locator, sec?: number) {
        const waitTimeout = sec ? sec * 1000 : this.options.waitForTimeout;

        locator = new Locator(locator, 'css');
        const context = await this._getContext();

        return context
            .waitForSelector(buildLocatorString(locator), { timeout: waitTimeout, state: 'hidden' })
            .catch((err) => {
                throw new Error(
                    `element (${locator.toString()}) still not hidden after ${
                        waitTimeout / 1000
                    } sec\n${err.message}`,
                );
            });
    }

    async _getContext() {
        if (this.context && this.context.constructor.name === 'Frame') {
            return this.context;
        }

        return this.page;
    }

    /**
     * {{> waitInUrl }}
     */
    async waitInUrl(urlPart: string, sec?: number) {
        const waitTimeout = sec ? sec * 1000 : this.options.waitForTimeout;

        return this.page
            .waitForFunction(
                (urlPart) => {
                    const currUrl = decodeURIComponent(
                        decodeURIComponent(decodeURIComponent(window.location.href)),
                    );

                    return currUrl.indexOf(urlPart) > -1;
                },
                urlPart,
                { timeout: waitTimeout },
            )
            .catch(async (e) => {
                const currUrl = await this._getPageUrl(); // Required because the waitForFunction can't return data.

                if (/Timeout/i.test(e.message)) {
                    throw new Error(`expected url to include ${urlPart}, but found ${currUrl}`);
                } else {
                    throw e;
                }
            });
    }

    /**
     * {{> waitUrlEquals }}
     */
    async waitUrlEquals(urlPart: string, sec?: number) {
        const waitTimeout = sec ? sec * 1000 : this.options.waitForTimeout;

        const baseUrl = this.options.url;

        if (urlPart.indexOf('http') < 0) {
            urlPart = baseUrl + urlPart;
        }

        return this.page
            .waitForFunction(
                (urlPart) => {
                    const currUrl = decodeURIComponent(
                        decodeURIComponent(decodeURIComponent(window.location.href)),
                    );

                    return currUrl.indexOf(urlPart) > -1;
                },
                urlPart,
                { timeout: waitTimeout },
            )
            .catch(async (e) => {
                const currUrl = await this._getPageUrl(); // Required because the waitForFunction can't return data.

                if (/Timeout/i.test(e.message)) {
                    throw new Error(`expected url to be ${urlPart}, but found ${currUrl}`);
                } else {
                    throw e;
                }
            });
    }

    /**
     * {{> waitForText }}
     */
    async waitForText(text: string, sec?: number, context?: string) {
        const waitTimeout = sec ? sec * 1000 : this.options.waitForTimeout;
        let waiter;

        const contextObject = await this._getContext();

        if (context) {
            const locator = new Locator(context, 'css');

            if (!locator.isXPath()) {
                waiter = contextObject.waitForSelector(
                    `${
                        locator.isCustom() ? `${locator.type}=${locator.value}` : locator.simplify()
                    } >> text=${text}`,
                    { timeout: waitTimeout, state: 'visible' },
                );
            }

            if (locator.isXPath()) {
                waiter = contextObject.waitForFunction(
                    ([locator, text, $XPath]) => {
                        eval($XPath); // eslint-disable-line no-eval
                        const el = $XPath(null, locator);

                        if (!el.length) {
                            return false;
                        }

                        return el[0].innerText.indexOf(text) > -1;
                    },
                    [locator.value, text, $XPath.toString()],
                    { timeout: waitTimeout },
                );
            }
        } else {
            waiter = contextObject.waitForFunction(
                (text) => document.body && document.body.innerText.indexOf(text) > -1,
                text,
                { timeout: waitTimeout },
            );
        }

        return waiter.catch((err) => {
            throw new Error(
                `Text "${text}" was not found on page after ${waitTimeout / 1000} sec\n${
                    err.message
                }`,
            );
        });
    }

    /**
     * Waits for a network request.
     *
     * ```js
     * I.waitForRequest('http://example.com/resource');
     * I.waitForRequest(request => request.url() === 'http://example.com' && request.method() === 'GET');
     * ```
     */
    async waitForRequest(
        urlOrPredicate: string | RegExp | ((request: Request) => boolean),
        sec?: number,
    ) {
        const timeout = sec ? sec * 1000 : this.options.waitForTimeout;

        return this.page.waitForRequest(urlOrPredicate, { timeout });
    }

    /**
     * Waits for a network request.
     *
     * ```js
     * I.waitForResponse('http://example.com/resource');
     * I.waitForResponse(request => request.url() === 'http://example.com' && request.method() === 'GET');
     * ```
     */
    async waitForResponse(
        urlOrPredicate: string | RegExp | ((response: Response) => boolean),
        sec?: number,
    ) {
        const timeout = sec ? sec * 1000 : this.options.waitForTimeout;

        return this.page.waitForResponse(urlOrPredicate, { timeout });
    }

    /**
     * {{> switchTo }}
     */
    async switchTo(locator: string | number) {
        if (Number.isInteger(locator)) {
            // Select by frame index of current context

            let childFrames = null;

            if (this.context && typeof this.context.childFrames === 'function') {
                childFrames = this.context.childFrames();
            } else {
                childFrames = this.page.mainFrame().childFrames();
            }

            if (locator >= 0 && locator < childFrames.length) {
                this.context = childFrames[locator];
                this.contextLocator = locator;
            } else {
                throw new Error('Element #invalidIframeSelector was not found by text|CSS|XPath');
            }

            return;
        }
        if (!locator) {
            this.context = this.page;
            this.contextLocator = null;

            return;
        }

        // iframe by selector
        let els = await this._locate(locator as string);
        els = await this.helperUtils.assertElementExists(this.context, els, locator as string);

        const contentFrame = await els[0].contentFrame();

        if (contentFrame) {
            this.context = contentFrame;
            this.contextLocator = null;
        } else {
            this.context = els[0];
            this.contextLocator = locator;
        }
    }

    /**
     * {{> waitForFunction }}
     */
    async waitForFunction(fn: string | Function, argsOrSec: any | number = null, sec?: number) {
        let args = [];

        if (argsOrSec) {
            if (Array.isArray(argsOrSec)) {
                args = argsOrSec;
            } else if (typeof argsOrSec === 'number') {
                sec = argsOrSec;
            }
        }
        const waitTimeout = sec ? sec * 1000 : this.options.waitForTimeout;
        const context = await this._getContext();

        return context.waitForFunction(fn, args, { timeout: waitTimeout });
    }

    /**
     * Waits for navigation to finish. By default takes configured `waitForNavigation` option.
     *
     * See [Playwright's reference](https://playwright.dev/docs/api/class-page?_highlight=waitfornavi#pagewaitfornavigationoptions)
     */
    async waitForNavigation(opts = {}) {
        opts = {
            timeout: this.options.getPageTimeout,
            waitUntil: this.options.waitForNavigation,
            ...opts,
        };

        return this.page.waitForNavigation(opts);
    }

    /**
     * {{> waitForDetached }}
     */
    async waitForDetached(locator: string | Locator, sec?: number) {
        const waitTimeout = sec ? sec * 1000 : this.options.waitForTimeout;

        locator = new Locator(locator, 'css');

        let waiter;
        const context = await this._getContext();

        if (!locator.isXPath()) {
            waiter = context.waitForSelector(
                `${locator.isCustom() ? `${locator.type}=${locator.value}` : locator.simplify()}`,
                { timeout: waitTimeout, state: 'detached' },
            );
        } else {
            const visibleFn = function ([locator, $XPath]) {
                eval($XPath); // eslint-disable-line no-eval

                return $XPath(null, locator).length === 0;
            };

            waiter = context.waitForFunction(visibleFn, [locator.value, $XPath.toString()], {
                timeout: waitTimeout,
            });
        }

        return waiter.catch((err) => {
            throw new Error(
                `element (${locator.toString()}) still on page after ${waitTimeout / 1000} sec\n${
                    err.message
                }`,
            );
        });
    }

    async _waitForAction() {
        return this.wait(this.options.waitForAction / 1000);
    }

    /**
     * {{> grabDataFromPerformanceTiming }}
     */
    async grabDataFromPerformanceTiming() {
        return perfTiming;
    }

    /**
     * {{> grabElementBoundingRect }}
     */
    async grabElementBoundingRect(locator: string): Promise<{
        x: number;
        y: number;
        width: number;
        height: number;
    }>;

    async grabElementBoundingRect(
        locator: string,
        prop: 'x' | 'y' | 'width' | 'height',
    ): Promise<string>;

    async grabElementBoundingRect(locator: string, prop?: string) {
        let els = await this._locate(locator);
        els = await this.helperUtils.assertElementExists(this.context, els, locator);

        const rect = await els[0].boundingBox();

        if (prop) {
            return rect[prop];
        }

        return rect;
    }

    /**
     * Mocks network request using [`browserContext.route`](https://playwright.dev/docs/api/class-browsercontext#browser-context-route) of Playwright
     *
     * ```js
     * I.mockRoute(/(\.png$)|(\.jpg$)/, route => route.abort());
     * ```
     * This method allows intercepting and mocking requests & responses. [Learn more about it](https://playwright.dev/docs/network#handle-requests)
     */
    async mockRoute(url: string | RegExp, handler: (route: Route, request: Request) => void) {
        return this.browserContext.route(url, handler);
    }

    /**
     * Stops network mocking created by `mockRoute`.
     *
     * ```js
     * I.stopMockingRoute(/(\.png$)|(\.jpg$)/);
     * I.stopMockingRoute(/(\.png$)|(\.jpg$)/, previouslySetHandler);
     * ```
     * If no handler is passed, all mock requests for the rote are disabled.
     */
    async stopMockingRoute(
        url: string | RegExp,
        handler: (route: Route, request: Request) => void,
    ) {
        return this.browserContext.unroute(url, handler);
    }
}

module.exports = Playwright;

export default Playwright;

function buildLocatorString(locator) {
    if (locator.isCustom()) {
        return `${locator.type}=${locator.value}`;
    }
    if (locator.isXPath()) {
        // dont rely on heuristics of playwright for figuring out xpath
        return `xpath=${locator.value}`;
    }

    return locator.simplify();
}

async function findElements(matcher, locator) {
    if (locator.react) {
        return findReact(matcher, locator);
    }
    locator = new Locator(locator, 'css');

    return matcher.$$(buildLocatorString(locator));
}

async function getVisibleElements(elements) {
    const visibleElements = [];

    for (const element of elements) {
        if (await element.isVisible()) {
            visibleElements.push(element);
        }
    }
    if (visibleElements.length === 0) {
        return elements;
    }

    return visibleElements;
}

async function proceedClick(locator, context = null, options: any = {}) {
    let matcher = await this._getContext();

    if (context) {
        let els = await this._locate(context);
        els = await this.helperUtils.assertElementExists(this.context, els, context);

        matcher = els[0];
    }

    let els = await findClickable.call(this, matcher, locator);

    if (context) {
        els = await this.helperUtils.assertElementExists(
            this.context,
            els,
            locator,
            'Clickable element',
            `was not found inside element ${new Locator(context).toString()}`,
        );
    } else {
        els = await this.helperUtils.assertElementExists(
            this.context,
            els,
            locator,
            'Clickable element',
        );
    }

    /*
    using the force true options itself but instead dispatching a click
  */
    if (options.force) {
        await els[0].dispatchEvent('click');
    } else {
        const element = els.length > 1 ? (await getVisibleElements(els))[0] : els[0];

        await element.click(options);
    }
    const promises = [];

    if (options.waitForNavigation) {
        promises.push(this.waitForNavigation());
    }
    promises.push(this._waitForAction());

    return Promise.all(promises);
}

async function findClickable(matcher, locator) {
    if (locator.react) {
        return findReact(matcher, locator);
    }

    locator = new Locator(locator);
    if (!locator.isFuzzy()) {
        return findElements.call(this, matcher, locator);
    }

    let els;
    const literal = xpathLocator.literal(locator.value);

    els = await findElements.call(this, matcher, Locator.clickable.narrow(literal));
    if (els.length) {
        return els;
    }

    els = await findElements.call(this, matcher, Locator.clickable.wide(literal));
    if (els.length) {
        return els;
    }

    try {
        els = await findElements.call(this, matcher, Locator.clickable.self(literal));
        if (els.length) {
            return els;
        }
    } catch (err) {
        // Do nothing
    }

    return findElements.call(this, matcher, locator.value); // by css or xpath
}

async function proceedSee(assertType, text, context, strict = false) {
    let description;
    let allText;

    if (!context) {
        let el = await this.context;

        if (el && !el.getProperty) {
            // Fallback to body
            el = await this.context.$('body');
        }

        allText = [await el.getProperty('innerText').then((p) => p.jsonValue())];
        description = 'web application';
    } else {
        const locator = new Locator(context, 'css');

        description = `element ${locator.toString()}`;
        let els = await this._locate(locator);
        els = await this.helperUtils.assertElementExists(this.context, els, context);

        allText = await Promise.all(
            els.map((el) => el.getProperty('innerText').then((p) => p.jsonValue())),
        );
    }

    if (strict) {
        return allText.map((elText) => equals(description)[assertType](text, elText));
    }

    return stringIncludes(description)[assertType](text, allText.join(' | '));
}

async function findCheckable(locator, context?) {
    let contextEl = await this.context;

    if (typeof context === 'string') {
        contextEl = await findElements.call(
            this,
            contextEl,
            new Locator(context, 'css').simplify(),
        );
        contextEl = await this.helperUtils.assertElementExists(this.context, contextEl, context);

        contextEl = contextEl[0];
    }

    const matchedLocator = new Locator(locator);

    if (!matchedLocator.isFuzzy()) {
        return findElements.call(this, contextEl, matchedLocator.simplify());
    }

    const literal = xpathLocator.literal(locator);
    let els = await findElements.call(this, contextEl, Locator.checkable.byText(literal));

    if (els.length) {
        return els;
    }
    els = await findElements.call(this, contextEl, Locator.checkable.byName(literal));
    if (els.length) {
        return els;
    }

    return findElements.call(this, contextEl, locator);
}

async function proceedIsChecked(assertType, option) {
    let els = await findCheckable.call(this, option);
    els = await this.helperUtils.assertElementExists(this.context, els, option, 'Checkable');
    els = await Promise.all(els.map((el) => el.getProperty('checked')));
    els = await Promise.all(els.map((el) => el.jsonValue()));

    const selected = els.reduce((prev, cur) => prev || cur);

    return truth(`checkable ${option}`, 'to be checked')[assertType](selected);
}

async function findFields(locator) {
    const matchedLocator = new Locator(locator);

    if (!matchedLocator.isFuzzy()) {
        return this._locate(matchedLocator);
    }
    const literal = xpathLocator.literal(locator);

    let els = await this._locate({ xpath: Locator.field.labelEquals(literal) });

    if (els.length) {
        return els;
    }

    els = await this._locate({ xpath: Locator.field.labelContains(literal) });
    if (els.length) {
        return els;
    }
    els = await this._locate({ xpath: Locator.field.byName(literal) });
    if (els.length) {
        return els;
    }

    return this._locate({ css: locator });
}

async function proceedDragAndDrop(sourceLocator: string, destinationLocator: string) {
    // modern drag and drop in Playwright
    if (this.page.dragAndDrop) {
        const source = new Locator(sourceLocator);
        const dest = new Locator(destinationLocator);

        if (source.isBasic() && dest.isBasic()) {
            return this.page.dragAndDrop(source.simplify(), dest.simplify());
        }
    }

    let src = await this._locate(sourceLocator);
    src = await this.helperUtils.assertElementExists(
        this.context,
        src,
        sourceLocator,
        'Source Element',
    );

    let dst = await this._locate(destinationLocator);
    dst = await this.helperUtils.assertElementExists(
        this.context,
        dst,
        destinationLocator,
        'Destination Element',
    );

    const dragSource = await clickablePoint(src[0], sourceLocator);
    const dragDestination = await clickablePoint(dst[0], destinationLocator);

    // Drag start point
    await this.page.mouse.move(dragSource.x, dragSource.y, { steps: 5 });
    await this.page.mouse.down();

    // Drag destination
    await this.page.mouse.move(dragDestination.x, dragDestination.y, { steps: 5 });
    await this.page.mouse.up();
    await this._waitForAction();
}

async function proceedSeeInField(assertType, field, value) {
    let els = await findFields.call(this, field);
    els = await this.helperUtils.assertElementExists(this.context, els, field, 'Field');

    const el = els[0];
    const tag = await el.getProperty('tagName').then((el) => el.jsonValue());
    const fieldType = await el.getProperty('type').then((el) => el.jsonValue());

    const proceedMultiple = async (elements) => {
        const fields = Array.isArray(elements) ? elements : [elements];

        const elementValues = [];

        for (const element of fields) {
            elementValues.push(await element.getProperty('value').then((el) => el.jsonValue()));
        }

        if (typeof value === 'boolean') {
            equals(`no. of items matching > 0: ${field}`)[assertType](
                value,
                Boolean(elementValues.length),
            );
        } else {
            if (assertType === 'assert') {
                equals(`select option by ${field}`)[assertType](true, elementValues.length > 0);
            }
            elementValues.forEach((val) =>
                stringIncludes(`fields by ${field}`)[assertType](value, val),
            );
        }
    };

    if (tag === 'SELECT') {
        const selectedOptions = await el.$$('option:checked');

        // locate option by values and check them
        if (value === '') {
            return proceedMultiple(selectedOptions);
        }

        const options = await filterFieldsByValue(selectedOptions, value, true);

        return proceedMultiple(options);
    }

    if (tag === 'INPUT') {
        if (fieldType === 'checkbox' || fieldType === 'radio') {
            if (typeof value === 'boolean') {
                // Filter by values
                const options = await filterFieldsBySelectionState(els, true);

                return proceedMultiple(options);
            }

            const options = await filterFieldsByValue(els, value, true);

            return proceedMultiple(options);
        }

        return proceedMultiple(els[0]);
    }
    const fieldVal = await el.getProperty('value').then((el) => el.jsonValue());

    return stringIncludes(`fields by ${field}`)[assertType](value, fieldVal);
}

async function filterFieldsByValue(elements, value, onlySelected) {
    const matches = [];

    for (const element of elements) {
        const val = await element.getProperty('value').then((el) => el.jsonValue());
        let isSelected = true;

        if (onlySelected) {
            isSelected = await elementSelected(element);
        }
        if ((value == null || val.indexOf(value) > -1) && isSelected) {
            matches.push(element);
        }
    }

    return matches;
}

async function filterFieldsBySelectionState(elements, state) {
    const matches = [];

    for (const element of elements) {
        const isSelected = await elementSelected(element);

        if (isSelected === state) {
            matches.push(element);
        }
    }

    return matches;
}

async function elementSelected(element) {
    const type = await element.getProperty('type').then((el) => el.jsonValue());

    if (type === 'checkbox' || type === 'radio') {
        return element.getProperty('checked').then((el) => el.jsonValue());
    }

    return element.getProperty('selected').then((el) => el.jsonValue());
}

function isFrameLocator(locator) {
    locator = new Locator(locator);
    if (locator.isFrame()) {
        return locator.value;
    }

    return false;
}

function $XPath(element, selector) {
    const found = document.evaluate(selector, element || document.body, null, 5, null);
    const res = [];
    let current = null;

    while ((current = found.iterateNext())) {
        res.push(current);
    }

    return res;
}

async function targetCreatedHandler(page) {
    if (!page) {
        return;
    }
    this.withinLocator = null;
    page.on('load', () => {
        page.$('body')
            .catch(() => null)
            .then(async (context) => {
                if (this.context && this.context._type === 'Frame') {
                    // we are inside iframe?
                    const frameEl = await this.context.frameElement();

                    this.context = await frameEl.contentFrame();
                    this.contextLocator = null;

                    return;
                }
                // if context element was in iframe - keep it
                // if (await this.context.ownerFrame()) return;
                this.context = page;
                this.contextLocator = null;
            });
    });
    page.on('console', (msg) => {
        this.debugSection(
            `Browser:${ucfirst(msg.type())}`,
            (msg._text || '') + msg.args().join(' '),
        );
        consoleLogStore.add(msg);
    });

    if (this.options.userAgent) {
        await page.setUserAgent(this.options.userAgent);
    }
    if (
        this.options.windowSize &&
        this.options.windowSize.indexOf('x') > 0 &&
        this._getType() === 'Browser'
    ) {
        await page.setViewportSize(parseWindowSize(this.options.windowSize));
    }
}

function parseWindowSize(windowSize) {
    if (!windowSize) {
        return { width: 800, height: 600 };
    }
    const dimensions = windowSize.split('x');

    if (dimensions.length < 2 || windowSize === 'maximize') {
        console.log('Invalid window size, setting window to default values');

        return { width: 800, height: 600 }; // invalid size
    }
    const width = parseInt(dimensions[0], 10);
    const height = parseInt(dimensions[1], 10);

    return { width, height };
}

// List of key values to key definitions
// https://github.com/puppeteer/puppeteer/blob/v1.20.0/lib/USKeyboardLayout.js
const keyDefinitionMap = {
    0: 'Digit0',
    1: 'Digit1',
    2: 'Digit2',
    3: 'Digit3',
    4: 'Digit4',
    5: 'Digit5',
    6: 'Digit6',
    7: 'Digit7',
    8: 'Digit8',
    9: 'Digit9',
    a: 'KeyA',
    b: 'KeyB',
    c: 'KeyC',
    d: 'KeyD',
    e: 'KeyE',
    f: 'KeyF',
    g: 'KeyG',
    h: 'KeyH',
    i: 'KeyI',
    j: 'KeyJ',
    k: 'KeyK',
    l: 'KeyL',
    m: 'KeyM',
    n: 'KeyN',
    o: 'KeyO',
    p: 'KeyP',
    q: 'KeyQ',
    r: 'KeyR',
    s: 'KeyS',
    t: 'KeyT',
    u: 'KeyU',
    v: 'KeyV',
    w: 'KeyW',
    x: 'KeyX',
    y: 'KeyY',
    z: 'KeyZ',
    ';': 'Semicolon',
    '=': 'Equal',
    ',': 'Comma',
    '-': 'Minus',
    '.': 'Period',
    '/': 'Slash',
    '`': 'Backquote',
    '[': 'BracketLeft',
    '\\': 'Backslash',
    ']': 'BracketRight',
    "'": 'Quote',
};

function getNormalizedKey(key: string) {
    const normalizedKey = getNormalizedKeyAttributeValue(key);

    if (key !== normalizedKey) {
        this.debugSection('Input', `Mapping key '${key}' to '${normalizedKey}'`);
    }

    if (Object.prototype.hasOwnProperty.call(keyDefinitionMap, normalizedKey)) {
        return keyDefinitionMap[normalizedKey];
    }

    return normalizedKey;
}

async function clickablePoint(el: ElementHandle, locator: string) {
    const rect = await el.boundingBox();

    if (!rect) {
        throw new Error(`Element "${locator}" is not visible.`);
    }
    const { x, y, width, height } = rect;

    return { x: x + width / 2, y: y + height / 2 };
}
