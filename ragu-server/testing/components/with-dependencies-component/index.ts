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
  render(element: HTMLElement, {name}: Props) {
    element.innerHTML = sayHello(name)
  }
}
