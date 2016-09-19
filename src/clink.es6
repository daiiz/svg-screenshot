/**
 * https://svgscreenshot.appspot.com/c/<ScreenShot-id> を開く
 */
class CLink {
    constructor (tab=null) {
        this.tab = tab;
        this.cn = 'daiiz-svgss-btn';
    }

    static targets () {
        var matchUrls = [
            // ['GyazoSearch', 'https://gyazo.com/search'],
            ['Gyazo', 'https://gyazo.com/(.+)'],
            ['GooglePhoto', 'https://photos.google.com/photo/(.+)'],
            ['GooglePhoto', 'https://photos.google.com/album/(.+)'],
            ['GoogleDriveFolders', 'https://drive.google.com/drive/folders/(.+)']
        ];
        return matchUrls;
    }

    static matchUrl (pageUrl) {
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
    static showMenu (trigger, insertClosestBefore, $tooltip, extractFunction) {
        var $body = $('body');
        $body.on('mouseenter', trigger, e => {
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

    static extractScreenShotId (str) {
        var res = '';
        res = (str.split('-')[1] || '').split('.')[0];
        res = res.split('(')[0];
        return res;
    }

    static checkScreenShotId (sid) {
        if (sid.length > 5 && +sid % 1 === 0) return sid;
        return false;
    }

    static getCLink (screenShotId='') {
        //var screenShotId = CLink.extractScreenShotId(idStr);
        var base = 'https://svgscreenshot.appspot.com/c';
        return `${base}/${screenShotId}`;
    }

    static baseATag (a, href) {
        return $(`<a title="SVGスクリーンショットを開く" class="daiiz-svgss-btn" target="_blank" href="${href}" style="cursor: pointer">${a}</a>`);
    }

    /**
     * サービス別に処理を定義する
     */
    // プレビュー型
    GooglePhoto () {
        $('body').on('mouseenter', 'div.R9U8ab', e => {
            var $v = $(e.target).closest('.R9U8ab');
            if ($v.find('a.daiiz-svgss-btn')) {
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
    Gyazo () {
        $('body').on('mouseenter', '.metadata-row', e => {
            var $t = $(e.target).closest('.metadata-row');
            if ($t.find('.metadata-key > i').hasClass('gy-icon-title')) {
                var $v = $t.find('.metadata-value');
                if ($v.find('a.daiiz-svgss-btn')) {
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
    GoogleDriveFolders () {
        $('body').on('mouseenter', 'span.l-Ab-T-r', e => {
            var $v = $(e.target).closest('.l-Ab-T-r');
            if ($v.find('a.daiiz-svgss-btn')) {
                var fileName = $v[0].innerHTML;
                var screenShotId = CLink.extractScreenShotId(fileName);
                if (CLink.checkScreenShotId(screenShotId)) {
                    var $a = CLink.baseATag(fileName, CLink.getCLink(screenShotId));
                    $a.css('color', '#222');
                    $v[0].innerHTML = $a[0].outerHTML;
                }
            }
        });
    }

    // リスト型
    GyazoSearch () {
        var extract = ($triggerElement) => {
            var $thumbInner = $triggerElement.closest('.thumb-inner');
            var fileName = $thumbInner.find('.title')[0].innerHTML;
            var screenShotId = CLink.extractScreenShotId(fileName);
            return CLink.checkScreenShotId(screenShotId);
        };

        var tipStyle = 'position: absolute; top: -24px; left: 2px; background: #555; color: #fff; text-align: left; ' +
            'z-index: 1000; padding: 4px; line-height: 1; border-radius: 3px; cursor: pointer;';
        var $tip = $(`<div style="${tipStyle}">Open ScreenShot</div>`);

        var aStyle = 'text-decoration: none; display: inline; width: initial; height: initial; position: static;';
        var $a = $(`<a style="${aStyle}" target="_blank" href="#">`);
        $a.append($tip);

        CLink.showMenu('.search-thumb', '.thumb-inner', $a, extract);
    }
}

var cc = new CLink();