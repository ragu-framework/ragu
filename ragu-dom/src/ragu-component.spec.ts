import {Component, ComponentLoader} from "./component-loader";
import {TestPromiseController} from "../testing/test-promise-controller";
import {registerRaguComponent} from "./ragu-component";

async function waitForPromises() {
  await new Promise((resolve) => setImmediate(() => resolve()));
}

describe('Rendering a component', () => {
  let controlledPromise: TestPromiseController<unknown & Component<any, any>>;
  let loadStub: jest.Mock;

  class StubLoader {
    async load<P, S, T extends Component<P, S>>(componentUrl: string): Promise<T> {
      loadStub(componentUrl);
      return controlledPromise.promise as any;
    }
  }

  beforeAll(() => {
    registerRaguComponent(new StubLoader() as ComponentLoader)
  });

  beforeEach(() => {
    controlledPromise = new TestPromiseController<Component<any, any>>();
    loadStub = jest.fn();
  });

  it('renders a component', async () => {
    const componentURL = 'http://my-squad.org/component/any-component';
    document.body.innerHTML = `<ragu-component src="${componentURL}"></ragu-component>`
    expect(document.querySelector('ragu-component')?.innerHTML).toEqual('');

    const renderPromise = new TestPromiseController();

    controlledPromise.resolve({
      resolverFunction: 'la',
      state: {
        from: 'Server'
      },
      props: {
        name: 'World'
      },
      client: 'client_url',
      html: 'Hello, World',
      hydrate: async  (element, {name}, {from}) => {
        await renderPromise.promise;
        element.innerHTML = `Hello from ${from}, ${name}`
      }
    });

    await waitForPromises();
    expect(loadStub).toBeCalledWith(componentURL);
    expect(document.querySelector('ragu-component')?.innerHTML).toEqual('Hello, World');

    renderPromise.resolve();

    await waitForPromises();
    expect(document.querySelector('ragu-component')?.innerHTML).toEqual('Hello from Server, World');
    expect(loadStub).toBeCalledTimes(1);
  });

  it('updates the content after a src change', async () => {
    const componentURL = 'http://my-squad.org/component/any-component';
    document.body.innerHTML = `<ragu-component src="${componentURL}"></ragu-component>`
    expect(document.querySelector('ragu-component')?.innerHTML).toEqual('');

    const renderPromise = new TestPromiseController();

    controlledPromise.resolve({
      resolverFunction: 'la',
      state: {
        from: 'Server'
      },
      props: {
        name: 'World'
      },
      client: 'client_url',
      html: 'Hello, World',
      hydrate: async  (element, {name}, {from}) => {
        await renderPromise.promise;
        element.innerHTML = `Hello from ${from}, ${name}`
      }
    });

    await waitForPromises();
    renderPromise.resolve();
    await waitForPromises();

    const component = document.querySelector('ragu-component') as HTMLElement;
    expect(component.innerHTML).toEqual('Hello from Server, World');

    component.setAttribute('src', 'http://my-squad.org/component/other-component');
    expect(loadStub).toBeCalledWith('http://my-squad.org/component/other-component');
  });
});
