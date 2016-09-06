import rp from 'request-promise';
import cheerio from 'cheerio';
import 'fs';
import fs from 'fs-extra';
import im from 'imagemagick';


export function searchManga(q=''){
    let options = {
        uri : `http://www.mangahit.com/search`,
        method : 'POST',
        form : {
            search : q
        },
        transform: (body) => {
            return cheerio.load(body);
        }
    };
    return rp(options)
        .then(($) => {
            let test = $('tr.line.record td:nth-child(1)').map((i, me) => {
                return {
                    name : $(me).text(),
                    href : $(me).find('a').attr('href')
                };
            });
            return test.get();
        });
}

export function getMangaList(l = 'all') {
    //FIXME refactor
    l = l == '#' ? 'num' : l;
    let options = {
        uri: `http://www.mangahit.com/mangas/${l}`,
        transform: (body) => {
            return cheerio.load(body);
        }
    };

    return rp(options).then(($) => {
        return $('tr.line.record td:nth-child(2) a').map((i, me) => {
            let parts = me.attribs.href.split('/')

            return {name: parts[1], lastChapter: parts[3]}
        }).get()
    });
}

export function getManga(program) {
    var output = program.out || `${program.name}_${program.chapter}.pdf`;

    console.log('Output file', output);

    function getPage(pageNumber) {
        var options = {
            uri: `http://www.mangahit.com/${program.name}/${program.chapter}/${pageNumber}`,
            transform: (body) => {
                return cheerio.load(body);
            }
        };
        return rp(options).then(($) => {
            return $('#topchapter > div.chapter-viewer > a > img').first().attr('src');
        });
    }


    // Process configuration
    var options = {
        uri: `http://www.mangahit.com/${program.name}/${program.chapter}/1`,
        transform: (body) => {
            return cheerio.load(body);
        }
    };

    rp(options)
        .then(($) => {
            //Get last page number
            var lastPage = $('select#pages option').last().val();
            //make temp directory
            //fs.rmdirSync('./_tmp');
            fs.removeSync('_tmp');
            fs.mkdirSync('_tmp');

            //Iterate over pages
            var p, f;
            var allUrl = [];
            for (var j = 1; j <= lastPage; j++) {
                p = getPage(j).then((url) => {
                    try {
                        f = rp.get({
                            uri: url,
                            encoding: null
                        }).catch((err) => {
                            console.log(err)
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

            Promise.all(allUrl).then((values) => {
                var i = 0;
                var filenames = values.map((link) => {

                    if (typeof link !== 'error') {
                        var path = `_tmp/${i + 1}.jpg`;
                        fs.writeFileSync(path, link);
                        i++;
                        return path;
                    } else {
                        console.log(link);
                    }
                    return null;
                }).filter(function (me) {
                    return me !== null;
                });
                var me = filenames.concat(['-resize', 'x1600', '-gravity', 'Center', '-extent', 'x1600', `${output}`]);
                im.convert(me);
            })
        })
        .catch((err) => {
            console.log('Error:', err.message);
        });
}
