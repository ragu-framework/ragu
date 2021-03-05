import {TestPromiseController} from "../testing/test-promise-controller";
import {ScriptLoader} from "./gateway/script-loader";
import {DependencyContext} from "./dependency-context";

describe('DependencyContext', () => {
  let scriptLoadStub: jest.Mock;
  let testPromiseController: TestPromiseController<void>;

  class StubFileLoader extends ScriptLoader {
    constructor() {
      super();
    }

    load(src: string): Promise<void> {
      scriptLoadStub(src);
      return testPromiseController.promise;
    }
  }

  let dependencyContext: DependencyContext;

  beforeEach(() => {
    document.head.innerHTML = '';
    scriptLoadStub = jest.fn();
    testPromiseController = new TestPromiseController<void>();
    dependencyContext = new DependencyContext(new StubFileLoader());
  })

  it('fetches a single file', (done) => {
    dependencyContext.load({
      dependency: 'http://react.js/main.js',
    }).then(() => {
      expect(scriptLoadStub).toBeCalledWith('http://react.js/main.js');
      done();
    });

    testPromiseController.resolve();
  });

  it('does not calls fetches anything if globalVariable is already registered', (done) => {
    (window as any).React = {};

    dependencyContext.load({
      globalVariable: 'React',
      dependency: 'http://react.js/main.js',
    }).then(() => {
      delete (window as any).React;
      expect(scriptLoadStub).not.toBeCalled();
      done();
    });

    testPromiseController.resolve();
  });

  it('fetches multiples dependencies', (done) => {
    dependencyContext.load({
      dependency: 'http://react.js/main.production.js',
    });

    dependencyContext.load({
      dependency: 'http://react.js/main.dev.js',
    }).then(() => {
      expect(scriptLoadStub).toBeCalledTimes(2);
      done();
    });

    testPromiseController.resolve();
  });

  it('fetches the dependency only once given the same file', (done) => {
    dependencyContext.load({
      globalVariable: 'porto belo',
      dependency: 'http://react.js/main.js',
    });

    dependencyContext.load({
      globalVariable: 'white mushroom',
      dependency: 'http://react.js/main.js',
    }).then(() => {
      expect(scriptLoadStub).toBeCalledTimes(1);
      done();
    });

    testPromiseController.resolve();
  });

  it('fetches the dependency only once', (done) => {
    dependencyContext.load({
      globalVariable: 'white mushroom',
      dependency: 'http://react.js/main.production.js',
    });

    dependencyContext.load({
      globalVariable: 'white mushroom',
      dependency: 'http://react.js/main.dev.js',
    }).then(() => {
      expect(scriptLoadStub).toBeCalledTimes(1);
      done();
    });

    testPromiseController.resolve();
  });

  describe('fetching in order', () => {
    it('follows the fetch order', (done) => {
      dependencyContext.loadAll([
        {
          order: 2,
          globalVariable: 'shimeji mushroom',
          dependency: 'http://react.js/main.shimeji.js',
        },
        {
          globalVariable: 'shiitake',
          dependency: 'http://react.js/main.shiitake.js',
        },
        {
          order: 1,
          globalVariable: 'white mushroom',
          dependency: 'http://react.js/main.white.js',
        },
        {
          globalVariable: 'king oyster',
          dependency: 'http://react.js/main.oyster.js',
          order: 0
        },
      ]).then(() => {
        expect(scriptLoadStub).toHaveBeenNthCalledWith(1, 'http://react.js/main.shiitake.js');
        expect(scriptLoadStub).toHaveBeenNthCalledWith(2, 'http://react.js/main.oyster.js');
        expect(scriptLoadStub).toHaveBeenNthCalledWith(3, 'http://react.js/main.white.js');
        expect(scriptLoadStub).toHaveBeenNthCalledWith(4, 'http://react.js/main.shimeji.js');
        done();
      });

      testPromiseController.resolve();
    });
  });

  describe('loading styles', () => {
    it('awaits until style loads', async () => {
      const resolvedMock = jest.fn();
      dependencyContext.loadStyles(['http://my-style/main.css'])
          .then(() => {
            resolvedMock();
          });

      await new Promise<void>((resolve) => setImmediate(() => resolve()));

      expect(resolvedMock).not.toBeCalled();

      const querySelector = document.head.querySelector('link[href="http://my-style/main.css"]') as HTMLLinkElement;
      querySelector.onload?.({} as any);

      await new Promise<void>((resolve) => setImmediate(() => resolve()));

      expect(resolvedMock).toBeCalled();
    });

    it('skips duplication', async () => {
      const resolvedMock = jest.fn();
      dependencyContext.loadStyles([
          'http://my-style/main.css',
          'http://my-style/main.css'
      ]).then(() => {
        resolvedMock();
      });

      await new Promise<void>((resolve) => setImmediate(() => resolve()));

      expect(resolvedMock).not.toBeCalled();

      const querySelector = document.head.querySelector('link[href="http://my-style/main.css"]') as HTMLLinkElement;
      querySelector.onload?.({} as any);
      expect(document.head.querySelectorAll('link[href="http://my-style/main.css"]')).toHaveLength(1);
    });

    it('resolves when css load fails', async () => {
      const resolvedMock = jest.fn();
      dependencyContext.loadStyles(['http://my-style/main.css'])
          .then(() => {
            resolvedMock();
          });

      await new Promise<void>((resolve) => setImmediate(() => resolve()));

      expect(resolvedMock).not.toBeCalled();

      const querySelector = document.head.querySelector('link[href="http://my-style/main.css"]') as HTMLLinkElement;
      querySelector.onerror?.({} as any);

      await new Promise<void>((resolve) => setImmediate(() => resolve()));

      expect(resolvedMock).toBeCalled();
    });
  });
});
