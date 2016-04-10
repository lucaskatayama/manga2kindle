#!/usr/bin/env node

/* jshint esversion: 6 */
'use strict';

var program = require('commander');
var lib = require('./lib/lib')

var version = require('./package.json').version;

//Read arguments
var list;
program
  .version(version)
  .option('-n, --name <name>', 'Manga name', null)
  .option('-c, --chapter <chapter>', 'Manga chapter', 1)
  .option('-o, --out <output>', 'Output PDF name', null)
  .option('-L, --list [letter]', 'List mangas')
  .parse(process.argv);


if(program.list){
  console.log('Listing:')
  lib.getMangaList(program.list).then((content) => {
    content.forEach((item, index) => {
      console.log(`${index} - ${item.name} - ${item.lastChapter}`)
    })
  })
}
else{
  lib.getManga(program)
}
