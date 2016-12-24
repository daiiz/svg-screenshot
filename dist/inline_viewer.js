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
    this.contentBaseUrl = 'https://svgscreenshot.appspot.com/c';
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

      var coverId = 'daiz-ss-iv-cover-c-' + cid;
      var pageX = window.pageXOffset;
      var pageY = window.pageYOffset;

      var $cover = $('#' + coverId);
      var newCover = false;

      // 存在しない場合は新規作成する
      if ($cover.length === 0) {
        newCover = true;
        $cover = $('<div id="' + coverId + '" class="daiz-ss-iv-cover">\n        <div class="daiz-ss-iv-svg">\n        </div>\n        <div class="daiz-ss-iv-cover-foot">\n          <a href="#" class="svgss" target="_blank">SVG ScreenShot</a>\n          <a href="#" class="jump" target="_blank">Original site</a>\n        </div>\n      </div>');

        $cover.css({
          width: $img.width(),
          height: $img.height()
        });
      }

      var imgRect = $img[0].getBoundingClientRect();
      $cover.css({
        left: imgRect.left + pageX,
        top: imgRect.top + pageY
      });

      return [$cover, newCover];
    }

    // SVGコンテンツを表示する

  }, {
    key: 'renderSVGScreenShot',
    value: function renderSVGScreenShot($cover) {
      var _this = this;

      var cid = arguments.length <= 1 || arguments[1] === undefined ? '5735735550279680' : arguments[1];

      var cover = $cover[0];
      var coverWidth = $cover.width();
      var coverHeight = $cover.height();
      var $svgArea = $cover.find('.daiz-ss-iv-svg');
      var svgUrl = '' + this.appImg + cid + '.svg';
      $.ajax({
        url: svgUrl,
        dataType: "text"
      }).success(function (svgTag) {
        var doc = new DOMParser().parseFromString(svgTag, 'application/xml');
        $svgArea[0].appendChild(cover.ownerDocument.importNode(doc.documentElement, true));
        var svg = cover.querySelector('svg.svg-screenshot');
        var orgUrl = svg.getAttribute('data-url');
        var title = svg.getAttribute('data-title');
        var viewBox = svg.viewBox.baseVal;
        // SVGレイヤーのサイズを設定
        // viewBox.width, viewBox.height: SVGのオリジナルサイズ
        // coverWidth, coverHeight: サムネイルのサイズ
        svg.setAttribute('width', coverWidth);
        svg.setAttribute('height', coverHeight);

        // cover footerを設定
        var $cFoot = $cover.find('.daiz-ss-iv-cover-foot');
        $cFoot.find('a.jump').attr('href', validateUrl(orgUrl));
        $cFoot.find('a.jump')[0].innerText = validateTitle(title);
        $cFoot.find('a.svgss').attr('href', _this.contentBaseUrl + '/' + cid);
        $cFoot.show();
      });
    }
  }, {
    key: 'bindEvents',
    value: function bindEvents() {
      var _this2 = this;

      var self = this;
      var $body = $('body');

      // 画像mouseenter時
      $body.on('mouseenter', 'img', function (e) {
        var $img = $(e.target).closest('img');
        // 対象画像であるかを確認
        var src = $img.attr('src');
        if (src.startsWith(_this2.appImg)) {
          var cid = self.getScreenShotId(src);
          var coverInfo = self.$getCover(cid, $img);
          var $cover = coverInfo[0];
          if (coverInfo[1]) {
            // 新規作成されたカバー
            $body.append($cover);
            self.renderSVGScreenShot($cover, cid);
          } else {
            $cover.show();
          }
        }
      });

      // 画像mouseleave時
      $body.on('mouseleave', '.daiz-ss-iv-cover', function (e) {
        var $cover = $(e.target).closest('.daiz-ss-iv-cover');
        $cover.hide();
      });
    }
  }]);

  return InlineViewer;
}();
