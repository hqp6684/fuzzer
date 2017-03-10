
1> Run `npm install` to install dependencies 

2> Run `npm run build` to build a node executable js file
    By default, the file is stored in ./dist folder
    
3> Run `node [fuzzer.js location] [discover | test ] url OPTIONS`

    ie: node dist/fuzzer.js test http://127.0.0.1/ --custom-auth=dvwa

 

NOTE for `--custom-auth=dvwa`

If `dvwa` is the root folder (in Gitlab CI), ignore this.

If not, for instance, the dvwa in XAMMP portable is in http://rootUrl/dvwa/

Change

    `src/fuzzer/services/fuzzer-custom-auth.service.ts`
    
line 27 `let postTargetFile = '/login.php';`

to the path that contains dvwa, in the case of XAMMP portable 

`let postTargetFile = '/dvwa/login.php';` 

             
    
    
