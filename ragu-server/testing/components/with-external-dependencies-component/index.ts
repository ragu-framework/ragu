import {sayHello} from "../../external-dependencies/dep";

interface Props {
  name: string;
}

export default {
  dependencies: [
    {
      'require': '../../external-dependencies/dep',
      'replaceWith': 'window.MyExternalDependency',
      'from': 'http://localhost/blah/'
    }
  ],
  ssr({name}: Props) {
    return {
      state: {
        name,
        greetingType: 'Hello'
      },
      html: sayHello(name)
    }
  },
  render({name}: Props, element: HTMLElement) {
    element.innerHTML = sayHello(name)
  }
}
