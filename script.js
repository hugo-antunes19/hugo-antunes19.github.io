const filters = document.querySelectorAll('[data-filter]');
const projects = document.querySelectorAll('[data-category]');
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(filter => {
    const active = filter === button;
    filter.classList.toggle('active', active);
    filter.setAttribute('aria-pressed', String(active));
  });
  let visible = 0;
  projects.forEach(project => {
    project.hidden = button.dataset.filter !== 'todos' && project.dataset.category !== button.dataset.filter;
    if (!project.hidden) visible++;
  });
  document.getElementById('filter-status').textContent = `${visible} ${visible === 1 ? 'projeto exibido' : 'projetos exibidos'}.`;
}));
document.getElementById('year').textContent = new Date().getFullYear();
