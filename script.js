/**
 * ================================================================
 * INSTITUTO RAÍZES VIVAS — script.js
 * Funcionalidades: Navbar, Dark Mode, Carrossel Hero, Abas de
 * Projetos, Galeria com Modal Lightbox, Filtros, Scroll Reveal,
 * Contador Animado, Validação de Formulário, Botão Voltar ao Topo.
 * ================================================================
 */

/* ----------------------------------------------------------------
   UTILITÁRIOS INTERNOS
---------------------------------------------------------------- */

/**
 * Seleciona um único elemento.
 * @param {string} sel — Seletor CSS
 * @param {Element} [ctx=document] — Contexto de busca
 */
const $ = (sel, ctx = document) => ctx.querySelector(sel);

/**
 * Seleciona múltiplos elementos como Array.
 * @param {string} sel — Seletor CSS
 * @param {Element} [ctx=document] — Contexto de busca
 */
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ================================================================
   1. NAVBAR — scroll + active link
================================================================ */
(function initNavbar() {
  const navbar  = $('#navbar');
  const navLinks = $$('.nav-link');
  const sections = $$('section[id]');

  // Adiciona sombra ao fazer scroll
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('is-scrolled', window.scrollY > 10);
    highlightActiveLink();
  }, { passive: true });

  // Marca o link ativo conforme a seção visível
  function highlightActiveLink() {
    const scrollY = window.scrollY + 100; // offset do navbar

    let currentId = '';
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollY) currentId = sec.id;
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('is-active', href === currentId);
    });
  }

  // Fecha o menu mobile ao clicar num link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });
})();

/* ================================================================
   2. MENU HAMBÚRGUER (Mobile)
================================================================ */
(function initHamburger() {
  const btn      = $('#hamburger');
  const nav      = $('#main-nav');
  const overlay  = $('#nav-overlay');

  if (!btn || !nav) return;

  btn.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', closeMobileMenu);

  // Fecha com tecla Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMobileMenu();
  });

  function toggleMenu() {
    const isOpen = nav.classList.toggle('is-open');
    btn.classList.toggle('is-open', isOpen);
    overlay.classList.toggle('is-open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }
})();

/** Fecha o menu mobile — chamado por outros módulos */
function closeMobileMenu() {
  const btn     = $('#hamburger');
  const nav     = $('#main-nav');
  const overlay = $('#nav-overlay');

  nav?.classList.remove('is-open');
  btn?.classList.remove('is-open');
  overlay?.classList.remove('is-open');
  btn?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

/* ================================================================
   3. DARK MODE — persiste preferência no localStorage
================================================================ */
(function initDarkMode() {
  const toggleBtn = $('#theme-toggle');
  const html = document.documentElement;

  // Carrega tema salvo ou prefere-color-scheme do sistema
  const saved = localStorage.getItem('raizes-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved ?? (prefersDark ? 'dark' : 'light');
  html.dataset.theme = initial;

  toggleBtn?.addEventListener('click', () => {
    const isDark = html.dataset.theme === 'dark';
    const next   = isDark ? 'light' : 'dark';
    html.dataset.theme = next;
    localStorage.setItem('raizes-theme', next);
  });
})();

/* ================================================================
   4. CARROSSEL HERO — autoplay + controles
================================================================ */
(function initHeroCarousel() {
  const slides    = $$('.hero__slide');
  const dots      = $$('.dot', $('#carousel-dots'));
  const prevBtn   = $('#prev-slide');
  const nextBtn   = $('#next-slide');

  if (!slides.length) return;

  let current   = 0;
  let autoTimer = null;
  const INTERVAL = 6000; // 6s entre slides

  /** Ativa o slide pelo índice */
  function goTo(idx) {
    // Desativa o slide atual
    slides[current].classList.remove('is-active');
    slides[current].setAttribute('aria-hidden', 'true');
    dots[current].classList.remove('is-active');
    dots[current].setAttribute('aria-selected', 'false');

    // Normaliza o índice (circular)
    current = (idx + slides.length) % slides.length;

    // Ativa o novo slide
    slides[current].classList.add('is-active');
    slides[current].setAttribute('aria-hidden', 'false');
    dots[current].classList.add('is-active');
    dots[current].setAttribute('aria-selected', 'true');
  }

  /** Avança para o próximo slide */
  function next() { goTo(current + 1); }

  /** Retrocede para o slide anterior */
  function prev() { goTo(current - 1); }

  /** Inicia o autoplay */
  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, INTERVAL);
  }

  /** Para o autoplay */
  function stopAuto() {
    clearInterval(autoTimer);
  }

  // Eventos dos botões
  nextBtn?.addEventListener('click', () => { next(); startAuto(); });
  prevBtn?.addEventListener('click', () => { prev(); startAuto(); });

  // Eventos dos dots
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); startAuto(); });
  });

  // Pausa o autoplay ao interagir com o carrossel (UX)
  const carousel = $('#hero-carousel');
  carousel?.addEventListener('mouseenter', stopAuto);
  carousel?.addEventListener('mouseleave', startAuto);

  // Suporte a swipe (touch) no hero
  let touchStartX = 0;
  carousel?.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  carousel?.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); startAuto(); }
  });

  // Inicia
  startAuto();
})();

