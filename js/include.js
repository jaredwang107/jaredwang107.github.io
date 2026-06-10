async function loadIncludes() {
  const pending = [...document.querySelectorAll('[data-include]')];
  for (const el of pending) {
    if (!el.isConnected) continue;
    const url = el.getAttribute('data-include');
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.statusText);
      const html = await res.text();
      el.outerHTML = html;
    } catch (e) {
      console.error('Failed to load partial:', url, e);
    }
  }
  if (document.querySelector('[data-include]')) await loadIncludes();
}

loadIncludes();
