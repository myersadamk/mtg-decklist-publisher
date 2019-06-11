var request = require('request-promise');
// const cheerio = require('cheerio');
// const { JSDOM } = require('jsdom');
var DECK_JSON_RE = RegExp('deck_json = (\{.*\});');
var DeckList = /** @class */ (function () {
    function DeckList(uri, commander, totalCount, cards, options) {
        if (options === void 0) { options = { verbose: true }; }
        this.uri = uri;
        this.commander = commander;
        this.totalCount = totalCount;
        this.cards = cards;
        this.options = options;
        if (this.options.verbose) {
            console.debug('Constructed DeckList:\n' + this);
        }
    }
    DeckList.prototype.isLegal = function () {
        return this.commander !== undefined && this.totalCount === 99;
    };
    DeckList.fromJSON = function (json) {
        var deckList = JSON.parse(value);
        return new DeckList(deckList.uri, deckList.commander, deckList.totalCount, deckList.cards);
    };
    return DeckList;
}());
var downloadList = function (uri) {
    return request(({ uri: uri })).then(function (page) {
        var listJson = JSON.parse(DECK_JSON_RE.exec(page)[1]);
        var commander;
        var mainboard = [];
        var totalCount = 0;
        listJson.sections.forEach(function (section) {
            mainboard = section.cards
                .filter(function (card) { return card.isSideboard === false; })
                .map(function (card) {
                if (card.isCommander) {
                    commander = card.name;
                }
                totalCount += card.amount;
                return [card.name, card.amount];
            });
            // .flatMap(cardAndCount => cardAndCount);
            // console.log(commander);
            // console.log(...mainboard);
            // console.log(totalCount);
        });
        return new (DeckList.bind.apply(DeckList, [void 0, uri, commander, totalCount].concat(mainboard)))();
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
var getDeckNames = function () {
    var EDH_URI = 'http://deckstats.net/decks/f/edh-commander/?lng=en';
    var deckLinkPattern = new RegExp('https://deckstats.net/decks/[0-9]+/[0-9]+-.*', 'g');
    request(({ uri: EDH_URI })).then(function (page) {
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
        var links = page.match(deckLinkPattern);
        var waitInterval = 30000;
        for (var i = 0; i < links.length; ++i) {
            setTimeout(function () { return downloadList(link)
                .then(function (deckList) {
                console.log(deckList.uri);
                console.log(deckList.totalCount);
            })
                .error(function (err) { return console.log(err); }); }, waitInterval * i);
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
    }).error(function (message) { return console.log("Failed to retrieve page " + EDH_URI + " - " + message); });
};
////////////////
var fs = require('fs');
var path = require('path');
var savePageContentsLocally = function (uri, page) {
    var filePath = path.join('..', __dirname, 'temp', uri);
    if (fs.existsSync(filePath)) {
        console.log("deck " + uri + " is already saved locally @ " + filePath);
        return;
    }
    fs.writeFile(filePath, page, function (error) { return console.log('Failed to save file @ ' + filePath + ':\n' + error); });
};
var DeckListSource = /** @class */ (function () {
    function DeckListSource() {
    }
    return DeckListSource;
}());
/**
 * Bypassing the for-loop to avoid triggering 429 during dev.
 */
var getFirstDeck = function (redisClient) {
    var EDH_URI = 'http://deckstats.net/decks/f/edh-commander/?lng=en';
    var deckLinkPattern = new RegExp('https://deckstats.net/decks/[0-9]+/[0-9]+-.*', 'g');
    request(({ uri: EDH_URI })).then(function (page) {
        var firstDeckUri = page.match(deckLinkPattern)[2];
        redisClient.get(firstDeckUri, function (error, value) {
            if (value === null) {
                console.log("Deck " + firstDeckUri + " was not previously persisted. Storing...");
                downloadList(firstDeckUri)
                    .then(function (deckList) {
                    console.log(deckList.uri);
                    console.log(deckList.totalCount);
                    // savePageContentsLocally(firstDeckUri, page);
                    redisClient.set(deckList.uri, JSON.stringify(deckList), function (error) {
                        console.log("Failed to save deck " + deckList.uri + "!\n" + error);
                    });
                }).error(function (err) { return console.log(err); });
            }
            else {
                console.log("Deck " + firstDeckUri + " was already persisted. Ignoring.");
                redisClient.get(firstDeckUri, function (error, value) {
                    var deckList = DeckList.fromJSON(value);
                });
            }
        });
    });
};
module.exports = { getDeckNames: getDeckNames, getFirstDeck: getFirstDeck };
