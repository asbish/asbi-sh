import './index.css';
import PendulumRenderElement from './pendulum-render-element';

function createSelectButton(
  bobSource: string,
  bobLabel: string,
  bobIco: string
) {
  const img = document.createElement('img');
  img.className = 'pendulum-select-button-ico';
  img.src = bobIco;
  img.alt = '';

  const button = document.createElement('button');
  button.className = 'pendulum-select-button';
  button.setAttribute('type', 'button');
  button.setAttribute('aria-label', bobLabel);
  button.appendChild(img);

  button.addEventListener('click', () => {
    document.querySelector('pendulum-render')!.setAttribute('src', bobSource);
  });

  return button;
}

{
  const select = document.createElement('div');
  select.className = 'pendulum-select';

  select.appendChild(
    createSelectButton(
      '/assets/pendulum/sphere.gltf',
      'Sphere',
      '/assets/pendulum/sphere.svg'
    )
  );
  select.appendChild(
    createSelectButton(
      '/assets/pendulum/robozilla.gltf',
      'Robozilla',
      '/assets/pendulum/robozilla-ico.svg'
    )
  );

  const cntr = document.getElementById('pendulum-cntr')!;
  cntr.appendChild(new PendulumRenderElement());
  cntr.appendChild(select);
}
