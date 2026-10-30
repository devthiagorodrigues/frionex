// Menu do celular, sombra do topo e destaque da seção atual. O site funciona sem este arquivo.
(() => {
  const raiz = document.documentElement;
  raiz.classList.remove('no-js');
  raiz.classList.add('js');

  const topo = document.getElementById('topo');
  const botao = document.querySelector('.menu-btn');
  const menu = document.getElementById('menu');
  const desktop = window.matchMedia('(min-width: 900px)');

  const definirMenu = (aberto) => {
    botao.setAttribute('aria-expanded', String(aberto));
    menu.classList.toggle('menu--aberto', aberto);
  };

  botao.addEventListener('click', () => definirMenu(botao.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) definirMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && botao.getAttribute('aria-expanded') === 'true') {
      definirMenu(false);
      botao.focus();
    }
  });
  desktop.addEventListener('change', () => definirMenu(false));

  const aoRolar = () => topo.classList.toggle('topo--rolou', window.scrollY > 8);
  aoRolar();
  window.addEventListener('scroll', aoRolar, { passive: true });

  if ('IntersectionObserver' in window) {
    const links = [...menu.querySelectorAll('a[href^="#"]:not(.btn)')];
    const porId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const observador = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        links.forEach((a) => a.removeAttribute('aria-current'));
        porId.get(e.target.id)?.setAttribute('aria-current', 'true');
      }
    }, { rootMargin: '-45% 0px -50% 0px' });
    porId.forEach((_, id) => { const s = document.getElementById(id); if (s) observador.observe(s); });
  }
})();
