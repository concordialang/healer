import { IUIElement } from './ui-element';

export enum HealingResultStatus {
    FAIL = 'fail',
    FAIL_DISPLAYED = 'fail_displayed',
    SUCCESS = 'success',
    SUCCESS_NOT_ACCEPTED = 'success_not_accepted',
    SUCCESS_ACCEPTED = 'success_accepted',
}

export class IHealingResult {
    uuid: string;
    newLocator: string;
    score: number;
    status: HealingResultStatus;
    createdAt: Date;
    element: IUIElement;
}
