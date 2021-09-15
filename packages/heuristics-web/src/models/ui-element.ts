import { UIElement as IUIElement } from '@healer/common';

import { HTMLElementContent } from './html-content';

interface UIElement extends IUIElement {
    content: HTMLElementContent;
}

export { UIElement };
