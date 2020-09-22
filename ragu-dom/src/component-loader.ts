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

    return {
      ...componentResponse,
      hydrate: async (htmlElement: HTMLElement, props: P, state: S) => {
        const dependencies = componentResponse.dependencies || [];

        await this.context.dependencyContext.loadAll(dependencies);

        await this.context.dependencyContext.load({dependency: componentResponse.client});

        const resolvedComponent = (window as any)[componentResponse.resolverFunction];

        if (resolvedComponent.default) {
          await resolvedComponent.default.hydrate(htmlElement, props, state);
          return;
        }

        // TODO deprecate:
        const component = await resolvedComponent.resolve();
        await component.hydrate(htmlElement, props, state);
      }
    };
  }
}
