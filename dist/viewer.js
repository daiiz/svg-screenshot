'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Viewer = (function () {
    function Viewer() {
        _classCallCheck(this, Viewer);

        this.UI_DARK = 'dark';
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

    _createClass(Viewer, [{
        key: 'storeVariable',
        value: function storeVariable(key, value) {
            localStorage[key] = value;
        }
    }, {
        key: 'getVariable',
        value: function getVariable(key) {
            return localStorage[key];
        }

        // UIモードに応じた配色を適用する
    }, {
        key: 'setUi',
        value: function setUi() {
            this.storeVariable(this.STORE_KEY__VIEWER_UI_THEME, this.ui_theme);
            if (this.ui_theme === this.UI_DARK) {
                // ヘッダ背景色
                $('header').css('background-color', '#212121');
                $('.headmenu').css('background-color', '#212121');
                // ページ背景色
                $('body').css('background-color', '#303030');
                // main領域背景色
                $('#main').css('background-color', '#424242');
                $('#main').css('color', '#fafafa');
            } else if (this.ui_theme === this.UI_LIGHT) {
                $('header').css('background-color', '#607D8B');
                $('.headmenu').css('background-color', '#607D8B');
                $('body').css('background-color', '#fafafa');
                $('#main').css('background-color', '#ffffff');
                $('#main').css('color', '#111');
            }
        }
    }, {
        key: 'renderSvgFile',
        value: function renderSvgFile(f) {
            var $stage = $('#main');
            var $title = $('#site-title');
            var $url = $('#btn-site-open');
            $stage[0].innerHTML = '';

            var reader = new FileReader();
            reader.onload = function (e) {
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
                document.title = pageTitle;
                $title[0].innerHTML = pageTitle;
                $title[0].title = pageTitle;
                $url[0].dataset.orgpageurl = pageUrl;
                svgRootTag.setAttributeNS(null, 'title', w + ' x ' + h);
                $stage[0].appendChild(svgRootTag);
            };
            // File APIを用いてテキストを読み込む
            reader.readAsText(f);
        }
    }, {
        key: 'bindEvents',
        value: function bindEvents() {
            var _this = this;

            // SVGスクリーンショットファイルをドラッグドロップで読み込む
            $('html').bind('drop', function (e) {
                e.preventDefault();
                var files = e.originalEvent.dataTransfer.files;
                var reader = new FileReader();
                if (files.length <= 0) return false;

                // ファイルimage/svg+xmlの読み込み
                // 複数与えられた場合でも，読み込むのは最初のファイルのみ
                var file = files[0];
                if (file.type.match('image/svg+xml') == -1) return false;
                _this.isVisibleRect = false;
                _this.renderSvgFile(file);
            }).bind('dragenter', function (e) {
                return false;
            }).bind('dragover', function (e) {
                return false;
            }).bind('dragleave', function (e) {
                return false;
            });

            // オリジナルサイトを新しいタブで開く
            $('#btn-site-open').on('click', function (e) {
                var $btn = $(e.target).closest('#btn-site-open');
                var url = $btn[0].dataset.orgpageurl || '';
                if (url.length > 0) {
                    window.open(url);
                }
            });

            // UIテーマを切り替える
            $('#btn_switch_ui_theme').on('click', function (e) {
                if (_this.ui_theme === _this.UI_LIGHT) {
                    _this.ui_theme = _this.UI_DARK;
                } else {
                    _this.ui_theme = _this.UI_LIGHT;
                }
                _this.setUi();
            });

            // SVG中のリンクRect要素の表示非表示を切り換える
            $('#btn_toggle_a_rect').on('click', function (e) {
                var rects = document.querySelectorAll('rect');
                if (rects.length === 0) return;
                if (!_this.isVisibleRect) {
                    // 表示する
                    for (var i = 0; i < rects.length; i++) {
                        var rect = rects[i];
                        rect.setAttribute('class', 'visibleRect');
                    }
                    _this.isVisibleRect = true;
                } else {
                    // 隠す
                    for (var i = 0; i < rects.length; i++) {
                        var rect = rects[i];
                        rect.setAttribute('class', '');
                    }
                    _this.isVisibleRect = false;
                }
            });

            // 埋め込み用iframe要素コードを表示する
            $('#btn_get_embeded_code').on('click', function (e) {
                var code = '<iframe></iframe>';
                window.prompt('埋め込みHTMLコード', code);
            });
        }
    }]);

    return Viewer;
})();

$(function () {
    // オリジナルサイトオープンボタンをホバーしたとき，
    // 移動先URLをToast表示する
    var snackbarContainer = document.querySelector('#toast');
    var $showToastButton = $('#btn-site-open');
    $showToastButton.on('mouseenter', function (e) {
        if (!$(snackbarContainer).hasClass('mdl-snackbar--active')) {
            var msg = e.target.dataset.orgpageurl;
            if (msg.length > 0) {
                snackbarContainer.MaterialSnackbar.showSnackbar({ message: msg });
            }
        }
    });
    var viewer = new Viewer();
});

