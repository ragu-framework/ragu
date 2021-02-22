import nock from "nock";
import {FetchGateway} from "./fetch-gateway";
import 'cross-fetch/polyfill';


describe('FetchGateway', () => {
  it('returns a http response body', async () => {
    const body = {la: 'ok'};

    nock('http://www.example.com')
        .get('/micro.json')
        .reply(200, body)

    expect(await new FetchGateway().fetch('http://www.example.com/micro.json'))
        .toEqual(body);
  });

  it('throws an error given an error status code', async () => {
    const body = {la: 'ok'};

    nock('http://www.example.com')
        .get('/micro.json')
        .reply(404, body)

    await expect(new FetchGateway().fetch('http://www.example.com/micro.json'))
        .rejects.toBeTruthy();
  });
});
