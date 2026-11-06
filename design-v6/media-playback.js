// Start the request and playback inside the tap so mobile browsers retain user activation.
window.mountPortfolioVideo = (video, src, poster, title) => {
  video.preload = 'none';
  video.playsInline = true;
  video.controls = false;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'portfolio-video-start';
  button.setAttribute('aria-label', '播放' + title);
  const cover = document.createElement('img');
  cover.alt = '';
  cover.loading = 'lazy';
  cover.decoding = 'async';
  if (poster) cover.src = poster;
  const icon = document.createElement('span');
  icon.className = 'portfolio-video-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '▶';
  const status = document.createElement('span');
  status.className = 'portfolio-video-status';
  status.setAttribute('role', 'status');
  button.append(cover, icon, status);
  video.after(button);

  let startupDeadline;
  const showRetry = () => {
    clearTimeout(startupDeadline);
    video.controls = false;
    button.hidden = false;
    button.disabled = false;
    status.textContent = '加载失败，点击重试';
  };
  video.addEventListener('error', showRetry);
  video.addEventListener('playing', () => {
    clearTimeout(startupDeadline);
    video.controls = true;
    button.hidden = true;
    button.disabled = false;
    status.textContent = '';
  });
  video.addEventListener('ended', () => {
    video.controls = false;
    button.hidden = false;
  });
  button.addEventListener('click', () => {
    button.disabled = true;
    status.textContent = '正在加载视频…';
    const playbackSource = matchMedia('(max-width: 760px)').matches
      ? src.replace(/\.web-preview\.mp4$/, '.mobile-preview.mp4')
      : src;
    if (!video.getAttribute('src') || video.error) video.src = playbackSource;
    startupDeadline = setTimeout(() => {
      video.pause();
      video.removeAttribute('src');
      video.load();
      showRetry();
    }, 20000);
    video.play().catch(showRetry);
  });
};
