(() => {
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-query');
  const status = document.getElementById('search-status');
  const results = document.getElementById('search-results');
  let indexPromise;
  let searchId = 0;

  // Build text nodes instead of HTML so indexed content and queries stay safe.
  function highlight(element, value, terms) {
    const escaped = terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
    for (const part of value.split(pattern)) {
      if (terms.some(term => part.toLocaleLowerCase() === term)) {
        const strong = document.createElement('strong');
        strong.textContent = part;
        element.appendChild(strong);
      } else {
        element.appendChild(document.createTextNode(part));
      }
    }
  }

  async function search(query) {
    const currentSearch = ++searchId;
    results.replaceChildren();
    const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!terms.length) {
      status.textContent = 'Enter a search term to get started.';
      return;
    }
    status.textContent = 'Searching…';
    try {
      indexPromise ||= fetch('search-index.json').then(response => {
        if (!response.ok) throw new Error('Unable to load search index');
        return response.json();
      });
      const pages = await indexPromise;
      if (currentSearch !== searchId) return;
      const matches = pages.map(page => {
        const title = page.title.toLocaleLowerCase();
        const body = page.text.toLocaleLowerCase();
        if (!terms.every(term => title.includes(term) || body.includes(term))) return null;
        const positions = terms.map(term => body.indexOf(term)).filter(n => n >= 0);
        const firstMatch = positions.length ? Math.min(...positions) : 0;
        const start = Math.max(0, firstMatch - 90);
        const snippet = (start ? '…' : '') + page.text.slice(start, start + 220) + (start + 220 < page.text.length ? '…' : '');
        return { ...page, snippet, score: terms.reduce((score, term) => score + (title.includes(term) ? 10 : 0), 0) };
      }).filter(Boolean).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
      status.textContent = matches.length ? `${matches.length} ${matches.length === 1 ? 'result' : 'results'} for “${query}”.` : `No results for “${query}”. Try different search terms.`;
      for (const page of matches) {
        const article = document.createElement('article');
        article.className = 'search-result';
        const heading = document.createElement('h2');
        const link = document.createElement('a');
        link.href = page.url;
        highlight(link, page.title, terms);
        heading.appendChild(link);
        const snippet = document.createElement('p');
        highlight(snippet, page.snippet, terms);
        article.append(heading, snippet);
        results.appendChild(article);
      }
    } catch (error) {
      if (currentSearch !== searchId) return;
      indexPromise = null;
      status.textContent = 'Search could not be loaded. Please try again.';
    }
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const query = input.value.trim();
    const url = new URL(window.location.href);
    if (query) url.searchParams.set('q', query); else url.searchParams.delete('q');
    history.replaceState(null, '', url);
    search(query);
  });
  input.value = new URLSearchParams(window.location.search).get('q') || '';
  if (input.value.trim()) search(input.value.trim());
})();
