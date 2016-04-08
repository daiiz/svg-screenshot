window.addEventListener('load', function () {
    var w = localStorage.w + 'px';
    var h = localStorage.h + 'px';
    var rootSVGtag = localStorage.svgroot;
    var res = document.querySelector('.daiz-ss');
    res.style.width = w;
    res.style.height = h;
    res.setAttributeNS(null, 'width', w);
    res.setAttributeNS(null, 'height', h);
    res.setAttributeNS(null, 'viewBox', '0 0 ' + localStorage.w + ' ' + localStorage.h);
    res.innerHTML = rootSVGtag;
    res.querySelector('.svg-screenshot').setAttributeNS(null, 'data-url', localStorage.url);
    var svg = res.innerHTML;

    var exportTag = document.getElementById("export");
    var blob = new Blob([svg], {
        type: "image/svg+xml"
    });
    var url = window.URL.createObjectURL(blob);
    exportTag.download = 'ss_w'+ localStorage.w + '_h' + localStorage.h;
    exportTag.href = url;


}, false);
