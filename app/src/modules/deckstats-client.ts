import DeckList from "./decklist";
import * as HTTP from 'request-promise-native';
import {Observable, from} from "rxjs";
import {concat, concatAll, mergeAll} from "rxjs/operators";

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

// TODO: Probably an interface for this, as well, since there could conceivably be screen scrapers for different sites, and different deck data sources that
// are not necessarily screen scrapers (someday...).
export default class ScreenScraper {

  // TODO: Make URI configuration-driven.
  private static DECKSTATS_EDH_URI = 'http://deckstats.net/decks/f/edh-commander/?lng=en';
  private static DECK_LINK_RE = new RegExp('https://deckstats.net/decks/[0-9]+/[0-9]+-.*', 'g');
  private static DECK_JSON_RE = new RegExp('\{"sections.*(?=;)');

  getDeckLists(): Observable<DeckList> {
    return from(HTTP.get({uri: ScreenScraper.DECKSTATS_EDH_URI}).then((pageContent: string) => {
      const deckListLinks = pageContent.match(ScreenScraper.DECK_LINK_RE);

      if (deckListLinks.length === 0) {
        throw new Error(`No deck list links were found at URI ${ScreenScraper.DECKSTATS_EDH_URI}`);
      }
      // TODO: This should get _all_ decks, but there needs to be a setTimeout strategy here to prevent the server from locking us out for making too many
      // requests in a short period.

      return from(deckListLinks.map(link => this.getDeckList(link))).pipe(concatAll());
    })).pipe(concatAll());
  }

  private async getDeckList(deckUri: string): Promise<DeckList> {
    return HTTP.get({uri: deckUri}).then((page: string) => {
      return ScreenScraper.parseDeckListJson(deckUri, JSON.parse(page.match(ScreenScraper.DECK_JSON_RE)[0]));
    });
  }

  private static parseDeckListJson(uri: string, deckListJson: any): DeckList {
    const deckJson = new DeckJson(deckListJson);
    return new DeckList(uri, deckJson.cardNames, deckJson.commanderName);
  }
}
