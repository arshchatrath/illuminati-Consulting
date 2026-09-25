// TODO: set the address that contact-form enquiries should go to.
const CONTACT_EMAIL = '';

document.getElementById('year').textContent = new Date().getFullYear();

// Mobile menu
const toggle = document.querySelector('.nav__toggle');
const menu = document.getElementById('mobile-menu');
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  menu.hidden = open;
});
menu.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    toggle.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
  }
});

// Nav background once scrolled past the top
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('nav--scrolled', window.scrollY > 24);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('is-in'));
}

// Hero light follows the pointer
const hero = document.querySelector('.hero');
hero.addEventListener('pointermove', (e) => {
  const r = hero.getBoundingClientRect();
  hero.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
  hero.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
});

// Contact form: no backend yet, so open the visitor's mail client.
const form = document.getElementById('contact-form');
const status = form.querySelector('.form__status');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    status.textContent = 'Please add your name, a valid work email and a short message.';
    form.reportValidity();
    return;
  }
  if (!CONTACT_EMAIL) {
    status.textContent = 'Thanks! Our enquiry inbox is being set up. Please reach us on LinkedIn for now.';
    return;
  }
  const d = new FormData(form);
  const subject = `Enquiry: ${d.get('interest')} (${d.get('company') || d.get('name')})`;
  const body = `Name: ${d.get('name')}\nEmail: ${d.get('email')}\nCompany: ${d.get('company')}\nInterest: ${d.get('interest')}\n\n${d.get('message')}`;
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  status.textContent = 'Opening your email client…';
});
