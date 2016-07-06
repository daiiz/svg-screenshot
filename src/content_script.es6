var sendChromeMsg = (json, callback) => {
    chrome.runtime.sendMessage(json, callback);
};

class ScreenShot {
    constructor () {
        this.CROP_BOX_SIZE = 120;
        this.uiInit();
        this.positionLastRclick = [0, 0];
        this.linkdata = null;
    }

    uiInit () {
        this.bindEvents();
    }

    // 切り抜きボックス, a要素カバーボックス
    $genCropper () {
        var $cropper = $(`<div class="daiz-ss-cropper" style="position: fixed;"></div>`);
        $cropper.css({
            top   : 0,
            left  : 0,
            width : this.CROP_BOX_SIZE,
            height: this.CROP_BOX_SIZE
        });
        return $cropper;
    }

    // true : 表示中のウェブページをスクロール不可にする
    // false: 解除する
    fixHtml (fg) {
        var fg = fg || false;
        if (fg) {
            $('html').css({
                height  : '100%',
                width   : '100%',
                overflow: 'hidden'
            })
        }else {
            $('html').css({
                height  : '',
                width   : '',
                overflow: 'auto'
            })
        }
    }

    // 範囲指定のための長方形を表示する
    setCropper () {
        var $cropper = this.$genCropper();
        var closeBtnImg = chrome.extension.getURL('x.png');
        var $closeBtn = $('<div id="daiz-ss-cropper-close"></div>');
        $closeBtn.css({
            'background-image': `url(${closeBtnImg})`
        });

        $cropper[0].className = 'daiz-ss-cropper-main';
        $cropper[0].id = 'daiz-ss-cropper-main';
        // 切り抜きボックスの位置を初期化
        $cropper.css({
            left  : this.positionLastRclick[0] - (this.CROP_BOX_SIZE / 2),
            top   : this.positionLastRclick[1] - (this.CROP_BOX_SIZE / 2),
            width : this.CROP_BOX_SIZE,
            height: this.CROP_BOX_SIZE
        });
        $cropper.append($closeBtn);
        // ドラッグ可能にする
        $cropper.draggable({
            stop: (ev, ui) => {
                this._setRects();
            }
        });
        // リサイズ可能にする
        $cropper.resizable({
            stop: (ev, ui) => {
                this._setRects();
            },
            handles: "all"
        });
        $('body').append($cropper);
    }

    _setRects () {
        var $cropper = $('#daiz-ss-cropper-main');
        var rect = $cropper[0].getBoundingClientRect();
        if (rect === undefined) return;
        this.removeCropper();
        this.linkdata = this.setRects(rect);
    }

    setRects (croppedRect) {
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
                        width : rect.width,
                        height: rect.height,
                        left  : rect.left,
                        top   : rect.top
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
        var pos_cropper = {
            x     : 0,
            y     : 0,
            orgX  : croppedRect.left,
            orgY  : croppedRect.top,
            width : croppedRect.width,
            height: croppedRect.height
        };
        var res = {
            cropperRect : pos_cropper,
            aTagRects   : aTagRects,
            winW        : window.innerWidth,
            winH        : window.innerHeight,
            baseUri     : window.location.href,
            title       : document.title || ''
        };
        return res;
    }

    isInCroppedBox(aTagRect, stageRect) {
        var xa = stageRect.left;
        var xb = stageRect.left + stageRect.width;
        var ya = stageRect.top;
        var yb = stageRect.top + stageRect.height;

        var x1 = aTagRect.left;
        var x2 = aTagRect.left + aTagRect.width;
        var y1 = aTagRect.top;
        var y2 = aTagRect.top + aTagRect.height;
        var w  = x2 - x1;
        var h  = y2 - y1;

        var fgX = (xa <= x1 && x2 <= xb);
        var fgY = (ya <= y1 && y2 <= yb);

        if (fgX && fgY && w >= 5 && h >= 5) {
            return true;
        }
        return false;
    }

    // aタグの位置補正
    // stageRectの左端，上端を基準とした距離表現に直す
    // aTagRect ⊂ stageRect は保証されている
    correctPosition (aTagRect, stageRect) {
        var res = {};
        var x1 = aTagRect.left - stageRect.left;
        var x2 = (aTagRect.left + aTagRect.width) - stageRect.left;
        var y1 = aTagRect.top - stageRect.top;
        var y2 = (aTagRect.top + aTagRect.height) - stageRect.top;
        res = {
            x     : x1,
            y     : y1,
            width : aTagRect.width,
            height: aTagRect.height
        };
        return res;
    }

    // 描画されている長方形カバーを全て消去
    removeCropper () {
        $('.daiz-ss-cropper').remove();
    }

    removeCropperMain () {
        $(".daiz-ss-cropper-main").remove();
    }

    bindEvents () {
        // cropperがクリックされたとき
        // 自身を消去する
        $('body').on('click', '.daiz-ss-cropper', ev => {
            this.removeCropper();
        });

        // 切り抜きボックスがダブルクリックされたとき
        $('body').on('dblclick', '#daiz-ss-cropper-main', ev => {
            var res = [];
            for (var j = 0; j < this.linkdata.aTagRects.length; j++) {
                var aTagDatum = this.linkdata.aTagRects[j];
                var aid = aTagDatum.id;
                if ($(`#${aid}`).length > 0) {
                    res.push(aTagDatum);
                }
            }
            this.linkdata.aTagRects = res;

            this.removeCropperMain();
            this.removeCropper();
            this.fixHtml(false);
            console.info(this.linkdata)
            // ページから不要なdivが消去されてからスクリーンショットを撮りたいので，
            // 1秒待ってから送信する
            window.setTimeout(() => {
                if (this.linkdata !== null) {
                    sendChromeMsg({
                        command: 'make-screen-shot',
                        options: {
                            sitedata: this.linkdata
                        }
                    });
                }
            }, 1000);
        });

        // 切り抜きボックスの閉じるボタンがクリックされたとき
        $('body').on('click', '#daiz-ss-cropper-close', ev => {
            this.removeCropper();
            this.removeCropperMain();
            this.fixHtml(false);
        });

        // ページでの右クリックを検出
        $(window).bind('contextmenu', (e) => {
            this.positionLastRclick = [e.clientX, e.clientY];
        });

        // コンテキストメニュー（右クリックメニュー）が押された通知をbackgroundページから受け取る
        chrome.extension.onRequest.addListener((request, sender, sendResponse) => {
            if (request.event === 'click-context-menu') {
                this.setCropper();
            }
        });
    }
}

var ss = new ScreenShot();
