interface HealingElement {
    node: any;
    totalScore: number;
    appliedHeuristics: {
        name: string;
        locator: string;
        score: number;
    }[];
}

export default HealingElement;
