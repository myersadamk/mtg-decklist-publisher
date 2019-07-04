import {Observable} from "rxjs";
import Axios from "axios-observable";
import {map} from "rxjs/operators";
import {AxiosResponse} from "axios";

export default interface HttpClient {
  get<T>(uri: string, handler?: HttpResponseHandler<T>): Observable<T>;
}

export interface HttpResponseHandler<T> {
  responseCode?(handler: (code: number) => void): boolean;
}

export class AxiosHttpClient implements HttpClient {
  get<T>(uri: string, handler?: HttpResponseHandler<T>): Observable<T> {
    return Axios.get(uri).pipe(
      map(response => {
        return response.data
      })
    );
  }
}
