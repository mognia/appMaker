const fs = require("fs");

module.exports.downloadApp = async function (id,api){
   let file = fs.createWriteStream('app.apk');
   await api.get(`/apps/${id}/android`).pipe(file);
   file.on('close',function(){
      console.log('Done');
      
   })
}