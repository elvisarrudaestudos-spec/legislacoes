// Minimal SPA para leitura de leis em arquivos .txt
// Arquivos necessários: leis/manifest.json e cada lei em leis/<arquivo>.txt
const $ = (sel) => document.querySelector(sel);
const lawSelect = $("#lawSelect");
const articleList = $("#articleList");
const content = $("#content");
const searchInput = $("#searchInput");
const meta = $("#meta");
const copyLinkBtn = $("#copyLinkBtn");

let manifest = { laws: [] };
let currentLaw = null;
let articles = []; // {num, title, html, plain}

function sanitizeHash(v){ return encodeURIComponent(v).replace(/%20/g,'+'); }
function parseHash(){
  const hash = new URLSearchParams(location.hash.replace(/^#/, ''));
  return Object.fromEntries(hash.entries());
}
function updateHash(params){
  const hash = new URLSearchParams(params).toString();
  history.replaceState(null, '', '#' + hash);
}

async function loadManifest(){
  const res = await fetch('leis/manifest.json');
  manifest = await res.json();
  // popular select
  lawSelect.innerHTML = '';
  manifest.laws.forEach(law => {
    const opt = document.createElement('option');
    opt.value = law.id;
    opt.textContent = law.title;
    lawSelect.appendChild(opt);
  });
}

async function loadLaw(lawId){
  currentLaw = manifest.laws.find(l => l.id === lawId) || manifest.laws[0];
  if (!currentLaw) return;
  lawSelect.value = currentLaw.id;
  meta.textContent = currentLaw.title;
  const res = await fetch(currentLaw.file);
  const txt = await res.text();
  articles = parseArticles(txt);

  renderList();
  // abrir artigo do hash se houver
  const { art } = parseHash();
  if (art && articles.some(a => a.num === art)) {
    openArticle(art);
  } else if (articles.length) {
    openArticle(articles[0].num);
  }
}

function parseArticles(raw){
  // normalizar quebras de linha
  const text = raw.replace(/\r\n/g, '\n').replace(/\u00A0/g, ' ').trim();
  // Capturar cabeçalhos (Capítulo/Seção) quando aparecem antes de um Art.
  const lines = text.split('\n');
  let blocks = [];
  let buffer = [];
  for (let i=0;i<lines.length;i++){
    const line = lines[i];
    buffer.push(line);
  }
  const joined = buffer.join('\n');

  // Quebra por artigos começando no início de linha: "Art. 1º", "Art. 12-A", "Art. 20-B" etc.
  const re = /(^|\n)\s*(Art\.)\s*(\d+[A-Z\-]*)(º)?\s*(.*?)(?=(\n\s*Art\.\s*\d+[A-Z\-]*º?\s*)|\s*$)/gis;
  let match;
  let out = [];
  while ((match = re.exec(joined))){
    const numberRaw = (match[3] || '').toString().toUpperCase();
    const num = numberRaw; // incluir sufixos como 12-A
    // Título do artigo
    const head = `Art. ${numberRaw}${match[4] ? 'º' : ''}`;
    // Texto do artigo = "head + resto da linha + próximo bloco até antes do próximo Art."
    const rest = match[5] ? match[5].trim() : '';
    const full = (head + ' ' + rest).trim();
    out.push({
      num,
      title: head,
      plain: full,
      html: toHTML(full)
    });
  }
  // fallback: se regex não achar, retorna o texto inteiro como um único "artigo"
  if (!out.length && text.length){
    out.push({ num: 'único', title: 'Texto', plain: text, html: toHTML(text) });
  }
  return out;
}

function toHTML(t){
  // Enfatiza parágrafos, incisos e parágrafo único de forma simples
  let html = t
    .replace(/§\s*(\d+º?)/g, '<strong>§ $1</strong>')
    .replace(/Parágrafo único\./gi, '<strong>Parágrafo único.</strong>')
    .replace(/([IVXLCDM]{1,4})\s*-\s/g, '<br><strong>$1 - </strong>')
    .replace(/\n{2,}/g, '\n\n');
  html = html.split('\n').map(p => `<p>${p.trim()}</p>`).join('\n');
  return html;
}

function renderList(){
  const q = (searchInput.value || '').trim().toLowerCase();
  articleList.innerHTML = '';
  const frag = document.createDocumentFragment();
  articles.forEach(a => {
    const hay = `${a.title} ${a.plain}`.toLowerCase();
    if (q && !hay.includes(q)) return;
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#lei=${sanitizeHash(currentLaw.id)}&art=${sanitizeHash(a.num)}`;
    link.textContent = a.title;
    link.addEventListener('click', (ev) => {
      ev.preventDefault();
      openArticle(a.num);
    });
    li.appendChild(link);
    frag.appendChild(li);
  });
  articleList.appendChild(frag);
}

function openArticle(num){
  const art = articles.find(x => x.num === num) || articles[0];
  if (!art) return;
  // Marcar ativo na lista
  [...articleList.querySelectorAll('a')].forEach(a => a.classList.remove('active'));
  const active = [...articleList.querySelectorAll('a')].find(a => a.textContent.includes(`Art. ${num}`));
  if (active) active.classList.add('active');
  // Render
  content.innerHTML = `<h2 class="heading">${art.title}</h2><div>${art.html}</div>`;
  updateHash({ lei: currentLaw.id, art: num });
}

lawSelect?.addEventListener('change', () => {
  const id = lawSelect.value;
  updateHash({ lei: id });
  loadLaw(id);
});

searchInput?.addEventListener('input', () => renderList());

copyLinkBtn?.addEventListener('click', async () => {
  try{
    await navigator.clipboard.writeText(location.href);
    copyLinkBtn.textContent = "Link copiado!";
    setTimeout(() => copyLinkBtn.textContent = "Copiar link", 1400);
  } catch(e){
    alert("Não foi possível copiar. Copie da barra de endereços.");
  }
});

(async function init(){
  await loadManifest();
  const { lei } = parseHash();
  await loadLaw(lei || (manifest.laws[0] && manifest.laws[0].id));
})();
