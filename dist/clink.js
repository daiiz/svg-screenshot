'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * https://svgscreenshot.appspot.com/c/<ScreenShot-id> を開く
 */

var CLink = function () {
    function CLink() {
        var tab = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

        _classCallCheck(this, CLink);

        this.tab = tab;
        this.cn = 'daiiz-svgss-btn';
    }

    _createClass(CLink, [{
        key: 'GooglePhoto',


        /**
         * サービス別に処理を定義する
         */
        // プレビュー型
        value: function GooglePhoto() {
            $('body').on('mouseenter', 'div.R9U8ab', function (e) {
                var $v = $(e.target).closest('.R9U8ab');
                if ($v.find('a.daiiz-svgss-btn').length === 0) {
                    var fileName = $v[0].innerHTML;
                    var screenShotId = CLink.extractScreenShotId(fileName);
                    if (CLink.checkScreenShotId(screenShotId)) {
                        var $a = CLink.baseATag(fileName, CLink.getCLink(screenShotId));
                        $v[0].innerHTML = $a[0].outerHTML;
                    }
                }
            });
        }

        // プレビュー型

    }, {
        key: 'Gyazo',
        value: function Gyazo() {
            $('body').on('mouseenter', '.metadata-row', function (e) {
                var $t = $(e.target).closest('.metadata-row');
                if ($t.find('.metadata-key > i').hasClass('gy-icon-title')) {
                    var $v = $t.find('.metadata-value');
                    if ($v.find('a.daiiz-svgss-btn').length === 0) {
                        var fileName = $v[0].innerHTML;
                        var screenShotId = CLink.extractScreenShotId(fileName);
                        if (CLink.checkScreenShotId(screenShotId)) {
                            var $a = CLink.baseATag(fileName, CLink.getCLink(screenShotId));
                            $v[0].innerHTML = $a[0].outerHTML;
                        }
                    }
                }
            });
        }

        // リスト型

    }, {
        key: 'GoogleDriveFolders',
        value: function GoogleDriveFolders() {
            $('body').on('mouseenter', 'span.l-Ab-T-r', function (e) {
                var $v = $(e.target).closest('.l-Ab-T-r');
                if ($v.find('a.daiiz-svgss-btn').length === 0) {
                    var fileName = $v[0].innerHTML;
                    var screenShotId = CLink.extractScreenShotId(fileName);
                    if (CLink.checkScreenShotId(screenShotId)) {
                        var $a = CLink.baseATag(fileName, CLink.getCLink(screenShotId));
                        $a.css({
                            'color': '#222'
                        });
                        $v[0].innerHTML = $a[0].outerHTML;
                    }
                }
            });
        }

        // リスト型

    }, {
        key: 'GyazoSearch',
        value: function GyazoSearch() {
            var $body = $('body');

            $body.on('mouseenter', 'span.title', function (e) {
                var $v = $(e.target).closest('.title');
                if ($v.find('span.daiiz-svgss-btn').length === 0) {
                    var fileName = $v[0].innerHTML;
                    var screenShotId = CLink.extractScreenShotId(fileName);
                    if (CLink.checkScreenShotId(screenShotId)) {
                        var $a = CLink.baseATag(fileName, CLink.getCLink(screenShotId), 'span');
                        $a.css({
                            'color': '#696969',
                            'height': '26px',
                            'text-decoration': 'underline'
                        });
                        $a.attr('data-url', $a.attr('href'));
                        $a.attr('href', '');
                        $a.addClass('daiiz-jslink');
                        $v[0].innerHTML = $a[0].outerHTML;
                    }
                }
            });
        }
    }], [{
        key: 'targets',
        value: function targets() {
            var matchUrls = [['GyazoSearch', 'https://gyazo.com/search'], ['Gyazo', 'https://gyazo.com/(.+)'], ['GooglePhoto', 'https://photos.google.com/photo/(.+)'], ['GooglePhoto', 'https://photos.google.com/album/(.+)'], ['GoogleDriveFolders', 'https://drive.google.com/drive/folders/(.+)']];
            return matchUrls;
        }
    }, {
        key: 'matchUrl',
        value: function matchUrl(pageUrl) {
            var targets = CLink.targets();
            for (var i = 0; i < targets.length; i++) {
                var t = targets[i][1];
                var r = new RegExp(t, 'i');
                if (pageUrl.match(r)) {
                    return targets[i][0];
                }
            }
            return false;
        }

        // 右クリックメニュー生成

    }, {
        key: 'showMenu',
        value: function showMenu(trigger, insertClosestBefore, $tooltip, extractFunction) {
            var $body = $('body');
            $body.on('mouseenter', trigger, function (e) {
                $('.daiiz-svgss-btn').remove();

                var $t = $(e.target);
                var screenShotId = extractFunction($t);
                if (screenShotId) {
                    $tooltip.addClass("daiiz-svgss-btn");
                    $tooltip.attr('href', CLink.getCLink(screenShotId));
                    $t.closest(insertClosestBefore).before($tooltip);
                }
            });
        }
    }, {
        key: 'extractScreenShotId',
        value: function extractScreenShotId(str) {
            var res = '';
            res = (str.split('-')[1] || '').split('.')[0];
            res = res.split('(')[0];
            return res;
        }
    }, {
        key: 'checkScreenShotId',
        value: function checkScreenShotId(sid) {
            if (sid.length > 5 && +sid % 1 === 0) return sid;
            return false;
        }
    }, {
        key: 'getCLink',
        value: function getCLink() {
            var screenShotId = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

            //var screenShotId = CLink.extractScreenShotId(idStr);
            var base = 'https://svgscreenshot.appspot.com/c';
            return base + '/' + screenShotId;
        }
    }, {
        key: 'baseATag',
        value: function baseATag(a, href) {
            var tag = arguments.length <= 2 || arguments[2] === undefined ? 'a' : arguments[2];

            return $('<' + tag + ' title="SVGスクリーンショットを開く" class="daiiz-svgss-btn" target="_blank" href="' + href + '" style="cursor: pointer">' + a + '</' + tag + '>');
        }
    }]);

    return CLink;
}();

var cc = new CLink();
