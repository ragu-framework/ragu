import * as React from "react";
import ReactDOM from 'react-dom'
import {renderToString} from 'react-dom/server';

interface Props {
  name: string;
}

class MyComponent extends React.Component<Props, Props> {
  state = {...this.props};

  render() {
    return <div>Hello, {this.state.name} <button onClick={this.changeNameToWorld.bind(this)}>call me world</button></div>
  }

  private changeNameToWorld() {
    this.setState({name: 'World'});
  }
}

export default {
  dependencies: [
    {
      nodeRequire: 'react',
      globalVariable: 'React',
      dependency: 'https://unpkg.com/react@16/umd/react.production.min.js'
    },
    {
      nodeRequire: 'react-dom',
      globalVariable: 'ReactDOM',
      dependency: 'https://unpkg.com/react-dom@16/umd/react-dom.production.min.js'
    },
    {
      nodeRequire: 'react-dom/server',
      globalVariable: 'ReactDOM',
      dependency: 'https://unpkg.com/react-dom@16/umd/react-dom.production.min.js'
    }
  ],
  render(props: Props) {
    return {
      state: {},
      html: renderToString(
          React.createElement(MyComponent, props)
      )
    }
  },
  hydrate(element: HTMLElement, props: Props) {
    ReactDOM.hydrate(<MyComponent name={props.name} />, element);
  }
}
