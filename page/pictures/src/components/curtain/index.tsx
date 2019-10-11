import { h, Component } from 'preact';
import { bind } from 'decko';

import css from './style.css';

interface Props {
  fill: boolean;
  onFillEnd: () => void;
}

class Curtain extends Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    return nextProps.fill !== this.props.fill;
  }

  @bind
  private hProxyEnd(e: TransitionEvent) {
    if (this.props.fill && e.propertyName === 'opacity') {
      this.props.onFillEnd();
    }
  }

  render({ fill }: Props) {
    let dark, light;

    if (fill) {
      dark = css.darkToFill;
      light = css.lightToFill;
    } else {
      dark = css.dark;
      light = css.light;
    }

    return (
      <div className={css.curtain} role="presentation">
        <div className={dark} onTransitionEnd={this.hProxyEnd} />
        <div className={light} />
      </div>
    );
  }
}

export default Curtain;
