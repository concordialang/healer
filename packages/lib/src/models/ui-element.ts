export interface IUIElement {
    uuid: string;
    feature: string;
    scenario: string;
    locator: string;
    locatorType: string;
    content: any;
    uiType: string;
    createdAt: Date;
    updatedAt: Date;
}
