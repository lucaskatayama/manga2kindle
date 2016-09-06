#!/usr/bin/env node
import program from 'commander';
import * as lib from './lib/mangakindle';
import {version} from '../package.json';
import columnify from 'columnify';

//Read arguments
var list;
program
    .version(version)
    .option('-n, --name <name>', 'Manga name', null)
    .option('-c, --chapter <chapter>', 'Manga chapter', 1)
    .option('-o, --out <output>', 'Output PDF name', null)
    .option('-L, --list [letter]', 'List mangas')
    .option('-s, --search [name]', 'Search by name')
    .parse(process.argv);

if (program.list) {
    console.log('Listing:');
    lib.getMangaList(program.list).then((content) => {
        content.forEach((item, index) => {
            console.log(`${index} - ${item.name} - ${item.lastChapter}`)
        })
    })
}
else if(program.search){
    lib.searchManga(program.search).then((a) => {
        let items = a.map((item) => {
            var {name, href} = item;
            return {
                ID : href.split('/')[1],
                name : name
            }
        });
        let columns = columnify(items, {
            columnSplitter: ' | '
        });
        console.log(columns);
    });
}
else {
    lib.getManga(program);
}
