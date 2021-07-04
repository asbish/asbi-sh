const {
  headerHeight,
  titleHeight,
  contentTopMargin,
  contentSideMargin,
  contentSideMarginX2,
  tabletsDisplayWidth,
  fixedMenuDisplayWidth
} = require('../lib/constants');

module.exports = {
  stage: 2,
  features: {
    'nesting-rules': true,
    'custom-media-queries': true
  },
  browsers: 'Firefox ESR,IE 11',
  preserve: false,
  autoprefixer: { grid: true },
  importFrom: [
    () => {
      const customProperties = {
        '--baseColor': '#f6f6f6',
        '--primaryColor': '#00799b',

        '--z0': 2147483647,
        '--z1': 1073741823,
        '--z2': 536870911,
        '--z3': 268435455,
        '--z4': 134217727,
        '--z5': 67108863,
        '--z6': 33554431,

        '--textLineMargin': '24px',

        '--menuWidth': '280px',
        '--headerHeight': `${headerHeight}px`,
        '--titleHeight': `${titleHeight}px`,

        '--contentTopMargin': `${contentTopMargin}px`,
        '--contentSideMargin': `${contentSideMargin}px`,
        '--contentSideMarginX2': `${contentSideMarginX2}px`,

        // Shorthand calc(0px - x)
        '--negContentTopMargin': `${-contentTopMargin}px`,
        '--negContentSideMargin': `${-contentSideMargin}px`,
        '--negContentSideMarginX2': `${-contentSideMarginX2}px`,

        '--minimumDisplayWidth': '320px',
        '--tabletsDisplayWidth': `${tabletsDisplayWidth}px`,
        '--fixedMenuDisplayWidth': `${fixedMenuDisplayWidth}px`
      };

      const customMedia = {
        '--tabletsDisplay': `only screen and (min-width: ${tabletsDisplayWidth}px)`,
        '--fixedMenuDisplay': `only screen and (min-width: ${fixedMenuDisplayWidth}px)`
      };

      return { customProperties, customMedia };
    }
  ]
};
