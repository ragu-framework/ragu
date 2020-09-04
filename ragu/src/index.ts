import {componentLifecycleEvents} from "./lifecycle-events";

export interface Renderable {
  clientSide(element: HTMLElement): Promise<void>;
  serverSide(): Promise<string>;
}

export class PropsToStateError extends Error {
  readonly causedBy: Error;
  readonly errorType = 'PropsToStateError';

  constructor(causedBy: Error) {
    super(`Error during mapping props to state: ${causedBy}`);
    this.causedBy = causedBy;
  }

  static is(e: any) {
    return e.errorType === PropsToStateError.name;
  }
}

export class ComponentRenderError extends Error {
  readonly causedBy: Error;
  readonly errorType = 'ComponentRenderError';

  constructor(causedBy: Error) {
    super(`Error during render: ${causedBy}`);
    this.causedBy = causedBy;
  }

  static is(e: any) {
    return e.errorType === ComponentRenderError.name;
  }
}

export abstract class RaguComponent<Props, State> {
  protected state: State;
  protected props: Props;

  constructor(props: Props, state: State) {
    this.props = props;
    this.state = state;
  }

  abstract renderable(): Renderable;
  abstract updateProps(props: Props): void;
}

interface RaguComponentClass<Props, State> {
  new(props: Props, state: State): RaguComponent<Props, State>;
  propsToState?(props: Props): Promise<State>;
}

const stateFromProps = async <Props, State>(componentClass: RaguComponentClass<Props, State>, props: Props) => {
  try {
    return (await componentClass.propsToState?.(props)) as State;
  } catch (e) {
    throw new PropsToStateError(e);
  }
}

const componentFactory =  async <Props, State>(componentClass: RaguComponentClass<Props, State>, props: Props) => {
  const state = await stateFromProps(componentClass, props);
  return new componentClass(props, state);
}

export const serverRawHtml = async <Props, State>(componentClass: RaguComponentClass<Props, State>, props: Props) => {
  const component = await componentFactory(componentClass, props);
  try {
    return await component.renderable().serverSide();
  } catch (e) {
    throw new ComponentRenderError(e);
  }
}

export const clientSideComponentFactory = async <Props, State>(componentClass: RaguComponentClass<Props, State>, props: Props, element: HTMLElement): Promise<RaguComponent<Props, State>> => {
  componentLifecycleEvents.stateLoading(element);
  let raguComponent = await componentFactory(componentClass, props);
  componentLifecycleEvents.stateLoaded(element);
  return raguComponent;
}

export const clientSideConnect = async <Props, State>(component: RaguComponent<Props, State>, element: HTMLElement) => {
  try {
    await component.renderable().clientSide(element);
    componentLifecycleEvents.connected(element);
  } catch (e) {
    componentLifecycleEvents.renderError(element, e);
    throw new ComponentRenderError(e);
  }
}

export const triggerLifecycle = async <Props, State>(componentClass: RaguComponentClass<Props, State>, props: Props, element: HTMLElement): Promise<void> => {
  try {
    const component = await clientSideComponentFactory(componentClass, props, element);
    await clientSideConnect(component, element);
  } catch (e) {
    if (PropsToStateError.is(e)) {
      componentLifecycleEvents.stateLoadingFail(element, e.causedBy);
    }
    if (ComponentRenderError.is(e)) {
      componentLifecycleEvents.renderError(element, e.causedBy);
    }
    throw e;
  }
}
