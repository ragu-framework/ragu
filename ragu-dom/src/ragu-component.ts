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
      await this.waitToFullParse();
      this.firstFetchPerformed = true;
      const ssrScriptElement = this.querySelector('script[data-ragu-ssr]');

      if (ssrScriptElement) {
        await this.hydrate(ssrScriptElement);
        return;
      }

      await this.fetchComponent();
    }

    private async waitToFullParse() {
      await new Promise((resolve) => {
        setTimeout(() => resolve());
      });
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

    private async hydrate(ssrScriptElement: Element) {
      const serverDate = JSON.parse(ssrScriptElement.textContent || '{}');
      ssrScriptElement.remove();

      this.component = await componentLoader.hydrationFactory(serverDate);
      await this.component?.hydrate(this, this.component.props, this.component.state);
    }
  }

  window.customElements.define('ragu-component', RaguComponent);
}
