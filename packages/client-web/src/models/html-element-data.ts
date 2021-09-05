interface HTMLElementData {
    tag: string;
    innerText: string;
    xpath: string;
    attributes: Record<string, string>;
    parents?: HTMLElementData[];
}

export { HTMLElementData };
