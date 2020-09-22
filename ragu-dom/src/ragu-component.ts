import {Component, ComponentLoader} from "./component-loader";
import {DependencyContext} from "./dependency-context";
import {ScriptLoader} from "./gateway/script-loader";
import {JsonpGateway} from "./gateway/jsonp-gateway";

export const defaultComponentLoader = new ComponentLoader({
  dependencyContext: new DependencyContext(new ScriptLoader()),
  jsonpGateway: new JsonpGateway(document)
});

export const registerRaguComponent = (componentLoader: ComponentLoader = defaultComponentLoader): void => {
  class RaguComponent extends HTMLElement {
    private component?: Component<any, any>;
    private firstFetchPerformed = false;

    static get observedAttributes() {
      return ['src'];
    }

    async attributeChangedCallback() {
      if (this.firstFetchPerformed) {
        await this.fetchComponent();
      }
    }

    async connectedCallback() {
      this.firstFetchPerformed = true;
      await this.fetchComponent();
    }

    disconnectedCallback() {
      this.disconnectComponent();
    }

    private async fetchComponent() {
      const src = this.getAttribute('src');

      if (src) {
        this.disconnectComponent();

        this.component = await componentLoader.load(src);
        this.innerHTML = this.component.html;
        await this.component.hydrate(this, this.component.props, this.component.state);
      }
    }

    private disconnectComponent() {
      if (this.component) {
        this.component.disconnect?.();
      }
    }
  }

  window.customElements.define('ragu-component', RaguComponent);
}
