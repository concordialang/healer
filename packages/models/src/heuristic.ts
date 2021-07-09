export interface Heuristic {
    name: string;
    run: ( elements: any ) => any;
}
