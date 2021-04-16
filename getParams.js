const querystring = require('querystring')


module.exports = function(incomingurl,host){
        const temp = new URL(incomingurl, `http://${host}`);
        const params = temp.search.slice(1)
        return querystring.parse(params);
  } 