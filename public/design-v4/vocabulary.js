(() => {
  document.querySelectorAll('.voc-gallery').forEach(gallery => {
    for (const setting of ['size', 'ground']) {
      const buttons = [...gallery.querySelectorAll(`[data-voc-${setting}]`)];
      buttons.forEach(button => button.addEventListener('click', () => {
        gallery.dataset[setting] = button.dataset[setting === 'size' ? 'vocSize' : 'vocGround'];
        buttons.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
      }));
    }
  });
})();
