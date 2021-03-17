import {ComponentLoader} from "./component-loader";
import {RaguComponent} from "./ragu-component";
const {withParsedCallback} = require('html-parsed-element');

export const registerRaguComponent = (componentLoader?: ComponentLoader): void => {
  const RaguCustomElement = withParsedCallback(class extends HTMLElement {
    private component!: RaguComponent;
    private firstFetchPerformed = false;

    constructor() {
      super();
      this.component = new RaguComponent(this, componentLoader);
    }

    static get observedAttributes() {
      return ['src'];
    }

    async attributeChangedCallback() {
      if (this.firstFetchPerformed) {
        await this.setRaguComponent();
      }
    }

    async parsedCallback() {
      await this.waitToFullParse();
      this.firstFetchPerformed = true;

      await this.setRaguComponent();
    }

    private async setRaguComponent() {
      const src = this.getAttribute('src');

      if (src) {
        await this.component.fetchComponent(src);
      }
    }

    private async waitToFullParse() {
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve());
      });
    }

    disconnectedCallback() {
      this.component.disconnectComponent();
    }
  });

  window.customElements.define('ragu-component', RaguCustomElement);
}