/* ================================================================
   5. ABAS DE PROJETOS
================================================================ */
(function initProjectTabs() {
  const tabs   = $$('.proj-tab');
  const panels = $$('.proj-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      // Remove estado ativo de todas as abas
      tabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });

      // Oculta todos os painéis
      panels.forEach(p => {
        p.classList.remove('is-active');
        p.hidden = true;
      });

      // Ativa a aba clicada
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      // Mostra o painel correspondente
      const panel = $(`#tab-${target}`);
      if (panel) {
        panel.classList.add('is-active');
        panel.hidden = false;

        // Re-dispara animações de reveal dentro do painel
        $$('.reveal', panel).forEach(el => {
          el.classList.remove('is-visible');
          void el.offsetWidth; // force reflow
          el.classList.add('is-visible');
        });
      }
    });
  });
})();

/* ================================================================
   6. GALERIA — Filtros + Modal Lightbox + Navegação
================================================================ */
(function initGaleria() {
  /* ---- Filtros ---- */
  const filterBtns = $$('.filter-btn');
  const items      = $$('.galeria__item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      items.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('is-hidden', !match);
      });
    });
  });

  /* ---- Modal Lightbox ---- */
  const modal      = $('#galeria-modal');
  const overlay    = $('#modal-overlay');
  const closeBtn   = $('#modal-close');
  const imgWrap    = $('#modal-img-wrap');
  const caption    = $('#modal-caption');
  const prevBtn    = $('#modal-prev');
  const nextBtn    = $('#modal-next');

  if (!modal) return;

  let currentIdx = 0;           // índice do item atual no modal
  let visibleItems = [];        // items visíveis (respeitando filtro ativo)

  /** Abre o modal com o item de índice idx */
  function openModal(idx) {
    visibleItems = items.filter(i => !i.classList.contains('is-hidden'));
    currentIdx = idx;
    renderModal();

    modal.hidden    = false;
    overlay.hidden  = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  /** Fecha o modal */
  function closeModal() {
    modal.hidden   = true;
    overlay.hidden = true;
    document.body.style.overflow = '';
  }

  /** Renderiza o conteúdo do modal conforme currentIdx */
  function renderModal() {
    const item  = visibleItems[currentIdx];
    if (!item) return;

    const thumb = $('.galeria__thumb', item);
    const bg    = window.getComputedStyle(thumb).backgroundImage;
    const cap   = item.dataset.caption || '';

    imgWrap.style.backgroundImage = bg;
    caption.textContent = cap;
    caption.id = 'modal-caption';

    // Oculta setas se só há um item
    const hasMultiple = visibleItems.length > 1;
    prevBtn.hidden = !hasMultiple;
    nextBtn.hidden = !hasMultiple;
  }

  /** Navega para o próximo/anterior */
  function navModal(dir) {
    currentIdx = (currentIdx + dir + visibleItems.length) % visibleItems.length;
    renderModal();
  }

  // Abre modal ao clicar em cada item
  items.forEach((item, idx) => {
    item.addEventListener('click', () => openModal(idx));
  });

  // Botões de fechar e navegar
  closeBtn?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', closeModal);
  prevBtn?.addEventListener('click', () => navModal(-1));
  nextBtn?.addEventListener('click', () => navModal(1));

  // Teclado: ESC fecha, setas navegam
  document.addEventListener('keydown', e => {
    if (modal.hidden) return;
    if (e.key === 'Escape')     closeModal();
    if (e.key === 'ArrowLeft')  navModal(-1);
    if (e.key === 'ArrowRight') navModal(1);
  });

  // Swipe no modal
  let touchX = 0;
  modal.addEventListener('touchstart', e => { touchX = e.changedTouches[0].screenX; }, { passive: true });
  modal.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].screenX - touchX;
    if (Math.abs(dx) > 50) navModal(dx < 0 ? 1 : -1);
  });
})();

