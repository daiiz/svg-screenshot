'use strict';

var SVGSCREENSHOT_APP = 'https://svgscreenshot.appspot.com';

window.addEventListener('load', function () {
    var w = localStorage.w + 'px';
    var h = localStorage.h + 'px';
    var rootSVGtag = localStorage.svgroot;
    var res = document.querySelector('.daiz-ss');
    res.style.width = w;
    res.style.height = h;
    res.setAttributeNS(null, 'width', w);
    res.setAttributeNS(null, 'height', h);
    res.setAttributeNS(null, 'viewBox', '0 0 ' + localStorage.w + ' ' + localStorage.h);
    res.innerHTML = rootSVGtag;
    res.querySelector('.svg-screenshot').setAttributeNS(null, 'data-url', localStorage.url);
    res.querySelector('.svg-screenshot').setAttributeNS(null, 'data-title', localStorage.title);

    var svg = res.innerHTML;
    setDownloadLink(svg);
}, false);

// SVGファイルをダウンロードするリンクの準備
var setDownloadLink = function setDownloadLink(svg) {
    var exportTag = document.getElementById("export");
    var blob = new Blob([svg], {
        type: "image/svg+xml"
    });
    var url = window.URL.createObjectURL(blob);
    exportTag.download = 'ss_w' + localStorage.w + '_h' + localStorage.h;
    exportTag.href = url;
};

var getSvgTag = function getSvgTag() {
    var $stage = $('.daiz-ss');
    var tag = $stage[0].firstElementChild;
    if (tag.tagName === 'svg' && tag.classList[0] === 'svg-screenshot') {
        return tag;
    }
    return null;
};

var getSvgBgImg = function getSvgBgImg(svgTag) {
    var imageTag = svgTag.getElementsByTagName('image');
    if (imageTag.length === 0) return null;
    var dataImage = imageTag[0].getAttribute('xlink:href');
    return dataImage;
};

var showToast = function showToast(msg) {
    var snackbarContainer = document.querySelector('#toast');
    snackbarContainer.MaterialSnackbar.showSnackbar({
        message: msg
    });
};

// Uploadリンクがクリックされたとき
$('#upload').on('click', function (e) {
    // SVGが表示されているときのみ有効
    var svgtag = getSvgTag();
    if (svgtag === null) return;
    var svgBgBase64Img = getSvgBgImg(svgtag);

    var $openLink = $('#open-item');
    $openLink.hide();

    // Ajaxでapi/uploadsvgをたたく
    $.ajax({
        url: SVGSCREENSHOT_APP + '/api/uploadsvg',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({
            svg: svgtag.outerHTML,
            base64png: svgBgBase64Img,
            orgurl: svgtag.getAttribute('data-url'),
            title: svgtag.getAttribute('data-title') || '',
            viewbox: svgtag.getAttribute('viewBox')
        })
    }).success(function (data) {
        var stat = data.status;
        // console.info(data);
        if (stat === 'ok-saved-new-screenshot') {
            $('#btn_upload_wrapper').hide();
            var url = SVGSCREENSHOT_APP + data.url;
            $openLink.attr('href', url);
            $openLink.show();
            showToast("アップロードしました");
        } else if (stat === 'exceed-screenshots-upper-limit') {
            showToast("ファイルの上限数に達しています");
        } else {
            showToast("アップロードに失敗しました");
        }
        console.log(data);
    }).fail(function (data) {
        console.error("[Err api/uploadsvg]");
    });
});
