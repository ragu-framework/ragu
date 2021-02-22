import {parseURL} from "./url-parser";

describe('url-parser', () => {
  it('parses an url', () => {
    const url = 'https://domin.com';

    expect(parseURL(url)).toEqual({
      url,
      extension: undefined,
      props: {}
    });
  });

  it('parses props without extensions', () => {
    const url = 'https://domin.com?a=b';

    expect(parseURL(url)).toEqual({
      url,
      extension: undefined,
      props: {
        a: 'b'
      }
    });
  });

  it('parses an url', () => {
    const url = 'https://domin.com/components/my-component/';

    expect(parseURL(url)).toEqual({
      url,
      extension: undefined,
      props: {}
    });
  });

  it('parses an extension', () => {
    const url = 'https://domin.com/components/my-component.json';

    expect(parseURL(url)).toEqual({
      url,
      extension: 'json',
      props: {}
    });
  });

  it('parses query params', () => {
    const url = 'https://domin.com/components/my-component.json?a=a.b';

    expect(parseURL(url)).toEqual({
      url,
      extension: 'json',
      props: {
        a: 'a.b'
      }
    });
  });
});
