import { h, Component } from 'preact';

import { Picture } from '../../data';
import InView from '../../utils/in-view';
import css from './style.css';
import Item from './item';

function detectPadding(len: number): [number, number, number] {
  const modCol2 = len % 2;
  const modCol3 = len % 3;
  const col2 = modCol2 && 2 - modCol2;
  const col3 = modCol3 && 3 - modCol3;

  if (col2 !== 0 && col3 !== 0) {
    const both = Math.min(col3, col2);
    return [both, 0, col3 - both];
  }

  return [0, col2, col3];
}

interface Props {
  pics: Picture[];
  setCurrent: (index: number) => void;
}

class Grid extends Component<Props> {
  private inView = new InView();

  shouldComponentUpdate(nextProps: Props) {
    return nextProps.pics.length !== this.props.pics.length;
  }

  componentWillUnmount() {
    this.inView.disconnect();
  }

  render({ pics, setCurrent }: Props) {
    const items = [];

    for (let i = 0; i < pics.length; i++) {
      const pic = pics[i];
      items.push(
        <Item
          key={pic.t}
          pic={pic}
          idx={i}
          className={css.item}
          setCurrent={setCurrent}
          observeInView={this.inView.observe}
          unobserveInView={this.inView.unobserve}
        />
      );
    }

    const [both, col2, col3] = detectPadding(pics.length);
    if (both !== 0) {
      for (let i = 0; i < both; i++) {
        items.push(
          <div key={`both${i}`} className={css.pad} role="presentation" />
        );
      }
    }
    if (col2 !== 0) {
      for (let i = 0; i < col2; i++) {
        items.push(
          <div key={`pad2${i}`} className={css.padCol2} role="presentation" />
        );
      }
    }
    if (col3 !== 0) {
      for (let i = 0; i < col3; i++) {
        items.push(
          <div key={`pad3${i}`} className={css.padCol3} role="presentation" />
        );
      }
    }

    return <div className={css.grid}>{items}</div>;
  }
}

export default Grid;
