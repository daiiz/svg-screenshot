class Viewer {
    constructor () {
        this.bindEvents();
    }

    renderSvgFile (f) {
        var $stage = $('#main');
        var $title = $('#site-title');
        var $url   = $('#a-site-url');
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
            $url[0].innerHTML = pageUrl;
            $url[0].href = pageUrl;
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
    }
}

$(function () {
    var viewer = new Viewer();
    console.info(viewer);
});
