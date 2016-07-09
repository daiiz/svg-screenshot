var sendChromeMsg = (json, callback) => {
     chrome.runtime.sendMessage(json, callback);
};


// Canvasに画像をセットして，必要部分のみ切り出す
var renderImage = function (linkdata, base64img) {
    var canvas = document.querySelector("#cav");
    var pos_cropper = linkdata.cropperRect;
    var baseUri = linkdata.baseUri;
    var title = linkdata.title;
    var w = +pos_cropper.width;
    var h = +pos_cropper.height;
    canvas.width  = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');

    var img = new Image();
    img.onload = function () {
        ctx.drawImage(img, pos_cropper.orgX, pos_cropper.orgY, w, h, 0, 0, w, h);
        var screenshot = canvas.toDataURL('image/png');
        // SVGスクリーンショットタグをつくる
        makeSVGtag(linkdata.aTagRects, linkdata.text, screenshot, w, h, baseUri, title);
    };
    img.src = base64img;
};

var makeSVGtag = function (aTagRects, text, base64img, width, height, baseUri, title) {
    var svgns  = 'http://www.w3.org/2000/svg';
    var hrefns = 'http://www.w3.org/1999/xlink';
    // root SVG element
    var rootSVGtag = document.createElementNS(svgns, 'svg');
    rootSVGtag.setAttributeNS(null, 'version', '1.1');
    rootSVGtag.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    rootSVGtag.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    rootSVGtag.setAttributeNS(null, 'class', 'svg-screenshot');
    rootSVGtag.setAttributeNS(null, 'viewBox', '0 0 ' + width + ' ' + height);
    // image element
    var img = document.createElementNS(svgns, 'image');
    img.setAttributeNS(null, 'width', width);
    img.setAttributeNS(null, 'height', height);
    img.setAttributeNS(null, 'x', 0);
    img.setAttributeNS(null, 'y', 0);
    img.setAttributeNS(null, 'data-selectedtext', text);
    img.setAttributeNS(hrefns, 'href', base64img);

    rootSVGtag.appendChild(img);

    // 外部ページヘのリンク用のrect elements
    for (var i = 0; i < aTagRects.length; i++) {
        var aTagRect = aTagRects[i];
        // a element
        var a = document.createElementNS(svgns, 'a');
        a.setAttributeNS(hrefns, 'href', aTagRect.href);
        a.setAttributeNS(null, 'target', '_blank');

        // rect element
        var rect = document.createElementNS(svgns, 'rect');
        rect.setAttributeNS(null, 'width', aTagRect.width);
        rect.setAttributeNS(null, 'height', aTagRect.height);
        rect.setAttributeNS(null, 'x', aTagRect.x);
        rect.setAttributeNS(null, 'y', aTagRect.y);
        rect.setAttributeNS(null, 'fill', 'rgba(0, 0, 0, 0)');

        // text element
        var text = document.createElementNS(svgns, 'text');
        text.setAttributeNS(null, 'x', aTagRect.x);
        text.setAttributeNS(null, 'y', aTagRect.y + aTagRect.height);
        text.textContent = aTagRect.text;
        text.setAttributeNS(null, 'fill', 'rgba(0, 0, 0, 0)');

        a.appendChild(rect);
        a.appendChild(text);
        rootSVGtag.appendChild(a);
    }

    localStorage['w'] = width;
    localStorage['h'] = height;
    localStorage['url'] = baseUri;
    localStorage['title'] = title;
    localStorage['svgroot'] = rootSVGtag.outerHTML;

    chrome.tabs.create({
        url: chrome.extension.getURL("preview.html")
    }, null);
};

// ユーザーが閲覧中のページに専用の右クリックメニューを設ける
chrome.contextMenus.create({
    title: 'SVGスクリーンショットを撮る',
    contexts: [
        'page',
        'select'
    ],
    onclick: function (clicked, tab) {
        chrome.tabs.sendRequest(tab.id, {
            event: 'click-context-menu'
        });
    }
});

// ポップアップ画面から命令を受ける
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    var opts = request.options;
    console.warn(opts.sitedata);
    if (request.command === 'make-screen-shot') {
        var linkdata = opts.sitedata;
        chrome.tabs.captureVisibleTab({format: 'png'}, function (dataUrl) {
            renderImage(linkdata, dataUrl);
            console.warn(opts.sitedata);
        });
    }
});

// browser_actionボタンが押されたとき
chrome.browserAction.onClicked.addListener(tab => {
    chrome.tabs.create({
        url: "https://svgscreenshot.appspot.com/"
    }, null);
});
