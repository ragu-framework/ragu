import Vue from "vue";

export interface VueHydrate<Props, State> {
  render: (props: Props, state: State) => Promise<Vue>
}

export const vueToRaguHydrate = <Props, State>({render}: VueHydrate<Props, State>) => async (el: HTMLElement, props: Props, state: State) => {
  const vueInstance = await render(props, state);

  vueInstance.$mount(el.firstChild as Element);
}
