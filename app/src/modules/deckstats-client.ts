import DeckList from "./decklist";
import * as Request from 'request-promise-native';

class MainBoard {
  public readonly cards: Card[] = [];

  constructor(sectionJson: any) {
    const isCommander = sectionJson.name === 'Commander';
    sectionJson.cards.forEach((card: any) => {
      this.cards.push(new Card(card.name, card.amount, isCommander));
    });
  };
}

class Card {
  constructor(public readonly name: string, public readonly quantity: number, public readonly isCommander: boolean) {
  };
}

export default class ScreenScraper {

  private static DECKSTATS_EDH_URI = 'http://deckstats.net/decks/f/edh-commander/?lng=en';
  private static DECK_LINK_RE = new RegExp('https://deckstats.net/decks/[0-9]+/[0-9]+-.*', 'g');
  private static DECK_JSON_RE = RegExp('deck_json = (\{.*\});');

  constructor(private readonly downloadDeckLists: boolean = false) {
  }

  async getDeckNames(): Promise<DeckList> {
    return Request.get({uri: ScreenScraper.DECKSTATS_EDH_URI}).then((page: string) => {
      const deckListLinks = page.match(ScreenScraper.DECK_LINK_RE);

      const lol: string = 'https://deckstats.net/decks/2656/322680-blue-white-awaken-things-edh/en';
      return this.getDeckList(lol);
      // return page;
    });
  }

  private async getDeckList(deckUri: string): Promise<DeckList> {
    return Request.get({uri: deckUri}).then((page: string) => {
      return this.parseDeckListJson(deckUri, JSON.parse(page.match(ScreenScraper.DECK_JSON_RE)[1]));
    });
  }

  private parseDeckListJson(uri: string, deckListJson: any): DeckList {
    console.log(uri);
    let commander: string | null | undefined;
    let totalCount = 0;

    const mainboard: any[] | [] = deckListJson.sections
      .map((section: any) => new MainBoard(section))
      .flatMap((section: MainBoard) => section.cards)
      .forEach((card: Card) => console.log(card));

    return new DeckList(uri, mainboard, commander);
  }
}
