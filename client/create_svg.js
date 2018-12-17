const sourceStyle = [
  `.source text {
    fill: #888888;
    font-size: 11px;
    font-weight: 400;
    text-decoration: none;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  }`,
  `.source text:hover {
    text-decoration: underline;
    fill: #2962FF;
  }`
]

const createSVGTag = (
  {aTagRects, elementRects, text, width, height, baseUri, title, base64Img}) => {
  const externals = []

  // imgs
  const imgs = elementRects.img
  for (const imgRect of imgs) {
    const {url, position} = imgRect
    // Gyazo以外の画像は無視
    if (url.match(/gyazo\.com\//i) === null) continue
    // 静止画像の場合は無視
    if (url.match(/\.(svg|png|jpe?g|bmp)$/i) !== null) continue
    externals.push({
      url,
      x: imgRect.x,
      y: imgRect.y,
      width: position.width,
      height: position.height,
      type: 'img'
    })
  }

  // ページ内リンク
  for (const anchor of aTagRects) {
    externals.push({
      url: validateUrl(anchor.href),
      x: anchor.x,
      y: anchor.y,
      width: anchor.width,
      height: anchor.height,
      text: validateTitle(anchor.text)
    })
  }

  // 出典
  externals.push({
    url: validateUrl(baseUri),
    text: validateTitle(title),
    className: 'source',
    x: 4,
    y: height - 4
  })

  const svgTagText = dynamicGazo.svgize.createSvg(base64Img, {
    width, height,
    className: 'svg-screenshot',
    dataset: {
      url: validateUrl(baseUri),
      title: validateTitle(title)
    },
    externals,
    style: sourceStyle
  })

  return {tagText: svgTagText, viewBox: `0 0 ${width} ${height}`}
}
