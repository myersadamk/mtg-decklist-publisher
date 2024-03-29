import DeckList from './decklist';
import DeckStatsScreenScraper from './deck-source/deckstats-dot-net/deckstats-client';

import * as Request from 'request-promise';
import * as FileSystem from 'fs';
import * as Path from 'path';

import Bluebird from 'bluebird';
import {RedisClient} from 'redis';

export default class DeckRepository {
  readonly screenScraper: DeckStatsScreenScraper;

  constructor(screenScraper: DeckStatsScreenScraper) {
    this.screenScraper = screenScraper;
  }

  savePageContentsLocally(uri: string, page: string): void {
    const filePath = Path.join('..', __dirname, 'temp', uri);
    if (FileSystem.existsSync(filePath)) {
      console.log(`deck ${uri} is already saved locally @ ${filePath}`);
      return;
    }

    FileSystem.writeFile(filePath, page, (error) => console.log('Failed to save file @ ' + filePath + ':\n' + error))
  };

  /**
   * Bypassing the for-loop to avoid triggering 429 during dev.
   */
  getFirstDeck(redisClient: RedisClient): Bluebird<void> {

    const EDH_URI = 'http://deckstats.net/decks/f/edh-commander/?lng=en';
    const deckLinkPattern = new RegExp('https://deckstats.net/decks/[0-9]+/[0-9]+-.*', 'g');

    return Request.get(({uri: EDH_URI})).then((page) => {
      const firstDeckUri = page.match(deckLinkPattern)[2];

      redisClient.get(firstDeckUri, (error, value) => {
        if (value === null) {
          console.log(`Deck ${firstDeckUri} was not previously persisted. Storing...`);

          this.screenScraper.downloadList(firstDeckUri)
            .then(deckList => {
              console.log(deckList.getUri());
              console.log(deckList.getCardCount());

              // savePageContentsLocally(firstDeckUri, page);

              redisClient.set(deckList.getUri(), JSON.stringify(deckList), error => {
                console.log(`Failed to save deck ${deckList.uri}!\n${error}`);
              });
            }).error(err => console.log(err));
        } else {
          console.log(`Deck ${firstDeckUri} was already persisted. Ignoring.`);
          redisClient.get(firstDeckUri, (error, value) => {
            const deckList = DeckList.fromJSON(value);
          });
        }
      });
    });
  };
}

// export {getDeckNames, getFirstDeck};
// module.exports = {getDeckNames, getFirstDeck};
