import {Component, ComponentLoader} from "./component-loader";
import {DependencyContext} from "./dependency-context";
import {ScriptLoader} from "./gateway/script-loader";
import {JsonpGateway} from "./gateway/jsonp-gateway";
import {FetchGateway} from "./gateway/fetch-gateway";

export const defaultComponentLoader = new ComponentLoader({
  dependencyContext: new DependencyContext(new ScriptLoader()),
  jsonpGateway: new JsonpGateway(document),
  fetchGateway: new FetchGateway()
});

export class RaguComponent {
  private component?: Component<any, any>;

  constructor(private readonly element: HTMLElement, private readonly componentLoader: ComponentLoader = defaultComponentLoader) {
  }

  async fetchComponent(src: string) {
    const ssrScriptElement = this.element.querySelector('script[data-ragu-ssr]');

    if (ssrScriptElement) {
      await this.fetchComponentFromSSRScript(ssrScriptElement);
      return;
    }

    await this.fetchComponentFromServer(src);
  }

  private fetchComponentFromServer(src: string) {
    this.disconnectComponent();

    this.componentLoader.load(src).then((component) => {
      this.component = component;
      this.element.dispatchEvent(new CustomEvent("ragu:fetched", { detail: this.component }));

      if (this.component.html) {
        this.element.innerHTML = this.component.html;
      }

      this.render();
    }).catch((e) => {
      this.element.dispatchEvent(new CustomEvent("ragu:fetch-fail", { detail: e }));
    });
  }

  disconnectComponent() {
    if (this.component) {
      this.component.disconnect?.(this.element);
    }
  }

  private async fetchComponentFromSSRScript(ssrScriptElement: Element) {
    const serverDate = JSON.parse(ssrScriptElement.textContent || '{}');
    ssrScriptElement.remove();

    this.component = await this.componentLoader.hydrationFactory(serverDate);
    await this.render();
  }

  private render() {
    this.component?.render(this.element).then(() => {
      this.element.dispatchEvent(new CustomEvent('ragu:hydrated', {
        detail: this.component
      }))
    });
  }
}
