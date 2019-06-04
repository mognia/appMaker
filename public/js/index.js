const urlInput = $('#urlInpu');
const submitBtn = $('#submit-button');
const ErrAlert = $('#ErrAlert');

submitBtn.click(function(){

    let inputUrl = urlInput.val()
    $.post('/sendUrl',{url :inputUrl } ,function (data) {
        let success = data['success'];
        let msg = data['msg']
        if (!success) {
            ErrAlert.text(msg)
            ErrAlert.css({'display':'block'});
            setTimeout(function(params) {
                ErrAlert.css({'display':'none'});
            },4000)
        }
        console.log(success);
        
    })
})