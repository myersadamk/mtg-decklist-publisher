import DeckList from "../decklist";

describe('basic', () => {
  it('should do the thing', () => {
    expect(0).toBe(0);
  });

  it('should frickin construct', () => {
    new DeckList('some deck', ['a card'])
  });
});