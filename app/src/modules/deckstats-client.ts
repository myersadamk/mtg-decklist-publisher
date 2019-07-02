import DeckList from "./decklist";
// import * as HTTP from 'request-promise-native';
import HTTP from 'axios-observable'
import {Observable, from, timer, defer, of, interval} from "rxjs";
import {concat, concatAll, concatMap, delay, delayWhen, flatMap, map, mergeAll, mergeMap, retryWhen, take, tap} from "rxjs/operators";
import {AxiosResponse} from "axios";

// TODO: there is quite a bit of work here to get all the classes/abstractions right, if we allow that we may want
// to use other deck formats/better-typed card types. This is really just a prototype.
class DeckJson {
  private readonly _commander: CardJson;
  private readonly _cardNames: Array<string>;

  constructor(deckJson: any) {
    const cards: Array<CardJson> = deckJson.sections
      .flatMap((sectionJson: any) => sectionJson.cards)
      .map((cardJson: any) => new CardJson(cardJson));

    this._commander = cards.find(card => card.isCommander);
    this._cardNames = cards.filter((cardJson) => DeckJson.isMainboard(cardJson)).map((cardJson) => cardJson.name);
  }

  get commanderName() {
    if (this._commander) {
      return this._commander.name;
    }
    return undefined;
  }

  get cardNames() {
    return this._cardNames;
  }

  private static isMainboard(cardJson: CardJson): boolean {
    return !cardJson.isCommander && !cardJson.isMaybeboard && !cardJson.isSideboard && cardJson.valid;
  }
}

class CardJson {
  public readonly name: string;
  public readonly isCommander: boolean;
  public readonly isSideboard: boolean;
  public readonly isMaybeboard: boolean;
  public readonly valid: boolean;

  constructor(cardJson: object) {
    Object.assign(this, cardJson);
  }
}

export interface HttpClient {
  get<T>(uri: string, handler?: HttpResponseHandler<T>): Observable<T>;
}

export interface HttpResponseHandler<T> {
  responseCode?(handler: (code: number) => void): boolean;
}

export class AxiosHttpClient implements HttpClient {
  get<T>(uri: string, handler?: HttpResponseHandler<T>): Observable<T> {
    return HTTP.get(uri).pipe(
      map((response: AxiosResponse<T>) => {
        return response.data;
      })
    );
  }
}

// TODO: Probably an interface for this, as well, since there could conceivably be screen scrapers for different sites, and different deck data sources that
// are not necessarily screen scrapers (someday...).
export default class ScreenScraper {

  // TODO: Make URI configuration-driven.
  private static DECKSTATS_EDH_URI = 'http://deckstats.net/decks/f/edh-commander/?lng=en';
  private static DECK_LINK_RE = new RegExp('https://deckstats.net/decks/[0-9]+/[0-9]+-.*', 'g');
  private static DECK_JSON_RE = new RegExp('\{"sections.*(?=;)');

  constructor(private readonly _http: HttpClient) {
  }

  getDeckLists(): Observable<DeckList> {
    return this._http.get(ScreenScraper.DECKSTATS_EDH_URI).pipe(
      mergeMap((pageContent: string) => {
        const deckListLinks = pageContent.match(ScreenScraper.DECK_LINK_RE);

        if (deckListLinks.length === 0) {
          throw new Error(`No deck list links were found at URI ${ScreenScraper.DECKSTATS_EDH_URI}`);
        }

        return deckListLinks;
      }),
      flatMap(deckListUri => interval( 10000).pipe(map(() => deckListUri))),
      concatMap(deckListUri => this.getDeckList(deckListUri))

      // flatMap(deckListUri => this.getDeckList(deckListUri)),
      // mergeMap(uri => timer(0, 5000).pipe(take(1), map(() => uri)))
    )
  }

  //
  //
  // // return this._httpClient.get(ScreenScraper.DECKSTATS_EDH_URI).pipe(
  // return this._http.get(ScreenScraper.DECKSTATS_EDH_URI).pipe(
  //   map((pageContent: string) => {
  //       const deckListLinks = pageContent.match(ScreenScraper.DECK_LINK_RE);
  //
  //       if (deckListLinks.length === 0) {
  //         throw new Error(`No deck list links were found at URI ${ScreenScraper.DECKSTATS_EDH_URI}`);
  //       }
  //       // TODO: This should get _all_ decks, but there needs to be a setTimeout strategy here to prevent the server from locking us out for making too many
  //       // requests in a short period.
  //       // return of(deckListLinks.map(link => {
  //       //     console.log('made a call ehehehehe');
  //       //     return this.getDeckList(link).pipe(delay(1000))
  //       //   })
  //       // ).pipe(concatAll());
  //
  //       // const poll = of({}).pipe(
  //       //   mergeMap(_ => fakeDelayedRequest()),
  //       //   tap(display),
  //       //   delay(3000),
  //       //   repeat()
  //       // );
  //
  //       // of({}).pipe(
  //       //   mergeMap(_ =>  of(new Date()).pipe(delay(3000))),
  //       //   tap()
  //       // )
  //
  //     //   * const letters = of('a', 'b', 'c');
  //     // * const result = letters.pipe(
  //     //   *   mergeMap(x => interval(1000).pipe(map(i => x+i))),
  //     //   * );
  //
  //       return from(
  //         deckListLinks.map(link => {
  //           console.log('made a call ehehehehe');
  //           return this.getDeckList(link)
  //         })
  //       )
  //     }
  //   ), concatAll()
  // ).pipe(concatAll());

  // return from(HTTP.get({uri: ScreenScraper.DECKSTATS_EDH_URI}).then((pageContent: string) => {
  //     const deckListLinks = pageContent.match(ScreenScraper.DECK_LINK_RE);
  //
  //     if (deckListLinks.length === 0) {
  //       throw new Error(`No deck list links were found at URI ${ScreenScraper.DECKSTATS_EDH_URI}`);
  //     }
  //     // TODO: This should get _all_ decks, but there needs to be a setTimeout strategy here to prevent the server from locking us out for making too many
  //     // requests in a short period.
  //     return from(
  //       deckListLinks.map(link => this.getDeckList(link))
  //     ).pipe(concatAll());
  //   })
  // ).pipe(concatAll());

  getDeckList(deckUri: string): Observable<DeckList> {
    console.log('were doing it!');
    return this._http.get(deckUri).pipe(
      map((pageContent: string) => {
        return ScreenScraper.parseDeckListJson(deckUri, JSON.parse(pageContent.match(ScreenScraper.DECK_JSON_RE)[0]));
      })
    );
  }

  private static parseDeckListJson(uri: string, deckListJson: any): DeckList {
    const deckJson = new DeckJson(deckListJson);
    return new DeckList(uri, deckJson.cardNames, deckJson.commanderName);
  }
}