/* ================================================================
   7. SCROLL REVEAL — IntersectionObserver para animações suaves
================================================================ */
(function initScrollReveal() {
  const elements = $$('.reveal');

  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // anima apenas uma vez
        }
      });
    },
    {
      threshold:  0.12,   // visível 12% do elemento
      rootMargin: '0px 0px -40px 0px'  // pequena margem inferior
    }
  );

  elements.forEach(el => observer.observe(el));
})();

/* ================================================================
   8. CONTADOR ANIMADO para estatísticas
================================================================ */
(function initCounters() {
  const counters = $$('.stat__num[data-target]');

  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);

        const el     = entry.target;
        const target = +el.dataset.target;
        const dur    = 1800; // duração da animação em ms
        const start  = performance.now();

        // Easing — easeOutExpo para desaceleração suave no final
        function easeOutExpo(t) {
          return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }

        function tick(now) {
          const elapsed  = now - start;
          const progress = Math.min(elapsed / dur, 1);
          const value    = Math.round(easeOutExpo(progress) * target);
          el.textContent = value.toLocaleString('pt-BR');
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
})();

/* ================================================================
   9. VALIDAÇÃO DO FORMULÁRIO DE CONTATO
================================================================ */
(function initContactForm() {
  const form     = $('#contact-form');
  const feedback = $('#form-feedback');
  const submitBtn = $('#form-submit');

  if (!form) return;

  /* --- Regras de validação --- */
  const rules = {
    'f-name': {
      required: true,
      minLength: 3,
      messages: {
        required:  'Por favor, informe seu nome completo.',
        minLength: 'O nome deve ter ao menos 3 caracteres.'
      }
    },
    'f-email': {
      required: true,
      pattern:  /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      messages: {
        required: 'Por favor, informe seu e-mail.',
        pattern:  'Informe um e-mail válido (ex: nome@dominio.com.br).'
      }
    },
    'f-assunto': {
      required: true,
      messages: { required: 'Por favor, selecione um assunto.' }
    },
    'f-msg': {
      required:  true,
      minLength: 10,
      messages: {
        required:  'Por favor, escreva uma mensagem.',
        minLength: 'A mensagem deve ter ao menos 10 caracteres.'
      }
    }
  };

  /**
   * Valida um campo e exibe/limpa o erro.
   * @param {HTMLElement} field — O campo a validar
   * @returns {boolean} — true se válido
   */
  function validateField(field) {
    const id     = field.id;
    const rule   = rules[id];
    const errEl  = $(`#${id}-error`);

    if (!rule || !errEl) return true;

    const val    = field.value.trim();
    let   msg    = '';

    if (rule.required && !val) {
      msg = rule.messages.required;
    } else if (rule.pattern && val && !rule.pattern.test(val)) {
      msg = rule.messages.pattern;
    } else if (rule.minLength && val.length < rule.minLength) {
      msg = rule.messages.minLength;
    }

    errEl.textContent = msg;
    field.classList.toggle('is-error', !!msg);
    field.setAttribute('aria-invalid', String(!!msg));

    return !msg;
  }

  /** Valida o checkbox LGPD separadamente */
  function validateCheckbox() {
    const cb    = $('#f-lgpd');
    const errEl = $('#f-lgpd-error');
    if (!cb || !errEl) return true;

    const valid = cb.checked;
    errEl.textContent = valid ? '' : 'Você precisa aceitar os termos para enviar a mensagem.';
    return valid;
  }

  // Valida em tempo real ao sair do campo (blur)
  Object.keys(rules).forEach(id => {
    const field = $(`#${id}`);
    field?.addEventListener('blur', () => validateField(field));
    field?.addEventListener('input', () => {
      // Limpa o erro enquanto o usuário digita (após blur inicial)
      if (field.classList.contains('is-error')) validateField(field);
    });
  });

  // Submit — valida tudo e "envia" (simulado)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Valida todos os campos
    const fieldIds    = Object.keys(rules);
    let   allValid    = fieldIds.every(id => validateField($(`#${id}`))); 
    const checkOk     = validateCheckbox();
    allValid          = allValid && checkOk;

    if (!allValid) {
      // Scroll suave até o primeiro erro
      const firstError = form.querySelector('.is-error, [aria-invalid="true"]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError?.focus();
      return;
    }

    // --- Simulação de envio --- (substituir por fetch real em produção)
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Enviando…';

    try {
      // Simula delay de rede
      await new Promise(res => setTimeout(res, 1800));

      // Coleta dados do formulário (para fins demonstrativos)
      const data = Object.fromEntries(new FormData(form).entries());
      console.log('📬 Formulário enviado:', data);

      // Feedback de sucesso
      form.reset();
      showFeedback('success',
        '✅ Mensagem enviada com sucesso! Nossa equipe entrará em contato em até 2 dias úteis.');

    } catch (err) {
      showFeedback('error',
        '❌ Erro ao enviar. Por favor, tente novamente ou entre em contato pelo WhatsApp.');
    } finally {
      submitBtn.disabled    = false;
      submitBtn.innerHTML   = '<i class="ph ph-paper-plane-tilt" aria-hidden="true"></i> Enviar mensagem';
    }
  });

  /**
   * Exibe o feedback de envio.
   * @param {'success'|'error'} type
   * @param {string} message
   */
  function showFeedback(type, message) {
    feedback.textContent  = message;
    feedback.className    = `form__feedback is-${type}`;
    feedback.hidden       = false;
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    // Auto-oculta após 8s no caso de sucesso
    if (type === 'success') setTimeout(() => { feedback.hidden = true; }, 8000);
  }
})();

