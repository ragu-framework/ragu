interface Props {
  name: string;
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
  render({name}: Props, element: HTMLElement) {
    element.innerHTML = `Hello, ${name}`
  }
}
