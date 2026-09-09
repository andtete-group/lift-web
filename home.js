const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

// Header navigation: keep every menu item usable even when visual effects are active.
const siteHeader = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-button');
const headerNav = siteHeader?.querySelector('nav');

menuButton?.addEventListener('click', () => {
  const isOpen = siteHeader.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
});

headerNav?.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', link.getAttribute('href'));
    siteHeader.classList.remove('menu-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'メニューを開く');
  });
});

document.querySelectorAll('details').forEach((detail) => {
  detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    document.querySelectorAll('details[open]').forEach((item) => {
      if (item !== detail) item.removeAttribute('open');
    });
  });
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const progress = document.querySelector('.scroll-progress');
const glow = document.querySelector('.cursor-glow');
const heroArt = document.querySelector('.hero-art');
const typeCard = document.querySelector('.browser-object');

function updateScrollEffects() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${scrollable > 0 ? window.scrollY / scrollable : 0})`;

  if (!reducedMotion && heroArt) {
    const offset = Math.min(window.scrollY, window.innerHeight) * 0.055;
    heroArt.style.transform = `translateY(${offset}px)`;
  }
}

window.addEventListener('scroll', updateScrollEffects, { passive: true });
updateScrollEffects();

if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('pointermove', (event) => {
    glow.animate({ left: `${event.clientX}px`, top: `${event.clientY}px` }, { duration: 650, fill: 'forwards' });
  });

  heroArt?.addEventListener('pointermove', (event) => {
    const bounds = heroArt.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    typeCard.style.transform = `rotate(-4deg) translate(${x * 18}px, ${y * 18}px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
  });
  heroArt?.addEventListener('pointerleave', () => {
    typeCard.style.transform = 'rotate(-4deg)';
  });

  document.querySelectorAll('.plan').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${-y * 2.5}deg) rotateY(${x * 2.5}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

document.querySelectorAll('.button').forEach((button) => {
  button.addEventListener('pointermove', (event) => {
    if (reducedMotion) return;
    const bounds = button.getBoundingClientRect();
    button.style.transform = `translate(${(event.clientX - bounds.left - bounds.width / 2) * .06}px, ${(event.clientY - bounds.top - bounds.height / 2) * .08}px)`;
  });
  button.addEventListener('pointerleave', () => { button.style.transform = ''; });
});

const miniSite = document.querySelector('.mini-site');
if (miniSite && !reducedMotion) {
  let userControlled = false;
  let previewStep = 0;
  let previewTimer;
  const stopPreview = () => {
    userControlled = true;
    window.clearInterval(previewTimer);
  };

  ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach((eventName) => {
    miniSite.addEventListener(eventName, stopPreview, { passive: true, once: true });
  });

  const miniObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting || userControlled || previewTimer) return;
    previewTimer = window.setInterval(() => {
      previewStep += 1;
      if (previewStep > 3) {
        window.clearInterval(previewTimer);
        window.setTimeout(() => {
          if (!userControlled) miniSite.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1400);
        return;
      }
      miniSite.scrollTo({ top: previewStep * miniSite.clientHeight, behavior: 'smooth' });
    }, 2600);
    miniObserver.disconnect();
  }, { threshold: .55 });
  miniObserver.observe(miniSite);
}

const companyOrbit = document.querySelector('.company-art>div');
if (companyOrbit && !reducedMotion) {
  ['one', 'two', 'three'].forEach((name) => {
    const dot = document.createElement('b');
    dot.className = `company-dot ${name}`;
    companyOrbit.appendChild(dot);
  });
}
