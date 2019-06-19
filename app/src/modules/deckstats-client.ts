import DeckList from "./decklist";
import Bluebird from 'bluebird';
import * as Request from 'request-promise';

export default class ScreenScraper {
  readonly DECK_JSON_RE = RegExp('deck_json = (\{.*\});');

  downloadList(uri: string): Bluebird<DeckList> {
    return Request.get({uri: uri}).then(page => {
      const listJson = JSON.parse(this.DECK_JSON_RE.exec(page)[1]);

      let commander: string | null | undefined;
      let mainboard: string[] = [];
      let totalCount = 0;

      listJson.sections.forEach(section => {
        mainboard = section.cards
          .filter(card => card.isSideboard === false)
          .map(card => {
            if (card.isCommander) {
              commander = card.name;
            }
            totalCount += card.amount;
            return [card.name, card.amount]
          });
      });
      return new DeckList(uri, mainboard, commander);
    });
  };

  getDeckNames(): Bluebird<void> {
    // getDeckNames(): Bluebird<Array<String>> {
    const EDH_URI = 'http://deckstats.net/decks/f/edh-commander/?lng=en';
    const deckLinkPattern = new RegExp('https://deckstats.net/decks/[0-9]+/[0-9]+-.*', 'g');

    return Request.get({uri: EDH_URI}).then((page) => {
      const links = page.match(deckLinkPattern);
      const waitInterval = 30000;
      for (let i = 0; i < links.length; ++i) {
        setTimeout(() => this.downloadList(EDH_URI)
            .then(deckList => {
              console.log(deckList.getCommander());
              console.log(deckList.getCards());
            }),
          // .error(err => console.log(err)),
          waitInterval * i);
      }

    }).error((message) => console.log(`Failed to retrieve page ${EDH_URI} - ${message}`));
  }
}
