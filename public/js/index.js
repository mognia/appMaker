const urlInput = $("#urlInput");
const submitUrl = $("#submit-url");
const urlErrAlert = $("#urlErrAlert");
const nameErrAlert = $("#nameErrAlert");
const urlBox = $("#urlBox");
const detailBox = $("#detailBox");
const submitName = $("#submit-name");
const NameInput = $("#NameInput");
const iconBox = $("#iconBox");
const waitBox = $("#waitBox");
const downloadBox = $("#downloadBox");
const failBox = $("#failBox");
const centBox = $("#centBox");
const startProcess = $("#startProcess");

let Url;
let Name;
let icon;
submitUrl.click(function() {
  Url = urlInput.val();

  if (Url.length == 0) {
    urlErrAlert.text("ابتدا یک آدرس وارد کنید");
    urlErrAlert.css({ display: "block" });
    setTimeout(function(params) {
      urlErrAlert.css({ display: "none" });
    }, 4000);
    return false;
  }
  var validatUrl = /\b((http|https):\/\/?)[^\s()<>]+(?:\([\w\d]+\)|([^[:punct:]\s]|\/?))/g;
  if (!validatUrl.test(Url)) {
    urlErrAlert.text("آدرس وارد شده صحیح نیست");
    urlErrAlert.css({ display: "block" });
    setTimeout(function(params) {
      urlErrAlert.css({ display: "none" });
    }, 4000);
    return false;
  } else {
    urlBox.fadeOut();
    setTimeout(function(params) {
      detailBox.fadeIn();
    }, 900);
  }
});
submitName.click(function() {
  Name = NameInput.val();
  if (Name.length == 0) {
    nameErrAlert.text("لطفا یک نام انتخاب کنید");
    nameErrAlert.css({ display: "block" });
    setTimeout(function(params) {
      nameErrAlert.css({ display: "none" });
    }, 4000);
    return false;
  } else {
    detailBox.fadeOut();
    setTimeout(function(params) {
      iconBox.fadeIn();
      centBox.css({ height: "45%", margin: "9% 38%" });
    }, 900);
  }
});

function start() {
  iconBox.fadeOut();
  setTimeout(function(params) {
    waitBox.fadeIn();
  }, 900);

  $.post({
    type: "POST",
    timeout: 0,
    url: "/sendUrl",
    data: {
      url: Url,
      name: Name,
      icon: Icon
    },
    cache: false,
    contentType: false,
    processData: false
  })
    .done(function(respond) {
      waitBox.fadeOut();
      setTimeout(function(params) {
        downloadBox.fadeIn();
      }, 900);
      $("#dlBtn").attr("href", `#/${respond["apk"]}`);
    })
    .fail(function(xhr, status, error) {
      // error handling
      waitBox.fadeOut();
      setTimeout(function(params) {
        failBox.fadeIn();
      }, 900);
    });
}
