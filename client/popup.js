(function () {
  const replaceToDevUrls = () => {
    if (window.dynamicGazo.env === 'production') return
    const targets = [
      '#open',
      '#y-collection',
      '#login',
      '#collection'
    ]
    for (const target of targets) {
      const url = document.querySelector(target).href
      document.querySelector(target).href = url.replace(
        /^https\:\/\/svgscreenshot\.appspot\.com/, 'http://localhost:8080')
    }
  }

  const setCancelEvents = () => {
    document.querySelector('#img').addEventListener('click', () => {
      closeWindow()
    })

    const aTags = document.querySelectorAll('a')
    for (const a of aTags) {
      a.addEventListener('click', () => { closeWindow() })
    }
  }

  const setGyazoCollectionLink = () => {
    const {useGyazo, gyazoHashtag} = readOptions()
    const gayzoCollection = document.querySelector('#gyazo-collection')
    if (useGyazo === 'yes') {
      if (gyazoHashtag.length === 0) return
      gayzoCollection.href = `https://gyazo.com/search/${encodeURIComponent(gyazoHashtag)}`
    } else {
      gayzoCollection.remove()
    }
  }

  const itemUrl = (url) => {
    if (!url) return ''
    if (window.dynamicGazo.env === 'production') return url
    return url.replace(/^https\:\/\/svgscreenshot\.appspot\.com/, 'http://localhost:8080')
  }

  const openN = () => {
    document.querySelector('#n').style.display = 'block';
    document.querySelector('#y').style.display = 'none';
  }

  const openY = () => {
    document.querySelector('#y').style.display = 'block';
    document.querySelector('#n').style.display = 'none';
  }

  window.addEventListener('load', function () {
    document.querySelector('#open').href = itemUrl(localStorage.item_url)
    var thumbnail = document.querySelector('#img');
    thumbnail.src = localStorage.item_img || '';
    thumbnail.dataset.clipboardText = itemUrl(localStorage.item_img)
    var err = localStorage.is_error || 'ようこそ';
    if (err !== 'y') {
      // キャプチャ失敗
      document.querySelector('#msg').innerText = err;
      openN();
    }else {
      new Clipboard('.copy-btn');
      openY();
    }
    replaceToDevUrls()
    setGyazoCollectionLink()
    setCancelEvents()
  }, false);

  document.querySelector('#open').addEventListener('click', function () {
    clearBadge();
  }, false);

  document.querySelector('#login').addEventListener('click', function () {
    clearBadge();
  }, false);

  // 範囲選択による撮影モード
  chrome.tabs.getSelected(null, function (tab) {
    chrome.tabs.sendRequest(tab.id, {
      event: 'capture-range'
    })
  })

  const closeWindow = () => {
    chrome.tabs.getSelected(null, function (tab) {
      chrome.tabs.sendRequest(tab.id, {
        event: 'cancel-capture-range'
      })
    })
    window.close()
  }
})()
