import {ComponentDependency, DependencyContext} from "./dependency-context";
import {JsonpGateway} from "./gateway/jsonp-gateway";

export interface ComponentLoaderContext {
  dependencyContext: DependencyContext;
  jsonpGateway: JsonpGateway
}

export interface Component<Props, State> {
  dependencies?: ComponentDependency[];
  props: Props;
  state: State;
  html: string;
  client: string;
  styles?: string[];
  resolverFunction: string;
  disconnect?: () => void
  hydratePromise?: Promise<void>,
  component?: {
    hydrate: (element: HTMLElement, props: Props, state: State) => Promise<void>,
    disconnect?: () => void;
  },
  hydrate: (element: HTMLElement, props: Props, state: State) => Promise<void>;
}

export class ComponentLoader {
  constructor(readonly context: ComponentLoaderContext) {
  }

  async load<P, S, T extends Component<P, S>>(componentUrl: string): Promise<T> {
    const componentResponse: T = await this.context.jsonpGateway.fetchJsonp<T>(componentUrl);

    return await this.hydrationFactory(componentResponse);
  }

  async hydrationFactory<T  extends Component<P, S>, P, S>(componentResponse: T) {
    if (componentResponse.styles && componentResponse.styles.length) {
      await this.context.dependencyContext.loadStyles(componentResponse.styles);
    }

    const context = this.context;

    return {
      ...componentResponse,
      async disconnect() {
          await this.hydratePromise;
          this.component?.disconnect?.();
      },
      async hydrate(htmlElement: HTMLElement, props: P, state: S) {
        const dependencies = componentResponse.dependencies || [];

        await context.dependencyContext.loadAll(dependencies);
        await context.dependencyContext.load({dependency: componentResponse.client});

        const resolvedComponent = (window as any)[componentResponse.resolverFunction];

        if (resolvedComponent.default) {
          this.component = resolvedComponent.default;
          this.hydratePromise = this.component?.hydrate(htmlElement, props, state);
          await this.hydratePromise;
          return;
        }

        // TODO deprecate:
        this.component = await resolvedComponent.resolve();
        this.hydratePromise = this.component?.hydrate(htmlElement, props, state);
        await this.hydratePromise;
      }
    };
  }
}
