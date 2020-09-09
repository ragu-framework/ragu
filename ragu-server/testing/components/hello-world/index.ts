interface Props {
  name: string;
}

interface State {
  name: string;
  greetingType: string;
}

export default {
  dependencies: [
    {
      'nodeRequire': 'react',
      'globalVariable': 'React',
      'dependency': 'https://unpkg.com/react@16/umd/react.production.min.js'
    }
  ],
  ssr({name}: Props) {
    return {
      state: {
        name,
        greetingType: 'Hello'
      },
      html: `<b>Hello, ${name}</b>`
    }
  },
  render(element: HTMLElement, props: Props, state: State) {
    element.innerHTML = `${state.greetingType}, ${props.name}`
  }
}
