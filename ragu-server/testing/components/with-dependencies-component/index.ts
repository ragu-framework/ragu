import {sayHello} from "./dep";

interface Props {
  name: string;
}

export default {
  render({name}: Props) {
    return {
      state: {
        name,
        greetingType: 'Hello'
      },
      html: sayHello(name)
    }
  },
  hydrate(element: HTMLElement, {name}: Props) {
    element.innerHTML = sayHello(name)
  }
}
