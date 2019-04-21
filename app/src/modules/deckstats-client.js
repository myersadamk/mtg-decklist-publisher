const request = require('request-promise');
// const cheerio = require('cheerio');
// const { JSDOM } = require('jsdom');


const DECK_JSON_RE = RegExp('deck_json = (\{.*\});');

class DeckList {
  constructor(uri, commander, cards, totalCount) {
    this.uri = uri;
    this.commander = commander;
    this.cards = cards;
    this.totalCount = totalCount;
  }

  isLegal() {
    return this.commander !== undefined && this.totalCount === 99;
  }
}

const downloadList = uri => {
  return request(({uri: uri})).then(page => {
    const listJson = JSON.parse(DECK_JSON_RE.exec(page)[1]);

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
      // .flatMap(cardAndCount => cardAndCount);
      // console.log(commander);
      // console.log(...mainboard);
      // console.log(totalCount);
    });
    return new DeckList(uri, commander, mainboard, totalCount);
    // console.log(ree.exec(page));
    // console.log(page.match('deck_json = (\{.*\});'));
    // console.log(page.toString().match('deck_json = \{.*\}'));
    // const dom = new JSDOM(page);

    // fs.writeFile('temp.txt', page, (err) => console.log('oh noes!1' + err));
    // console.log(page)
    // const wh = dom.window.document.querySelector("div[data-group-section='Main']");
    // console.log(wh)
    // // dom.querySelectorAll("div[data-group-section='Main']").forEach(e => console.log(e));
    //
    // // const button = dom.window.document.querySelector('#download_deck_dialog > button:nth-child(4)');
    // // button.click();
    // console.log('then...');
    // const $ = cheerio.load(page);
    // const button = $('#download_deck_dialog > button:nth-child(4)');
    // console.log(button);
    // button.click();
  });
};

const getDeckNames = () => {
  const EDH_URI = 'http://deckstats.net/decks/f/edh-commander/?lng=en';
  const deckLinkPattern = new RegExp('https://deckstats.net/decks/[0-9]+/[0-9]+-.*', 'g');

  request(({uri: EDH_URI})).then((page) => {
    // console.log(page.match(deckLinkPattern));

    // downloadList(page.match(deckLinkPattern)[0]).then(deckList => {
    //   console.log(deckList.uri);
    //   console.log(deckList.totalCount);
    // }).error(err => console.log(err));

    // page.match(deckLinkPattern)[0].forEach(link => {
    //   setInterval(downloadList(link), 50000);
    // }).then(deckList => {
    //   console.log(deckList.uri);
    //   console.log(deckList.totalCount);
    // }).error(err => console.log(err));

    const links = page.match(deckLinkPattern);
    const waitInterval = 30000;
    for (let i = 0; i < links.length; ++i) {
      setTimeout(() => downloadList(link)
          .then(deckList => {
            console.log(deckList.uri);
            console.log(deckList.totalCount);
          })
          .error(err => console.log(err)),
        waitInterval * i);
    }

    // page.match(deckLinkPattern).forEach(link => {
    //   setTimeout(() => downloadList(link)
    //       .then(deckList => {
    //         console.log(deckList.uri);
    //         console.log(deckList.totalCount);
    //       })
    //       .error(err => console.log(err)),
    //     30000);
    // });

    // console.log(page);
    // const $ = cheerio.load(page);
    // // http.get(EDH_URI, (page) => {
    // tableparser($);
    // const decks = $(DECK_SEARCH_TABLE_SELECTOR).parsetable();
    // // .children()[0].children.forEach(child => {
    // //   console.log(child)
    // // });
    // console.log(lol);
    // console.log(typeof lol);
  }).error((message) => console.log(`Failed to retrieve page ${EDH_URI} - ${message}`));
};

module.exports = getDeckNames;
