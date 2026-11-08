/* The existing case cards are pulled out of a compact folder stack. */
(() => {
  const stage = document.querySelector('#cases');
  const tabs = stage.querySelector('.file-tabs');
  const wrap = stage.querySelector('.deck-wrap');
  const deck = document.querySelector('#caseDeck');
  const cards = [...deck.querySelectorAll('.file-card')];
  const buttons = [...tabs.querySelectorAll('button')];
  const previous = document.querySelector('#casePrev');
  const next = document.querySelector('#caseNext');
  const counter = document.querySelector('#caseCount');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  let selected = -1;
  let pinned = false;

  function show(index) {
    if (selected === index && wrap.hidden === (index < 0)) return;
    selected = index;
    buttons.forEach((button, i) => {
      button.setAttribute('aria-selected', String(i === index));
      button.tabIndex = 0;
      cards[i].setAttribute('aria-hidden', String(i !== index));
      cards[i].inert = i !== index;
    });
    wrap.hidden = index < 0;
    if (index >= 0) {
      const overlay = hover.matches && innerWidth >= 761;
      if (overlay) tabs.before(wrap);
      else buttons[index].after(wrap);
      wrap.classList.toggle('case-overlay', overlay);
      if (overlay) {
        const available = tabs.getBoundingClientRect().top - Math.max(0, stage.getBoundingClientRect().top);
        wrap.style.setProperty('--case-preview-space', Math.max(180, available - 14) + 'px');
      }
      wrap.scrollTop = 0;
      document.dispatchEvent(new Event('portfolio:case-shown'));

      if (!matchMedia('(prefers-reduced-motion: reduce)').matches && window.gsap) {
        window.gsap.fromTo(cards[index], { y: overlay ? 140 : 32 }, {
          y: 0, duration: .48, ease: 'power3.out', overwrite: true,
          clearProps: 'transform'
        });
      }
      wrap.style.setProperty('--open-folder', getComputedStyle(buttons[index]).getPropertyValue('--folder-color'));
    }
    previous.disabled = index <= 0;
    next.disabled = index === cards.length - 1;
    counter.textContent = `${Math.max(1, index + 1)} / ${String(cards.length).padStart(2, '0')}`;
  }

  function go(index) {
    pinned = true;
    show(Math.max(0, Math.min(cards.length - 1, index)));
  }

  buttons.forEach((button, index) => {
    button.addEventListener('pointerenter', () => {
      if (hover.matches && !pinned) show(index);
    });
    button.onkeydown = event => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const step = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
      const target = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 :
        (index + step + buttons.length) % buttons.length;
      go(target);
      buttons[target].focus({ preventScroll: true });
    };
    button.onclick = () => {
      if (hover.matches && innerWidth >= 761) {
        go(index);
        const link = [...cards[index].querySelectorAll('a[href]')].find(anchor =>
          /(?:account|commercial|huihuo|rcc)\.html$/.test(anchor.getAttribute('href')) &&
          anchor.getClientRects().length);
        if (link) link.click();
        return;
      }
      if (selected === index && pinned) {
        pinned = false;
        show(-1);
      } else go(index);
    };
  });
  stage.addEventListener('pointerleave', () => {
    if (hover.matches && !pinned && !wrap.contains(document.activeElement)) show(-1);
  });
  stage.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || selected < 0) return;
    buttons[selected].focus();
    pinned = false;
    show(-1);
  });
  function adaptOpenCard() {
    if (selected < 0) return;
    const index = selected;
    selected = -1;
    show(index);
  }
  hover.addEventListener('change', adaptOpenCard);
  matchMedia('(min-width: 761px)').addEventListener('change', adaptOpenCard);
  previous.onclick = () => go(selected - 1);
  next.onclick = () => go(selected + 1);
  window.WCYCaseNavigation = { go };
  stage.classList.add('folder-stack');
  show(-1);

  const requested = new URLSearchParams(location.search).get('case');
  if (/^[1-4]$/.test(requested || '')) {
    go(Number(requested) - 1);
    requestAnimationFrame(() => stage.scrollIntoView());
  }
})();
