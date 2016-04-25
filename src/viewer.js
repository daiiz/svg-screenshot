class Viewer {
    constructor () {
        this.UI_DARK  = 'dark';
        this.UI_LIGHT = 'light';
        this.STORE_KEY__VIEWER_UI_THEME = 'viewer_ui_theme';
        // ローカルストレージに設定情報が存在すれば，それを使用する
        this.ui_theme = this.getVariable(this.STORE_KEY__VIEWER_UI_THEME) || this.UI_LIGHT;
        // SVGのrect要素を可視化するかどうか
        this.isVisibleRect = false;
        this.setUi();
        this.bindEvents();
    }

    // ローカルストレージに設定変数を保存する
    storeVariable (key, value) {
        localStorage[key] = value;
    }

    getVariable (key) {
        return localStorage[key];
    }

    // UIモードに応じた配色を適用する
    setUi () {
        this.storeVariable(this.STORE_KEY__VIEWER_UI_THEME, this.ui_theme);
        if (this.ui_theme === this.UI_DARK) {
            // ヘッダ背景色
            $('header').css('background-color', '#212121');
            $('.headmenu').css('background-color', '#212121');
            // ページ背景色
            $('body').css('background-color', '#303030');
            // main領域背景色
            $('#main').css('background-color', '#424242');
        }else if (this.ui_theme === this.UI_LIGHT) {
            $('header').css('background-color', '#607D8B');
            $('.headmenu').css('background-color', '#607D8B');
            $('body').css('background-color', '#fafafa');
            $('#main').css('background-color', '#ffffff');
        }
    }

    renderSvgFile (f) {
        var $stage = $('#main');
        var $title = $('#site-title');
        var $url   = $('#btn-site-open');
        $stage[0].innerHTML = '';

        var reader = new FileReader();
        reader.onload = e => {
            $('#hide')[0].innerHTML = reader.result;
            var svgRootTag = $('.svg-screenshot')[0];
            var viewbox = svgRootTag.viewBox.baseVal;
            var w = viewbox.width;
            var h = viewbox.height;
            $stage.css({
                width: w,
                height: h
            });
            var pageUrl = svgRootTag.getAttribute('data-url') || '';
            var pageTitle = svgRootTag.getAttribute('data-title') || 'Viewer';
            $title[0].innerHTML = pageTitle;
            $title[0].title = pageTitle;
            $url[0].dataset.orgpageurl = pageUrl;
            svgRootTag.setAttributeNS(null, 'title', `${w} x ${h}`);
            $stage[0].appendChild(svgRootTag);
        }
        // File APIを用いてテキストを読み込む
        reader.readAsText(f);
    }

    bindEvents () {
        // SVGスクリーンショットファイルをドラッグドロップで読み込む
        $('html').bind('drop', e => {
            e.preventDefault();
            var files = e.originalEvent.dataTransfer.files;
            var reader = new FileReader();
            if (files.length <= 0) return false;

            // 複数与えられた場合でも，読み込むのは最初のファイルのみ
            var file = files[0];
            if (file.type.match('image/svg+xml') == -1) return false;
            this.renderSvgFile(file);

        }).bind('dragenter', e => {
            return false;
        }).bind('dragover', e => {
            return false;
        }).bind('dragleave', e => {
            return false;
        });

        // オリジナルサイトを新しいタブで開く
        $('#btn-site-open').on('click', e => {
            var $btn = $(e.target).closest('#btn-site-open');
            var url = $btn[0].dataset.orgpageurl || '';
            if (url.length > 0) {
                window.open(url);
            }
        });

        // UIテーマを切り替える
        $('#btn_switch_ui_theme').on('click', e => {
            if (this.ui_theme === this.UI_LIGHT) {
                this.ui_theme = this.UI_DARK;
            }else {
                this.ui_theme = this.UI_LIGHT;
            }
            this.setUi();
        });

        // SVG中のリンクRect要素の表示非表示を切り換える
        $('#btn_toggle_a_rect').on('click', e => {
            var rects = document.querySelectorAll('rect');
            if (rects.length === 0) return;
            if (!this.isVisibleRect) {
                // 表示する
                for (var i = 0; i < rects.length; i++) {
                    var rect = rects[i];
                    rect.setAttribute('class', 'visibleRect');
                }
                this.isVisibleRect = true;
            }else {
                // 隠す
                for (var i = 0; i < rects.length; i++) {
                    var rect = rects[i];
                    rect.setAttribute('class', '');
                }
                this.isVisibleRect = false;
            }
        });
    }
}

$(function () {
    // オリジナルサイトオープンボタンをホバーしたとき，
    // 移動先URLをToast表示する
    var snackbarContainer = document.querySelector('#toast');
    var $showToastButton = $('#btn-site-open');
    $showToastButton.on('mouseenter', function (e) {
        if (!$(snackbarContainer).hasClass('mdl-snackbar--active')) {
            var msg = e.target.dataset.orgpageurl;
            if (msg.length > 0) {
                snackbarContainer.MaterialSnackbar.showSnackbar({message: msg});
            }
        }
    });
    var viewer = new Viewer();
});
