import {Component} from "./component-loader";
import {registerRaguComponent} from "./ragu-custom-element";

describe('when loading fails', () => {
  const error = new Error('Error!');

  class StubLoader {
    async load<P, S, T extends Component<P, S>>(): Promise<T> {
      return Promise.reject(error)
    }
  }

  it('sends a fail message with the error when load fails', (done) => {
    registerRaguComponent(new StubLoader() as any)

    const componentURL = 'http://my-squad.org/component/any-component';
    document.body.innerHTML = `<ragu-component src="${componentURL}"></ragu-component>`
    expect(document.querySelector('ragu-component')?.innerHTML).toEqual('');

    // @ts-ignore
    document.querySelector('ragu-component').addEventListener('ragu:fetch-fail', (e: CustomEvent) => {
      expect(e.detail).toEqual(error);
      done();
    });
  });
});
