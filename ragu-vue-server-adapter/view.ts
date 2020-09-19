import Vue from "vue";
import * as vueServerRenderer from "vue-server-renderer";

export interface VueRenderer<Props, State> {
  propsToState: (props: Props) => Promise<State>;
  render: (props: Props, state: State) => Promise<Vue>
}

export const vueToRaguRender = <Props, State>({propsToState, render}: VueRenderer<Props, State>) => async (props: Props) => {
  const state = await propsToState(props);
  const vueInstance = await render(props, state);

  const renderer = vueServerRenderer.createRenderer();

  return {
    state: state,
    html: await renderer.renderToString(vueInstance)
  }
}
