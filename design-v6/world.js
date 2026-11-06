(() => {
  const dialog = document.querySelector('#profileDialog');
  const content = document.querySelector('#profileContent');
  const fallback = document.querySelector('#openProfileFallback');
  const template = document.querySelector('#profileFallback');

  window.ensureProfileContent = () => {
    if (content.children.length) return;
    const profile = template.content.firstElementChild.cloneNode(true);
    content.append(profile);
    window.initProfileCollage?.(profile);
    profile.querySelector('a[href="#cases"]')?.addEventListener('click', () => dialog.close());
  };

  window.enableProfileFallback = () => {
    document.body.classList.remove('has-3d');
    fallback.hidden = false;
    document.dispatchEvent(new Event('portfolio:folder-ready'));
    const close = () => dialog.close();
    document.querySelector('#returnPaper').onclick = close;
    document.querySelector('#inspectPaper').hidden = true;
  };

  fallback.addEventListener('click', () => {
    window.ensureProfileContent();
    dialog.showModal();
    window.fitProfileFile?.();
  });
})();
