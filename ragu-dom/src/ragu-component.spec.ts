import {Component, ComponentLoader} from "..";
import {TestPromiseController} from "../testing/test-promise-controller";
import {registerRaguComponent} from "..";
import waitForExpect from "wait-for-expect";

async function waitForPromises() {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 10));
}

describe('Rendering a component', () => {
  describe('when loading a component', () => {
    let controlledPromise: TestPromiseController<unknown & Component<any, any>>;
    let loadStub: jest.Mock;

    let hydrationPromise: TestPromiseController<unknown & Component<any, any>>;
    let hydrationStub: jest.Mock;

    class StubLoader {
      async load<P, S, T extends Component<P, S>>(componentUrl: string): Promise<T> {
        loadStub(componentUrl);
        return controlledPromise.promise as any;
      }

      async hydrationFactory<T  extends Component<P, S>, P, S>(componentResponse: T) {
        hydrationStub(componentResponse);
        return hydrationPromise.promise as any;
      }
    }

    beforeAll(() => {
      registerRaguComponent(new StubLoader() as ComponentLoader)
    });

    beforeEach(() => {
      controlledPromise = new TestPromiseController<Component<any, any>>();
      loadStub = jest.fn();
      hydrationPromise = new TestPromiseController<Component<any, any>>();
      hydrationStub = jest.fn();
    });

    it('ignores the undefined html', async () => {
      const componentURL = 'http://my-squad.org/component/any-component';
      document.body.innerHTML = `<ragu-component src="${componentURL}"></ragu-component>`
      document.dispatchEvent(new CustomEvent('DOMContentLoaded'));
      expect(document.querySelector('ragu-component')?.innerHTML).toEqual('');

      const fetchedStub = jest.fn();
      const hydrateStub = jest.fn();

      // @ts-ignore
      document.querySelector('ragu-component').addEventListener('ragu:fetched', (e: CustomEvent) => {
        fetchedStub(e.detail)
      });

      // @ts-ignore
      document.querySelector('ragu-component').addEventListener('ragu:hydrated', (e: CustomEvent) => {
        hydrateStub(e.detail)
      });

      const renderPromise = new TestPromiseController();

      const componentResponse: Component<any, any> = {
        resolverFunction: 'la',
        state: {
          from: 'Server'
        },
        props: {
          name: 'World'
        },
        client: 'client_url',
        async render (element) {
          await renderPromise.promise;
          element.innerHTML = `Hello from ${this.state.from}, ${this.props.name}`
        }
      };

      controlledPromise.resolve(componentResponse);

      await waitForPromises();
      expect(document.querySelector('ragu-component')?.innerHTML).toEqual('');
    });

    it('hydrates a component', async () => {
      const componentURL = 'http://my-squad.org/component/any-component';
      document.body.innerHTML = `<ragu-component src="${componentURL}"></ragu-component>`;
      document.dispatchEvent(new CustomEvent('DOMContentLoaded'));

      expect(document.querySelector('ragu-component')?.innerHTML).toEqual('');

      const fetchedStub = jest.fn();
      const hydrateStub = jest.fn();

      // @ts-ignore
      document.querySelector('ragu-component').addEventListener('ragu:fetched', (e: CustomEvent) => {
        fetchedStub(e.detail)
      });

      // @ts-ignore
      document.querySelector('ragu-component').addEventListener('ragu:hydrated', (e: CustomEvent) => {
        hydrateStub(e.detail)
      });

      const renderPromise = new TestPromiseController();

      const componentResponse: Component<any, any> = {
        resolverFunction: 'la',
        state: {
          from: 'Server'
        },
        props: {
          name: 'World'
        },
        client: 'client_url',
        html: 'Hello, World',
        async render (element) {
          await renderPromise.promise;
          element.innerHTML = `Hello from ${this.state.from}, ${this.props.name}`
        }
      };

      controlledPromise.resolve(componentResponse);

      await waitForPromises();
      expect(fetchedStub).toBeCalledWith(componentResponse);
      expect(hydrateStub).not.toBeCalled();
      expect(loadStub).toBeCalledWith(componentURL);
      expect(document.querySelector('ragu-component')?.innerHTML).toEqual('Hello, World');

      renderPromise.resolve();

      await waitForPromises();
      expect(document.querySelector('ragu-component')?.innerHTML).toEqual('Hello from Server, World');
      expect(loadStub).toBeCalledTimes(1);
      expect(hydrateStub).toBeCalledWith(componentResponse);
    });

    it('removes the previous html given an empty html response', async () => {
      const componentURL = 'http://my-squad.org/component/any-component';
      document.body.innerHTML = `<ragu-component src="${componentURL}">My previous content</ragu-component>`;
      document.dispatchEvent(new CustomEvent('DOMContentLoaded'));

      const componentResponse: Component<any, any> = {
        resolverFunction: 'la',
        state: {
          from: 'Server'
        },
        props: {
          name: 'World'
        },
        client: 'client_url',
        async render () {
        }
      };

      controlledPromise.resolve(componentResponse);

      await waitForPromises();
      expect(document.querySelector('ragu-component')?.innerHTML).toEqual('');
    });

    it('updates the content after a src change', async () => {
      const componentURL = 'http://my-squad.org/component/any-component';
      document.body.innerHTML = `<ragu-component src="${componentURL}"></ragu-component>`
      document.dispatchEvent(new CustomEvent('DOMContentLoaded'));

      expect(document.querySelector('ragu-component')?.innerHTML).toEqual('');

      const renderPromise = new TestPromiseController();
      const disconnectStub = jest.fn();

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
        async render (element) {
          await renderPromise.promise;
          element.innerHTML = `Hello from ${this.state.from}, ${this.props.name}`
        },
        disconnect: disconnectStub
      });

      await waitForPromises();
      renderPromise.resolve();

      const component = document.querySelector('ragu-component') as HTMLElement;
      await waitForExpect(() => {
        expect(component.innerHTML).toEqual('Hello from Server, World');
        expect(disconnectStub).not.toBeCalled();
      });

      component.setAttribute('src', 'http://my-squad.org/component/other-component');

      await waitForExpect(() => {
        expect(loadStub).toBeCalledWith('http://my-squad.org/component/other-component');
        expect(disconnectStub).toBeCalled();
      })
    });

    it('disconnect when component is removed from dom', async () => {
      const componentURL = 'http://my-squad.org/component/any-component';
      document.body.innerHTML = `<ragu-component src="${componentURL}"></ragu-component>`;
      document.dispatchEvent(new CustomEvent('DOMContentLoaded'));
      expect(document.querySelector('ragu-component')?.innerHTML).toEqual('');

      const renderPromise = new TestPromiseController();
      const disconnectStub = jest.fn();

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
        async render (element) {
          await renderPromise.promise;
          element.innerHTML = `Hello from ${this.state.from}, ${this.props.name}`
        },
        disconnect: disconnectStub
      });

      await waitForPromises();
      renderPromise.resolve();

      const component = document.querySelector('ragu-component') as HTMLElement;
      component.remove();

      await waitForExpect(() => {
        expect(disconnectStub).toBeCalledWith(component);
      });
    });

    describe('When SSR', () => {
      it('renders a component', async () => {
        const serverData = {
          resolverFunction: 'la',
          state: {
            from: 'Server'
          },
          props: {
            name: 'World'
          },
          client: 'client_url'
        };

        const componentURL = 'http://my-squad.org/component/any-component';
        const scriptTag = `<script data-ragu-ssr type="application/json">${JSON.stringify(serverData)}</script>`;
        const bodyHtml = `<div>Hello, World</div>`;

        document.body.innerHTML = `<ragu-component src="${componentURL}">${scriptTag}${bodyHtml}</ragu-component>`

        const renderPromise = new TestPromiseController();

        hydrationPromise.resolve({
          ...serverData,
          async render (element) {
            await renderPromise.promise;
            // @ts-ignore
            element.querySelector('div').innerHTML = `Hello from ${this.state.from}, ${this.props.name}`
          }
        });

        renderPromise.resolve();

        await waitForExpect(() => {
          expect(hydrationStub).toBeCalledTimes(1);
          expect(hydrationStub).toHaveBeenCalledWith({
            ...serverData,
            html: bodyHtml
          })
          expect(loadStub).toBeCalledTimes(0);

          expect(document.querySelector('ragu-component')?.textContent).toContain('Hello from Server, World');

          expect(document.querySelector('script')).toBeNull();
        });
      });
    });
  });
});
