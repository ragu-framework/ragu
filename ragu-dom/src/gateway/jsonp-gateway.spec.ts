import {JsonpGateway} from "./jsonp-gateway";

describe('Ragu Gateway', () => {
  let raguGateway: JsonpGateway;
  const componentURL = 'http://localhost:3000/components/hello-world?name=World';


  beforeEach(() => {
    document.head.innerHTML = '';
    raguGateway = new JsonpGateway(document);
  });

  describe('fetching a component', () => {
    it('adds script to be fetched at the document', () => {
      raguGateway.fetchJsonp(componentURL);

      expect(document.querySelector('script')?.src).toContain(componentURL);
    });

    it('passes the callback function to url', () => {
      raguGateway.fetchJsonp(componentURL);

      const callback = document.querySelector('script')?.id?.replace('ragu_jsonp_script_', '');
      expect(document.querySelector('script')?.src).toContain("callback=raguJSONP_" + callback);
    });

    it('resolves the promise with the received callback', (done) => {
      const givenResponse = {hello: 'world'};

      raguGateway.fetchJsonp(componentURL).then((response) => {
        expect(response).toBe(givenResponse);
        expect((window as any)[callbackFunction]).toBeUndefined();
        expect(document.querySelector('script')).toBeNull();
        done();
      });

      const callback = document.querySelector('script')?.id?.replace('ragu_jsonp_script_', '');
      const callbackFunction = "raguJSONP_" + callback;

      (window as any)[callbackFunction](givenResponse);
    });

    it('rejects the promise with the received callback', (done) => {
      const givenResponse = 'error';

      const callback = document.querySelector('script')?.id?.replace('ragu_jsonp_script_', '');
      const callbackFunction = "raguJSONP_" + callback;

      raguGateway.fetchJsonp(componentURL).catch((response) => {
        expect(response).toBe(givenResponse);
        expect((window as any)[callbackFunction]).toBeUndefined();
        expect(document.querySelector('script')).toBeNull();
        done();
      });

      const script = document.querySelector('script');
      script?.onerror?.(givenResponse);
    });
  })
});
