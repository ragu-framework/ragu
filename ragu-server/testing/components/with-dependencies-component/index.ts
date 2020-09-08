import {sayHello} from "./dep";

interface Props {
  name: string;
}

export default {
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
