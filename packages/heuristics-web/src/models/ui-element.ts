import { UIElement as IUIElement } from '@concordialang-healer/common';

import { HTMLElementContent } from './html-content';

interface UIElement extends IUIElement {
    content: HTMLElementContent;
}

export { UIElement };
