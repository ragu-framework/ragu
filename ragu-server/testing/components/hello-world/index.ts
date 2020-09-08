interface Props {
  name: string;
}

export default {
  dependencies: [
    {
      'require': 'react',
      'replaceWith': 'React',
      'from': 'https://unpkg.com/react@16/umd/react.production.min.js'
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
