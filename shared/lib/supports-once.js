var supported = false;

try {
  var options = Object.defineProperty({}, 'once', {
    // eslint-disable-next-line getter-return
    get: function () {
      supported = true;
    }
  });

  window.addEventListener('test', options, options);
  window.removeEventListener('test', options, options);
} catch (err) {
  supported = false;
}

module.exports = supported;
