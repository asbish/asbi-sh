import { h, Component } from 'preact';
import { bind, debounce } from 'decko';
import ResizeObserver from 'resize-observer-polyfill';

import { Source } from '../../data';
import css from './style.css';

interface Vector {
  x: number;
  y: number;
}

interface Transform extends Vector {
  scale: number;
}

function calcScaledDirectionToTheCenter(
  p: Touch,
  p1: Touch,
  targetRect: ClientRect | DOMRect,
  scale: number
): Vector {
  const fromX = (p1.clientX - p.clientX) * 0.5 + p.clientX;
  const fromY = (p1.clientY - p.clientY) * 0.5 + p.clientY;

  const halfWidth = targetRect.width * 0.5;
  const halfHeight = targetRect.height * 0.5;

  const x = (halfWidth - (fromX - targetRect.left)) * scale;
  const y = (halfHeight - (fromY - targetRect.top)) * scale;
  const maxX = halfWidth * scale - halfWidth;
  const maxY = halfHeight * scale - halfHeight;

  return {
    x: Math.abs(x) > maxX ? (x > 0 ? maxX : -maxX) : x,
    y: Math.abs(y) > maxY ? (y > 0 ? maxY : -maxY) : y
  };
}

function calcDistance(p: Touch, p1: Touch): number {
  const x = p1.clientX - p.clientX;
  const y = p1.clientY - p.clientY;
  return Math.sqrt(x * x + y * y);
}

function calcScale(
  start: Touch,
  start1: Touch,
  end: Touch,
  end1: Touch
): number {
  return calcDistance(end, end1) / calcDistance(start, start1);
}

interface Props {
  t: string;
  src: Source[];
  srcH: number;
  passiveOptions: PassiveOptions;
}

interface State {
  unitWidth: number;
  unitHeight: number;
  rightmost: number;
  sens: number;
  offset: number;
  focusIdx: number;
  focusT: Transform;
}

class Carousel extends Component<Props, State> {
  // Defaults
  private readonly moveTolerance = 50;
  private readonly sensitibity = 4;
  private readonly sensitibityWidth = 350;
  private readonly scaleTolerance = 0.01;
  private readonly unitGap = 40;
  private readonly clearance = 32;
  private readonly maxScale = 2.5;
  private readonly minScale = 0.6;

  // Gesture
  private start: Touch[] = [];
  private moveCount = 0;
  private lastSwipeDistance = 0;

  // Save [past, current] width.
  private preciseWidth: null | [number, number] = null;
  private baseObserver: ResizeObserver | null = null;

  state: State = {
    unitWidth: 2000,
    unitHeight: 0,
    rightmost: 0,
    sens: this.sensitibity,
    offset: 0,
    focusIdx: 0,
    focusT: { scale: 1, x: 0, y: 0 }
  };

  componentDidMount() {
    const { passiveOptions } = this.props;

    (this.base as HTMLElement).addEventListener(
      'touchstart',
      this.hTouchStart,
      passiveOptions
    );
    (this.base as HTMLElement).addEventListener(
      'touchmove',
      this.hTouchMove,
      passiveOptions
    );
    (this.base as HTMLElement).addEventListener(
      'touchend',
      this.hTouchEnd,
      passiveOptions
    );
    (this.base as HTMLElement).addEventListener(
      'touchcancel',
      this.hTouchEnd,
      passiveOptions
    );

    const observer = new ResizeObserver(this.hResize);
    observer.observe(this.base as HTMLElement);
    this.baseObserver = observer;
  }

  componentWillUnmount() {
    (this.base as HTMLElement).removeEventListener(
      'touchstart',
      this.hTouchStart,
      false
    );
    (this.base as HTMLElement).removeEventListener(
      'touchmove',
      this.hTouchMove,
      false
    );
    (this.base as HTMLElement).removeEventListener(
      'touchend',
      this.hTouchEnd,
      false
    );
    (this.base as HTMLElement).removeEventListener(
      'touchcancel',
      this.hTouchEnd,
      false
    );

    if (this.baseObserver) {
      this.baseObserver.disconnect();
      this.baseObserver = null;
    }

    this.start.length = 0;
  }

  shouldComponentUpdate(_: Props, { focusT: { scale } }: State) {
    return !(
      scale === this.state.focusT.scale &&
      (scale === this.maxScale || scale === this.minScale)
    );
  }

  @bind
  @debounce(100)
  private hResize(entries: ResizeObserverEntry[]) {
    const width = entries[0].contentRect.width;

    if (this.preciseWidth) {
      // Prevent recursive function call that occurs due to the influence of
      // displaying scroll-bar.
      if (this.preciseWidth[0] === width || this.preciseWidth[1] === width) {
        return;
      }
      this.preciseWidth = [this.preciseWidth[1], width];
    } else {
      this.preciseWidth = [width, width];
    }

    const unitWidth = width + this.unitGap;
    const sens = (width / this.sensitibityWidth) * this.sensitibity;

    this.setState(({ focusIdx }, { src, srcH }) => {
      return {
        unitWidth,
        unitHeight: width * srcH,
        rightmost: -unitWidth * (src.length - 1) - this.clearance,
        sens,
        offset: -unitWidth * focusIdx,
        focusT: { scale: 1, x: 0, y: 0 }
      };
    });
  }

