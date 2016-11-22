'use strict';

// BrowserActionのBadgeをクリア
var clearBadge = function clearBadge() {
  chrome.browserAction.setBadgeText({
    'text': ''
  });
};

// ブラウザ側でもa.href, titleを確認する
var validateUrl = function validateUrl() {
  var url = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

  // http, https で始まるもののみOK
  var prot = url.split(':')[0].toLowerCase();
  if (prot && (prot === 'http' || prot === 'https')) {
    // OK
  } else {
      return '';
    }
  // <, > を除去
  url = url.replace(/</g, '').replace(/>/g, '');
  return url;
};

var validateTitle = function validateTitle() {
  var title = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

  // <, > を除去
  title = title.replace(/</g, '').replace(/>/g, '');
  return title;
};
