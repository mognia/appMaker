const urlInput = $('#urlInput');
const submitUrl = $('#submit-url');
const urlErrAlert = $('#urlErrAlert');
const nameErrAlert = $('#nameErrAlert');
const urlBox = $('#urlBox');
const detailBox = $('#detailBox');
const submitName = $('#submit-name');
const NameInput = $('#NameInput');
const iconBox = $('#iconBox');
const centBox = $('#centBox');
const startProcess = $('#startProcess');

let Url;
let Name;
let icon;
submitUrl.click(function () {
    Url = urlInput.val();

    if (Url.length == 0) {
        urlErrAlert.text('ابتدا یک آدرس وارد کنید')
        urlErrAlert.css({ 'display': 'block' });
        setTimeout(function (params) {
            urlErrAlert.css({ 'display': 'none' });
        }, 4000);
        return false;
    }
    var validatUrl = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
    if (!validatUrl.test(Url)) {
        urlErrAlert.text('آدرس وارد شده صحیح نیست')
        urlErrAlert.css({ 'display': 'block' });
        setTimeout(function (params) {
            urlErrAlert.css({ 'display': 'none' });
        }, 4000);
        return false;
    }
    else {

        urlBox.fadeOut();
        setTimeout(function (params) {
            detailBox.fadeIn();
        }, 900);
    }

});
submitName.click(function () {
    Name = NameInput.val();
    if (Name.length == 0) {
        nameErrAlert.text('لطفا یک نام انتخاب کنید')
        nameErrAlert.css({ 'display': 'block' });
        setTimeout(function (params) {
            nameErrAlert.css({ 'display': 'none' });
        }, 4000);
        return false;
    }
    else {

        detailBox.fadeOut();
        setTimeout(function (params) {
            iconBox.fadeIn();
            centBox.css({ 'height': '45%', 'margin': '9% 38%' })
        }, 900);
    }
});
function getImg(params) {
    icon = params.files[0];
    console.log(icon);
    
}
function start() {
    console.log('ssssss');
    
    var formdata = new FormData(this);
    formdata.append('url',Url);
    formdata.append('name',Name);
    formdata.append('icon',icon);
    $.ajax({
        type: "POST",
        url: "/sendUrl",
        data: formdata,
        cache: false,
        contentType: false,
        processData: false
    }).done(function (respond) {
        console.log(respond);
    });
}
startProcess.click(function (params) {
    // create FormData object
    // var formdata = new FormData(this);
    // formdata.append('url',Url);
    // formdata.append('name',Name);
    // formdata.append('icon',icon);
    // $.ajax({
    //     type: "POST",
    //     url: "/sendUrl",
    //     data: formdata,
    //     cache: false,
    //     contentType: false,
    //     processData: false
    // }).done(function (respond) {
    //     console.log(respond);
    // });
    //     $.post('/sendUrl',{url :Url,name:Name } ,function (data) {
    //     let success = data['success'];
    //     let msg = data['msg']
    //     if (!success) {

    //     }
    //     console.log(data);

    // });
})