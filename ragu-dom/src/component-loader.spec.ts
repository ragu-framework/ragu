import {Component, ComponentLoader} from "./component-loader";
import {DependencyContext} from "./dependency-context";
import {ScriptLoader} from "./gateway/script-loader";
import {JsonpGateway} from "./gateway/jsonp-gateway";

describe('component loader', () => {
  afterEach(() => {
    document.head.innerHTML = '';
  });

  class StubJSONP extends JsonpGateway {
    constructor(readonly promise: Promise<any>, readonly componentURL: string) {
      super(document);
    }

    fetchJsonp<T>(componentURL: string): Promise<T> {
      expect(componentURL).toBe(this.componentURL);
      return this.promise;
    }
  }

  it('loads a basic component', (done) => {
    const componentResponse: Partial<Component<string, string>> = {
      state: 'la',
      client: 'http://my-squad.org/client.asijdoaidj.ja',
      html: 'Hello, World!',
      resolverFunction: 'myResolverStub'
    };

    new ComponentLoader({
      dependencyContext: new DependencyContext(
          new ScriptLoader()
      ),
      jsonpGateway: new StubJSONP(Promise.resolve(componentResponse), 'http://localhost:3000/components/hello-world?name=World')
    }).load('http://localhost:3000/components/hello-world?name=World')
        .then((component) => {
          expect(component).toEqual(expect.objectContaining(componentResponse));
          done();
        });
  });

  it('renders the component', async (done) => {
    const componentResponse: Partial<Component<string, string>> = {
      state: 'la',
      client: 'http://my-squad.org/client.asijdoaidj.ja',
      html: 'Hello, World!',
      resolverFunction: 'myResolverStub'
    };

    const component = await new ComponentLoader({
      dependencyContext: new DependencyContext(
          new ScriptLoader()
      ),
      jsonpGateway: new StubJSONP(Promise.resolve(componentResponse), 'http://localhost:3000/components/hello-world?name=World')
    }).load('http://localhost:3000/components/hello-world?name=World');

    (window as any)['myResolverStub'] = {
      resolve: async () => {
        return {
          async render(element: HTMLElement, props: string, state: string) {
            await new Promise((resolve) => {
              setImmediate(() => resolve());
            });
            element.innerHTML = `props: ${props}, state: ${state}`;
          }
        }
      }
    }

    component.render(document.body, 'hello', 'world')
        .then(() => {
          expect(document.body.textContent).toContain('props: hello, state: world');
          done();
        });

    await new Promise((resolve) => {
      setImmediate(() => resolve());
    });

    (document.querySelector('script[src="http://my-squad.org/client.asijdoaidj.ja"]') as HTMLScriptElement)
        .onload?.(null as any);
  });


  it('waits for dependencies before to render', async (done) => {
    const componentResponse: Partial<Component<string, string>> = {
      dependencies: [
          {
          dependency: "https://unpkg.com/react@16/umd/react.production.min.js"
        },
        {
          dependency: "https://unpkg.com/react@16/umd/react.development.min.js"
        }],
      state: 'la',
      client: 'http://my-squad.org/client.asijdoaidj.ja',
      html: 'Hello, World!',
      resolverFunction: 'myResolverStub'
    };

    let dependencyResolved = false;
    let clientResolved = false;

    const component = await new ComponentLoader({
      dependencyContext: new DependencyContext(
          new ScriptLoader()
      ),
      jsonpGateway: new StubJSONP(Promise.resolve(componentResponse), 'http://localhost:3000/components/hello-world?name=World')
    }).load('http://localhost:3000/components/hello-world?name=World');

    (window as any)['myResolverStub'] = {
      resolve: async () => {
        return {
          async render(element: HTMLElement, props: string, state: string) {
            element.innerHTML = `props: ${props}, state: ${state}`;
          }
        }
      }
    }

    component.render(document.body, 'hello', 'world')
        .then(() => {
          expect(clientResolved).toBeTruthy();
          expect(dependencyResolved).toBeTruthy();
          expect(document.body.textContent).toContain('props: hello, state: world');
          done();
        });

    await new Promise((resolve) => {
      setImmediate(() => resolve());
    });

    dependencyResolved = true;
    (document.querySelector('script[src="https://unpkg.com/react@16/umd/react.production.min.js"]') as HTMLScriptElement)
        .onload?.(null as any);
    (document.querySelector('script[src="https://unpkg.com/react@16/umd/react.development.min.js"]') as HTMLScriptElement)
        .onload?.(null as any);

    await new Promise((resolve) => {
      setImmediate(() => resolve());
    });

    clientResolved = true;
    (document.querySelector('script[src="http://my-squad.org/client.asijdoaidj.ja"]') as HTMLScriptElement)
        .onload?.(null as any);
  });
});