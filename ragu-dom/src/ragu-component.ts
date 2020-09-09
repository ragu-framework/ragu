import {ComponentLoader} from "./component-loader";
import {DependencyContext} from "./dependency-context";
import {ScriptLoader} from "./gateway/script-loader";
import {JsonpGateway} from "./gateway/jsonp-gateway";

export const defaultComponentLoader = new ComponentLoader({
  dependencyContext: new DependencyContext(new ScriptLoader()),
  jsonpGateway: new JsonpGateway(document)
});

export const registerRaguComponent = (componentLoader: ComponentLoader = defaultComponentLoader): void => {
  class RaguComponent extends HTMLElement {
    static get observedAttributes() {
      return ['src'];
    }

    async attributeChangedCallback() {
      await this.fetchComponent();
    }

    private async fetchComponent() {
      const src = this.getAttribute('src');

      if (src) {
        const component = await componentLoader.load(src);
        this.innerHTML = component.html;

        await component.render(this, component.props, component.state);
      }
    }
  }

  window.customElements.define('ragu-component', RaguComponent);
}
