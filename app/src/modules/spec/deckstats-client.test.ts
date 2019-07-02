import ScreenScraper from "../deckstats-client";
import DeckList from "../decklist";

/**
 * Integration-style tests that actuall hit the DeckStats webpage, but don't utilize a Redis instance for persistent
 * storage. These really just test the ScreenScraper doesn't blow up, e.g. the page is formatted as expected.
 */
describe('When retrieving from the DeckStats', () => {
  const scraper = new ScreenScraper();
  const fiveSecondsInMillis = 5000;

  it('should be able to parse locate at least one deck list', async () => {
    // expect(0).toBe(0);
    await scraper.getDeckLists().then((deckList: DeckList) => {
      expect(deckList.mainboard.length).toBeDefined();
      expect(deckList.uri.length).toBeDefined();
      expect(deckList.uri.length).toBeGreaterThan(0);
      expect([true, false]).toContain(deckList.isLegal);
      console.log(deckList);
    });
  }, fiveSecondsInMillis);
});
