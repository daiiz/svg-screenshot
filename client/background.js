(function () {
  let META = {}

  const uploadToGyazo = async ({svgScreenshotImageId, hashTag, base64Img, devicePixelRatio}) => {
    const {baseUri, title} = META
    await window.dynamicGazo.uploadToGyazo({
      title,
      referer: baseUri,
      image: base64Img,
      scale: devicePixelRatio,
      svgScreenshotImageId,
      hashTag
    })
  }

  const uploadToSVGScreenshot = async ({devicePixelRatio}) => {
    const {baseUri, title, base64Img} = META
    const {useGyazo, gyazoHashtag} = readOptions()

    // SVGタグを生成する
    const svg = createSVGTag(META)
    const imageDataURI = dynamicGazo.addPhysChunk(base64Img, devicePixelRatio)
    const res = await dynamicGazo.uploadToDynamicGazo({
      svg,
      title,
      referer: baseUri,
      base64Img: imageDataURI,
      devicePixelRatio
    })
    if (res.status === 200 && res.data.x_key) {
      updateLocalStorage({
        item_url: `${window.dynamicGazo.appOrigin}/x/${res.data.x_key}`,
        item_img: `${window.dynamicGazo.appOrigin}/c/x/${res.data.x_key}.png`,
        message: 'y'
      })

      if (useGyazo === 'yes') {
        setBadgeUploadingToGyazo()
        await uploadToGyazo({
          svgScreenshotImageId: res.data.x_key,
          hashTag: gyazoHashtag || '',
          base64Img: imageDataURI,
          devicePixelRatio
        })
      }
      clearBadge()
    } else {
      // XXX: 適切なstatus codeが返ってきていない！
      handleError(res.data)
    }
    return res
  }


  const updateLocalStorage = ({item_url, item_img, message} = {item_url: '', item_img: ''}) => {
    localStorage.item_url = item_url
    localStorage.item_img = item_img
    localStorage.is_error = message
  }

  const handleError = ({ status }) => {
    chrome.browserAction.setBadgeBackgroundColor({ color: 'red' })
    chrome.browserAction.setBadgeText({ text: '😇' })
    switch (status) {
      case 'exceed-screenshots-upper-limit': {
        updateLocalStorage({
          message: 'ファイルの上限数に達しています。'
        })
        break
      }
      case 'no-login': {
        updateLocalStorage({
          message: 'ウェブアプリにログインしていません。'
        })
        break
      }
      default: {
        updateLocalStorage({
          message: 'アップロードに失敗しました。'
        })
        break
      }
    }
  }

  // Canvasに画像をセットして，必要部分のみ切り出す
  const renderImage = function (linkdata, base64Img, devicePixelRatio) {
    var rat = devicePixelRatio;
    var canvas = document.querySelector("#cav");
    var pos_cropper = linkdata.cropperRect;
    var baseUri = linkdata.baseUri;
    var title = linkdata.title;
    var w = +pos_cropper.width;
    var h = +pos_cropper.height;
    canvas.width  = rat * w;
    canvas.height = rat * h;

    var ctx = canvas.getContext('2d');
    var img = new Image();
    img.onload = function () {
      ctx.drawImage(img, rat * pos_cropper.orgX, rat * pos_cropper.orgY, rat * w, rat * h,
       0, 0, rat * w, rat * h)
      const screenshot = canvas.toDataURL('image/png')
      keepMetaData(
        linkdata.aTagRects,
        linkdata.elementRects,
        linkdata.text,
        w,
        h,
        baseUri,
        title,
        rat,
        screenshot)
      uploadToSVGScreenshot({
        devicePixelRatio: rat
      })
    };
    img.src = base64Img;
  };

  const keepMetaData = (aTagRects, elementRects, text, width, height, baseUri, title, devicePixelRatio, base64Img) => {
    META = { aTagRects, elementRects, text, width, height, baseUri, title, devicePixelRatio, base64Img }
  }

  // ポップアップ画面から命令を受ける
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    var opts = request.options;

    if (request.command === 'make-screen-shot') {
      // スクリーンショットの撮影
      var linkdata = opts.sitedata;
      chrome.tabs.captureVisibleTab({ format: 'png' }, function (dataUrl) {
        setBadgeCaptureCompleted()
        renderImage(linkdata, dataUrl, opts.dpr)
      });
    }
  });

  var initScreenShotMenu = () => {
    // ユーザーが閲覧中のページに専用の右クリックメニューを設ける
    // ウェブページ向け
    chrome.contextMenus.create({
      title: 'Capture whole page',
      contexts: [
        'page',
        'selection'
      ],
      onclick: function (clicked, tab) {
        clearBadge()
        chrome.tabs.sendRequest(tab.id, {
          event: 'capture-whole-page'
        });
      }
    })
  };

  initScreenShotMenu();

  chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
    if (info.status === 'complete') {
      chrome.tabs.sendRequest(tab.id, {
        event: 'updated-location-href'
      });
    }
  })
})();
