'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var sendChromeMsg = function sendChromeMsg(json, callback) {
    chrome.runtime.sendMessage(json, callback);
};

var ScreenShot = function () {
    function ScreenShot() {
        _classCallCheck(this, ScreenShot);

        this.CROP_BOX_SIZE = 120;
        this.uiInit();
        this.positionLastRclick = [0, 0];
        this.linkdata = null;
    }

    _createClass(ScreenShot, [{
        key: 'uiInit',
        value: function uiInit() {
            this.bindEvents();
        }

        // 切り抜きボックス, a要素カバーボックス

    }, {
        key: '$genCropper',
        value: function $genCropper() {
            var $cropper = $('<div class="daiz-ss-cropper" style="position: fixed;"></div>');
            $cropper.css({
                top: 0,
                left: 0,
                width: this.CROP_BOX_SIZE,
                height: this.CROP_BOX_SIZE
            });
            return $cropper;
        }

        // true : 表示中のウェブページをスクロール不可にする
        // false: 解除する

    }, {
        key: 'fixHtml',
        value: function fixHtml(fg) {
            var fg = fg || false;
            if (fg) {
                $('html').css({
                    height: '100%',
                    width: '100%',
                    overflow: 'hidden'
                });
            } else {
                $('html').css({
                    height: '',
                    width: '',
                    overflow: 'auto'
                });
            }
        }

        // 範囲指定のための長方形を表示する

    }, {
        key: 'setCropper',
        value: function setCropper() {
            var _this = this;

            var $cropper = this.$genCropper();
            var closeBtnImg = chrome.extension.getURL('x.png');
            var $closeBtn = $('<div id="daiz-ss-cropper-close"></div>');
            $closeBtn.css({
                'background-image': 'url(' + closeBtnImg + ')'
            });

            $cropper[0].className = 'daiz-ss-cropper-main';
            $cropper[0].id = 'daiz-ss-cropper-main';
            // 切り抜きボックスの位置を初期化
            $cropper.css({
                left: this.positionLastRclick[0] - this.CROP_BOX_SIZE / 2,
                top: this.positionLastRclick[1] - this.CROP_BOX_SIZE / 2,
                width: this.CROP_BOX_SIZE,
                height: this.CROP_BOX_SIZE
            });
            $cropper.append($closeBtn);
            // ドラッグ可能にする
            $cropper.draggable({
                stop: function stop(ev, ui) {
                    _this._setRects();
                }
            });
            // リサイズ可能にする
            $cropper.resizable({
                stop: function stop(ev, ui) {
                    _this._setRects();
                },
                handles: "all"
            });
            $('body').append($cropper);
        }
    }, {
        key: '_setRects',
        value: function _setRects() {
            var $cropper = $('#daiz-ss-cropper-main');
            var rect = $cropper[0].getBoundingClientRect();
            if (rect === undefined) return;
            this.removeCropper();
            this.linkdata = this.setRects(rect);
        }

        // ページ上で選択されている文字列を取得

    }, {
        key: 'getSelectedText',
        value: function getSelectedText() {
            var self = this;
            var selection = window.getSelection();
            var text = selection.toString();
            return text;
        }
    }, {
        key: 'setRects',
        value: function setRects(croppedRect) {
            this.fixHtml(true);

            // リンク以外のテキスト:
            var text = this.getSelectedText();
            $('#daiz-ss-cropper-main').attr('title', text);

            // リンク: 切り抜かれた形内のみ，aタグを覆えばよい
            var idx = 0;
            var aTags = $('body').find('a');
            var aTagRects = [];
            for (var i = 0; i < aTags.length; i++) {
                var aTag = aTags[i];
                var rect = aTag.getBoundingClientRect();
                if (rect !== undefined) {
                    // 検出したaタグが切り抜かれた領域内に完全に含まれているかを確認する
                    var fg = this.isInCroppedBox(rect, croppedRect);
                    if (fg) {
                        // リンク要素の位置と大きさに合わせて，長方形カバーを被せる
                        var $cropper = this.$genCropper();
                        $cropper.css({
                            width: rect.width,
                            height: rect.height,
                            left: rect.left,
                            top: rect.top
                        });
                        var aid = 'daiz-ss-a' + idx;
                        var pos = this.correctPosition(rect, croppedRect);
                        pos.id = aid;
                        pos.href = $(aTag).prop('href');
                        pos.text = $(aTag)[0].innerText;
                        pos.fontSize = $(aTag).css('font-size');
                        pos.fontFamily = $(aTag).css('font-family');

                        $cropper.attr('title', $(aTag).attr('href'));
                        $cropper.attr('id', aid);
                        $('body').append($cropper);
                        aTagRects.push(pos);
                        idx += 1;
                        console.info('[END] cover hovered a-tag');
                    }
                }
            }

            // 切り取り領域
            var pos_cropper = {
                x: 0,
                y: 0,
                orgX: croppedRect.left,
                orgY: croppedRect.top,
                width: croppedRect.width,
                height: croppedRect.height
            };

            var res = {
                cropperRect: pos_cropper,
                aTagRects: aTagRects,
                text: text,
                winW: window.innerWidth,
                winH: window.innerHeight,
                baseUri: window.location.href,
                title: document.title || ''
            };
            return res;
        }
    }, {
        key: 'isInCroppedBox',
        value: function isInCroppedBox(aTagRect, stageRect) {
            var xa = stageRect.left;
            var xb = stageRect.left + stageRect.width;
            var ya = stageRect.top;
            var yb = stageRect.top + stageRect.height;

            var x1 = aTagRect.left;
            var x2 = aTagRect.left + aTagRect.width;
            var y1 = aTagRect.top;
            var y2 = aTagRect.top + aTagRect.height;
            var w = x2 - x1;
            var h = y2 - y1;

            var fgX = xa <= x1 && x2 <= xb;
            var fgY = ya <= y1 && y2 <= yb;

            if (fgX && fgY && w >= 5 && h >= 5) {
                return true;
            }
            return false;
        }

        // aタグの位置補正
        // stageRectの左端，上端を基準とした距離表現に直す
        // aTagRect ⊂ stageRect は保証されている

    }, {
        key: 'correctPosition',
        value: function correctPosition(aTagRect, stageRect) {
            var res = {};
            var x1 = aTagRect.left - stageRect.left;
            var x2 = aTagRect.left + aTagRect.width - stageRect.left;
            var y1 = aTagRect.top - stageRect.top;
            var y2 = aTagRect.top + aTagRect.height - stageRect.top;
            res = {
                x: x1,
                y: y1,
                width: aTagRect.width,
                height: aTagRect.height
            };
            return res;
        }

        // 描画されている長方形カバーを全て消去

    }, {
        key: 'removeCropper',
        value: function removeCropper() {
            $('.daiz-ss-cropper').remove();
        }
    }, {
        key: 'removeCropperMain',
        value: function removeCropperMain() {
            $(".daiz-ss-cropper-main").remove();
        }
    }, {
        key: 'bindEvents',
        value: function bindEvents() {
            var _this2 = this;

            // cropperがクリックされたとき
            // 自身を消去する
            $('body').on('click', '.daiz-ss-cropper', function (ev) {
                $(ev.target).closest('.daiz-ss-cropper').remove();
            });

            // 切り抜きボックスがダブルクリックされたとき
            $('body').on('dblclick', '#daiz-ss-cropper-main', function (ev) {
                var res = [];
                window.getSelection().removeAllRanges();

                // 切り取りボックス内のa要素
                for (var j = 0; j < _this2.linkdata.aTagRects.length; j++) {
                    var aTagDatum = _this2.linkdata.aTagRects[j];
                    var aid = aTagDatum.id;
                    if ($('#' + aid).length > 0) {
                        res.push(aTagDatum);
                    }
                }
                _this2.linkdata.aTagRects = res;

                _this2.removeCropperMain();
                _this2.removeCropper();
                _this2.fixHtml(false);
                console.info(_this2.linkdata);

                // ページから不要なdivが消去されてからスクリーンショットを撮りたいので，
                // 1秒待ってから送信する
                window.setTimeout(function () {
                    if (_this2.linkdata !== null) {
                        sendChromeMsg({
                            command: 'make-screen-shot',
                            options: {
                                sitedata: _this2.linkdata
                            }
                        });
                    }
                }, 1000);
            });

            // 切り抜きボックスの閉じるボタンがクリックされたとき
            $('body').on('click', '#daiz-ss-cropper-close', function (ev) {
                _this2.removeCropper();
                _this2.removeCropperMain();
                _this2.fixHtml(false);
            });

            // ページでの右クリックを検出
            $(window).bind('contextmenu', function (e) {
                _this2.positionLastRclick = [e.clientX, e.clientY];
            });

            // コンテキストメニュー（右クリックメニュー）が押された通知をbackgroundページから受け取る
            chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
                if (request.event === 'click-context-menu') {
                    _this2.setCropper();
                }
            });
        }
    }]);

    return ScreenShot;
}();

var ss = new ScreenShot();

/** c-link を開くためのコンテキストメニュー **/
var setCLinkMenu = function setCLinkMenu() {
    var url = window.location.href;
    var serviceName = CLink.matchUrl(url);
    if (serviceName) {
        if (serviceName === 'GyazoSearch') {
            cc.GyazoSearch();
        } else if (serviceName === 'Gyazo') {
            cc.Gyazo();
        } else if (serviceName === 'GooglePhoto') {
            cc.GooglePhoto();
        }
    }
};

chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    if (request.event === 'updated-location-href') {
        setCLinkMenu();
    }
});
