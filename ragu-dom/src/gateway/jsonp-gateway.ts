class RaguJSONP<T> {
  static scriptIdPrefix = 'ragu_jsonp_script_';
  static callbackFunctionPrefix = 'raguJSONP_';
  private readonly id: string;
  private readonly script: HTMLScriptElement;

  constructor(private readonly document: Document, private readonly url: string) {
    this.id = `${Date.now()}_${Math.ceil(Math.random() * 10000000)}`;
    this.script = this.createScript();
  }

  private createScript() {
    const htmlScriptElement = this.document.createElement('script');
    htmlScriptElement.src = this.getScriptSRC();
    htmlScriptElement.id = this.getScriptID();
    return htmlScriptElement;
  }

  fetch(): Promise<T> {
    const promise = new Promise<T>((resolve, reject) => {
      (window as any)[this.getCallbackFunctionName()] = (value: T) => {
        this.cleanup();
        resolve(value);
      }
      this.script.onerror = (err) => {
        this.cleanup();
        reject(err);
      }
    });

    this.document.head.appendChild(this.script);
    return promise;
  }

  private cleanup() {
    delete (window as any)[this.getCallbackFunctionName()];
    this.script.remove();
  }

  private getScriptSRC() {
    const url = new URL(this.url);
    url.searchParams.append('callback', this.getCallbackFunctionName());
    return url.toString();
  }

  private getCallbackFunctionName() {
    return `${RaguJSONP.callbackFunctionPrefix}${this.id}`;
  }

  private getScriptID() {
    return `${RaguJSONP.scriptIdPrefix}${this.id}`;
  }
}


export class JsonpGateway {
  constructor(private readonly document: Document) {
  }

  fetchJsonp<T>(componentURL: string): Promise<T> {
    return new RaguJSONP<T>(this.document, componentURL).fetch();
  }
}
