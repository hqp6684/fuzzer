var request = require('request');

request('https://www.hpham.co', function(err, res, body){
  if(!err){
   //console.log(body); 
  console.log(body.body);
    }
    console.log(err);
  })
