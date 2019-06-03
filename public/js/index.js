const urlInput = $('#urlInpu');
const submitBtn = $('#submit-button');

submitBtn.click(function(){

    let inputUrl = urlInput.val()
    $.post('/sendUrl',{url :inputUrl } ,function (data) {
        console.log(data);
        
    })
})