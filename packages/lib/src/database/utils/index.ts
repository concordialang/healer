import { generateKey } from '../../utils';

const buildUIElementKey = ( {
    feature,
    scenario,
    locator,
}: {
    feature: string;
    scenario: string;
    locator: string;
} ): string => {
    return generateKey( feature, scenario, locator );
};

const buildHealingResultKey = (): string => {
    return generateKey();
};

export { buildUIElementKey, buildHealingResultKey };
