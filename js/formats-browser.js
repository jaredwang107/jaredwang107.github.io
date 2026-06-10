(function () {
  const taglineEl = document.getElementById('formatTaglineCats');
  const explorer = document.getElementById('formatExplorer');
  const panels = document.getElementById('formatPanels');
  if (!taglineEl || !panels || typeof CATEGORIES === 'undefined') return;

  const TAGLINE_CATS = [
    { id: 'image', label: 'Images' },
    { id: 'video', label: 'video' },
    { id: 'audio', label: 'audio' },
    { id: 'document', label: 'documents' },
    { id: 'archive', label: 'archives' },
  ];

  function showCategory(catId) {
    document.querySelectorAll('.format-cat-link').forEach((link) => {
      link.classList.toggle('active', link.dataset.cat === catId);
    });
    document.querySelectorAll('.formats-panel').forEach((panel) => {
      panel.classList.toggle('active', panel.id === 'panel-' + catId);
    });
    explorer.hidden = false;
    explorer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  TAGLINE_CATS.forEach((item, idx) => {
    const cat = CATEGORIES.find((c) => c.id === item.id);
    if (!cat) return;

    if (idx > 0) taglineEl.appendChild(document.createTextNode(', '));

    const link = document.createElement('button');
    link.type = 'button';
    link.className = 'format-cat-link';
    link.dataset.cat = item.id;
    link.textContent = item.label;
    link.addEventListener('click', () => showCategory(item.id));
    taglineEl.appendChild(link);

    const panel = document.createElement('div');
    panel.className = 'formats-panel';
    panel.id = 'panel-' + cat.id;

    const grid = document.createElement('div');
    grid.className = 'formats-grid';
    cat.formats.forEach((f) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'fmt-card';
      card.innerHTML = `<span class="fmt-ext">.${f.ext}</span><span class="fmt-name">${f.name}</span>`;
      card.title = `Convert to ${f.ext}`;
      card.addEventListener('click', () => {
        window.location.href = `/convertflow/?to=${f.ext.toLowerCase()}`;
      });
      grid.appendChild(card);
    });
    panel.appendChild(grid);
    panels.appendChild(panel);
  });
})();
