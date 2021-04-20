
//-----------------------------------------------------Creating myFiles Array ---------------------------------------------------//

/*
    Using Sync function as I was not able to export using async functions
*/
const fs = require('fs')
const {readdirSync,statSync} = fs;
const PATH = __dirname + '/logFiles'
let obj = [];

let arr = readdirSync( PATH )

for( let i = 0 ; i<arr.length; i++ ){
    let temp = {
        'name' : PATH + '/' + arr[i],
        'size' : statSync(PATH + '/' + arr[i]).size
    }
    obj.push(temp)
}

module.exports = obj





