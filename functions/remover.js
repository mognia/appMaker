const uploader = require('./uploader');
module.exports.removeApp = async function (id , api){

    api.del(`/apps/${id}`, function(e, data) {
        console.log('remover error:', e);
        console.log('remover data:', data);
        uploader.uploadApp(api);
    });
}