import ScreenScraper, {AxiosHttpClient, HttpClient} from "../deckstats-client";
import DeckList from "../decklist";
import {delay, take} from 'rxjs/operators'
import {of, timer} from "rxjs";
import any = jasmine.any;

/**
 * Integration-style tests that actuall hit the DeckStats webpage, but don't utilize a Redis instance for persistent
 * storage. These really just test the ScreenScraper doesn't blow up, e.g. the page is formatted as expected.
 */
describe('When retrieving from the DeckStats page for reals', () => {
  const scraper = new ScreenScraper(new AxiosHttpClient);
  // const fiveSecondsInMillis = 5000;
  const fiveSecondsInMillis = 50000;

  it('should be able to parse locate at least one deck list', (done) => {
    scraper.getDeckLists().pipe(take(2)).subscribe({
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
//   const scraper = new ScreenScraper(mockHttpClient);
//   // const fiveSecondsInMillis = 5000;
//   const fiveSecondsInMillis = 50000;
//
//   it('should wait inbetween HTTP requests', (done) => {
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
