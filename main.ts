import * as cheerio from 'cheerio';
import * as request from 'request';

// import {Observable} from 'rxjs';
function testArgs(){
   if(process.argv.length>2){
       console.log(process.argv.splice(2));
   } 
}
function main(){
    let url = 'https://hpham.co';
    // let 
    // let rawDoc =  Observable.bindCallback(request(url, {}, (err,res,body)=>()));
    
    request(url, {}, (err, res, body)=>{
        if(!err){
            // console.log(body);
            let $ = cheerio.load(body);
            let alinks = $(body).find('a')
            alinks.map(a=>{
                
            })
            console.log(alinks);
        }
        console.log(err);
    })
}

// main();
testArgs();