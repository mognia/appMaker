const downloader = require('./downloader');

module.exports.appBuilder = function (id, api) {
    var options = {
        form: {
            data: {
                platforms: [ 'android']
            }
        }
    };
    api.post(`/apps/${id}/build`, options,async function (e, data) {
        console.log('error:', e);
        console.log('data : ',data);
        let refreshId =  setInterval(function(){
            api.get(`/apps/${id}`, async function(e, data) {

                console.log('data:', data);
                if (data.status.android === 'complete') {
                    clearInterval(refreshId);
                    console.log('android compelete!');
                    
                    await downloader.downloadApp(data.id,api);
                }
            });
         }, 5000);
    });

}