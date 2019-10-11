function detectSupportsPassive() {
  var passiveSupported = false;

  try {
    var options = Object.defineProperty({}, 'passive', {
      // eslint-disable-next-line getter-return
      get: function() {
        passiveSupported = true;
      }
    });

    window.addEventListener('test', options, options);
    window.removeEventListener('test', options, options);
  } catch (err) {
    passiveSupported = false;
  }

  return passiveSupported;
}

var supported = detectSupportsPassive();

module.exports = supported;
