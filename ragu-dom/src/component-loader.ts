import {ComponentDependency, DependencyContext} from "./dependency-context";
import {JsonpGateway} from "./gateway/jsonp-gateway";

export interface ComponentLoaderContext {
  dependencyContext: DependencyContext;
  jsonpGateway: JsonpGateway
}

type ComponentRenderable<Props, State> = (element: HTMLElement, props: Props, state: State) => Promise<void>;

type RuntimeComponent<Props, State> = {
  hydrate: ComponentRenderable<Props, State>,
  render: ComponentRenderable<Props, State>,
  disconnect?: (element: HTMLElement) => void;
};

export interface Component<Props, State> {
  dependencies?: ComponentDependency[];
  props: Props;
  state: State;
  html?: string;
  client: string;
  styles?: string[];
  resolverFunction: string;
  hydratePromise?: Promise<void>;
  component?: RuntimeComponent<Props, State>;
  render: (element: HTMLElement) => Promise<void>;
  disconnect?: (element: HTMLElement) => void;
}

export class ComponentLoader {
  constructor(readonly context: ComponentLoaderContext) {
  }

  async load<P, S, T extends Component<P, S>>(componentUrl: string): Promise<T> {
    const componentResponse: T = await this.context.jsonpGateway.fetchJsonp<T>(componentUrl);

    return await this.hydrationFactory<T, P, S>(componentResponse);
  }

  async hydrationFactory<T  extends Component<P, S>, P, S>(componentResponse: T) {
    if (componentResponse.styles && componentResponse.styles.length) {
      await this.context.dependencyContext.loadStyles(componentResponse.styles);
    }

    const context = this.context;

    return {
      ...componentResponse,
      async disconnect(el: HTMLElement) {
          const component = this.component;
          await this.hydratePromise;
          component?.disconnect?.(el);
      },
      async runtimeComponent(externalFunction: any): Promise<RuntimeComponent<P, S>> {
        const component = externalFunction.default || externalFunction;

        /**
         * deprecated: The method resolve will not be supported in further versions.
         */
        if (component.resolve) {
          return await externalFunction.resolve();
        }

        return component;
      },
      getRenderFunction(): ComponentRenderable<P, S> | undefined {
        if (this.html === undefined) {
          return this.component?.render;
        }
        return this.component?.hydrate;
      },
      async render(htmlElement: HTMLElement) {
        const dependencies = componentResponse.dependencies || [];

        await context.dependencyContext.loadAll(dependencies);
        await context.dependencyContext.load({dependency: componentResponse.client});

        const resolvedComponent = (window as any)[componentResponse.resolverFunction];
        this.component = await this.runtimeComponent(resolvedComponent);

        const renderFunction = this.getRenderFunction();
        this.hydratePromise = renderFunction?.(htmlElement, this.props, this.state);
        await this.hydratePromise;
      }
    };
  }
}
