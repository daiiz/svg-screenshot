'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Viewer = (function () {
    function Viewer() {
        _classCallCheck(this, Viewer);

        this.bindEvents();
    }

    _createClass(Viewer, [{
        key: 'renderSvgFile',
        value: function renderSvgFile(f) {
            var $stage = $('#main');
            var $title = $('#site-title');
            var $url = $('#a-site-url');
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
                $title[0].innerHTML = pageTitle;
                $url[0].innerHTML = pageUrl;
                $url[0].href = pageUrl;
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

                // 複数与えられた場合でも，読み込むのは最初のファイルのみ
                var file = files[0];
                if (file.type.match('image/svg+xml') == -1) return false;
                _this.renderSvgFile(file);
            }).bind('dragenter', function (e) {
                return false;
            }).bind('dragover', function (e) {
                return false;
            }).bind('dragleave', function (e) {
                return false;
            });
        }
    }]);

    return Viewer;
})();

$(function () {
    var viewer = new Viewer();
    console.info(viewer);
});

