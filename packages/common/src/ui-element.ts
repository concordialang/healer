interface UIElement {
    uuid?: string;
    feature: string;
    locator: string;
    locatorType: string;
    content: any;
    uiType: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export default UIElement;
