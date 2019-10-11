import 'intersection-observer';
import { bind } from 'decko';

class InView {
  private observer: IntersectionObserver | null = null;
  private callbacks: WeakMap<Element, () => void> = new WeakMap();
  private options: IntersectionObserverInit = {};

  constructor(options?: IntersectionObserverInit) {
    if (options) this.options = options;
  }

  @bind
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  @bind
  private hIntersection(
    entries: IntersectionObserverEntry[],
    observer: IntersectionObserver
  ) {
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      if (entry.intersectionRatio > 0 && entry.isIntersecting) {
        const elem = entry.target;

        const cbOnce = this.callbacks.get(elem);
        if (cbOnce) cbOnce();

        this.callbacks.delete(elem);
        observer.unobserve(elem);
      }
    }
  }

  @bind
  observe(elem: HTMLElement, cbOnce: () => void) {
    if (!this.observer) {
      this.observer = new IntersectionObserver(
        this.hIntersection,
        this.options
      );
    }

    // Check target elem is already observed.
    if (!this.callbacks.has(elem)) {
      this.callbacks.set(elem, cbOnce);
      this.observer.observe(elem);
    }
  }

  @bind
  unobserve(elem: HTMLElement) {
    if (this.observer) {
      this.observer.unobserve(elem);
    }

    this.callbacks.delete(elem);
  }
}

export default InView;
