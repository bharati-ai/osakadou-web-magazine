(() => {
  const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];

  // Season calendar: current season first and full width, the rest follow in order.
  const seasons = ['winter', 'spring', 'summer', 'autumn'];
  const now = Math.floor((new Date().getMonth() + 1) % 12 / 3);
  seasons.forEach((s, k) => {
    const el = $('#s-' + s);
    if (!el) return;
    el.style.order = (k - now + 4) % 4;
    el.classList.toggle('is-now', k === now);
  });
  // In the current season, tag this month and dim months already past.
  const month = new Date().getMonth() + 1;
  $$('.season.is-now .ev dt').forEach((dt) => {
    if (dt.textContent.includes('〜')) return; // month ranges (7〜8月) get no tag
    const d = (month - parseInt(dt.textContent, 10) + 12) % 12;
    if (d === 0) dt.insertAdjacentHTML('beforeend', '<span class="tag">今月</span>');
    else if (d === 11) dt.insertAdjacentHTML('beforeend', '<span class="tag">もうすぐ</span>');
    else if (d < 3) {
      dt.classList.add('past'); dt.nextElementSibling.classList.add('past');
      dt.insertAdjacentHTML('beforeend', '<span class="tag">終了</span>');
    }
  });
  // Cover line 03 names this month's event (next month's from the 15th on).
  const target = new Date().getDate() >= 15 ? month % 12 + 1 : month;
  const row = $$('.ev dt').find((dt) => !dt.textContent.includes('〜') && parseInt(dt.textContent, 10) === target);
  const cl = $('.coverlines a[href="#calendar"] small');
  if (row && cl) cl.textContent = `${target}月は${row.nextElementSibling.firstChild.textContent.trim()}ほか。季節の体調メモも`;


  // Scroll reveal (content stays visible if this never runs).
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    $$('.rv').forEach((el) => io.observe(el));
    new IntersectionObserver(([e]) => $('.hd').classList.toggle('on-cover', e.isIntersecting)).observe($('.masthead'));
  } else $$('.rv').forEach((el) => el.classList.add('in'));

  // Contents dialog (one list in the page, cloned into the dialog).
  const d = $('#toc');
  $('#toc-nav').append($('#contents .contents').cloneNode(true));
  if (typeof d.showModal !== 'function') $('#toc-open').hidden = true;
  $('#toc-open').addEventListener('click', () => d.showModal());
  $('#toc-close').addEventListener('click', () => d.close());
  d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('a')) d.close(); });

  // Checklist, remembered on this device only.
  const KEY = 'osakalive:checklist';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch {}
  const boxes = $$('#checklist input[type=checkbox]');
  const count = () => { $('#check-n').textContent = boxes.filter((b) => b.checked).length; };
  boxes.forEach((b) => {
    b.checked = !!saved[b.id];
    b.addEventListener('change', () => {
      saved[b.id] = b.checked;
      try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch {}
      count();
    });
  });
  count();

  // Copy a section link / share the page.
  const pageUrl = location.origin + location.pathname;
  const copy = async (btn, url) => {
    const label = btn.dataset.label ??= btn.textContent;
    try { await navigator.clipboard.writeText(url); btn.textContent = 'リンクをコピーしました'; }
    catch { btn.textContent = url.split(String.fromCharCode(10)).pop(); return; }
    setTimeout(() => { btn.textContent = label; }, 2500);
  };
  $$('[data-copy]').forEach((b) => b.addEventListener('click', () => copy(b, `${b.dataset.text}\n${pageUrl}#${b.dataset.copy}`)));
  $('#share').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const labelled = `OSAKA LIVE｜大阪で、暮らす。\n${pageUrl}`;
    if (!navigator.share) return copy(btn, labelled);
    try { await navigator.share({ title: document.title, text: '大阪で、暮らす。住む人の目線で、出典を明記して書くWebマガジン。', url: pageUrl }); }
    catch (err) { if (err.name !== 'AbortError') copy(btn, labelled); }
  });
  window.__ol = 1;
})();
