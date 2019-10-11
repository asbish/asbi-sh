import { h, Component } from 'preact';

import { Picture } from '../../data';
import css from './style.css';
import Carousel from './carousel';

interface Props {
  pic: Picture;
  unsetCurrent: () => void;
  passiveOptions: PassiveOptions;
}

class Detail extends Component<Props> {
  componentDidMount() {
    document.documentElement.scrollTop = 0;
  }

  shouldComponentUpdate(nextProps: Props) {
    return nextProps.pic !== this.props.pic;
  }

  render({ pic: { t, src, srcH, text }, unsetCurrent, passiveOptions }: Props) {
    return (
      <div className={css.detail}>
        <div className={css.head}>
          <h2 className={css.title}>{t}</h2>
          <button
            type="button"
            className={css.close}
            onClick={unsetCurrent}
            aria-label="close"
          >
            <svg
              className={css.closeSVG}
              viewBox="0 0 26 26"
              focusable="false"
              preserveAspectRatio="xMidYMid meet"
            >
              <line
                className={css.closeSVGLine1}
                x1="2.02"
                y1="2.02"
                x2="23.98"
                y2="23.98"
              />
              <line
                className={css.closeSVGLine2}
                x1="2.02"
                y1="23.98"
                x2="23.98"
                y2="2.02"
              />
            </svg>
          </button>
        </div>
        <div className={css.content}>
          <Carousel
            t={t}
            src={src}
            srcH={srcH}
            passiveOptions={passiveOptions}
          />
          <div className={css.description}>
            <div className={css.descriptionText}>{text}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default Detail;
