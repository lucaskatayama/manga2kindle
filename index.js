#!/usr/bin/env node
/* jshint esversion: 6 */
'use strict';

var open = require('open');
var rp = require('request-promise');
var cheerio = require('cheerio');
var program = require('commander');
var path = require('path');
var fs = require('fs');
var fs = require('fs-extra');
var im = require('imagemagick');

var version = require('./package.json').version;

//Read arguments
program
    .version(version)
    .option('-n, --name <name>', 'Manga name', null)
    .option('-c, --chapter <chapter>', 'Manga chapter', 1)
    .option('-o, --out <output>', 'Output PDF name', null)
    .parse(process.argv);


var output = program.out || `${program.name}_${program.chapter}.pdf`

console.log('Output file', output);

// Process configuration
var options = {
    uri : `http://www.mangahit.com/${program.name}/${program.chapter}/1`,
    transform: function (body) {
        return cheerio.load(body);
    }
};

function getPage(pageNumber){
    var options = {
        uri : `http://www.mangahit.com/${program.name}/${program.chapter}/${pageNumber}`,
        transform: function (body) {
            return cheerio.load(body);
        }
    };
    return rp(options).then(function ($) {
        return $('#topchapter > div.chapter-viewer > a > img').first().attr('src');
    });
}

rp(options)
    .then(function ($) {
        //Get last page number
        var lastPage = $('select#pages option').last().val();
        //make temp directory
        //fs.rmdirSync('./_tmp');
        fs.removeSync('_tmp');
        fs.mkdirSync('_tmp');

        //Iterate over pages
        var p, f;
        var allUrl = [];
        for(var j = 1; j <= lastPage; j++){
            p = getPage(j).then(function(url){
                try {
                    f = rp.get({uri : url, encoding:null}).catch(function(err){
                        console.log('Page error:', url);
                        return 'error';
                    });
                }catch(e){
                    console.log(e);
                }
                return f;
            });
            allUrl.push(p);
        }

        Promise.all(allUrl).then(function(values){
            var i = 0;
            var filenames = values.map(function(link){

                if(typeof link !== 'error'){
                    var path = `_tmp/${i+1}.jpg`;
                    fs.writeFileSync(path, link);
                    i++;
                    return path;
                }
                else{
                    console.log(link);
                }
                return null;
            }).filter(function(me){return me !== null;});
            var me = filenames.concat(['-resize','x1600','-gravity', 'Center', '-extent','x1600' ,`${output}`]);
            im.convert(me);
        })
    })
    .catch(function (err) {
        console.log('Error:', err.message);
    });
