import * as React from "react";
import {createReactRaguComponent} from "../../ragu-react-helper";

interface Props {
  name: string;
}

const MyComponent = (props: Props) => <div>Hello, {props.name}</div>;

export default createReactRaguComponent<Props>(
    (props) => {
      if (!props.name) {
        throw new Error('Give me a name');
      }
      return <MyComponent name={props.name}/>;
    }
)
