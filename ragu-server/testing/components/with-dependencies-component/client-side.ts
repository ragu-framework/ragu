import {sayHello} from "./dep";

interface Props {
  name: string;
}

export default {
  hydrate(element: HTMLElement, {name}: Props) {
    element.innerHTML = sayHello(name)
  }
}
