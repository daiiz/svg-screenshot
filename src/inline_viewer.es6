/**
 * ウェブページ中で SVG ScreenShot のプレビューを展開する
 * 対象画像をホバーしたときにSVGコンテンツを重ねて表示する
 */
  // TODO: 読み込み要求のボタンを設ける?
class InlineViewer {
  constructor () {
    this.appImg = 'https://svgscreenshot.appspot.com/c/c-';
    this.bindEvents();
  }

  getScreenShotId (url='https://svgscreenshot.appspot.com/c/c-xxxx.png') {
    var cid = url.split(this.appImg)[1].split('.png')[0];
    return cid;
  }

  $getCover (cid='', $img) {
    var coverId = '"daiz-ss-iv-cover-c-' + cid;
    var pageX = window.pageXOffset;
    var pageY = window.pageYOffset;

    var $cover = $(`#${coverId}`);

    // 既に存在する場合はそれを返す
    if ($cover.length > 0) return $cover;

    // 存在しない場合は新規作成する
    var imgRect = $img[0].getBoundingClientRect();
    $cover = $(`<div id="${coverId}" class="daiz-ss-iv-cover"></div>`);
    $cover.css({
        left: imgRect.left + pageX,
        top: imgRect.top + pageY,
        width: $img.width(),
        height: $img.height()
    });

    return $cover;
  }

  // SVGコンテンツを表示する
  renderSVGScreenShot ($cover, cid='5735735550279680') {
    var cover = $cover[0];
    var svgUrl = `${this.appImg}cid.svg`;
    $.ajax({
      url: svgUrl,
      dataType: "text"
    }).success(svgTag => {
      var doc = new DOMParser().parseFromString(svgTag, 'application/xml');
      cover.appendChild(cover.ownerDocument.importNode(doc.documentElement, true));
      var svg = cover.querySelector('svg.svg-screenshot');
      var viewBox = svg.viewBox.baseVal;
      svg.setAttribute('width', viewBox.width);
      svg.setAttribute('height', viewBox.height);
    });
  }

  bindEvents () {
    var self = this;
    var $body = $('body');

    // 画像ホバー時
    $body.on('mouseenter', 'img', e => {
      var $img = $(e.target).closest('img');
      // 対象画像であるかを確認
      var src = $img.attr('src');
      if (src.indexOf(this.appImg) >= 0) {
        var cid = self.getScreenShotId();
        var $cover = self.$getCover(cid, $img);
        $body.append($cover);
        self.renderSVGScreenShot($cover, cid);
      }
    });
  }
}
