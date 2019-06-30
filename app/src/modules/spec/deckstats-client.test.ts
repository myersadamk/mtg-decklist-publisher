import ScreenScraper from "../deckstats-client";
import DeckList from "../decklist";

describe('printing thangs', () => {
  it('should do the thing', async () => {
    // expect(0).toBe(0);
    await (new ScreenScraper().getDeckNames()).then((deckList: DeckList) => {
      console.log(deckList.cards);
    });
  }, 10000);
});
