import {ComponentLoader} from "./component-loader";
import {RaguComponent} from "./ragu-component";

export const registerRaguComponent = (componentLoader?: ComponentLoader): void => {
  class RaguCustomElement extends HTMLElement {
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

    async connectedCallback() {
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
      await new Promise((resolve) => {
        setTimeout(() => resolve());
      });
    }

    disconnectedCallback() {
      this.component.disconnectComponent();
    }
  }

  window.customElements.define('ragu-component', RaguCustomElement);
}
