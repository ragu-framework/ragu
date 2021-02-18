import {sayHello} from "../../external-dependencies/dep";
import jQuery from 'jquery';


interface Props {
  name: string;
}

export default {
  hydrate(element: HTMLElement, {name}: Props) {
    element.innerHTML = sayHello(name);
    jQuery(element).on('click', () => alert(`hi, ${name}`));
  }
}
