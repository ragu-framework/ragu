interface Props {
  name: string;
}

interface State {
  name: string;
  greetingType: string;
}

export default {
  render({name}: Props) {
    return {
      state: {
        name,
        greetingType: 'Hello'
      },
      html: `<b>Hello from Catalog, ${name}</b>`
    }
  },
  hydrate(element: HTMLElement, props: Props, state: State) {
    element.innerHTML = `${state.greetingType} from Catalog, ${props.name}`
  }
}
