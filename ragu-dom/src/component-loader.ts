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
  resolverFunction: string;
  render: (element: HTMLElement, props: Props, state: State) => Promise<void>;
}

export class ComponentLoader {
  constructor(readonly context: ComponentLoaderContext) {
  }

  async load<P, S, T extends Component<P, S>>(componentUrl: string): Promise<T> {
    const componentResponse: T = await this.context.jsonpGateway.fetchJsonp<T>(componentUrl);

    return {
      ...componentResponse,
      render: async (htmlElement: HTMLElement, props: P, state: S) => {
        const dependencies = componentResponse.dependencies || [];

        await Promise.all(dependencies.map((dep) => {
          return this.context.dependencyContext.load(dep);
        }));

        await this.context.dependencyContext.load({ dependency: componentResponse.client });

        const component = await (window as any)[componentResponse.resolverFunction].resolve();
        await component.render(htmlElement, props, state);
      }
    };
  }
}
