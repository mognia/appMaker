var client = require('phonegap-build-api');
const uploader = require('./uploader')
const remover = require('./remover')
module.exports.authUser = function () {
    const token = process.env.TOKEN
    client.auth({ token: token }, function (e, api) {
        // time to make requests
        api.get('/apps', async function (e, data) {
            console.log('auth error:', e);

            let apps = data.apps
            console.log(apps.length);

            if (apps.length != 0) {

                await remover.removeApp(apps[0].id, api)
            }
            else {
                uploader.uploadApp(api);
            }
        });
    });
}
