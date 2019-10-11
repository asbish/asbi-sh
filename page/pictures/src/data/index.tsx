import { h, VNode } from 'preact';
import css from './style.css';

export interface Source {
  url: string;
  srcSet?: string;
  source?: VNode<'source'> | VNode<'source'>[];
}

export interface Picture {
  t: string; // This is used as id and title
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  text: VNode<any> | VNode<any>[];
  src: Source[];
  srcH: number; // height/width
  thumb: [string, string, string]; // [url, width, height]
}

export const pics: Picture[] = [
  {
    t: 'Hobbyhorse',
    text: [
      <p key="horse-l0" className={css.para}>
        {'A person wearing a Horse Head Mask.'}
      </p>,
      <p key="horse-l1" className={css.para}>
        <ul className={css.list}>
          <li className={css.item}>{'Year / 2017'}</li>
          <li className={css.item}>{'Height / 11cm'}</li>
          <li className={css.item}>{'Materials / CLAY(SCULPEY)'}</li>
        </ul>
      </p>
    ],
    thumb: [
      '/assets/pictures/horse-mask-thumb-200w270h-20191010.jpg',
      '200px',
      '270px'
    ],
    srcH: 1.4,
    src: [
      {
        url: '/assets/pictures/horse-mask-00-1080w1512h-20191010.jpg',
        srcSet: '/assets/pictures/horse-mask-00-600w840h-20191010.jpg 600w',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/horse-mask-00-600w840h-20191010.webp 600w, /assets/pictures/horse-mask-00-1080w1512h-20191010.webp"
          />
        ]
      },
      {
        url: '/assets/pictures/horse-mask-01-1080w1512h-20191010.jpg',
        srcSet: '/assets/pictures/horse-mask-01-600w840h-20191010.jpg 600w',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/horse-mask-01-600w840h-20191010.webp 600w, /assets/pictures/horse-mask-01-1080w1512h-20191010.webp"
          />
        ]
      },
      {
        url: '/assets/pictures/horse-mask-02-1080w1512h-20191010.jpg',
        srcSet: '/assets/pictures/horse-mask-02-600w840h-20191010.jpg 600w',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/horse-mask-02-600w840h-20191010.webp 600w, /assets/pictures/horse-mask-02-1080w1512h-20191010.webp"
          />
        ]
      }
    ]
  },
  {
    t: 'asbish',
    text: [
      <p key="asbish-l0" className={css.para}>
        {'Create it for this web site.'}
      </p>,
      <p key="asbish-l1" className={css.para}>
        <ul className={css.list}>
          <li className={css.item}>{'Year / 2017'}</li>
          <li className={css.item}>{'Tools / ADOBE ILLUSTRATOR'}</li>
        </ul>
      </p>
    ],
    thumb: [
      '/assets/pictures/asbi-sh-top-thumb-270w270h-20191010.jpg',
      '270px',
      '270px'
    ],
    srcH: 1,
    src: [
      {
        url: '/assets/pictures/asbi-sh-top-00-1080w1080h-20191010.jpg',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/asbi-sh-top-00-1080w1080h-20191010.webp"
          />
        ]
      },
      {
        url: '/assets/pictures/asbi-sh-top-01-1080w1080h-20191010.jpg',
        srcSet: '/assets/pictures/asbi-sh-top-01-600w600h-20191010.jpg 600w',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/asbi-sh-top-01-600w600h-20191010.webp 600w, /assets/pictures/asbi-sh-top-01-1080w1080h-20191010.webp"
          />
        ]
      },
      {
        url: '/assets/pictures/asbi-sh-top-02-1080w1080h-20191010.jpg',
        srcSet: '/assets/pictures/asbi-sh-top-02-600w600h-20191010.jpg 600w',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/asbi-sh-top-02-600w600h-20191010.webp 600w, /assets/pictures/asbi-sh-top-02-1080w1080h-20191010.webp"
          />
        ]
      }
    ]
  },
  {
    t: 'Nosferatu',
    text: [
      <p key="nosferatu-l0" className={css.para}>
        {'A head sculpture.'}
      </p>,
      <p key="nosferatu-l1" className={css.para}>
        <ul className={css.list}>
          <li className={css.item}>{'Year / 2016'}</li>
          <li className={css.item}>{'Height / 18.5cm'}</li>
          <li className={css.item}>
            {'Materials / CLAY(CHARVANT NSP MIDIUM)'}
          </li>
        </ul>
      </p>
    ],
    thumb: [
      '/assets/pictures/nosferatu-thumb-193w270h-20191010.jpg',
      '193px',
      '270px'
    ],
    srcH: 1.4,
    src: [
      {
        url: '/assets/pictures/nosferatu-raw-00-1080w1512h-20191010.jpg',
        srcSet: '/assets/pictures/nosferatu-raw-00-600w840h-20191010.jpg 600w',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/nosferatu-raw-00-600w840h-20191010.webp 600w, /assets/pictures/nosferatu-raw-00-1080w1512h-20191010.webp"
          />
        ]
      },
      {
        url: '/assets/pictures/nosferatu-raw-01-1080w1512h-20191010.jpg',
        srcSet: '/assets/pictures/nosferatu-raw-01-600w840h-20191010.jpg 600w',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/nosferatu-raw-01-600w840h-20191010.webp 600w, /assets/pictures/nosferatu-raw-01-1080w1512h-20191010.webp"
          />
        ]
      },
      {
        url: '/assets/pictures/nosferatu-raw-02-1080w1512h-20191010.jpg',
        srcSet: '/assets/pictures/nosferatu-raw-02-600w840h-20191010.jpg 600w',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/nosferatu-raw-02-600w840h-20191010.webp 600w, /assets/pictures/nosferatu-raw-02-1080w1512h-20191010.webp"
          />
        ]
      }
    ]
  },
  {
    t: 'Cards',
    text: [
      <p key="cards-l0" className={css.para}>
        {'Sculpting tools for my name cards.'}
      </p>,
      <p key="cards-l1" className={css.para}>
        <ul className={css.list}>
          <li className={css.item}>{'Year / 2015'}</li>
          <li className={css.item}>{'Tools / ADOBE ILLUSTRATOR'}</li>
        </ul>
      </p>
    ],
    thumb: [
      '/assets/pictures/card-thumb-270w270h-20191010.png',
      '270px',
      '270px'
    ],
    srcH: 1.6,
    src: [
      { url: '/assets/pictures/card-tools-700w1120h-20191010.png' },
      { url: '/assets/pictures/card-clay-700w1120h-20191010.png' }
    ]
  },
  {
    t: 'Robot',
    text: [
      <p key="robot-l0" className={css.para}>
        {
          "Based on my first original sculpture. Initially, I was going to create alphabetical illustrations, A to Z. But I couldn't come up with any idea for B..."
        }
      </p>,
      <p key="robot-l1" className={css.para}>
        <ul className={css.list}>
          <li className={css.item}>{'Year / 2015'}</li>
          <li className={css.item}>{'Tools / ADOBE ILLUSTRATOR'}</li>
        </ul>
      </p>
    ],
    thumb: [
      '/assets/pictures/robot-thumb-270w156h-20191010.png',
      '270px',
      '156px'
    ],
    srcH: 1,
    src: [
      { url: '/assets/pictures/robot-illustration-600w600h-20191010.png' },
      {
        url: '/assets/pictures/robot-sculpture-900w900h-20191010.jpg',
        srcSet: '/assets/pictures/robot-sculpture-500w500h-20191010.jpg 500w',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/robot-sculpture-500w500h-20191010.webp 500w, /assets/pictures/robot-sculpture-900w900h-20191010.webp"
          />
        ]
      }
    ]
  },
  {
    t: 'Devil Girl',
    text: [
      <p key="devil-girl-l0" className={css.para}>
        {'I inverted BSD daemon characteristics.'}
      </p>,
      <p key="devil-girl-l1" className={css.para}>
        <ul className={css.list}>
          <li className={css.item}>{'Year / 2012'}</li>
          <li className={css.item}>{'Height / 14cm'}</li>
          <li className={css.item}>
            {'Materials / WAX, CLAY, PUTTY(BODY FILLER)'}
          </li>
        </ul>
      </p>
    ],
    thumb: [
      '/assets/pictures/devil-girl-thumb-270w270h-20191010.jpg',
      '270px',
      '270px'
    ],
    srcH: 1.35,
    src: [
      {
        url: '/assets/pictures/devil-girl-illustration-1080w1458h-20191010.jpg',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/devil-girl-illustration-1080w1458h-20191010.webp"
          />
        ]
      },
      {
        url: '/assets/pictures/devil-girl-kit-00-1080w1458h-20191010.jpg',
        srcSet: '/assets/pictures/devil-girl-kit-00-600w810h-20191010.jpg 600w',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/devil-girl-kit-00-600w810h-20191010.webp 600w, /assets/pictures/devil-girl-kit-00-1080w1458h-20191010.webp"
          />
        ]
      },
      {
        url: '/assets/pictures/devil-girl-raw-00-1080w1458h-20191010.jpg',
        srcSet: '/assets/pictures/devil-girl-raw-00-600w810h-20191010.jpg 600w',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/devil-girl-raw-00-600w810h-20191010.webp 600w, /assets/pictures/devil-girl-raw-00-1080w1458h-20191010.webp"
          />
        ]
      },
      {
        url: '/assets/pictures/devil-girl-raw-01-1080w1458h-20191010.jpg',
        srcSet: '/assets/pictures/devil-girl-raw-01-600w810h-20191010.jpg 600w',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/devil-girl-raw-01-600w810h-20191010.webp 600w, /assets/pictures/devil-girl-raw-01-1080w1458h-20191010.webp"
          />
        ]
      },
      {
        url: '/assets/pictures/devil-girl-raw-02-1080w1458h-20191010.jpg',
        srcSet: '/assets/pictures/devil-girl-raw-02-600w810h-20191010.jpg 600w',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/devil-girl-raw-02-600w810h-20191010.webp 600w, /assets/pictures/devil-girl-raw-02-1080w1458h-20191010.webp"
          />
        ]
      },
      {
        url: '/assets/pictures/devil-girl-raw-03-1080w1458h-20191010.jpg',
        srcSet: '/assets/pictures/devil-girl-raw-03-600w810h-20191010.jpg 600w',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/devil-girl-raw-03-600w810h-20191010.webp 600w, /assets/pictures/devil-girl-raw-03-1080w1458h-20191010.webp"
          />
        ]
      },
      {
        url: '/assets/pictures/devil-girl-raw-04-1080w1458h-20191010.jpg',
        srcSet: '/assets/pictures/devil-girl-raw-04-600w810h-20191010.jpg 600w',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/devil-girl-raw-04-600w810h-20191010.webp 600w, /assets/pictures/devil-girl-raw-04-1080w1458h-20191010.webp"
          />
        ]
      }
    ]
  },
  {
    t: 'Zombie Girl',
    text: [
      <p key="zombie-girl-l0" className={css.para}>
        {'A memorable piece for me.'}
      </p>,
      <p key="zombie-girl-l1" className={css.para}>
        <ul className={css.list}>
          <li className={css.item}>{'Year / 2009'}</li>
          <li className={css.item}>{'Height / 21.5cm'}</li>
          <li className={css.item}>
            {'Materials / CLAY(SCULPEY), EPOXY PUTTY'}
          </li>
        </ul>
      </p>
    ],
    thumb: [
      '/assets/pictures/zombie-girl-thumb-270w270h-20191010.jpg',
      '270px',
      '270px'
    ],
    srcH: 1.35,
    src: [
      {
        url: '/assets/pictures/zombie-girl-00-1080w1458h-20191010.jpg',
        srcSet: '/assets/pictures/zombie-girl-00-600w810h-20191010.jpg 600w',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/zombie-girl-00-600w810h-20191010.webp 600w, /assets/pictures/zombie-girl-00-1080w1458h-20191010.webp"
          />
        ]
      },
      {
        url: '/assets/pictures/zombie-girl-01-1080w1458h-20191010.jpg',
        srcSet: '/assets/pictures/zombie-girl-01-600w810h-20191010.jpg 600w',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/zombie-girl-01-600w810h-20191010.webp 600w, /assets/pictures/zombie-girl-01-1080w1458h-20191010.webp"
          />
        ]
      },
      {
        url: '/assets/pictures/zombie-girl-02-1080w1458h-20191010.jpg',
        srcSet: '/assets/pictures/zombie-girl-02-600w810h-20191010.jpg 600w',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/zombie-girl-02-600w810h-20191010.webp 600w, /assets/pictures/zombie-girl-02-1080w1458h-20191010.webp"
          />
        ]
      },
      {
        url: '/assets/pictures/zombie-girl-03-1080w1458h-20191010.jpg',
        srcSet: '/assets/pictures/zombie-girl-03-600w810h-20191010.jpg 600w',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/zombie-girl-03-600w810h-20191010.webp 600w, /assets/pictures/zombie-girl-03-1080w1458h-20191010.webp"
          />
        ]
      },
      {
        url: '/assets/pictures/zombie-girl-04-1080w1458h-20191010.jpg',
        srcSet: '/assets/pictures/zombie-girl-04-600w810h-20191010.jpg 600w',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/zombie-girl-04-600w810h-20191010.webp 600w, /assets/pictures/zombie-girl-04-1080w1458h-20191010.webp"
          />
        ]
      }
    ]
  },
  {
    t: 'Misc',
    text: [
      <p key="misc-text-0" className={css.para}>
        {'Old sculptures in my student days.'}
      </p>
    ],
    thumb: [
      '/assets/pictures/misc-thumb-193w270h-20191010.jpg',
      '193px',
      '270px'
    ],
    srcH: 1.4,
    src: [
      {
        url: '/assets/pictures/misc-gp-00-1080w1512h-20191010.jpg',
        srcSet: '/assets/pictures/misc-gp-00-600w840h-20191010.jpg 600w',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/misc-gp-00-600w840h-20191010.webp 600w, /assets/pictures/misc-gp-00-1080w1512h-20191010.webp"
          />
        ]
      },
      {
        url: '/assets/pictures/misc-gp-01-800w1120h-20191010.jpg',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/misc-gp-01-800w1120h-20191010.webp"
          />
        ]
      },
      {
        url: '/assets/pictures/misc-gp-02-600w840h-20191010.jpg',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/misc-gp-02-600w840h-20191010.webp"
          />
        ]
      },
      {
        url: '/assets/pictures/misc-gp-03-600w840h-20191010.jpg',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/misc-gp-03-600w840h-20191010.webp"
          />
        ]
      },
      {
        url: '/assets/pictures/misc-mask-1080w1512h-20191010.jpg',
        srcSet: '/assets/pictures/misc-mask-600w840h-20191010.jpg 600w',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/misc-mask-600w840h-20191010.webp 600w, /assets/pictures/misc-mask-1080w1512h-20191010.webp"
          />
        ]
      },
      {
        url: '/assets/pictures/misc-papa-00-600w840h-20191010.jpg',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/misc-papa-00-600w840h-20191010.webp"
          />
        ]
      },
      {
        url: '/assets/pictures/misc-papa-01-600w840h-20191010.jpg',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/misc-papa-01-600w840h-20191010.webp"
          />
        ]
      },
      {
        url: '/assets/pictures/misc-boy-600w840h-20191010.jpg',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/misc-boy-600w840h-20191010.webp"
          />
        ]
      },
      {
        url: '/assets/pictures/misc-bb-600w840h-20191010.jpg',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/misc-bb-600w840h-20191010.webp"
          />
        ]
      },
      {
        url: '/assets/pictures/misc-frog-600w840h-20191010.jpg',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/misc-frog-600w840h-20191010.webp"
          />
        ]
      },
      {
        url: '/assets/pictures/misc-rhino-600w840h-20191010.jpg',
        source: [
          <source
            key="source-webp"
            type="image/webp"
            srcSet="/assets/pictures/misc-rhino-600w840h-20191010.webp"
          />
        ]
      }
    ]
  }
];
