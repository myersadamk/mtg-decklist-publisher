// TODO: This is a specific _type_ of decklist; an EDH decklist. An interface might be appropriate here, in case the functionality ever expands.
export default class DeckList {
  private readonly _isLegal: boolean;

  constructor(
    private readonly _uri: string,
    private readonly _mainboard: Array<string>,
    private readonly _commander?: string
  ) {
    this._isLegal = _commander !== undefined && _mainboard.length === 99;
  }

  get uri(): string {
    return this._uri;
  }

  get isLegal() {
    return this._isLegal;
  }

  get commander() {
    return this._commander;
  }

  get mainboard() {
    return this._mainboard
  }

  cards(): Array<string> {
    return [this._commander, ...this._mainboard];
  }

  static fromJSON(json: string) {
    const [uri, commander, cards] = JSON.parse(json);
    return new DeckList(uri, commander, cards);
  }
}

