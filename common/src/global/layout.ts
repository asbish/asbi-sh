import { fixedMenuDisplayWidth } from 'shared/lib/constants';
import supportsPassive from 'shared/lib/supports-passive';

let menuOpened = false;

function closeMenu(): void {
  menuOpened = false;

  document.body.setAttribute('data-menu', 'closed');

  const guide = document.getElementById('guide')!;
  guide.setAttribute('aria-pressed', 'false');
  guide.focus();
}

function openMenu(): void {
  menuOpened = true;

  document.body.setAttribute('data-menu', 'opened');

  const guide = document.getElementById('guide')!;
  guide.setAttribute('aria-pressed', 'true');
  guide.focus();
}

const focusElementsInMenu = '.menu-item-container a';
const menuTransitionDuration = '200ms';

function toggleMenu(e: Event | KeyboardEvent): void {
  if (menuOpened) {
    if ('key' in e) {
      // Trap prev element focus
      if (e.key === 'Tab' && e.shiftKey) {
        const links = document.querySelectorAll(focusElementsInMenu);
        const last = links[links.length - 1];
        (last as HTMLElement).focus();
        e.preventDefault();
        return;
      }

      if (e.key !== 'Enter' && e.key !== 'Escape') return;
    }
    closeMenu();
  } else {
    if ('key' in e && e.key !== 'Enter') return;

    if (window.innerWidth < fixedMenuDisplayWidth) {
      const menu = document.getElementById('menu');
      if (menu!.style.transitionDuration !== menuTransitionDuration) {
        menu!.style.transitionDuration = menuTransitionDuration;
      }
    }

    openMenu();
  }
}

function jumpMenuLink(e: Event | KeyboardEvent): void {
  if (menuOpened && 'key' in e && e.key === 'Escape') {
    closeMenu();
    e.preventDefault();
  }
}

function jumpMenuLinkLast(e: Event | KeyboardEvent): void {
  if (menuOpened && 'key' in e) {
    if (e.key === 'Tab' && !e.shiftKey) {
      document.getElementById('guide')!.focus();
      e.preventDefault();
    } else if (e.key === 'Escape') {
      closeMenu();
      e.preventDefault();
    }
  }
}

let width = window.innerWidth;
function resize(): void {
  if (window.innerWidth !== width) {
    width = window.innerWidth;

    const menu = document.getElementById('menu')!;
    if (window.innerWidth < fixedMenuDisplayWidth) {
      menu.style.transitionDuration = menuTransitionDuration;
    } else {
      menu.style.transitionDuration = '0s';
      if (menuOpened) closeMenu();
    }
  }
}

export function init(): void {
  const guide = document.getElementById('guide')!;
  guide.addEventListener('mousedown', toggleMenu, false);
  guide.addEventListener('keydown', toggleMenu, false);

  const mask = document.getElementById('mask')!;
  mask.addEventListener('mousedown', toggleMenu, false);

  const links = document.querySelectorAll(focusElementsInMenu);
  for (let i = 0; i < links.length; i++) {
    if (i === links.length - 1) {
      links[i].addEventListener('keydown', jumpMenuLinkLast, false);
    } else {
      links[i].addEventListener('keydown', jumpMenuLink, false);
    }
  }

  window.addEventListener(
    'resize',
    resize,
    supportsPassive ? { passive: true } : false
  );
}
