"use strict";
var cheerio = require('cheerio');
var request = require('request');
// import {Observable} from 'rxjs';
function testArgs() {
    if (process.argv.length > 2) {
        console.log(process.argv.splice(2));
    }
}
function main() {
    var url = 'https://hpham.co';
    // let 
    // let rawDoc =  Observable.bindCallback(request(url, {}, (err,res,body)=>()));
    request(url, {}, function (err, res, body) {
        if (!err) {
            // console.log(body);
            var $ = cheerio.load(body);
            var alinks = $(body).find('a');
            alinks.map(function (a) {
            });
            console.log(alinks);
        }
        console.log(err);
    });
}
// main();
testArgs();
