interface MessageOptions {
  delay?: number;
}

class PendulumBannerElement extends HTMLElement {
  private timeoutID: number | null = null;

  connectedCallback() {
    this.classList.add('pendulum-banner');
    this.displayMessage = this.displayMessage.bind(this);
  }

  disconnectedCallback() {
    if (typeof this.timeoutID === 'number') {
      clearTimeout(this.timeoutID);
    }
  }

  sendMessage(message: string | null, options: MessageOptions = {}) {
    if (typeof this.timeoutID === 'number') {
      clearTimeout(this.timeoutID);
    }

    if (!message) {
      this.classList.remove('pendulum-banner--open');
      return;
    }

    if (options.delay) {
      this.timeoutID = window.setTimeout(() => {
        this.displayMessage(message);
      }, options.delay);
    } else {
      this.displayMessage(message);
    }
  }

  private displayMessage(message: string) {
    this.classList.add('pendulum-banner--open');
    this.textContent = message;
  }
}

if (!window.customElements.get('pendulum-banner')) {
  window.customElements.define('pendulum-banner', PendulumBannerElement);
}

export default PendulumBannerElement;
