(function () {
  var openN = () => {
    document.querySelector('#n').style.display = 'block';
    document.querySelector('#y').style.display = 'none';
  };

  var openY = () => {
    document.querySelector('#y').style.display = 'block';
    document.querySelector('#n').style.display = 'none';
  };

  window.addEventListener('load', function () {
    document.querySelector('#open').href = localStorage.item_url || '';
    document.querySelector('#img').src = localStorage.item_img || '';
    var err = localStorage.is_error || 'ようこそ';
    if (err !== 'y') {
      // キャプチャ失敗
      document.querySelector('#msg').innerText = err;
      openN();
    }else {
      openY();
    }

  }, false);

  document.querySelector('#open').addEventListener('click', function () {
    clearBadge();
  }, false);

  document.querySelector('#login').addEventListener('click', function () {
    clearBadge();
  }, false);

  document.querySelector('#btn-show-cropper').addEventListener('click', function () {
    console.info("22");
    chrome.tabs.getSelected(null, function (tab) {
      console.info(tab);
      clearBadge();
      chrome.tabs.sendRequest(tab.id, {
        event: 'click-context-menu'
      });
      window.close();
    });
  });
})();