/* The editor document supplies content and evidence geometry for this responsive case page. */
(() => {
  let revision = -1;
  const evidence = document.querySelector('[data-editor-evidence]');
  const activity = evidence.querySelector('[data-editor-evidence-slot="activity"]');
  const brief = evidence.querySelector('[data-editor-evidence-slot="brief"]');
  const placeholder = activity.querySelector('.missing-image');
  const projectPhotoId = '10e1025c-5dd8-4aef-8dcf-0c0639958082';
  const canvas = {x: 501.4, y: 407, width: 873.6};
  const referenceImage = document.querySelector('[data-editor-element="brand-plan-miwu-reference"]');
  const referenceFrame = referenceImage.closest('.image-preview');
  const referenceReplacementId = '407aa45a-93b8-44fd-b9e9-3c3fda7cad80';
  const staticIds = new Set([...document.querySelectorAll('[data-editor-element]')].map(node => node.dataset.editorElement));

  function syncText(node, layer) {
    const prefix = node.firstElementChild;
    if (node.textContent.trim() !== layer.text) {
      if (prefix?.tagName === 'B' && layer.text.startsWith(prefix.textContent)) {
        node.replaceChildren(prefix, document.createTextNode(layer.text.slice(prefix.textContent.length)));
      } else {
        node.textContent = layer.text;
      }
    }
    if (node.hasAttribute('data-editor-copy')) {
      const [size, weight, color, alignment] = node.dataset.editorCopy.split(',');
      if (Number(size) === layer.fontSize) node.style.removeProperty('font-size');
      else node.style.setProperty('font-size', layer.fontSize + 'px', 'important');
      if (Number(weight) === layer.fontWeight) node.style.removeProperty('font-weight');
      else node.style.setProperty('font-weight', String(layer.fontWeight || ''), 'important');
      if (color === layer.color) node.style.removeProperty('color');
      else node.style.setProperty('color', layer.color || '', 'important');
      if (alignment === layer.align) node.style.removeProperty('text-align');
      else node.style.setProperty('text-align', layer.align || '', 'important');
      return;
    }
    if (layer.href && node instanceof HTMLAnchorElement) node.href = layer.href;
    node.style.fontSize = layer.fontSize + 'px';
    node.style.fontWeight = layer.fontWeight || 400;
    node.style.color = layer.color || '';
    node.style.textAlign = layer.align || 'left';
  }

  function syncImage(node, layer, assets) {
    const src = assets[layer.asset];
    if (!src) return;
    if (node.getAttribute('src') !== src) node.src = src;
    node.alt = layer.name || '';
    const frame = node.closest('.image-preview');
    const crop = layer.crop;
    const cropped = crop && crop.w > 0 && crop.h > 0;
    Object.assign(node.style, {
      position: cropped ? 'absolute' : '',
      width: cropped ? 100 / crop.w + '%' : '',
      height: cropped ? 100 / crop.h + '%' : '',
      left: cropped ? -100 * crop.x / crop.w + '%' : '',
      top: cropped ? -100 * crop.y / crop.h + '%' : '',
      objectFit: cropped ? 'fill' : layer.fit || 'contain',
    });
    if (frame) {
      frame.style.position = 'relative';
      frame.style.borderRadius = layer.radius == null ? '' : layer.radius + 'px';
    }
  }

  function evidenceButton(figure) {
    const existing = figure.querySelector('.image-preview');
    if (existing) return existing;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'image-preview editor-evidence-image';
    const image = document.createElement('img');
    button.append(image);
    button.addEventListener('click', () => button.classList.toggle('gentle'));
    figure.prepend(button);
    return button;
  }

  function syncEvidence(layers, config) {
    const photos = [...layers.values()].filter(layer =>
      layer.type === 'image' && !layer.hidden && config.assets[layer.asset] &&
      config.assetTypes?.[layer.asset]?.startsWith('image/') &&
      !staticIds.has(layer.id) && (layer.id === projectPhotoId ||
      (layer.x >= canvas.x - 36 && layer.y >= canvas.y - 65 && layer.y < 800)));
    const mainPhoto = photos.find(layer => layer.id === projectPhotoId) || photos[0];
    placeholder.hidden = Boolean(mainPhoto);
    let primaryButton = activity.querySelector('.image-preview');
    if (mainPhoto) primaryButton = evidenceButton(activity);
    if (primaryButton) {
      primaryButton.hidden = !mainPhoto;
      if (mainPhoto) syncImage(primaryButton.querySelector('img'), mainPhoto, config.assets);
    }
    for (const figure of evidence.querySelectorAll('[data-editor-extra]')) {
      if (!photos.some(layer => layer !== mainPhoto && layer.id === figure.dataset.editorExtra)) figure.remove();
    }
    const placements = [[activity, mainPhoto || {x: canvas.x, y: canvas.y, w: 429, h: 322}]];
    const briefLayer = layers.get(brief.querySelector('img').dataset.editorElement);
    brief.hidden = !briefLayer || !!briefLayer.hidden;
    if (!brief.hidden) placements.push([brief, briefLayer]);
    for (const layer of photos) {
      if (layer === mainPhoto) continue;
      let figure = [...evidence.querySelectorAll('[data-editor-extra]')].find(node => node.dataset.editorExtra === layer.id);
      if (!figure) {
        figure = document.createElement('figure');
        figure.dataset.editorExtra = layer.id;
        evidence.append(figure);
      }
      syncImage(evidenceButton(figure).querySelector('img'), layer, config.assets);
      placements.push([figure, layer]);
    }
    const bounds = placements.map(([figure, layer]) => {
      const width = Math.min(canvas.width, Math.max(1, layer.w));
      const x = Math.max(0, Math.min(canvas.width - width, layer.x - canvas.x));
      return {figure, layer, x, y: Math.max(0, layer.y - canvas.y), width, height: Math.max(1, layer.h)};
    });
    const height = Math.max(...bounds.map(item => item.y + item.height + 34));
    evidence.style.setProperty('--evidence-ratio', canvas.width + ' / ' + height);
    evidence.classList.add("is-editor-synced");

    for (const {figure, layer, x, y, width, height: itemHeight} of bounds) {
      figure.style.setProperty('--evidence-x', 100 * x / canvas.width + '%');
      figure.style.setProperty('--evidence-y', 100 * y / height + '%');
      figure.style.setProperty('--evidence-width', 100 * width / canvas.width + '%');
      figure.style.setProperty('--evidence-image-ratio', width + ' / ' + itemHeight);
      figure.style.setProperty('--evidence-angle', (layer.angle || 0) + 'deg');
    }
  }

  function syncReference(layers, config) {
    const replacement = layers.get(referenceReplacementId);
    const original = layers.get(referenceImage.dataset.editorElement);
    const added = [...layers.values()].find(layer =>
      !staticIds.has(layer.id) && layer.type === 'image' && !layer.hidden &&
      config.assetTypes?.[layer.asset]?.startsWith('image/') &&
      Math.abs(layer.x - 521.4) < 150 && Math.abs(layer.y - 2611.6) < 175);
    const layer = [replacement, original, added].find(candidate =>
      candidate && !candidate.hidden && config.assets[candidate.asset]);
    referenceFrame.hidden = !layer;
    referenceImage.hidden = !layer;
    if (!layer) return;
    syncImage(referenceImage, layer, config.assets);
    referenceFrame.style.setProperty('--reference-width', Math.max(48, layer.w) + 'px');
    referenceFrame.style.setProperty('--reference-ratio', layer.w + ' / ' + layer.h);
    referenceFrame.style.transform = 'rotate(' + (layer.angle || 0) + 'deg)';
  }

  async function sync() {
    try {
      const response = await fetch('layout-config.json', {cache: 'no-store'});
      if (!response.ok) return;
      const config = await response.json();
      if (config.revision <= revision) return;
      const page = config.pages.find(item => item.role === 'detail-rcc');
      if (!page) return;
      const activeLayers = new Map(page.elements.map(layer => [layer.id, layer]));
      for (const node of document.querySelectorAll('[data-editor-element]')) {
        if (node === referenceImage) continue;
        const layer = activeLayers.get(node.dataset.editorElement);
        node.hidden = !layer || !!layer.hidden;
        if (!layer) continue;
        if (layer.type === 'text') syncText(node, layer);
        if (layer.type === 'image') {
          syncImage(node, layer, config.assets);
          const frame = node.closest('.image-preview');
          if (frame && !evidence.contains(frame)) frame.hidden = !!layer.hidden;
        }
      }
      syncEvidence(activeLayers, config);
      syncReference(activeLayers, config);
      revision = config.revision;
    } catch (error) {
      console.warn('品牌详情同步失败', error);
    }
  }

  sync();
  setInterval(sync, 1500);
  addEventListener('focus', sync);
})();
