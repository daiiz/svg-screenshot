(function () {
  var SVGSCREENSHOT_APP = 'https://svgscreenshot.appspot.com';
  var sendChromeMsg = (json, callback) => {
    chrome.runtime.sendMessage(json, callback);
  };

  // スクリーンショットをアップロードする
  var uploader = () => {

  };

  // ブラウザ側でもa.href, titleを確認する
  var validateUrl = (url='') => {
    // http, https で始まるもののみOK
    var prot = url.split(':')[0].toLowerCase();
    if (prot && (prot === 'http' || prot === 'https')) {
      // OK
    }else {
      return '';
    }
    // <, > を除去
    url = url.replace(/</g, '').replace(/>/g, '');
    return url;
  };

  var validateTitle = (title='') => {
    // <, > を除去
    title = title.replace(/</g, '').replace(/>/g, '');
    return title;
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

  // SVGタグを生成する
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
    //
    for (var i = 0; i < aTagRects.length; i++) {
      var aTagRect = aTagRects[i];
      // a element
      var a = document.createElementNS(svgns, 'a');
      var url = validateUrl(aTagRect.href);
      if (url.length === 0) continue;
      a.setAttributeNS(hrefns, 'href', url);
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
      var txt = validateTitle(aTagRect.text);
      text.textContent = txt;
      text.setAttributeNS(null, 'fill', 'rgba(0, 0, 0, 0)');

      a.appendChild(rect);
      a.appendChild(text);
      rootSVGtag.appendChild(a);
    }

    rootSVGtag.setAttributeNS(null, 'width', width);
    rootSVGtag.setAttributeNS(null, 'height', height);
    rootSVGtag.setAttributeNS(null, 'data-url', validateUrl(baseUri));
    rootSVGtag.setAttributeNS(null, 'data-title', validateTitle(title));
    // localStorage['w'] = width;
    // localStorage['h'] = height;
    // localStorage['url'] = baseUri;
    // localStorage['title'] = title;
    //localStorage['svgroot'] = rootSVGtag.outerHTML;


    // スクリーンショットをアップロード


    chrome.tabs.create({
      url: chrome.extension.getURL("preview.html")
    }, null);
  };

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

  var initScreenShotMenu = () => {
    // ユーザーが閲覧中のページに専用の右クリックメニューを設ける
    // ウェブページ向け
    chrome.contextMenus.create({
      title: 'SVGスクリーンショットを撮る',
      contexts: [
        'page',
        'selection'
      ],
      onclick: function (clicked, tab) {
        chrome.tabs.sendRequest(tab.id, {
          event: 'click-context-menu'
        });
      }
    });
    // ウェブページ上の画像向け
    chrome.contextMenus.create({
      title: 'SVGスクリーンショットを撮る',
      contexts: [
        'image'
      ],
      onclick: function (clicked, tab) {
        chrome.tabs.sendRequest(tab.id, {
          event: 'click-context-menu',
          elementType: 'image'
        });
      }
    });
  };

  initScreenShotMenu();

  chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
    if (info.status === 'complete') {
      chrome.tabs.sendRequest(tab.id, {
        event: 'updated-location-href'
      });
    }
  });
})();
