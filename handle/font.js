// handle/font.js

const text = require('fontstyles');

const font = {
  thin: msg => text.thin(msg),
  italic: msg => text.italic(msg),
  bold: msg => text.bold(msg),
  underline: msg => text.underline(msg),
  strike: msg => text.strike(msg),
  monospace: msg => text.monospace(msg),
  roman: msg => text.roman(msg),
  bubble: msg => text.bubble(msg),
  squarebox: msg => text.squarebox(msg),
  origin: msg => text.origin(msg),
};

let userFontSettings = { enabled: true, currentFont: 'origin' };

function formatFont(msg) {
  if (!userFontSettings.enabled || userFontSettings.currentFont === 'origin') {
    return msg;
  }
  return font[userFontSettings.currentFont](msg);
}

module.exports = {
  formatFont,
  font,
  userFontSettings
};
