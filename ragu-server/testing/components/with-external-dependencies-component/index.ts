import {sayHello} from "../../external-dependencies/dep";

interface Props {
  name: string;
}

export default {
  dependencies: [
    {
      'nodeRequire': '../../external-dependencies/dep',
      'globalVariable': 'MyExternalDependency',
      'dependency': 'http://localhost/blah/'
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
