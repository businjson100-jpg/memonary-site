(() => {
  const config = window.MEMONARY_INSTALL || {};
  const links = [
    ['App Store', config.appStoreUrl, config.appStorePublic === true, 'apps.apple.com'],
    ['Google Play', config.googlePlayUrl, config.googlePlayPublic === true, 'play.google.com'],
  ];
  for (const [label, raw, publiclyVerified, host] of links) {
    if (!publiclyVerified || typeof raw !== 'string' || !raw) continue;
    try {
      const url = new URL(raw);
      if (url.protocol !== 'https:' || url.hostname !== host || url.port || url.username || url.password || url.hash) continue;
      if (host === 'apps.apple.com' && (!/^\/(?:[a-z]{2}\/)?app\/(?:[^/]+\/)?id6812567967\/?$/.test(url.pathname) || url.search)) continue;
      if (host === 'play.google.com' && (url.pathname !== '/store/apps/details' || url.searchParams.get('id') !== 'kr.memonary.app' || [...url.searchParams.keys()].length !== 1)) continue;
      const link = document.createElement('a'); link.textContent = label; link.href = url.href;
      link.rel = 'noopener noreferrer'; document.getElementById('stores').append(link);
    } catch { /* Missing, unverified or invalid configuration remains unavailable. */ }
  }
  if (document.getElementById('stores').children.length) document.getElementById('pending').hidden = true;
})();
