interface ScoredElement {
    node: any;
    locator: string;
    score: number;
}

interface HeuristicResult {
    weight: number;
    elements: ScoredElement[];
}

export default HeuristicResult;

export { ScoredElement };
