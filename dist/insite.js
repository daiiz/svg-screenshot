'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var sendChromeMsg = function sendChromeMsg(json, callback) {
    chrome.runtime.sendMessage(json, callback);
};

var ScreenShot = (function () {
    function ScreenShot() {
        _classCallCheck(this, ScreenShot);

        this.uiInit();
        this.linkdata = null;
    }

    _createClass(ScreenShot, [{
        key: 'uiInit',
        value: function uiInit() {
            this.bindEvents();
            console.info('[END] init js');
        }
    }, {
        key: '$genCropper',
        value: function $genCropper() {
            var $cropper = $('<div class="daiz-ss-cropper" style="position: fixed;"></div>');
            // 切り抜きボックスの位置を初期化
            $cropper.css({
                top: 0,
                left: 0,
                width: 50,
                height: 50
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
            $cropper[0].className = 'daiz-ss-cropper-main';
            $cropper[0].id = 'daiz-ss-cropper-main';
            // 切り抜きボックスの位置を初期化
            $cropper.css({
                top: 0,
                left: 0,
                width: 50,
                height: 50
            });
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
            // 前回生成した長方形カバーを消去
            $('.daiz-ss-cropper').remove();
            this.linkdata = this.setRects(rect);
        }
    }, {
        key: 'setRects',
        value: function setRects(croppedRect) {
            var idx = 0;
            // 切り抜かれた長方形内のみ，aタグを覆えばよい
            this.fixHtml(true);
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
                        // pos.url = window.location.href;  //NOTE
                        pos.href = $(aTag).prop('href');
                        $cropper.attr('title', $(aTag).attr('href'));
                        $cropper.attr('id', aid);
                        $('body').append($cropper);
                        aTagRects.push(pos);
                        idx += 1;
                        console.info('[END] cover hovered a-tag');
                    }
                }
            }
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
    }, {
        key: 'bindEvents',
        value: function bindEvents() {
            var _this2 = this;

            // cropperがクリックされたとき
            // 自身を消去する
            $('body').on('click', '.daiz-ss-cropper', function (ev) {
                $(ev.target).remove();
            });

            // 切り抜きボックスがダブルクリックされたとき
            $('body').on('dblclick', '#daiz-ss-cropper-main', function (ev) {
                var res = [];
                for (var j = 0; j < _this2.linkdata.aTagRects.length; j++) {
                    var aTagDatum = _this2.linkdata.aTagRects[j];
                    var aid = aTagDatum.id;
                    if ($('#' + aid).length > 0) {
                        res.push(aTagDatum);
                    }
                }
                _this2.linkdata.aTagRects = res;
                console.info(res);
                $(".daiz-ss-cropper-main").remove();
                $(".daiz-ss-cropper").remove();
                _this2.fixHtml(false);
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

            // コンテキストメニュー（右クリックメニュー）が押された通知をbackgroundページから受け取る
            chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
                if (request.event === 'click-context-menu') {
                    _this2.setCropper();
                }
            });
        }
    }]);

    return ScreenShot;
})();

var ss = new ScreenShot();

