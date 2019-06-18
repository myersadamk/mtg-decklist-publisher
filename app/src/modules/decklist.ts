export class DeckList {
  private uri: String;
  readonly commander: String;
  readonly cards: Array<String>;

  constructor(uri: String, commander: String, cards: Array<String>) {
    this.uri = uri;
    this.commander = commander;
    this.cards = cards;
  }

  getCommander(): String {
    return this.commander;
  }

  getCards(): Array<String> {
    return this.cards
  }

  isLegal() {
    return this.commander !== undefined && this.cards.length === 99;
  }

  static fromJSON(json: String) {
    const deckList = JSON.parse(value);
    return new DeckList(deckList.uri, deckList.commander, deckList.cards);
  }
}

