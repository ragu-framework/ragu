import {sayHello} from "../../external-dependencies/dep";


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
  }
}
