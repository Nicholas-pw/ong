/**
 * ================================================================
 * INSTITUTO VIA SOLIDÁRIA — script.js
 * Módulos: Navbar · Menu Mobile · Dark Mode · Carrossel Hero ·
 *          Abas de Projetos · Galeria + Lightbox · Scroll Reveal ·
 *          Contador Animado · Formulário · Voltar ao Topo · Footer
 * ================================================================
 */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ================================================================
   1. NAVBAR
================================================================ */
function initNavbar() {
    const navbar = $('#navbar');
    const navLinks = $$('.nav-links .nav-link');
    const sections = $$('section[id]');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 8);

        const scrollY = window.scrollY + 100;
        let current = '';
        sections.forEach(s => { if (s.offsetTop <= scrollY) current = s.id; });
        navLinks.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + current);
        });
    }, { passive: true });
}

/* ================================================================
   2. MENU MOBILE
================================================================ */
function initMobileMenu() {
    const hamburger = $('#hamburger');
    const menu = $('#mobile-menu');
    const overlay = $('#mobile-overlay');
    const closeBtn = $('#mobile-close');
    const menuLinks = $$('.mobile-menu__link', menu);

    if (!hamburger || !menu) return;

    function openMenu() {
        menu.classList.add('open');
        menu.setAttribute('aria-hidden', 'false');
        overlay.classList.add('show');
        hamburger.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
    }

    function closeMenu() {
        menu.classList.remove('open');
        menu.setAttribute('aria-hidden', 'true');
        overlay.classList.remove('show');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        hamburger.focus();
    }

    hamburger.addEventListener('click', () => menu.classList.contains('open') ? closeMenu() : openMenu());
    closeBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
    menuLinks.forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
    });
}

/* ================================================================
   3. DARK MODE
================================================================ */
function initDarkMode() {
    const btn = $('#theme-toggle');
    const html = document.documentElement;

    const saved = localStorage.getItem('ivs-theme');
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.dataset.theme = saved ?? (sysDark ? 'dark' : 'light');

    btn?.addEventListener('click', () => {
        const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
        html.dataset.theme = next;
        localStorage.setItem('ivs-theme', next);
    });
}

/* ================================================================
   4. CARROSSEL HERO
================================================================ */
function initHeroCarousel() {
    const slides = $$('.hero-slide');
    const dots = $$('.hero-dot');
    const prevBtn = $('#hero-prev');
    const nextBtn = $('#hero-next');
    const counter = $('#slide-current');
    const progBar = $('#hero-progress-bar');
    const track = $('#hero-track');

    if (!slides.length) return;

    const TOTAL = slides.length;
    const INTERVAL = 6500;
    let current = 0;
    let timer = null;

    const fmt = n => String(n + 1).padStart(2, '0');

    function goTo(idx) {
        slides[current].classList.remove('active');
        slides[current].classList.add('prev');
        dots[current].classList.remove('active');
        dots[current].setAttribute('aria-selected', 'false');

        const old = current;
        setTimeout(() => slides[old].classList.remove('prev'), 900);

        current = (idx + TOTAL) % TOTAL;

        slides[current].classList.add('active');
        dots[current].classList.add('active');
        dots[current].setAttribute('aria-selected', 'true');

        if (counter) counter.textContent = fmt(current);
        startProgress();
    }

    const next = () => goTo(current + 1);
    const prev = () => goTo(current - 1);

    function startAutoplay() {
        stopAutoplay();
        timer = setInterval(next, INTERVAL);
    }
    function stopAutoplay() { clearInterval(timer); }

    function startProgress() {
        if (!progBar) return;
        progBar.style.transition = 'none';
        progBar.style.width = '0%';
        void progBar.offsetWidth;
        progBar.style.transition = `width ${INTERVAL}ms linear`;
        progBar.style.width = '100%';
    }

    nextBtn?.addEventListener('click', () => { next(); startAutoplay(); });
    prevBtn?.addEventListener('click', () => { prev(); startAutoplay(); });

    dots.forEach(dot => {
        dot.addEventListener('click', () => { goTo(+dot.dataset.slide); startAutoplay(); });
    });

    track?.addEventListener('mouseenter', stopAutoplay);
    track?.addEventListener('mouseleave', startAutoplay);

    let tx = 0;
    track?.addEventListener('touchstart', e => { tx = e.changedTouches[0].screenX; }, { passive: true });
    track?.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].screenX - tx;
        if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); startAutoplay(); }
    });

    document.addEventListener('keydown', e => {
        if (!$('#lightbox[hidden]') || $('#lightbox[hidden]').hidden === false) return;
        if (e.key === 'ArrowRight') { next(); startAutoplay(); }
        if (e.key === 'ArrowLeft') { prev(); startAutoplay(); }
    });

    startAutoplay();
    startProgress();
}

