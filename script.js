// Preencha apenas com contatos públicos confirmados. Links vazios não são exibidos.
const profile = {
  github: 'https://github.com/hugo-antunes19',
  linkedin: '',
  email: ''
};

const filters = document.querySelectorAll('[data-filter]');
const projects = document.querySelectorAll('[data-category]');
filters.forEach(button => {
  button.addEventListener('click', () => {
    filters.forEach(filter => {
      const selected = filter === button;
      filter.classList.toggle('active', selected);
      filter.setAttribute('aria-pressed', String(selected));
    });
    let count = 0;
    projects.forEach(project => {
      project.hidden = button.dataset.filter !== 'todos' && project.dataset.category !== button.dataset.filter;
      if (!project.hidden) count++;
    });
    document.getElementById('filter-status').textContent = `${count} ${count === 1 ? 'projeto exibido' : 'projetos exibidos'}.`;
  });
});

const contactLinks = [];
for (const [key, label] of [['github', 'GitHub'], ['linkedin', 'LinkedIn'], ['email', 'E-mail']]) {
  const value = profile[key].trim();
  if (!value) continue;
  let href;
  if (key === 'email') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || /[\r\n]/.test(value)) continue;
    href = `mailto:${value}`;
  } else {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:') continue;
      href = url.href;
    } catch { continue; }
  }
  const link = document.createElement('a');
  link.href = href;
  link.textContent = `${label} ↗`;
  if (key !== 'email') {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  contactLinks.push(link);
}
if (contactLinks.length) {
  const container = document.getElementById('contact-links');
  container.replaceChildren(...contactLinks);
  container.classList.add('contact-links');
}
document.getElementById('year').textContent = new Date().getFullYear();
