import { IUIElement } from './ui-element';

export enum HealingResultStatus {
    FAIL,
    FAIL_DISPLAYED,
    SUCCESS,
    SUCCESS_DISPLAYED,
    SUCCESS_ACCEPTED,
}

export class IHealingResult {
    uuid: string;
    newLocator: string;
    score: number;
    status: HealingResultStatus;
    createdAt: Date;
    element: IUIElement;
}
