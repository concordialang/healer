import { generateKey } from '../../utils';

const buildUIElementKey = ( params: { feature: string; locator: string } ): string => {
    const { feature, locator } = params;

    return generateKey( feature, locator );
};

const buildHealingResultKey = (): string => {
    return generateKey();
};

export { buildUIElementKey, buildHealingResultKey };
