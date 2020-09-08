import {ScriptLoader} from "./script-loader";

describe('fetch script', () => {
  const componentURL = 'http://localhost:3000/components/hello-world?name=World';
  const scriptLoader = new ScriptLoader();

  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('adds a script to the head', () => {
    scriptLoader.load(componentURL);
    expect(document.querySelector('script')?.src).toContain(componentURL);
  });

  it('resolves when script is loaded', (done) => {
    scriptLoader.load(componentURL).then(() => done());
    document.querySelector('script')?.onload?.({} as any);
  });

  it('rejects when script load fails', (done) => {
    const error = 'bla';

    scriptLoader.load(componentURL).catch((receivedError) => {
      expect(receivedError).toBe(error);
      return done();
    });

    document.querySelector('script')?.onerror?.(error);
  });
});
