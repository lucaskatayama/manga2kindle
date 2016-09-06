#!/usr/bin/env node
'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _mangakindle = require('./lib/mangakindle');

var lib = _interopRequireWildcard(_mangakindle);

var _package = require('../package.json');

var _columnify = require('columnify');

var _columnify2 = _interopRequireDefault(_columnify);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//Read arguments
var list;
_commander2.default.version(_package.version).option('-n, --name <name>', 'Manga name', null).option('-c, --chapter <chapter>', 'Manga chapter', 1).option('-o, --out <output>', 'Output PDF name', null).option('-L, --list [letter]', 'List mangas').option('-s, --search [name]', 'Search by name').parse(process.argv);

if (_commander2.default.list) {
    console.log('Listing:');
    lib.getMangaList(_commander2.default.list).then(function (content) {
        content.forEach(function (item, index) {
            console.log(index + ' - ' + item.name + ' - ' + item.lastChapter);
        });
    });
} else if (_commander2.default.search) {
    lib.searchManga(_commander2.default.search).then(function (a) {
        var items = a.map(function (item) {
            var name = item.name;
            var href = item.href;

            return {
                ID: href.split('/')[1],
                name: name
            };
        });
        var columns = (0, _columnify2.default)(items, {
            columnSplitter: ' | '
        });
        console.log(columns);
    });
} else {
    lib.getManga(_commander2.default);
}