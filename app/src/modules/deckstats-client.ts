import DeckList from "./decklist";
// import * as HTTP from 'request-promise-native';
import HTTP from 'axios-observable'
import {Observable, from, timer, defer, of, interval} from "rxjs";
import {concat, concatAll, concatMap, delay, delayWhen, flatMap, map, mergeAll, mergeMap, retryWhen, switchMap, take, tap} from "rxjs/operators";
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
      flatMap((pageContent: string) => {
        const deckPageUri = pageContent.match(ScreenScraper.DECK_LINK_RE);
        if (deckPageUri.length === 0) {
          throw new Error(`Failed to find expected deck list link elements at '${ScreenScraper.DECKSTATS_EDH_URI}'.`);
        }
        return deckPageUri;
      }),
      concatMap(uri => interval(3000).pipe(
        map(() => this.getDeckList(uri)))
      ),
      concatAll()
    );
  }

  private getDeckList(deckUri: string): Observable<DeckList> {
    return this._http.get(deckUri).pipe(
      map((pageContent: string) => {
        console.log('were doing it! ' + new Date());
        return ScreenScraper.parseDeckListJson(deckUri, JSON.parse(pageContent.match(ScreenScraper.DECK_JSON_RE)[0]));
      })
    );
  }

  private static parseDeckListJson(uri: string, deckListJson: any): DeckList {
    const deckJson = new DeckJson(deckListJson);
    return new DeckList(uri, deckJson.cardNames, deckJson.commanderName);
  }
}
