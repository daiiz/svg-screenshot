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
        "id_scrapbox": "[]"
      });
    }else {
      var s = getStorage();
      if (s.use_scrapbox === 'yes') {
        $('#use_scrapbox')[0].checked = true;
      }
      var idSet = s.id_scrapbox.join('\n');
      $('#id_scrapbox')[0].value = idSet || '';
    }

    $('#btn_save').on('click', ev => {
      var useScrapbox = ($('#use_scrapbox')[0].checked) ? 'yes' : 'no';
      var idScrapbox = $('#id_scrapbox').val();
      var ids = idScrapbox.split('\n');
      var idSet = [];
      for (var i = 0; i < ids.length; i++) {
        var toks = ('/' + ids[i]).split('/');
        var id = (toks[toks.length - 1]).trim();
        if (id.length > 0) {
          idSet.push(id);
        }
      }
      if (idSet.length === 0) useScrapbox = 'no';

      var s = getStorage();
      s.use_scrapbox = useScrapbox;
      s.id_scrapbox = idSet;
      setStorage(s);
    });
});