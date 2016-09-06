'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.searchManga = searchManga;
exports.getMangaList = getMangaList;
exports.getManga = getManga;

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

require('fs');

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _imagemagick = require('imagemagick');

var _imagemagick2 = _interopRequireDefault(_imagemagick);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function searchManga() {
    var q = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

    var options = {
        uri: 'http://www.mangahit.com/search',
        method: 'POST',
        form: {
            search: q
        },
        transform: function transform(body) {
            return _cheerio2.default.load(body);
        }
    };
    return (0, _requestPromise2.default)(options).then(function ($) {
        var test = $('tr.line.record td:nth-child(1)').map(function (i, me) {
            return {
                name: $(me).text(),
                href: $(me).find('a').attr('href')
            };
        });
        return test.get();
    });
}

function getMangaList() {
    var l = arguments.length <= 0 || arguments[0] === undefined ? 'all' : arguments[0];

    //FIXME refactor
    l = l == '#' ? 'num' : l;
    var options = {
        uri: 'http://www.mangahit.com/mangas/' + l,
        transform: function transform(body) {
            return _cheerio2.default.load(body);
        }
    };

    return (0, _requestPromise2.default)(options).then(function ($) {
        return $('tr.line.record td:nth-child(2) a').map(function (i, me) {
            var parts = me.attribs.href.split('/');

            return { name: parts[1], lastChapter: parts[3] };
        }).get();
    });
}

function getManga(program) {
    var output = program.out || program.name + '_' + program.chapter + '.pdf';

    console.log('Output file', output);

    function getPage(pageNumber) {
        var options = {
            uri: 'http://www.mangahit.com/' + program.name + '/' + program.chapter + '/' + pageNumber,
            transform: function transform(body) {
                return _cheerio2.default.load(body);
            }
        };
        return (0, _requestPromise2.default)(options).then(function ($) {
            return $('#topchapter > div.chapter-viewer > a > img').first().attr('src');
        });
    }

    // Process configuration
    var options = {
        uri: 'http://www.mangahit.com/' + program.name + '/' + program.chapter + '/1',
        transform: function transform(body) {
            return _cheerio2.default.load(body);
        }
    };

    (0, _requestPromise2.default)(options).then(function ($) {
        //Get last page number
        var lastPage = $('select#pages option').last().val();
        //make temp directory
        //fs.rmdirSync('./_tmp');
        _fsExtra2.default.removeSync('_tmp');
        _fsExtra2.default.mkdirSync('_tmp');

        //Iterate over pages
        var p, f;
        var allUrl = [];
        for (var j = 1; j <= lastPage; j++) {
            p = getPage(j).then(function (url) {
                try {
                    f = _requestPromise2.default.get({
                        uri: url,
                        encoding: null
                    }).catch(function (err) {
                        console.log(err);
                        console.log('Page error:', url);
                        return 'error';
                    });
                } catch (e) {
                    console.log(e);
                }
                return f;
            });
            allUrl.push(p);
        }

        Promise.all(allUrl).then(function (values) {
            var i = 0;
            var filenames = values.map(function (link) {

                if (typeof link !== 'error') {
                    var path = '_tmp/' + (i + 1) + '.jpg';
                    _fsExtra2.default.writeFileSync(path, link);
                    i++;
                    return path;
                } else {
                    console.log(link);
                }
                return null;
            }).filter(function (me) {
                return me !== null;
            });
            var me = filenames.concat(['-resize', 'x1600', '-gravity', 'Center', '-extent', 'x1600', '' + output]);
            _imagemagick2.default.convert(me);
        });
    }).catch(function (err) {
        console.log('Error:', err.message);
    });
}