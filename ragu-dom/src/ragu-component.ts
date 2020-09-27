import {Component, ComponentLoader} from "./component-loader";
import {DependencyContext} from "./dependency-context";
import {ScriptLoader} from "./gateway/script-loader";
import {JsonpGateway} from "./gateway/jsonp-gateway";

export const defaultComponentLoader = new ComponentLoader({
  dependencyContext: new DependencyContext(new ScriptLoader()),
  jsonpGateway: new JsonpGateway(document)
});

export class RaguComponent {
  private component?: Component<any, any>;

  constructor(private readonly element: HTMLElement, private readonly componentLoader: ComponentLoader = defaultComponentLoader) {
  }

  async fetchComponent(src: string) {
    const ssrScriptElement = this.element.querySelector('script[data-ragu-ssr]');

    if (ssrScriptElement) {
      await this.hydrate(ssrScriptElement);
      return;
    }

    await this.fetchComponentFromServer(src);
  }

  private async fetchComponentFromServer(src: string) {
    this.disconnectComponent();

    this.component = await this.componentLoader.load(src);
    this.element.innerHTML = this.component.html;
    await this.component.hydrate(this.element, this.component.props, this.component.state);
  }

  disconnectComponent() {
    if (this.component) {
      this.component.disconnect?.();
    }
  }

  private async hydrate(ssrScriptElement: Element) {
    const serverDate = JSON.parse(ssrScriptElement.textContent || '{}');
    ssrScriptElement.remove();

    this.component = await this.componentLoader.hydrationFactory(serverDate);
    await this.component?.hydrate(this.element, this.component.props, this.component.state);
  }
}
