// Sombra do topo ao rolar e destaque da seção atual no menu. O site funciona sem este arquivo.
(() => {
  const raiz = document.documentElement;
  raiz.classList.remove('no-js');
  raiz.classList.add('js');

  const topo = document.getElementById('topo');
  const aoRolar = () => topo.classList.toggle('topo--rolou', window.scrollY > 8);
  aoRolar();
  window.addEventListener('scroll', aoRolar, { passive: true });

  const menu = document.getElementById('menu');
  if (menu && 'IntersectionObserver' in window) {
    const links = [...menu.querySelectorAll('a[href^="#"]:not(.btn)')];
    const porId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const observador = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        links.forEach((a) => a.removeAttribute('aria-current'));
        porId.get(e.target.id)?.setAttribute('aria-current', 'true');
      }
    }, { rootMargin: '-45% 0px -50% 0px' });
    porId.forEach((_, id) => { const sec = document.getElementById(id); if (sec) observador.observe(sec); });
  }

  // Entrada das partes de cada seção: só esconde o que está prestes a entrar na tela.
  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !semMovimento) {
    const alvos = '.secao__cab > *, .duas-colunas__texto > *, .foto, .servico, .passo, .cartao, .etapa, .entrega, .compromisso, .contato, .alcance';
    const candidatos = new Set();
    const marcados = new Set();
    let ultimo = window.scrollY;
    let salto = false;
    const mostrar = (el) => { if (salto) el.classList.add('sem-transicao'); el.classList.add('visivel'); marcados.delete(el); revelar.unobserve(el); };
    const revelar = new IntersectionObserver((entradas) => {
      for (const e of entradas) if (e.isIntersecting) mostrar(e.target);
    }, { rootMargin: '0px 0px 8% 0px', threshold: 0 });
    const atualizar = () => {
      const vh = window.innerHeight;
      salto = Math.abs(window.scrollY - ultimo) > vh * 1.2;
      ultimo = window.scrollY;
      candidatos.forEach((el) => {
        const topo = el.getBoundingClientRect().top;
        if (topo > vh && topo < vh * 2.5) {
          el.classList.add('revelar');
          candidatos.delete(el);
          marcados.add(el);
          revelar.observe(el);
        }
      });
      marcados.forEach((el) => { if (el.getBoundingClientRect().top < vh * 1.05) mostrar(el); });
    };
    document.querySelectorAll('main > section:not(.hero)').forEach((secao) => {
      const grupos = new Map();
      secao.querySelectorAll(alvos).forEach((el) => {
        const pai = el.parentElement;
        const n = grupos.get(pai) || 0;
        grupos.set(pai, n + 1);
        el.style.setProperty('--atraso', `${Math.min(n, 5) * 70}ms`);
        candidatos.add(el);
      });
    });
    window.addEventListener('scroll', atualizar, { passive: true });
    window.addEventListener('resize', atualizar);
    atualizar();
  }
})();
