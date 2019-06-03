const builder = require('./builder')

module.exports.uploadApp = function (api) {
    var options = {
        form: {
            data: {
                // TODO: get title from URL
                title: 'My App',
                create_method: 'file'
            },
            file: './temp.zip'
        }
    };
    
    api.post('/apps', options, async function(e, data) {
        console.log('uploader error:', e);
        
        // TODO: delete zip folder after upload
        await builder.appBuilder(data.id,api);
    });
    
}