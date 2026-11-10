document.querySelectorAll('[data-density]').forEach(button => {
  if (button.tagName !== 'BUTTON') return;
  button.addEventListener('click', () => {
    document.body.dataset.density = button.dataset.density;
    document.querySelectorAll('button[data-density]').forEach(peer => peer.setAttribute('aria-pressed', String(peer === button)));
  });
});
document.querySelectorAll('button[data-subject]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-character]').forEach(sample => { sample.hidden = sample.dataset.character !== button.dataset.subject; });
    document.querySelectorAll('button[data-subject]').forEach(peer => peer.setAttribute('aria-pressed', String(peer === button)));
  });
});
