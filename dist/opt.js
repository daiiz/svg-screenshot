$(function () {
    var getStorage = function () {
      return JSON.parse(localStorage.svgscreenshot_settings);
    };

    var setStorage = function (obj) {
      localStorage.svgscreenshot_settings = JSON.stringify(obj);
    };

    if (!localStorage.svgscreenshot_settings) {
      setStorage({
        "use_scrapbox": "no",
        "id_scrapbox": ""
      });
    }else {
      var s = getStorage();
      console.info(s)
      if (s.use_scrapbox === 'yes') {
        $('#use_scrapbox')[0].checked = true;
      }
      $('#id_scrapbox')[0].value = s.id_scrapbox || '';
    }

    $('#btn_save').on('click', ev => {
      var useScrapbox = ($('#use_scrapbox')[0].checked) ? 'yes' : 'no';
      var idScrapbox = $('#id_scrapbox').val();
      if (idScrapbox.length === 0) useScrapbox = 'no';
      var s = getStorage();
      s.use_scrapbox = useScrapbox;
      s.id_scrapbox = idScrapbox;
      setStorage(s);
    });
});