import {sayHello} from "../../external-dependencies/dep";
import jQuery from 'jquery';


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
    element.innerHTML = sayHello(name);
    jQuery(element).on('click', () => alert(`hi, ${name}`));
  }
}
