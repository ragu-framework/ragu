import * as React from "react";
import {createReactRaguComponent} from "../../ragu-react-helper";

interface Props {
  name: string;
}

const MyComponent = (props: Props) => <div>Hello, {props.name}</div>;

export default createReactRaguComponent<Props>(
    (props) => <MyComponent name={props.name} />
)
