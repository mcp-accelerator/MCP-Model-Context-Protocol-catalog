document.addEventListener('DOMContentLoaded', () => {
  const TG = 'https://t.me/+4m2vc99t-RQwZjEy';
  const tabs = document.querySelector('.tabs');
  if (!tabs || !TG) return;
  if (tabs.querySelector('a.tg')) return;
  const a = document.createElement('a');
  a.className = 'tg';
  a.href = TG;
  a.target = '_blank';
  a.rel = 'noopener';
  a.textContent = 'Подпишись на канал';
  tabs.appendChild(a);
});
