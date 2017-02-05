export class StyleSheet {
    style: HTMLStyleElement;
    
    constructor () {
        this.style = document.createElement('style');
        this.Apply();
    }
    
    public Add(...styleText: string[]):void
    {
        this.style.textContent += '\n' + styleText.join('\n');
    }
    
    public Hide(selector: string|string[], ...selectors: string[]): void
    {
        if ('string' == typeof selector) {
            selectors.splice(0, 0, selector as string);
        } else {
            selectors = selector as string[];
        }
        
        var styleText = `${selectors.join(', ')} { display: none !important }`;
        this.Add(styleText);
    }
    
    public Show(selector: string|string[], ...selectors: string[]): void
    {
        if ('string' == typeof selector) {
            selectors.splice(0, 0, selector as string);
        } else {
            selectors = selector as string[];
        }
        
        var styleText = `${selectors.join(', ')} { display: block !important }`;
        this.Add(styleText);
    }
    
    public HideFrames(): void
    {
        this.Hide('frame, iframe, frameset');
    }
    
    public Apply (body: boolean = true): void
    {
        if (body && document.body) {
            document.body.appendChild(this.style);
        } else {
            document.head.appendChild(this.style);
        }
    }
}