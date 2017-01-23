'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * ウェブページ中で SVG ScreenShot のプレビューを展開する
 * 対象画像をホバーしたときにSVGコンテンツを重ねて表示する
 */

var InlineViewer = function () {
  function InlineViewer() {
    _classCallCheck(this, InlineViewer);

    this.appHost = 'svgscreenshot.appspot.com';
    this.appUrl = 'https://svgscreenshot.appspot.com';
    this.appImgBase = this.appHost + '/c/';
    this.appImgs = ['/c/c-', /* v0 */
    '/c/x/' /* v1 */
    ];
    this.contentBaseUrls = [this.appUrl + '/c', /* v0 */
    this.appUrl + '/x' /* v1 */
    ];
    this.hideAllSVGScreenShots();
    this.bindEvents();
  }

  _createClass(InlineViewer, [{
    key: 'getScreenShotId',
    value: function getScreenShotId() {
      var url = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
      var imgVesion = arguments[1];

      var cid = '';
      if (url.length === 0) return cid;
      var appImg = this.appImgs[imgVesion];
      cid = url.split(appImg)[1].split('.png')[0];
      return cid;
    }
  }, {
    key: '$getCover',
    value: function $getCover() {
      var cid = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
      var $img = arguments[1];

      // cid is cover-id!
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

      var cid = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
      var imgVersion = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

      var cover = $cover[0];
      var coverWidth = $cover.width();
      var coverHeight = $cover.height();
      var $svgArea = $cover.find('.daiz-ss-iv-svg');
      var appImg = this.appImgs[imgVersion];
      if (appImg.length === 0) return;

      var svgUrl = this.appUrl + '/' + appImg + cid + '.svg';
      $.ajax({
        url: svgUrl,
        dataType: "text"
      }).success(function (svgTag) {
        if (svgTag.length === 0) return;
        var doc = new DOMParser().parseFromString(svgTag, 'application/xml');
        $svgArea[0].appendChild(cover.ownerDocument.importNode(doc.documentElement, true));
        var svg = cover.querySelector('svg.svg-screenshot');
        var orgUrl = svg.getAttribute('data-url');
        var title = svg.getAttribute('data-title');
        // SVGレイヤーのサイズを設定
        // viewBox.width, viewBox.height: SVGのオリジナルサイズ
        // coverWidth, coverHeight: サムネイルのサイズ
        svg.setAttribute('width', coverWidth);
        svg.setAttribute('height', coverHeight);

        // cover footerを設定
        var $cFoot = $cover.find('.daiz-ss-iv-cover-foot');
        $cFoot.find('a.jump').attr('href', validateUrl(orgUrl));
        $cFoot.find('a.jump')[0].innerText = validateTitle(title);
        $cFoot.find('a.svgss').attr('href', _this.contentBaseUrls[imgVersion] + '/' + cid);
        $cFoot.show();
      });
    }

    // SVGコンテンツを最新のサムネイルのサイズに合わせる

  }, {
    key: 'updateSVGScreenShotSize',
    value: function updateSVGScreenShotSize($cover, $img) {
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

  }, {
    key: 'hideAllSVGScreenShots',
    value: function hideAllSVGScreenShots() {
      // 既存の消し忘れカバーを消す
      $('.daiz-ss-iv-cover').css('display', 'none');
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
        var src = decodeURIComponent($img[0].src);
        var imgVersion = -1;

        if (src.indexOf(_this2.appImgBase) != -1) {
          var toks = src.split(_this2.appImgBase);
          var sign = toks[toks.length - 1].charAt(0);
          if (sign === 'x') {
            imgVersion = 1;
          } else if (sign === 'c') {
            imgVersion = 0;
          }
        }

        if (imgVersion != -1 && imgVersion < self.appImgs.length) {
          self.hideAllSVGScreenShots();
          var cid = self.getScreenShotId(src, imgVersion);
          var coverInfo = self.$getCover(cid, $img);
          var $cover = coverInfo[0];
          if (coverInfo[1]) {
            // 新規作成されたカバー
            $body.append($cover);
            self.renderSVGScreenShot($cover, cid, imgVersion);
          } else {
            self.updateSVGScreenShotSize($cover, $img);
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
