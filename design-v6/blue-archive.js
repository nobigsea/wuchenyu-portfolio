(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const pending = 'wcy-archive-entry';
  const routes = ['account', 'huihuo', 'commercial', 'rcc'];
  // Cloudflare Pages redirects .html URLs to their extensionless forms.
  const routePath = path => path.replace(/\.html$/, '').replace(/\/index$/, '/');

  const header = document.querySelector('.topline, .archive-header');
  const navigation = document.querySelector('.sidebar nav, .archive-header nav');
  if (header && navigation) {
    const home = header.classList.contains('topline');
    const identity = home ? document.querySelector('.sidebar .archive-avatar') : header.querySelector('.archive-wordmark');
    identity.classList.add('reference-identity');
    const label = document.createElement('span');
    label.textContent = '吴晨渝 · 作品档案';
    identity.append(label);
    const wordmark = document.createElement('a');
    wordmark.className = 'reference-wordmark';
    wordmark.href = home ? '#intro' : 'index.html#intro';
    wordmark.textContent = 'WCY’S ARCHIVE';
    const menu = document.createElement('details');
    menu.className = 'reference-menu';
    const toggle = document.createElement('summary');
    toggle.textContent = 'About';
    if (home) navigation.append(header.querySelector('a'));
    menu.append(toggle, navigation);
    menu.addEventListener('click', event => {
      if (event.target.closest('a')) menu.open = false;
    });
    menu.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.open) {
        menu.open = false;
        toggle.focus();
      }
    });
    header.classList.add('reference-topbar');
    header.replaceChildren(identity, wordmark, menu);
    document.querySelector('.sidebar')?.setAttribute('hidden', '');
  }

  const reader = document.querySelector('.archive-detail :is(.project-layout,.brand-page)');
  if (reader) {
    let active = 0;
    const title = document.createElement('div');
    title.className = 'archive-case-title';
    title.setAttribute('aria-hidden', 'true');
    const masthead = document.createElement('div');
    masthead.className = 'archive-case-masthead';
    const context = document.createElement('div');
    context.className = 'archive-case-context';
    context.setAttribute('aria-hidden', 'true');
    masthead.append(title, context);
    reader.before(masthead);
    const tabs = document.createElement('div');
    tabs.className = 'blue-reader-tabs';
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', '案例阅读分区');
    const buttons = ['项目概览', '策略详情'].map((label, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.id = 'archive-tab-' + index;
      button.textContent = label;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', 'archive-panel-' + index);
      button.onclick = () => switchSheet(index);
      button.onkeydown = event => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
        buttons[next].click();
        buttons[next].focus({ preventScroll: true });
      };
      tabs.append(button);
      return button;
    });
    let sheetMotion;
    function finishSheet() {
      sheetMotion?.kill();
      sheetMotion = null;
      reader.removeAttribute('data-sheet-switching');
      window.gsap?.set(reader.querySelectorAll('[role="tabpanel"]'), { clearProps: 'transform,opacity' });
    }
    function switchSheet(index) {
      if (active === index) return;
      finishSheet();
      window.scrollTo({ top: 0, behavior: 'instant' });
      active = index;
      const animate = window.gsap && !reduce.matches;
      if (animate) reader.setAttribute('data-sheet-switching', '');
      sync();
      const panel = reader.querySelector('#archive-panel-' + index);
      if (!animate || !panel) {
        finishSheet();
        return;
      }
      sheetMotion = window.gsap.fromTo(panel,
        { y: index === 1 ? 22 : -16, opacity: .7 },
        { id: 'archive-sheet-switch', y: 0, opacity: 1, duration: .32, ease: 'power3.out', onComplete: finishSheet });
    }
    addEventListener('pagehide', finishSheet);
    addEventListener('pageshow', event => {
      if (!event.persisted) return;
      finishSheet();
      sync();
      if (active === 0) window.scrollTo({ top: 0, behavior: 'instant' });
    });
    reduce.addEventListener('change', () => { if (reduce.matches) finishSheet(); });
    let overview;
    function fitOverview() {
      if (!overview || overview.hidden || !overview.clientHeight) return;
      overview.style.removeProperty('--overview-fit');
      let scale = 1;
      for (let pass = 0; pass < 4 && overview.scrollHeight > overview.clientHeight + 1; pass++) {
        scale *= overview.clientHeight / overview.scrollHeight;
        overview.style.setProperty('--overview-fit', String(scale));
      }
    }
    const overviewResize = new ResizeObserver(fitOverview);
    document.fonts?.ready.then(fitOverview);
    function sync() {
      const panels = [
        reader.querySelector(':scope > :is(.project-summary,.detail-edit-left,.brand-summary)'),
        reader.querySelector(':scope > :is(.project-stream,.detail-edit-right,.brand-content)')
      ];
      if (panels.some(panel => !panel)) return;
      reader.classList.add('blue-reader');
      reader.dataset.sheetMode = active === 0 ? 'overview' : 'strategy';
      title.textContent = (panels[0].querySelector('h1')?.textContent || document.title.split('｜')[0]).trim();
      const contextLines = panels[0].querySelectorAll('.subtitle, .period, [data-detail-field="subtitle"], [data-detail-field="period"]');
      context.replaceChildren(...[...contextLines].map(source => {
        const line = document.createElement('span');
        line.textContent = source.textContent.trim();
        return line;
      }));
      if (tabs.parentNode !== reader) reader.prepend(tabs);
      if (overview !== panels[0]) {
        overviewResize.disconnect();
        overview = panels[0];
        overviewResize.observe(overview);
      }
      panels.forEach((panel, index) => {
        const selected = active === index;
        panel.id = 'archive-panel-' + index;
        panel.hidden = active !== null && !selected;
        panel.setAttribute('role', 'tabpanel');
        panel.tabIndex = 0;
        panel.setAttribute('aria-labelledby', buttons[index].id);
        buttons[index].setAttribute('aria-selected', String(selected));
        buttons[index].tabIndex = selected || (active === null && index === 0) ? 0 : -1;
        if (panel.hidden) panel.querySelectorAll('video').forEach(video => video.pause());
      });
      fitOverview();
    }
    new MutationObserver(sync).observe(reader, { childList: true });
    sync();
    const route = routePath(location.pathname).split('/').pop();
    const actions = document.createElement('nav');
    actions.className = 'archive-detail-actions';
    actions.setAttribute('aria-label', '案例导航');
    for (const [label, href] of [['返回首页', 'index.html#intro'],
      ['下一个案例', routes[(routes.indexOf(route) + 1) % routes.length] + '.html']]) {
      const link = document.createElement('a');
      link.href = href;
      link.textContent = label;
      actions.append(link);
    }
    reader.after(actions);
  }

  const track = document.querySelector('#workTrack');
  if (track) {
    let frame = 0;
    let centered;
    function paintReels() {
      frame = 0;
      const bounds = track.getBoundingClientRect();
      if (!bounds.width) return;
      let closest;
      let distance = Infinity;
      for (const card of track.children) {
        const rect = card.getBoundingClientRect();
        const delta = (rect.left + rect.width / 2 - bounds.left - bounds.width / 2) / bounds.width;
        card.style.setProperty('--reel-rise', Math.max(-68, Math.min(68, -delta * 126)) + 'px');
        if (Math.abs(delta) < distance) {
          closest = card;
          distance = Math.abs(delta);
        }
      }
      if (closest === centered) return;
      centered?.classList.remove('reel-centered');
      const changed = centered && track.contains(centered);
      centered = closest;
      centered?.classList.add('reel-centered');
      const cover = centered?.querySelector('.video-frame, .editable-work-board > div:has(video)');
      if (changed && cover && !reduce.matches && ![...cover.querySelectorAll('video')].some(video => !video.paused)) {
        cover.animate([
          { rotate: 'y 0deg' }, { rotate: 'y 78deg', offset: .48 }, { rotate: 'y 0deg' }
        ], { duration: 400, easing: 'ease-in-out' });
      }
    }
    function scheduleReels() {
      if (!frame) frame = requestAnimationFrame(paintReels);
    }
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    let edgeDirection = 0;
    let edgeFrame = 0;
    let lastTick = 0;
    let remainder = 0;
    function stopEdge() {
      edgeDirection = 0;
      cancelAnimationFrame(edgeFrame);
      edgeFrame = 0;
      lastTick = 0;
      remainder = 0;
      track.classList.remove('reel-edge-scrolling');
    }
    function tickEdge(now) {
      if (!edgeDirection || !fine.matches || reduce.matches || document.hidden) {
        stopEdge();
        return;
      }
      const delta = lastTick ? Math.min(now - lastTick, 32) : 16;
      lastTick = now;
      remainder += edgeDirection * delta * .22;
      const step = Math.trunc(remainder);
      remainder -= step;
      track.scrollLeft += step;
      if ((edgeDirection > 0 && track.scrollLeft >= track.scrollWidth - track.clientWidth - 1) ||
          (edgeDirection < 0 && track.scrollLeft <= 0)) {
        stopEdge();
        return;
      }
      edgeFrame = requestAnimationFrame(tickEdge);
    }
    track.addEventListener('pointermove', event => {
      if (!fine.matches || event.pointerType !== 'mouse' || reduce.matches || event.buttons ||
          [...track.querySelectorAll('video')].some(video => !video.paused)) {
        stopEdge();
        return;
      }
      const rect = track.getBoundingClientRect();
      const edge = Math.min(94, rect.width * .13);
      const direction = event.clientX > rect.right - edge ? 1 : event.clientX < rect.left + edge ? -1 : 0;
      if (!direction) { stopEdge(); return; }
      edgeDirection = direction;
      track.classList.add('reel-edge-scrolling');
      if (!edgeFrame) edgeFrame = requestAnimationFrame(tickEdge);
    });
    track.addEventListener('pointerleave', stopEdge);
    track.addEventListener('pointerdown', stopEdge);
    track.addEventListener('play', stopEdge, true);
    document.addEventListener('visibilitychange', stopEdge);
    track.addEventListener('scroll', scheduleReels, { passive: true });
    new ResizeObserver(scheduleReels).observe(track);
    new MutationObserver(paintReels).observe(track, { childList: true });
    paintReels();
  }

  const gsap = window.gsap;
  const stages = [...document.querySelectorAll('main > :is(#intro,#cases,#archive,#contact)')];
  let sectionMotion;
  let lastWheel = 0;
  if (stages.length && gsap) {
    addEventListener('wheel', event => {
      if (reduce.matches || innerWidth < 761 || event.ctrlKey || event.shiftKey ||
          Math.abs(event.deltaY) < 5 || Math.abs(event.deltaX) >= Math.abs(event.deltaY) ||
          document.querySelector('dialog[open], .archive-transition') ||
          event.target.closest?.('.deck-wrap, .reference-menu')) return;
      const direction = Math.sign(event.deltaY);
      const now = performance.now();
      const recent = now - lastWheel < 170;
      lastWheel = now;
      if (sectionMotion?.isActive() || recent) {
        event.preventDefault();
        return;
      }
      const offsets = stages.map(stage => stage.getBoundingClientRect().top + scrollY);
      const current = offsets.findLastIndex(y => y <= scrollY + 96);
      const target = offsets[current + direction];
      if (target === undefined) return;
      event.preventDefault();
      const position = { y: scrollY };
      const end = Math.min(target, document.documentElement.scrollHeight - innerHeight);
      sectionMotion = gsap.to(position, {
        id: 'archive-section-scroll', y: end, duration: .72, ease: 'power3.inOut',
        onUpdate: () => scrollTo({ top: position.y, behavior: 'instant' })
      });
    }, { passive: false });
  }

  const root = document.documentElement;
  const stable = reader ? 'detail' : 'overview';
  let timeline;
  let cover;
  function state(name) { root.dataset.archiveState = name; }
  function resetTransition() {
    timeline?.kill();
    cover?.remove();
    gsap?.set(document.querySelectorAll('.file-tabs > button, .blue-reader'), { clearProps: 'transform,opacity' });
    state(stable);
  }
  function makeCover(color, label) {
    cover = document.createElement('div');
    cover.className = 'archive-transition';
    cover.setAttribute('aria-hidden', 'true');
    const folder = document.createElement('span');
    folder.style.setProperty('--folder-color', color || '#526c8b');
    if (label) {
      const tab = document.createElement('strong');
      tab.textContent = label;
      folder.append(tab);
    }
    const wordmark = document.createElement('div');
    wordmark.className = 'archive-transition-wordmark';
    wordmark.textContent = header?.querySelector('.reference-wordmark')?.textContent || '';
    cover.append(wordmark, folder);
    document.body.append(cover);
    return folder;
  }
  state(stable);
  let handoff;
  try {
    handoff = JSON.parse(sessionStorage.getItem(pending) || 'null');
    sessionStorage.removeItem(pending);
  } catch {}
  if (gsap && !reduce.matches && handoff?.path && routePath(handoff.path) === routePath(location.pathname)) {
    const folder = makeCover(handoff.color, handoff.label);
    state(handoff.phase);
    const stack = document.querySelector(location.hash === '#intro' ? '.folder-stage' : '.file-tabs');
    timeline = gsap.timeline({ id: 'archive-route-transition', onComplete: resetTransition });
    if (reader) {
      timeline.fromTo(folder, { y: 65, rotation: 17, transformOrigin: '50% 100%' },
        { y: '62vh', rotation: 27, duration: .34, ease: 'power2.in' }, 0)
        .to(cover, { opacity: 0, duration: .22 }, .12);
    } else {
      timeline.fromTo(folder, { y: 65, rotation: 17 }, { y: 180, rotation: 0, duration: .42, ease: 'power3.out' }, 0)
        .fromTo(stack, { y: 90 }, { y: 0, duration: .46, ease: 'power3.out', clearProps: 'transform' }, .07)
        .to(cover, { autoAlpha: 0, duration: .22 }, .20);
    }
  }

  const warmed = new Set();
  function warmRoute(href) {
    if (warmed.has(href)) return;
    warmed.add(href);
    const preload = document.createElement('link');
    preload.rel = 'prefetch';
    preload.href = href;
    document.head.append(preload);
  }
  function warmFromTarget(event) {
    const tab = event.target.closest('.file-tabs > button');
    const card = tab && document.getElementById(tab.getAttribute('aria-controls'));
    const link = card?.querySelector('a[href$=".html"]') ||
      event.target.closest('#caseDeck a[href], .archive-detail-actions a[href]');
    if (link && new URL(link.href).origin === location.origin) warmRoute(link.href);
  }
  document.addEventListener('pointerover', warmFromTarget);
  document.addEventListener('pointerdown', warmFromTarget, { passive: true });
  document.addEventListener('focusin', warmFromTarget);
  const nextCase = document.querySelector('.archive-detail-actions a:last-child');
  if (nextCase && 'IntersectionObserver' in window) {
    const routeObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      routeObserver.disconnect();
      warmRoute(nextCase.href);
    }, { rootMargin: '240px 0px' });
    routeObserver.observe(nextCase);
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey || !gsap || reduce.matches || link.target) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin) return;
    const destination = routes.includes(routePath(url.pathname).split('/').pop());
    const returning = reader && routePath(url.pathname) === new URL('.', location.href).pathname && ['#cases', '#intro'].includes(url.hash);
    if (!(destination && (reader || link.closest('#caseDeck'))) && !returning) return;
    event.preventDefault();
    if (root.dataset.archiveState !== stable) return;
    const phase = returning ? 'closing' : reader ? 'switching' : 'opening';
    state(phase);
    warmRoute(url.href);
    sectionMotion?.kill();
    const tab = document.querySelector('.file-tabs [aria-selected="true"]');
    const color = tab ? getComputedStyle(tab).backgroundColor : '#526c8b';
    const label = tab?.textContent.trim() || document.querySelector('.archive-case-title')?.textContent.trim();
    const folder = makeCover(color, label);
    timeline = gsap.timeline({ id: 'archive-route-transition', onComplete: () => {
      try { sessionStorage.setItem(pending, JSON.stringify({ path: url.pathname, phase, color, label })); } catch {}
      location.assign(url.href);
    }});
    if (phase === 'switching') {
      timeline.fromTo(cover, { opacity: 0 }, { opacity: 1, duration: .18 }, 0)
        .fromTo(folder, { y: '36vh', rotation: 23, transformOrigin: '50% 100%' },
          { y: 65, rotation: 17, duration: .28, ease: 'power3.out' }, 0);
    } else if (returning) {
      timeline.to(reader, { y: '65vh', rotation: -28, scale: .87, transformOrigin: '48% 90%',
        duration: .40, ease: 'power2.in' }, 0)
        .fromTo(cover, { autoAlpha: 0 }, { autoAlpha: 1, duration: .27 }, .19)
        .fromTo(folder, { y: '62vh', rotation: 22 }, { y: 65, rotation: 17, duration: .36, ease: 'power3.out' }, .22);
    } else {
      timeline.fromTo(cover, { opacity: 0 }, { opacity: 1, duration: .20 }, 0)
        .fromTo(folder, { y: '46vh', rotation: 0, transformOrigin: '50% 100%' },
          { y: 65, rotation: 17, duration: .32, ease: 'power3.out' }, 0);
    }
  });
  addEventListener('pageshow', event => { if (event.persisted) resetTransition(); });
})();
