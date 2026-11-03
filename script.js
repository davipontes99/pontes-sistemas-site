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

// ── Abas de produto no topo ─────────────────────
const telaHero = document.getElementById('tela-hero');
const abas = document.querySelectorAll('.abas button');
abas.forEach(aba => aba.addEventListener('click', () => {
  abas.forEach(a => a.setAttribute('aria-selected', String(a === aba)));
  const img = telaHero.querySelector('img');
  img.style.opacity = '0';
  setTimeout(() => {
    img.onload = () => { img.style.opacity = '1'; };
    img.src = aba.dataset.tela;
    img.alt = 'Tela do ' + aba.textContent.trim();
    telaHero.querySelector('.tela-barra b').textContent = aba.dataset.nome;
  }, 150);
}));
// já baixa as outras telas pra troca ser instantânea
abas.forEach(a => { const i = new Image(); i.src = a.dataset.tela; });

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

// ── Ano no rodapé ───────────────────────────────
document.getElementById('ano').textContent = new Date().getFullYear();

// ── Atalho pro painel interno (Ctrl+Alt+P) ─────
const PAINEL_URL = 'https://painel-dev-ten.vercel.app';
window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'p') {
    window.location.href = PAINEL_URL;
  }
});
