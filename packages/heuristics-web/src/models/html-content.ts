export interface HTMLElementContent {
    tag: string;
    innerText?: string;
    xpath?: string;
    attributes?: Record<string, string>;
    parents?: HTMLElementContent[];
}
