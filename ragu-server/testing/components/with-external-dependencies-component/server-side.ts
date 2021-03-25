import {sayHello} from "../../external-dependencies/dep";
import {ServerSideProps} from "../../../src/component";


interface Props {
  name: string;
}

export default {
  render ({params}: ServerSideProps<Props, {}>){
    return {
      state: {
        name: params.name,
        greetingType: 'Hello'
      },
      html: sayHello(params.name)
    }
  }
}
