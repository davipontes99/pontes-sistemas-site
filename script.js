// ── Menu do celular ─────────────────────────────
const botaoMenu = document.querySelector('.topo-menu');
const menu = document.querySelector('.menu-aberto');

botaoMenu.addEventListener('click', () => {
  const abrir = menu.hidden;
  menu.hidden = !abrir;
  botaoMenu.setAttribute('aria-expanded', String(abrir));
  botaoMenu.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
  botaoMenu.innerHTML = abrir ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menu.hidden = true;
  botaoMenu.setAttribute('aria-expanded', 'false');
  botaoMenu.innerHTML = '<i class="fa-solid fa-bars"></i>';
}));

// ── Ampliar tela ao clicar ──────────────────────
const amplia = document.querySelector('.amplia');
document.querySelectorAll('.tela').forEach(tela => tela.addEventListener('click', () => {
  const img = tela.querySelector('img');
  amplia.querySelector('img').src = img.src;
  amplia.querySelector('img').alt = img.alt;
  amplia.showModal();
}));
amplia.querySelector('.amplia-fechar').addEventListener('click', () => amplia.close());
amplia.addEventListener('click', e => { if (e.target === amplia) amplia.close(); });

// ── Revelar ao rolar ────────────────────────────
const observaRevela = new IntersectionObserver(entradas => {
  entradas.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visivel');
      observaRevela.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.revela').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 0.07}s`;
  observaRevela.observe(el);
});

// ── Contadores ──────────────────────────────────
const observaNumero = new IntersectionObserver(entradas => {
  entradas.forEach(entrada => {
    if (!entrada.isIntersecting) return;
    const el = entrada.target;
    const alvo = parseInt(el.dataset.alvo, 10);
    const sufixo = el.dataset.sufixo || '';
    const inicio = performance.now();
    function passo(agora) {
      const p = Math.min((agora - inicio) / 1200, 1);
      el.textContent = Math.floor(p * alvo) + sufixo;
      if (p < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
    observaNumero.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-alvo]').forEach(el => observaNumero.observe(el));

// ── Título do topo digitando ────────────────────
(function () {
  const h1 = document.querySelector('.hero h1');
  if (!h1) return;
  const partes = [...h1.childNodes].map(n => ({ texto: n.textContent, destaque: n.nodeName === 'EM' }));
  h1.setAttribute('aria-label', h1.textContent);
  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  cursor.setAttribute('aria-hidden', 'true');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { h1.append(cursor); return; }

  // segura a altura do título pra página não pular enquanto as letras aparecem
  h1.style.minHeight = h1.offsetHeight + 'px';
  h1.textContent = '';
  const alvos = partes.map(p => {
    const el = document.createElement(p.destaque ? 'em' : 'span');
    el.setAttribute('aria-hidden', 'true');
    h1.append(el);
    return { el, texto: p.texto };
  });
  h1.append(cursor);

  let i = 0, j = 0;
  function digita() {
    if (i >= alvos.length) { h1.style.minHeight = ''; return; }
    const alvo = alvos[i];
    alvo.el.textContent += alvo.texto[j++];
    if (j >= alvo.texto.length) { i++; j = 0; }
    setTimeout(digita, 40 + Math.random() * 50);
  }
  setTimeout(digita, 350);
})();

// ── Ano no rodapé ───────────────────────────────
document.getElementById('ano').textContent = new Date().getFullYear();

// ── Atalho pro Painel de Sistemas (Ctrl+Alt+P) ─
const PAINEL_URL = 'https://cmv-saas.vercel.app/pontes';
window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'p') {
    window.location.href = PAINEL_URL;
  }
});

// ── "Nós ligamos pra você": o pedido cai na aba Leads do Painel de Sistemas ──
(function () {
  const LEADS_URL = 'https://backend-production-d998.up.railway.app/api/leads';
  const dialogo = document.querySelector('.ligamos');
  if (!dialogo) return;
  const form = dialogo.querySelector('.ligamos-form');
  const ok = dialogo.querySelector('.ligamos-ok');
  const erro = dialogo.querySelector('.ligamos-erro');
  const enviar = dialogo.querySelector('.ligamos-enviar');

  function abrir() {
    form.hidden = false; ok.hidden = true; erro.hidden = true;
    menu.hidden = true;
    dialogo.showModal();
    form.querySelector('[name=nome]').focus();
  }
  document.querySelectorAll('[data-abre-ligamos]').forEach(b => b.addEventListener('click', abrir));
  dialogo.querySelector('.ligamos-fechar').addEventListener('click', () => dialogo.close());
  dialogo.querySelector('.ligamos-fechar-ok').addEventListener('click', () => dialogo.close());
  dialogo.addEventListener('click', e => { if (e.target === dialogo) dialogo.close(); });

  function mostrarErro(texto) { erro.textContent = texto; erro.hidden = false; }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    erro.hidden = true;
    const dados = Object.fromEntries(new FormData(form));
    if (!dados.nome.trim()) return mostrarErro('Informe seu nome.');
    if (dados.telefone.replace(/\D/g, '').length < 10) return mostrarErro('Informe o telefone com DDD.');
    enviar.disabled = true;
    enviar.textContent = 'Enviando...';
    try {
      const r = await fetch(LEADS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dados, origem: 'site-pontes' }),
      });
      const resposta = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(resposta.erro || 'Não foi possível enviar agora.');
      form.reset();
      form.hidden = true;
      ok.hidden = false;
    } catch (falha) {
      mostrarErro((falha && falha.message) || 'Não foi possível enviar agora. Chame no WhatsApp: (14) 99726-7008.');
    } finally {
      enviar.disabled = false;
      enviar.innerHTML = '<i class="fa-solid fa-phone"></i> Quero que me liguem';
    }
  });
})();
