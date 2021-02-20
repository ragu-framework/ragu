import {ComponentDependency, DependencyContext} from "./dependency-context";
import {JsonpGateway} from "./gateway/jsonp-gateway";

export interface ComponentLoaderContext {
  dependencyContext: DependencyContext;
  jsonpGateway: JsonpGateway
}

type RuntimeComponent<Props, State> = {
  hydrate: (element: HTMLElement, props: Props, state: State) => Promise<void>,
  disconnect?: (element: HTMLElement) => void;
};

export interface Component<Props, State> {
  dependencies?: ComponentDependency[];
  props: Props;
  state: State;
  html: string;
  client: string;
  styles?: string[];
  resolverFunction: string;
  disconnect?: (element: HTMLElement) => void
  hydratePromise?: Promise<void>,
  component?: RuntimeComponent<Props, State>,
  hydrate: (element: HTMLElement) => Promise<void>;
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
      async hydrate(htmlElement: HTMLElement) {
        const dependencies = componentResponse.dependencies || [];

        await context.dependencyContext.loadAll(dependencies);
        await context.dependencyContext.load({dependency: componentResponse.client});

        const resolvedComponent = (window as any)[componentResponse.resolverFunction];
        this.component = await this.runtimeComponent(resolvedComponent);

        this.hydratePromise = this.component?.hydrate(htmlElement, this.props, this.state);
        await this.hydratePromise;
      }
    };
  }
}
