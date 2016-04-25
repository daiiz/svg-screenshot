class Viewer {
    constructor () {
        this.bindEvents();
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
            window.open(url);
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
            var data = {
                message: msg
            };
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
        }
    });
    var viewer = new Viewer();
});
