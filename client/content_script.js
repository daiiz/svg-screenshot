const APP_PREFIX = 'dynamic_gazo';
const dynamicGazo = window.dynamicGazo
const ESC = 27
let flagMousedown = false

const sendChromeMsg = (json, callback) => {
    chrome.runtime.sendMessage(json, callback);
};

class ScreenShot {
    constructor () {
        this.CROP_BOX_SIZE = 150;
        this.uiInit();
        this.positionLastRclick = [200, 200];
        this.linkdata = null;
        this.tmp = {
            // 右クリックされた画像要素
            '$contextMenuImg': []
        };
        this.inlineViewer = null;

        // アプリケーションとしてSVG撮影を使う場合，アプリ名がセットされる
        this.app = null;
    }

    renderCropper (boxParams = []) {
        var self = this;
        self.initCropperMain(boxParams, null)
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

    $showWrapper () {
        const $body = $('body')
        const $wrapper = $(`<div id='daiiz-wrapper'></div>`)
        $wrapper.css({
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            cursor: 'crosshair',
            zIndex: 2147483646
        })
        $body.append($wrapper)
        return $wrapper
    }

    // 範囲指定のための長方形を表示する
    initCropperMain () {
        const self = this
        const $cropper = this.$genCropper()
        const $wrapper = this.$showWrapper()
        const startPosition = {
            left: 0,
            top: 0
        }

        $cropper[0].className = 'daiz-ss-cropper-main'
        $cropper[0].id = `${APP_PREFIX}-daiz-ss-cropper-main`

        $wrapper.on('mousedown', event => {
            startPosition.left = event.pageX
            startPosition.top = event.pageY
            $cropper.css({
                left  : startPosition.left - window.scrollX,
                top   : startPosition.top - window.scrollY,
                width : 0,
                height: 0
            })
            flagMousedown = true
            self.fixHtml(true)
            $('body').append($cropper)
        })

        this.setMousemoveHandler($wrapper, $cropper, startPosition)
        this.setMousemoveHandler($cropper, $cropper, startPosition)

        $wrapper.on('mouseup', event => {
            const width = event.pageX - startPosition.left
            const height = event.pageY - startPosition.top
            if (width < 20 || height < 20) return
            $cropper.css({ width, height })
            flagMousedown = false
            $wrapper.remove()
            self._setRects(false)
        })

        $(window).on('keyup', event => {
            if (event.keyCode === ESC) self.clearCropper()
        })
    }

    clearCropper () {
        flagMousedown = false
        this.clean()
    }

    setMousemoveHandler ($elem, $cropper, startPosition) {
        const self = this
        $elem.on('mousemove', event => {
            if (!flagMousedown) return
            $cropper.css({
                width : event.pageX - startPosition.left,
                height: event.pageY - startPosition.top,
            })
            self._setRects(true)
        })
    }

    _setRects (simulate=false, _range=undefined) {
        var $cropper = $(`#${APP_PREFIX}-daiz-ss-cropper-main`)
        const range = _range || $cropper[0].getBoundingClientRect()
        if (range === undefined) return;
        this.removeCropper()

        if (simulate) {
            this.linkdata = this.setRects(range, simulate)
        } else {
            this.clean()
            // ページから不要なdivが消去されてからスクリーンショットを撮りたいので，
            // 1秒待ってから送信する
            window.setTimeout(() => {
                if (this.existCropUI()) {
                    console.log('rep')
                    this._setRects(false, range)
                    return
                }
                this.linkdata = this.setRects(range, simulate)
                this.capture()
            }, 1)
        }
    }

    // ページ上で選択されている文字列を取得
    getSelectedText () {
        var self = this;
        var selection = window.getSelection();
        var text = selection.toString();
        return text;
    }

    setRects (range, simulate=false) {
        // this.fixHtml(true)
        let $cropperMain = null
        if (!simulate) {
            $cropperMain = $(this.removeCropperMain())
        }

        const anchorsInArea = new dynamicGazo.AnchorsInArea(document)
        anchorsInArea.options.detail = true
        anchorsInArea.options.onlyInTopLayer = !simulate
        const aTags = anchorsInArea.find(range)

        let imgTags = []
        if (!simulate) {
            // XXX: 要素が増えたら、共通化
            imgTags = this.correctPositions(anchorsInArea.find(range, 'img'), range)
            for (const imgTag of imgTags) {
                imgTag.css = {}
                imgTag.css['border-radius'] = jQuery(imgTag.ref).css('border-radius') || '0px'
            }
        }

        // リンク以外のテキスト:
        var text = this.getSelectedText();
        $('#daiz-ss-cropper-main').attr('title', text);

        // リンク: 切り抜かれた形内のみ，aタグを覆えばよい
        var aTagRects = [];
        for (var i = 0; i < aTags.length; i++) {
            var aTag = aTags[i];
            var rect = aTag.position
            if (rect !== undefined) {
                // リンク要素の位置と大きさに合わせて，長方形カバーを被せる
                const $cropper = this.$genCropper();
                $cropper.css({
                    width : rect.width,
                    height: rect.height,
                    left  : rect.left,
                    top   : rect.top
                });
                var aid = `daiz-ss-a${i}`;
                var pos = this.correctPosition(rect, range);
                pos.id = aid;
                pos.href = aTag.url;
                pos.text = aTag.text;
                pos.fontSize = $(aTag.ref).css('font-size');
                pos.fontFamily = $(aTag.ref).css('font-family');

                $cropper.attr('title', aTag.url);
                $cropper.attr('id', aid);
                if (simulate) $('body').append($cropper);
                aTagRects.push(pos);
            }
        }

        // 切り取り領域
        var pos_cropper = {
            x     : 0,
            y     : 0,
            orgX  : range.left,
            orgY  : range.top,
            width : range.width,
            height: range.height
        };

        var title = document.title || '';
        if (title.length === 0) {
            // PDFページの場合，embedタグからファイル名を抽出して
            // titleとする
            var embeds = $('embed');
            if (embeds.length > 0 && embeds[0].type === 'application/pdf') {
                var pdfPath = '/' + embeds[0].src;
                var toks = pdfPath.split('/');
                title = toks[toks.length - 1];
            }
        }

        var res = {
            cropperRect : pos_cropper,
            aTagRects   : aTagRects,
            elementRects: {
                img: imgTags
            },
            text        : text,
            winW        : window.innerWidth,
            winH        : window.innerHeight,
            baseUri     : window.location.href,
            title       : title
        };
        return res;
    }

    // aタグの位置補正
    // stageRectの左端，上端を基準とした距離表現に直す
    // aTagRect ⊂ stageRect は保証されている
    correctPosition (aTagRect, stageRect) {
        // XXX: scrollの扱いを詰める必要あり
        let res = {}
        const x1 = aTagRect.left - stageRect.left
        // var x2 = (aTagRect.left + aTagRect.width) - stageRect.left;
        const y1 = aTagRect.top - stageRect.top
        // var y2 = (aTagRect.top + aTagRect.height) - stageRect.top;
        res = {
            x     : x1,
            y     : y1,
            width : aTagRect.width,
            height: aTagRect.height
        }
        return res
    }

    correctPositions (rects, stageRect) {
        for (const rect of rects) {
            const {x, y} = this.correctPosition(rect.position, stageRect)
            rect.x = x
            rect.y = y
        }
        return rects
    }

    // 描画されている長方形カバーを全て消去
    removeCropper () {
        $('.daiz-ss-cropper').remove();
    }

    getCropperMain () {
        return $(".daiz-ss-cropper-main")[0]
    }

    removeCropperMain () {
        const $elem = $(".daiz-ss-cropper-main")
        if ($elem.length === 0) return null
        const copy = $elem[0].cloneNode(true)
        $elem.remove();
        return copy
    }

    capture (mode='capture') {
        var self = this
        var res = []
        window.getSelection().removeAllRanges()

        // MacBook ProのRetinaディスプレイなどの高解像度な
        // ディスプレイを使用している場合は1より大きな値となる
        var rat = Math.max(window.devicePixelRatio, 1.0);
        if (self.linkdata !== null) {
            var appName = self.app;
            self.app = null;
            sendChromeMsg({
                command: 'make-screen-shot',
                options: {
                    sitedata: self.linkdata,
                    mode: mode,
                    scrapbox_box_id: null,
                    app: appName,
                    dpr: rat
                }
            });
        }
    }

    clean () {
        if (!this.existCropUI()) return
        console.log('clean')
        this.removeCropperMain();
        this.removeCropper();
        $('#daiiz-wrapper').remove()
        this.fixHtml(false);
    }

    existCropUI () {
        const wrapperExist = $('#daiiz-wrapper').length > 0
        const cropperMainExist = $('.daiz-ss-cropper-main').length > 0
        const cropperExist = $('.daiz-ss-cropper').length > 0
        return wrapperExist || cropperMainExist || cropperExist
    }

    bindEvents () {
        var self = this;
        var $body = $('body');

        // 画像上での右クリックを追跡
        $body.on('contextmenu', 'img', ev => {
            var $img = $(ev.target).closest('img');
            this.tmp.$contextMenuImg = $img;
        });

        $body.on('contextmenu', '.card-thumbnail', ev => {
            var $img = $(ev.target).closest('.card-area').find('.card-img');
            this.app = 'linkcard';
            self.tmp.$contextMenuImg = $img;
        });

        // ページでの右クリックを検出
        $(window).bind('contextmenu', (e) => {
            this.positionLastRclick = [e.clientX, e.clientY];
        });

        // コンテキストメニュー（右クリックメニュー）が押された通知をbackgroundページから受け取る
        chrome.extension.onRequest.addListener((request, sender, sendResponse) => {
            var re = request.event;
            if (re === 'capture-whole-page') {
                // 撮影領域を選択するやつを表示
                const range = {
                    left: 0,
                    right: window.innerWidth,
                    top: 0,
                    bottom: window.innerHeight,
                    width: window.innerWidth,
                    height: window.innerHeight
                }
                this.linkdata = this.setRects(range, false)
                this.capture()
            } else if (re === 'capture-range') {
                this.renderCropper()
            } else if (re === 'cancel-capture-range') {
                this.clean()
            }
        });

        $body.on('click', '.card-close', ev => {
            $('.card-area').remove();
        });
    }
}
var ss = new ScreenShot();

chrome.extension.onRequest.addListener((request, sender, sendResponse) => {
    var mark = "chrome-ext";
    if (request.event === 'updated-location-href') {
        var $body = $('body');
        if ($body.length > 0) {
            $body[0].dataset.stat_daiz_svgss = mark;
        }
        if (ss.inlineViewer === null) {
            ss.inlineViewer = new InlineViewer();
        }
    }
})