/* ================================================================
   10. BOTÃO VOLTAR AO TOPO
================================================================ */
(function initBackToTop() {
  const btn = $('#back-to-top');
  if (!btn) return;

  // Mostra o botão após rolar 400px
  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ================================================================
   11. ANO DINÂMICO NO FOOTER
================================================================ */
(function initFooterYear() {
  const yearEl = $('#footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

/* ================================================================
   12. MÁSCARA DE TELEFONE (campo de contato)
================================================================ */
(function initPhoneMask() {
  const telInput = $('#f-tel');
  if (!telInput) return;

  telInput.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '').slice(0, 11);

    if (v.length <= 2)       this.value = v.replace(/(\d{0,2})/, '($1');
    else if (v.length <= 6)  this.value = v.replace(/(\d{2})(\d{0,4})/, '($1) $2');
    else if (v.length <= 10) this.value = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    else                     this.value = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  });
})();

/* ================================================================
   13. SMOOTH SCROLL para links âncora com offset do navbar
================================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;

      e.preventDefault();
      const navH   = parseInt(getComputedStyle(document.documentElement)
                       .getPropertyValue('--navbar-h'), 10) || 70;
      const top    = target.getBoundingClientRect().top + window.scrollY - navH;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ================================================================
   14. REVELAÇÃO INICIAL — elements ja visiveis no viewport ao carregar
================================================================ */
window.addEventListener('DOMContentLoaded', () => {
  // Pequeno delay para garantir que o CSS de .reveal foi aplicado
  requestAnimationFrame(() => {
    $$('.reveal').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        el.classList.add('is-visible');
      }
    });
  });
});

/* ================================================================
   15. LOG de inicialização (desenvolvimento)
================================================================ */
console.log(
  '%c🌱 Instituto Raízes Vivas\n' +
  '%cSite carregado com sucesso. ' +
  'Transformando vidas desde 2010.',
  'font-size:1.2em; font-weight:bold; color:#2d7a56;',
  'color:#6b6259;'
);