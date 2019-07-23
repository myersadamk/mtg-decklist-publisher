import {take} from 'rxjs/operators'
import DeckStatsScreenScraper from "../deckstats-client";
import {AxiosHttpClient} from "../../../http/http-client";

/**
 * Integration-style tests that actuall hit the DeckStats webpage, but don't utilize a Redis instance for persistent
 * storage. These really just test the DeckStatsScreenScraper doesn't blow up, e.g. the page is formatted as expected.
 */
xdescribe('When retrieving from the DeckStats page for reals', () => {
  const scraper = new DeckStatsScreenScraper(new AxiosHttpClient());
  // const fiveSecondsInMillis = 5000;
  const fiveSecondsInMillis = 50000;

  it('should be able to parse locate at least one deck list', (done) => {
    scraper.getDecks().pipe(take(2)).subscribe({
      next: (deckList) => {
        expect(deckList.mainboard.length).toBeDefined();
        expect(deckList.uri.length).toBeDefined();
        expect(deckList.uri.length).toBeGreaterThan(0);
        expect([true, false]).toContain(deckList.isLegal);
        console.log(deckList)
      },
      complete: () => done()
    });
  }, fiveSecondsInMillis);
});

// describe('When mocking DeckStats', () => {
//   const mockHttpClient: HttpClient = {
//     get: jest.fn()
//   };
//   const scraper = new DeckStatsScreenScraper(mockHttpClient);
//   // const fiveSecondsInMillis = 5000;
//   const fiveSecondsInMillis = 50000;
//
//   it('should wait inbetween Axios requests', (done) => {
//     mockHttpClient.get(any()).thenReturn({data: '{}'});
//     scraper.getDeckLists().subscribe({
//       next: (deckList) => {
//         expect(deckList.mainboard.length).toBeDefined();
//         expect(deckList.uri.length).toBeDefined();
//         expect(deckList.uri.length).toBeGreaterThan(0);
//         expect([true, false]).toContain(deckList.isLegal);
//         console.log(deckList)
//       },
//       complete: () => done()
//     });
//   }, fiveSecondsInMillis);
// });
