(() => {
  const root = document.documentElement;
  const buttons = [...document.querySelectorAll('[data-style]')];
  function apply(mode, updateUrl) {
    const value = mode === 'original' ? 'original' : 'refined';
    root.dataset.refinement = value;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.style === value)));
    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set('style', value);
      history.replaceState(null, '', url);
    }
    document.querySelectorAll('.study-links a').forEach(link => {
      const url = new URL(link.getAttribute('href'), location.href);
      if (url.pathname.startsWith('/design-v4/')) {
        url.searchParams.set('style', value);
        link.setAttribute('href', url.pathname + url.search);
      }
    });
  }
  buttons.forEach(button => button.addEventListener('click', () => apply(button.dataset.style, true)));
  apply(new URLSearchParams(location.search).get('style'), false);
  window.addEventListener('popstate', () => apply(new URLSearchParams(location.search).get('style'), false));
})();
