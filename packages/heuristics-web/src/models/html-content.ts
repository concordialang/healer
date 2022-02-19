export interface HTMLElementContent {
    tag: string;
    textContent?: string;
    xpath?: string;
    attributes?: Record<string, string>;
    parents?: HTMLElementContent[];
}
