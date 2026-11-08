// Only choose mobile encodes that are part of the published site.
const portfolioMobileVideos = new Set([
  '1154b42f5dd54fd18bc4d599dba766b8.mp4',
  '2031691df40644b680dadf8b86a7753f.mp4',
  '27d2fb350e90484e81b1c260513d3edd.mp4',
  '35ba6a730414476cb81e7736a7b60c30.mp4',
  '5b1f7af11e6446e391457d34fb29b5f8.mp4',
  '6cf71bf3d75c433db4605ba36923e69e.web-preview.mp4',
  '720565d8acb14707aa8c19503e805cf8.mp4',
  '7fdc71ef912e4d6ba58f03caf13825e2.mp4',
  'ac54fd56486f468dab3c6284501f4af0.mp4',
  'd3369014ab564b39a8b5e283b58c7696.mp4',
  'e910df9d1cb94fe3940ea3de5db4101e.mp4',
  'ec327523accd45d3b1d22beda9970994.web-preview.mp4',
  'f0bbbe02515f4622ad8bb38a20d61d86.web-preview.mp4',
  'fecdb119dfa94410be8633b9794c4a53.mp4',
  'v284f1ab19719421aac511664634823.mp4',
  'v2b1e5271dea488aefbab1f81ff7cc8.web-preview.mp4',
]);

// Start the request and playback inside the tap so mobile browsers retain user activation.
window.mountPortfolioVideo = (video, src, poster, title, openPreview) => {
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
  if (openPreview) {
    button.addEventListener('click', openPreview);
    return;
  }

  let startupDeadline;
  let useOriginal = false;
  const showRetry = () => {
    clearTimeout(startupDeadline);
    useOriginal = true;
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
    const filename = src.startsWith('media/') ? src.slice('media/'.length) : '';
    const playbackSource = !useOriginal && matchMedia('(max-width: 760px)').matches &&
      portfolioMobileVideos.has(filename)
      ? src.replace(/(?:\.web-preview)?\.mp4$/, '.mobile-fast.mp4')
      : src;
    if (video.getAttribute('src') !== playbackSource || video.error) video.src = playbackSource;
    startupDeadline = setTimeout(() => {
      video.pause();
      video.removeAttribute('src');
      video.load();
      showRetry();
    }, 20000);
    video.play().catch(showRetry);
  });
};