  @bind
  private hTouchStart(e: TouchEvent) {
    if (e.touches.length > 1) {
      this.start = [e.touches[0], e.touches[1]];
    } else if (e.touches.length === 1) {
      this.start = [e.touches[0]];
    }

    this.moveCount = 0;
    this.lastSwipeDistance = 0;
  }

  @bind
  private hTouchMove(e: TouchEvent) {
    const { changedTouches } = e;

    if (this.start.length === 0 || changedTouches.length === 0) {
      return;
    }

    if (this.start.length > 1) {
      if (this.moveCount > 0) return;

      const start = this.start[0];
      const start1 = this.start[1];

      let end = start;
      let end1 = start1;

      for (let i = 0; i < changedTouches.length; i++) {
        const t = changedTouches[i];
        if (t.identifier === start.identifier) {
          end = t;
        } else if (t.identifier === start1.identifier) {
          end1 = t;
        }
      }

      const scale = calcScale(start, start1, end, end1);

      if (Math.abs(1 - scale) > this.scaleTolerance) {
        this.moveCount += 1;

        // Pinch fixed-rate zoom
        this.setState(({ focusT }) => {
          if (scale < 1) {
            if (focusT.scale === this.minScale) return null;
            return {
              focusT: {
                scale: this.minScale,
                x: 0,
                y: 0
              }
            };
          } else {
            if (focusT.scale === this.maxScale) return null;
            return {
              focusT: {
                scale: this.maxScale,
                ...calcScaledDirectionToTheCenter(
                  end,
                  end1,
                  (this.base as HTMLElement).getBoundingClientRect(),
                  this.maxScale
                )
              }
            };
          }
        });
      }
    } else {
      const start = this.start[0];
      const end = changedTouches[0];
      const dx = Math.abs(end.clientX - start.clientX);
      const dy = Math.abs(end.clientY - start.clientY);

      if (
        // Test tolerance and `X` is more traveled direction than `Y`
        (dy < this.moveTolerance || dx >= dy) &&
        dx >= this.moveTolerance
      ) {
        const distance = end.clientX - start.clientX;
        this.lastSwipeDistance = distance;

        this.start[0] = end;

        // Prevent swipe until touchend event happens.
        if (this.moveCount > 0) return;
        this.moveCount += 1;

        // Swipe unit
        this.setState(({ rightmost, sens, offset }) => {
          const newOffset = offset + distance * sens;
          return {
            offset:
              newOffset >= this.clearance
                ? this.clearance
                : newOffset < rightmost
                ? rightmost
                : newOffset,
            focusT: { scale: 1, x: 0, y: 0 }
          };
        });
      }
    }
  }

  @bind
  private hTouchEnd() {
    this.adjustImage();
    this.start.length = 0;
  }

  @bind
  private adjustImage(control?: 'next' | 'prev') {
    this.setState(({ unitWidth, offset, focusIdx }, { src }) => {
      let laterFocusIdx;

      if (!control) {
        const idx = Math.round(Math.abs(offset) / unitWidth);
        laterFocusIdx =
          // If last swipe direction is not same as next direction, abort.
          (this.lastSwipeDistance >= 0 ? 1 : -1) !== focusIdx - idx
            ? focusIdx
            : idx;
      } else {
        const idx = control === 'next' ? focusIdx + 1 : focusIdx - 1;
        laterFocusIdx = idx >= 0 && idx < src.length ? idx : focusIdx;
      }

      return {
        offset: -unitWidth * laterFocusIdx,
        focusIdx: laterFocusIdx,
        focusT: { scale: 1, x: 0, y: 0 }
      };
    });
  }

  @bind
  private hNavPrev(e: Event) {
    e.stopPropagation();
    this.adjustImage('prev');
  }

  @bind
  private hNavNext(e: Event) {
    e.stopPropagation();
    this.adjustImage('next');
  }

  render(
    { t, src }: Props,
    { unitWidth, unitHeight, offset, focusIdx, focusT: { scale, x, y } }: State
  ) {
    const imgs = [];

    if (this.preciseWidth) {
      for (
        let i = Math.max(focusIdx - 1, 0);
        i < Math.min(focusIdx + 2, src.length);
        i++
      ) {
        const s = src[i];
        const left = unitWidth * i + offset;
        const style: { [key: string]: string | number } =
          i !== focusIdx
            ? { transform: `matrix(1,0,0,1,${left},0)` }
            : {
                transform: `matrix(${scale},0,0,${scale},${left + x},${y})`,
                zIndex: scale === 1 ? 0 : 100
              };

        imgs.push(
          <picture key={i}>
            {s.source ? s.source : null}
            <img
              key="img"
              style={style}
              className={css.image}
              src={s.url}
              srcSet={s.srcSet}
              alt={`${t}-${i}`}
            />
          </picture>
        );
      }
    }

    return (
      <div style={{ height: `${unitHeight}px` }} className={css.carousel}>
        <div className={css.carouselInfo}>
          <div role="presentation" className={css.carouselBorder} />
          <div className={css.carouselCounter}>
            {`${focusIdx + 1} / ${src.length}`}
          </div>
        </div>
        <button
          type="button"
          className={css.carouselNavPrev}
          disabled={focusIdx === 0}
          onClick={this.hNavPrev}
          aria-label="prev"
        />
        <button
          type="button"
          className={css.carouselNavNext}
          disabled={focusIdx === src.length - 1}
          onClick={this.hNavNext}
          aria-label="next"
        />
        {imgs}
      </div>
    );
  }
}

export default Carousel;
