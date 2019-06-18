import {DeckList} from "./decklist";
import * as Request from 'request-promise';

export class ScreenScraper {
  readonly DECK_JSON_RE = RegExp('deck_json = (\{.*\});');

  downloadList(uri: String): Promise<DeckList> {
    return Request(({uri: uri})).then(page => {
      const listJson = JSON.parse(this.DECK_JSON_RE.exec(page)[1]);

      let commander;
      let mainboard = [];
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
      return new DeckList(uri, commander, mainboard);
    });
  };

  getDeckNames(): Promise<Array<String>> {
    const EDH_URI = 'http://deckstats.net/decks/f/edh-commander/?lng=en';
    const deckLinkPattern = new RegExp('https://deckstats.net/decks/[0-9]+/[0-9]+-.*', 'g');

    return Request(({uri: EDH_URI})).then((page) => {
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
