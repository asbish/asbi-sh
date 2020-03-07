import { h, Component } from 'preact';
import { bind } from 'decko';

import { Picture } from '../../data';
import css from './style.css';

interface Props {
  pic: Picture;
  idx: number;
  className: string;
  setCurrent: (index: number) => void;
  observeInView: (node: HTMLElement, cb: () => void) => void;
  unobserveInView: (node: HTMLElement) => void;
}

interface State {
  inView: boolean;
  loaded: boolean;
}

class Item extends Component<Props, State> {
  state: State = { inView: false, loaded: false };

  componentDidMount() {
    this.props.observeInView(this.base as HTMLElement, this.inViewport);
  }

  componentWillUnmount() {
    this.props.unobserveInView(this.base as HTMLElement);
  }

  @bind
  private inViewport() {
    this.setState({ inView: true });
  }

  @bind
  private hImageLoad() {
    this.setState({ loaded: true });
  }

  @bind
  private hOpen() {
    this.props.setCurrent(this.props.idx);
  }

  render({ pic: { t, thumb }, className }: Props, { inView, loaded }: State) {
    return (
      <div className={className}>
        <button
          type="button"
          className={css.itemButton}
          style={{ width: thumb[1], height: thumb[2] }}
          onClick={this.hOpen}
          aria-label="open"
        >
          {inView ? (
            <img
              className={loaded ? css.itemThumb : css.itemThumbLoading}
              src={thumb[0]}
              alt={t}
              aria-busy={loaded ? 'false' : 'true'}
              onLoad={this.hImageLoad}
              onError={this.hImageLoad}
            />
          ) : null}
          <span role="presentation" className={css.itemOverlay} />
        </button>
      </div>
    );
  }
}

export default Item;
