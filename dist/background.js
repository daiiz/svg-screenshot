'use strict';

(function () {
  var SVGSCREENSHOT_APP = 'https://svgscreenshot.appspot.com';
  var SVGSCREENSHOT_DEV = '';

  /**
   * MODE
   * - capture: 撮影して保存
   * - scrap: 撮影して保存した後Scrapboxのページを作成
   */
  var MODE = 'capture';
  var SCRAP_BOX_ID = '';
  var SITE_TITLE = '';
  var SITE_URL = '';

  var showBrowserPopup = function showBrowserPopup() {
    var itemUrl = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    var bgImg = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
    var err = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
    var msg = arguments.length <= 3 || arguments[3] === undefined ? '' : arguments[3];

    localStorage.item_url = itemUrl;
    var imgUrl = itemUrl.replace('/x/', '/c/x/') + '.png';
    localStorage.item_img = bgImg;
    localStorage.item_img_url = imgUrl;
    localStorage.is_error = err ? msg : 'y';

    var color = err ? 'red' : '#4abb0c';
    chrome.browserAction.setBadgeBackgroundColor({
      'color': color
    });

    var badge = err ? '✗' : '✔';
    chrome.browserAction.setBadgeText({
      'text': badge
    });

    chrome.browserAction.setPopup({
      'popup': 'popup.html'
    });
  };

  var getSettings = function getSettings() {
    var s = null;
    if (localStorage.svgscreenshot_settings) {
      s = JSON.parse(localStorage.svgscreenshot_settings);
    }
    return s;
  };

  var makeScrapboxPage = function makeScrapboxPage() {
    var xKey = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

    if (xKey.length === 0) return;
    var s = getSettings();
    if (s === null || s.use_scrapbox === 'no') return;

    var xUrl = SVGSCREENSHOT_APP + ('/c/x/' + xKey + '.png');
    // Scrapbox id
    var scrapboxId = SCRAP_BOX_ID || s.id_scrapbox[0];
    var title = encodeURIComponent(SITE_TITLE.trim());
    var body = encodeURIComponent('[' + xUrl + ']\n[' + SITE_TITLE + ' ' + SITE_URL + ']');
    var scrapboxBookmarkletUrl = 'https://scrapbox.io/' + scrapboxId + '/' + title + '?body=' + body;
    chrome.tabs.create({
      url: scrapboxBookmarkletUrl
    }, null);
  };

  // スクリーンショットをアップロードする
  var uploader = function uploader(svgtag, svgBgBase64Img) {
    var pub = 'yes';
    SITE_TITLE = svgtag.getAttribute('data-title') || '';
    SITE_URL = svgtag.getAttribute('data-url') || '';

    // Ajaxでapi/uploadsvgをたたく
    $.ajax({
      url: SVGSCREENSHOT_APP + '/api/uploadsvg',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify({
        svg: svgtag.outerHTML,
        base64png: svgBgBase64Img,
        orgurl: SITE_URL,
        title: SITE_TITLE,
        viewbox: svgtag.getAttribute('viewBox'),
        public: pub
      })
    }).success(function (data) {
      var stat = data.status;
      if (stat === 'ok-saved-new-screenshot') {
        var itemUrl = SVGSCREENSHOT_APP + data.url;
        showBrowserPopup(itemUrl, svgBgBase64Img, false);
        if (MODE === 'scrap') {
          makeScrapboxPage(data.x_key);
        }
      } else if (stat === 'exceed-screenshots-upper-limit') {
        showBrowserPopup('', '', true, "ファイルの上限数に達しています");
      } else if (stat == 'no-login') {
        showBrowserPopup('', '', true, "ウェブアプリにログインしていません");
      } else {
        showBrowserPopup('', '', true, "アップロードに失敗しました");
      }
      console.log(data);
    }).fail(function (data) {
      showBrowserPopup('', '', true, "Unknown error");
    });
  };

  // Canvasに画像をセットして，必要部分のみ切り出す
  var renderImage = function renderImage(linkdata, base64img) {
    var canvas = document.querySelector("#cav");
    var pos_cropper = linkdata.cropperRect;
    var baseUri = linkdata.baseUri;
    var title = linkdata.title;
    var w = +pos_cropper.width;
    var h = +pos_cropper.height;
    canvas.width = w;
    canvas.height = h;

    var ctx = canvas.getContext('2d');

    // MacBook ProのRetinaディスプレイなどの高解像度な
    // ディスプレイを使用している場合は1より大きな値となる
    var rat = window.devicePixelRatio;
    if (rat < 1) rat = 1;
    ctx.scale(1 / rat, 1 / rat);

    var img = new Image();
    img.onload = function () {
      ctx.drawImage(img, rat * pos_cropper.orgX, rat * pos_cropper.orgY, rat * w, rat * h, 0, 0, rat * w, rat * h);
      var screenshot = canvas.toDataURL('image/png');
      // SVGスクリーンショットタグをつくる
      makeSVGtag(linkdata.aTagRects, linkdata.text, screenshot, w, h, baseUri, title);
    };
    img.src = base64img;
  };

  // SVGタグを生成する
  var makeSVGtag = function makeSVGtag(aTagRects, text, base64img, width, height, baseUri, title) {
    var svgns = 'http://www.w3.org/2000/svg';
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

    // スクリーンショットをアップロード
    uploader(rootSVGtag, base64img);
  };

  // ポップアップ画面から命令を受ける
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    var opts = request.options;

    if (request.command === 'make-screen-shot') {
      // スクリーンショットの撮影
      var linkdata = opts.sitedata;
      chrome.tabs.captureVisibleTab({ format: 'png' }, function (dataUrl) {
        MODE = opts.mode;
        SCRAP_BOX_ID = opts.scrapbox_box_id;
        renderImage(linkdata, dataUrl);
      });
    } else if (request.command === 'get-scrapbox-list') {
      // scrapboxボックス名リストを返す
      var scrapboxIds = [];
      var scrapboxEnabled = 'no';
      var s = getSettings();
      if (s != null) {
        scrapboxIds = s.id_scrapbox;
        scrapboxEnabled = s.use_scrapbox;
      }
      sendResponse({
        scrapbox_enabled: scrapboxEnabled,
        scrapbox_ids: scrapboxIds
      });
    }
  });

  // browser_actionボタンが押されたとき
  chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.create({
      url: SVGSCREENSHOT_APP
    }, null);
  });

  var getContextMenuTitle = function getContextMenuTitle(title) {
    var prefix = SVGSCREENSHOT_DEV;
    return prefix + title;
  };

  var initScreenShotMenu = function initScreenShotMenu() {
    // ユーザーが閲覧中のページに専用の右クリックメニューを設ける
    // ウェブページ向け
    chrome.contextMenus.create({
      title: getContextMenuTitle('SVGスクリーンショットを撮る'),
      contexts: ['page', 'selection'],
      onclick: function onclick(clicked, tab) {
        clearBadge();
        chrome.tabs.sendRequest(tab.id, {
          event: 'click-context-menu'
        });
      }
    });
    // ウェブページ上の画像向け
    chrome.contextMenus.create({
      title: getContextMenuTitle('SVGスクリーンショットを撮る'),
      contexts: ['image'],
      onclick: function onclick(clicked, tab) {
        clearBadge();
        chrome.tabs.sendRequest(tab.id, {
          event: 'click-context-menu',
          elementType: 'image'
        });
      }
    });
  };

  initScreenShotMenu();

  chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
    if (info.status === 'complete') {
      chrome.tabs.sendRequest(tab.id, {
        event: 'updated-location-href'
      });
    }
  });
})();
