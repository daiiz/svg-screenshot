$(function () {
    const getOptions = () => {
      return JSON.parse(localStorage.svgscreenshot_settings)
    }

    const saveOptions = function (obj) {
      localStorage.svgscreenshot_settings = JSON.stringify(obj)
    }

    if (!localStorage.svgscreenshot_settings) {
      saveOptions({
        useGyazo: "no",
        gyazoHashtag: "#SVGScreenshot"
      })
    }else {
      const {useGyazo, gyazoHashtag} = getOptions()
      $('#use_gyazo')[0].checked = useGyazo === 'yes'
      $('#gyazo_hashtag')[0].value = gyazoHashtag
    }

    $('#btn_save').on('click', () => {
      const useGyazo = ($('#use_gyazo')[0].checked) ? 'yes' : 'no'
      const gyazoHashtag = $('#gyazo_hashtag')[0].value
      saveOptions({useGyazo, gyazoHashtag})
      window.close()
    })
})