/* ================================================================
   5. ABAS DE PROJETOS
================================================================ */
function initProjectTabs() {
    const tabs = $$('.tab');
    const panels = $$('.panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.panel;

            tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
            panels.forEach(p => { p.classList.remove('active'); p.hidden = true; });

            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            const panel = $(`#panel-${target}`);
            if (panel) {
                panel.classList.add('active');
                panel.hidden = false;
                $$('.reveal', panel).forEach(el => {
                    el.classList.remove('visible');
                    void el.offsetWidth;
                    el.classList.add('visible');
                });
            }
        });
    });
}

/* ================================================================
   6. GALERIA + LIGHTBOX
================================================================ */
function initGallery() {
    const filters = $$('.gallery-filter');
    const items = $$('.gitem');

    filters.forEach(btn => {
        btn.addEventListener('click', () => {
            filters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const f = btn.dataset.filter;
            items.forEach(item => {
                item.classList.toggle('hidden', f !== 'all' && item.dataset.cat !== f);
            });
        });
    });

    const lb = $('#lightbox');
    const lbOver = $('#lb-overlay');
    const lbClose = $('#lb-close');
    const lbPrev = $('#lb-prev');
    const lbNext = $('#lb-next');
    const lbImg = $('#lb-img');
    const lbCap = $('#lb-caption');

    if (!lb) return;

    let idx = 0;
    let visible = [];

    function openLb(i) {
        visible = items.filter(it => !it.classList.contains('hidden'));
        idx = i;
        renderLb();
        lb.hidden = false;
        document.body.style.overflow = 'hidden';
        lbClose.focus();
    }

    function closeLb() {
        lb.hidden = true;
        document.body.style.overflow = '';
    }

    function navLb(dir) {
        idx = (idx + dir + visible.length) % visible.length;
        renderLb();
    }

    function renderLb() {
        const item = visible[idx];
        if (!item) return;
        const thumb = $('.gthumb', item);
        lbImg.style.backgroundImage = window.getComputedStyle(thumb).backgroundImage;
        lbCap.textContent = item.dataset.caption || '';
        lbPrev.hidden = lbNext.hidden = visible.length < 2;
    }

    items.forEach((item, i) => item.addEventListener('click', () => openLb(i)));
    lbClose?.addEventListener('click', closeLb);
    lbOver?.addEventListener('click', closeLb);
    lbPrev?.addEventListener('click', () => navLb(-1));
    lbNext?.addEventListener('click', () => navLb(1));

    document.addEventListener('keydown', e => {
        if (lb.hidden) return;
        if (e.key === 'Escape') closeLb();
        if (e.key === 'ArrowLeft') navLb(-1);
        if (e.key === 'ArrowRight') navLb(1);
    });

    let ltx = 0;
    lb.addEventListener('touchstart', e => { ltx = e.changedTouches[0].screenX; }, { passive: true });
    lb.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].screenX - ltx;
        if (Math.abs(dx) > 50) navLb(dx < 0 ? 1 : -1);
    });
}

/* ================================================================
   7. SCROLL REVEAL
================================================================ */
function initScrollReveal() {
    const els = $$('.reveal');
    if (!els.length) return;

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => obs.observe(el));
}

/* ================================================================
   8. CONTADORES ANIMADOS
================================================================ */
function initCounters() {
    const counters = $$('.stat-num[data-target], .impact-num[data-target]');
    if (!counters.length) return;

    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            obs.unobserve(entry.target);

            const el = entry.target;
            const target = +el.dataset.target;
            const dur = 1800;
            const t0 = performance.now();
            const easeOut = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

            (function tick(now) {
                const p = Math.min((now - t0) / dur, 1);
                el.textContent = Math.round(easeOut(p) * target).toLocaleString('pt-BR');
                if (p < 1) requestAnimationFrame(tick);
            })(t0);
        });
    }, { threshold: 0.5 });

    counters.forEach(el => obs.observe(el));
}

/* ================================================================
   9. MÁSCARA TELEFONE
================================================================ */
function initPhoneMask() {
    const tel = $('#f-tel');
    if (!tel) return;

    tel.addEventListener('input', function () {
        let v = this.value.replace(/\D/g, '').slice(0, 11);
        if (v.length <= 2) this.value = v.replace(/(\d{0,2})/, '($1');
        else if (v.length <= 6) this.value = v.replace(/(\d{2})(\d{0,4})/, '($1) $2');
        else if (v.length <= 10) this.value = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        else this.value = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    });
}

