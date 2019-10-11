import { h, Component, render, options } from 'preact';
import { bind } from 'decko';
import qs from 'query-string';
import supportsPassive from 'shared/lib/supports-passive';

import { pics, Picture } from './data';
import Grid from './components/grid';
import Detail from './components/detail';
import Curtain from './components/curtain';

options.debounceRendering = requestAnimationFrame;

const passiveOptions: PassiveOptions = supportsPassive
  ? { passive: true }
  : false;

function findCurrentFromLocation(): Picture | null {
  if (!location.search) return null;

  const parsed = qs.parse(location.search);

  for (let i = 0; i < pics.length; i++) {
    const pic = pics[i];
    if (pic.t === parsed.t) {
      return pic;
    }
  }

  return null;
}

interface State {
  current: Picture | null;
  scrollTop: number;
  mountGrid: boolean; // Flag for lazy mounting of Grid component
  movingCurtain: boolean;
}

class App extends Component<{}, State> {
  constructor() {
    super();

    const current = findCurrentFromLocation();
    this.state = {
      current,
      scrollTop: 0,
      mountGrid: !current,
      movingCurtain: false
    };

    window.addEventListener('popstate', this.hPopState, false);

    // Disable default pinch zoom for swipe container
    document
      .querySelector("meta[name='viewport']")!
      .setAttribute(
        'content',
        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
      );
    // For iOS
    document.body.addEventListener('gesturestart', (e: Event) => {
      e.preventDefault();
    });
  }

  componentDidUpdate() {
    if (this.state.current === null) {
      // Restore Grid scroll position
      document.documentElement.scrollTop = this.state.scrollTop;
    }
  }

  @bind
  private hPopState() {
    const current = findCurrentFromLocation();
    this.setState({
      current,
      mountGrid: !current
    });
  }

  @bind
  private async setCurrent(idx: number) {
    this.setState(({ movingCurtain }) => {
      if (movingCurtain) return null;

      const current = pics[idx] || null;
      if (current) {
        window.history.pushState(
          { back: true },
          '',
          `?${qs.stringify({ t: current.t })}`
        );
      }

      return {
        current,
        scrollTop: document.documentElement.scrollTop,
        movingCurtain: true
      };
    });
  }

  @bind
  private unsetCurrent() {
    if (window.history.state && window.history.state.back) {
      window.history.back();
    } else {
      /* global PUBLIC_PATH */
      window.history.replaceState(null, '', PUBLIC_PATH);
      this.setState({ current: null, mountGrid: true });
    }
  }

  @bind
  private hCurtainEnd() {
    this.setState({ movingCurtain: false });
  }

  render(_: {}, { current, mountGrid, movingCurtain }: State) {
    return (
      <div>
        {mountGrid && (
          <div
            style={current && !movingCurtain ? { display: 'none' } : undefined}
          >
            <Grid pics={pics} setCurrent={this.setCurrent} />
          </div>
        )}
        <Curtain fill={!!current} onFillEnd={this.hCurtainEnd} />
        {current && !movingCurtain ? (
          <Detail
            pic={current}
            unsetCurrent={this.unsetCurrent}
            passiveOptions={passiveOptions}
          />
        ) : null}
      </div>
    );
  }
}

render(<App />, document.getElementById('pictures')!);
