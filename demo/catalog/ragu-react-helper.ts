import {renderToString} from "react-dom/server";
import ReactDOM from "react-dom";
import {ReactElement} from "react";

export type ComponentRender<Props> = (props: Props) => ReactElement;

export const createReactRaguComponent = <Props>(componentRender: ComponentRender<Props>) => ({
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
      html: renderToString(componentRender(props))
    }
  },
  hydrate(element: HTMLElement, props: Props) {
    ReactDOM.hydrate(componentRender(props), element);
  }
})
