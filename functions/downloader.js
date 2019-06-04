const fs = require("fs");
let appName ='Temp';
var EventEmitter = require('events')
let response;
var emiter = new EventEmitter();
module.exports.getName = function(name ,res) {
   appName = name;
   response = res;
}

module.exports.downloadApp = async function (id,api){
   let file = fs.createWriteStream(`./readyApps/${appName}.apk`);
   await api.get(`/apps/${id}/android`).pipe(file);
   file.on('close',function(){
      console.log('Done');
      response.json({
         succces:true,
         apk : `./readyApps/${appName}.apk`
     })
   })
}