/* ================================================================
   10. FORMULÁRIO DE CONTATO
================================================================ */
function initContactForm() {
    const form = $('#contact-form');
    const feedback = $('#form-feedback');
    if (!form) return;

    const rules = {
        'f-name': { required: true, min: 3, msgs: { required: 'Informe seu nome completo.', min: 'Mínimo de 3 caracteres.' } },
        'f-email': { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, msgs: { required: 'Informe seu e-mail.', pattern: 'E-mail inválido.' } },
        'f-assunto': { required: true, msgs: { required: 'Selecione um assunto.' } },
        'f-msg': { required: true, min: 10, msgs: { required: 'Escreva uma mensagem.', min: 'Mínimo de 10 caracteres.' } },
    };

    function validate(field) {
        const id = field.id;
        const rule = rules[id];
        const errEl = $(`#err-${id.replace('f-', '')}`);
        if (!rule || !errEl) return true;

        const val = field.value.trim();
        let msg = '';

        if (rule.required && !val) msg = rule.msgs.required;
        else if (rule.pattern && !rule.pattern.test(val)) msg = rule.msgs.pattern;
        else if (rule.min && val.length < rule.min) msg = rule.msgs.min;

        errEl.textContent = msg;
        field.classList.toggle('error', !!msg);
        return !msg;
    }

    function validateLgpd() {
        const cb = $('#f-lgpd');
        const err = $('#err-lgpd');
        if (!cb || !err) return true;
        const ok = cb.checked;
        err.textContent = ok ? '' : 'Aceite os termos para continuar.';
        return ok;
    }

    Object.keys(rules).forEach(id => {
        const f = $(`#${id}`);
        f?.addEventListener('blur', () => validate(f));
        f?.addEventListener('input', () => { if (f.classList.contains('error')) validate(f); });
    });

    const WA_NUMBER = '5521920356707';
    const ASSUNTOS = {
        parceria: 'Parceria institucional',
        doacao: 'Doação',
        imprensa: 'Imprensa / mídia',
        outro: 'Outro assunto',
    };

    function buildWhatsAppMessage(data) {
        const assunto = ASSUNTOS[data.assunto] ?? data.assunto;
        const tel = data.telefone?.trim() || 'Não informado';
        return (
            `🌱 *Nova mensagem — Instituto Via Solidária*\n\n` +
            `👤 *Nome:* ${data.nome}\n` +
            `📧 *E-mail:* ${data.email}\n` +
            `📱 *Telefone:* ${tel}\n` +
            `📋 *Assunto:* ${assunto}\n\n` +
            `💬 *Mensagem:*\n${data.mensagem}`
        );
    }

    form.addEventListener('submit', e => {
        e.preventDefault();

        const allOk = Object.keys(rules).every(id => validate($(`#${id}`))) && validateLgpd();
        if (!allOk) {
            form.querySelector('.error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        const data = Object.fromEntries(new FormData(form));
        const msg = buildWhatsAppMessage(data);
        const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

        showFeedback('success', '✅ Tudo certo! Abrindo o WhatsApp para você enviar a mensagem…');
        form.reset();
        setTimeout(() => window.open(url, '_blank', 'noopener,noreferrer'), 900);
    });

    function showFeedback(type, msg) {
        feedback.textContent = msg;
        feedback.className = `form-feedback ${type}`;
        feedback.hidden = false;
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        if (type === 'success') setTimeout(() => { feedback.hidden = true; }, 8000);
    }
}

/* ================================================================
   11. SMOOTH SCROLL
================================================================ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
            window.scrollTo({ top: target.offsetTop - navH, behavior: 'smooth' });
        });
    });
}

/* ================================================================
   12. VOLTAR AO TOPO
================================================================ */
function initBackToTop() {
    const btn = $('#back-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('show', window.scrollY > 400);
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ================================================================
   13. FOOTER ANO
================================================================ */
function initFooterYear() {
    const el = $('#footer-year');
    if (el) el.textContent = new Date().getFullYear();
}

/* ================================================================
   14. PIX COPY
================================================================ */
function initPixCopy() {
    document.querySelectorAll('.pix-copy').forEach(btn => {
        btn.addEventListener('click', async () => {
            const key = btn.dataset.pix;
            try {
                await navigator.clipboard.writeText(key);
            } catch {
                const ta = document.createElement('textarea');
                ta.value = key;
                ta.style.cssText = 'position:fixed;opacity:0';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="ph ph-check"></i> Copiado!';
            btn.classList.add('copied');
            setTimeout(() => { btn.innerHTML = original; btn.classList.remove('copied'); }, 2200);
        });
    });
}

/* ================================================================
   15. REVEALS NO LOAD
================================================================ */
function revealOnLoad() {
    requestAnimationFrame(() => {
        $$('.reveal').forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
                el.classList.add('visible');
            }
        });
    });
}

/* ================================================================
   INIT
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initDarkMode();
    initHeroCarousel();
    initProjectTabs();
    initGallery();
    initScrollReveal();
    initCounters();
    initPhoneMask();
    initContactForm();
    initSmoothScroll();
    initBackToTop();
    initFooterYear();
    initPixCopy();
    revealOnLoad();

    console.log(
        '%c🌱 Instituto Via Solidária %csistema iniciado',
        'font-weight:bold;color:#286945;font-size:14px',
        'color:#4a4238;font-size:14px'
    );
});