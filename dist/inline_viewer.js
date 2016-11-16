'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * ウェブページ中で SVG ScreenShot のプレビューを展開する
 * 対象画像をホバーしたときにSVGコンテンツを重ねて表示する
 */
// TODO: 読み込み要求のボタンを設ける?

var InlineViewer = function () {
  function InlineViewer() {
    _classCallCheck(this, InlineViewer);

    this.appImg = 'https://svgscreenshot.appspot.com/c/c-';
    this.bindEvents();
  }

  _createClass(InlineViewer, [{
    key: 'getScreenShotId',
    value: function getScreenShotId() {
      var url = arguments.length <= 0 || arguments[0] === undefined ? 'https://svgscreenshot.appspot.com/c/c-xxxx.png' : arguments[0];

      var cid = url.split(this.appImg)[1].split('.png')[0];
      return cid;
    }
  }, {
    key: '$getCover',
    value: function $getCover() {
      var cid = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
      var $img = arguments[1];

      var coverId = '"daiz-ss-iv-cover-c-' + cid;
      var pageX = window.pageXOffset;
      var pageY = window.pageYOffset;

      var $cover = $('#' + coverId);

      // 既に存在する場合はそれを返す
      if ($cover.length > 0) return $cover;

      // 存在しない場合は新規作成する
      var imgRect = $img[0].getBoundingClientRect();
      $cover = $('<div id="' + coverId + '" class="daiz-ss-iv-cover"></div>');
      $cover.css({
        left: imgRect.left + pageX,
        top: imgRect.top + pageY,
        width: $img.width(),
        height: $img.height()
      });

      return $cover;
    }

    // SVGコンテンツを表示する

  }, {
    key: 'renderSVGScreenShot',
    value: function renderSVGScreenShot($cover) {
      var cid = arguments.length <= 1 || arguments[1] === undefined ? '5735735550279680' : arguments[1];

      var cover = $cover[0];
      var svgUrl = this.appImg + 'cid.svg';
      $.ajax({
        url: svgUrl,
        dataType: "text"
      }).success(function (svgTag) {
        var doc = new DOMParser().parseFromString(svgTag, 'application/xml');
        cover.appendChild(cover.ownerDocument.importNode(doc.documentElement, true));
        var svg = cover.querySelector('svg.svg-screenshot');
        var viewBox = svg.viewBox.baseVal;
        svg.setAttribute('width', viewBox.width);
        svg.setAttribute('height', viewBox.height);
      });
    }
  }, {
    key: 'bindEvents',
    value: function bindEvents() {
      var _this = this;

      var self = this;
      var $body = $('body');

      // 画像ホバー時
      $body.on('mouseenter', 'img', function (e) {
        var $img = $(e.target).closest('img');
        // 対象画像であるかを確認
        var src = $img.attr('src');
        if (src.indexOf(_this.appImg) >= 0) {
          var cid = self.getScreenShotId();
          var $cover = self.$getCover(cid, $img);
          $body.append($cover);
          self.renderSVGScreenShot($cover, cid);
        }
      });
    }
  }]);

  return InlineViewer;
}();
