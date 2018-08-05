/**
 * ウェブページ中で DynamicGazo のプレビューを展開する
 * 対象画像をホバーしたときにSVGコンテンツを重ねて表示する
 */
class InlineViewer {
  constructor () {
    this.appUrl = (window.dynamicGazo.env === 'production') ?
      'https://svgscreenshot.appspot.com' : 'http://localhost:8080'
    this.gyazo = 'https://gyazo.com'
    this.svgScreenShotUrlPatterns = [
      `${this.appUrl}/c/x/(.+)`,
      `${this.appUrl}/thumb/(.+)`
    ]
    /* 直近で検出した画像のID */
    this.latestImageId = null
    this.hideAllSVGScreenShots()
    this.bindEvents()
  }

  detectImageId (src, urlPatterns) {
    let imgId = null;
    for (let i = 0; i < urlPatterns.length; i++) {
      let pattern = urlPatterns[i];
      let reg = new RegExp(pattern);
      let matched = src.match(reg);
      if (matched && matched.length >= 2) {
        imgId = matched[1].split('#')[0].split('.')[0]
        break;
      }
    }
    if (imgId === null) return null;
    if (imgId.indexOf('/') !== -1) return null;
    return imgId;
  }

  $getCover (cid='', $img) {
    // cid is cover-id
    var coverId = 'daiz-ss-iv-cover-c-' + cid;
    var pageX = window.pageXOffset;
    var pageY = window.pageYOffset;

    var $cover = $(`#${coverId}`);
    var newCover = false;

    // 存在しない場合は新規作成する
    if ($cover.length === 0) {
      newCover = true;
      var optionClassName = '';
      if (window.location.host === 'gyazo.com') {
        optionClassName = 'gyazo-com'
      }
      $cover = $(`<div id="${coverId}" class="daiz-ss-iv-cover ${optionClassName}">
        <div class="daiz-ss-iv-svg">
        </div>
      </div>`);

      $cover.css({
        width: $img.width(),
        height: $img.height(),
        display: 'none'
      });
    }

    var imgRect = $img[0].getBoundingClientRect();
    $cover.css({
      left: imgRect.left + pageX,
      top: imgRect.top + pageY,
      cursor: $img.css('cursor') || 'default'
    });

    return [$cover, newCover];
  }

  // SVGコンテンツを表示する
  renderSVGScreenShot ($cover, cid='') {
    var cover = $cover[0]
    var coverWidth = $cover.width()
    var coverHeight = $cover.height()
    var $svgArea = $cover.find('.daiz-ss-iv-svg')
    var svgUrl = `${this.appUrl}/d/s/${cid}`

    $.ajax({
      url: svgUrl,
      method: "POST",
      dataType: "json"
    }).success(data => {
      let svgTag = data.svg_tag;
      let appName = data.app_name || null;
      if (svgTag.length === 0) return;
      var doc = new DOMParser().parseFromString(svgTag, 'application/xml');
      $svgArea[0].appendChild(cover.ownerDocument.importNode(doc.documentElement, true));
      var svg = cover.querySelector('svg.svg-screenshot');
      var orgUrl = data.url;
      var title = data.title;
      // SVGレイヤーのサイズを設定
      // viewBox.width, viewBox.height: SVGのオリジナルサイズ
      // coverWidth, coverHeight: サムネイルのサイズ
      svg.setAttribute('width', coverWidth);
      svg.setAttribute('height', coverHeight);
      $cover.show();
    });
  }

  // SVGコンテンツを最新のサムネイルのサイズに合わせる
  updateSVGScreenShotSize ($cover, $img) {
    if ($cover.find('.daiz-ss-iv-svg')[0].innerHTML.trim() === '') return;

    var w = $img.width();
    var h = $img.height();
    $cover.css({
      width: w,
      height: h
    });
    var svg = $cover[0].querySelector('svg.svg-screenshot');
    if (svg) {
      svg.setAttribute('width', w);
      svg.setAttribute('height', h);
    }
    $cover.show();
  }

  // 全てのcoverを非表示にする
  hideAllSVGScreenShots () {
    // 既存の消し忘れカバーを消す
    $('.daiz-ss-iv-cover').css('display', 'none');
  }

  bindEvents () {
    var self = this;
    var $body = $('body');

    const showLinkLayer = e => {
      const $img = $(e.target).closest('img')

      // 対象画像であるかを確認
      const src = decodeURIComponent($img[0].src)
      const imageId = self.detectImageId(src, self.svgScreenShotUrlPatterns)

      if (imageId === null) return
      if (imageId !== this.latestImageId) {
        this.latestImageId = imageId
      }

      self.hideAllSVGScreenShots()
      var coverInfo = self.$getCover(imageId, $img)
      var $cover = coverInfo[0]
      if (coverInfo[1]) {
        // 新規作成されたカバー
        $cover.on('click', event => {
          const className = event.target.className.baseVal
          if (className !== 'svg-screenshot') return
          $cover.hide()
          $img.trigger('click')
        })

        $body.append($cover)
        self.renderSVGScreenShot($cover, imageId)
      }else {
        self.updateSVGScreenShotSize($cover, $img)
      }
    }

    // 画像mouseenter時
    $body.on('mouseenter', 'img', e => {
      showLinkLayer(e)
    });

    // 画像mouseleave時
    $body.on('mouseleave', '.daiz-ss-iv-cover', e => {
      var $cover = $(e.target).closest('.daiz-ss-iv-cover');
      $cover.hide();
    });
  }
}
