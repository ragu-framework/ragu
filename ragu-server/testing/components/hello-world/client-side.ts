interface Props {
  name: string;
}

interface State {
  name: string;
  greetingType: string;
}

export default {
  hydrate(element: HTMLElement, props: Props, state: State) {
    element.innerHTML = `${state.greetingType}, ${props.name}`
  }
}
