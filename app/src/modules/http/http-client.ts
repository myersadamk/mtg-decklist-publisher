import {Observable} from "rxjs";
import Axios from "axios-observable";
import {map} from "rxjs/operators";

export default interface HttpClient {
  get<T>(uri: string, handler?: HttpResponseHandler<T>): Observable<T>;
}

export interface HttpResponseHandler<T> {
  responseCode?(code: number, text?: string): void;
}

export class HttpStatusCodeFailure extends Error {
  constructor(readonly status: number, readonly statusText?: string) {
    super(`Unexpected HTTP response: ${status}` + (statusText + '.') || '.');
  }
}

class DefaultHttpResponseHandler implements HttpResponseHandler<any> {
  responseCode(code: number, statusText?: string): void {
    if (code < 200 || code >= 300) {
      throw new Error(`Unexpected HTTP response: ${code}${statusText ? ': ' + statusText : ''}.`);
    }

    if (!code) {
      throw new Error('Did not receive a valid HTTP response status from client');
    }
  }
}

export class AxiosHttpClient implements HttpClient {
  get<T>(uri: string, handler: HttpResponseHandler<T> = new DefaultHttpResponseHandler()): Observable<T> {
    return Axios.get(uri).pipe(
      map(response => {
        if (handler.responseCode) {
          handler.responseCode(response.status, response.statusText);
        }
        return response.data
      })
    );
  }
}
