export default class DeckList {
  readonly uri: string;
  readonly commander: string;
  readonly cards: Array<string>;

  constructor(uri: string, cards: Array<string>, commander?: string) {
    this.uri = uri;
    this.commander = commander;
    this.cards = cards;
  }

  getUri(): string {
    return this.uri;
  }

  getCommander(): string {
    return this.commander;
  }

  getCards(): Array<string> {
    return this.cards
  }

  getCardCount(): Number {
    return this.cards.length;
  }

  isLegal() {
    return this.commander !== undefined && this.cards.length === 99;
  }

  static fromJSON(json: string) {
    const deckList = JSON.parse(json);
    return new DeckList(deckList.uri, deckList.commander, deckList.cards);
  }
}

