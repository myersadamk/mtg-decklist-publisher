import {AxiosHttpClient} from './http-client';
import Axios from "axios-observable";
import {of} from "rxjs";
import {AxiosResponse} from "axios";

jest.mock('axios-observable');
const axiosMock = Axios as jest.Mocked<typeof Axios>;

function fakeResponse(status: number, statusText?: string, headers?: Array<string>, data?: [], config?: {}): AxiosResponse<any> {
  return {
    status: status,
    statusText: statusText,
    headers: headers || [],
    data: data || [],
    config: config || {}
  }
}

function fakeUri(base: string, parameters?: Array<string>) {
  return base;
}


describe('The AxiosHttpClient', () => {
  describe('configured with defaults', () => {
    it('should return the response body when a 2xx response is returned', done => {
      [200, 201, 299]
        .map(successStatus => fakeResponse({status: successStatus, data: ['some things']})
        .forEach(response => {
          axiosMock.get.mockReturnValue(of(response));
          new http_client_1.AxiosHttpClient().get('/uri').subscribe({
            error: (thrown) => {
              expect(thrown.toString()).toContain(response.status);
              expect(thrown.toString()).toContain(response.statusText);
              done();
            },
            complete: () => {
              done.fail(new Error(`Did not received the expected error for HTTP status ${response.status} using the Default client.`));
            }
          });
        });
    });
    function fakeErrorResponse(errorStatus: number) {
      return fakeResponse(errorStatus, `An EXPECTED error occurred [erroStatus: ${errorStatus}], but the client failed to recognize it.`);
    }

    // const responses = [199, 200, 300].map((errorStatus) => fakeResponse(errorStatus, `'An EXPECTED error occurred with code [${errorStatus}]`));

    it('should throw an Error for non-200 responses', done => {
      [0, 99, 100, 101, 199, 300, 301, 399, 400, 401, 499, 500, 501, 599]
        .map(errorStatus => fakeResponse(
          errorStatus, `An EXPECTED error occurred [erroStatus: ${errorStatus}], but the client failed to recognize it`)
        )
        .forEach(response => {
          axiosMock.get.mockReturnValue(of(response));

          new AxiosHttpClient().get('/uri').subscribe({
            error: (thrown) => {
              expect(thrown.toString()).toContain(response.status);
              expect(thrown.toString()).toContain(response.statusText);
              done();
            },
            complete: () => {
              done.fail(new Error(`Did not received the expected error for HTTP status ${response.status} using the Default client.`));
            }
          });
        });
    });
  })
});
