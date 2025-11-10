/* ===== main.js — Optimized & Robust =====
   - rAF-throttled scroll updates (no layout thrashing)
   - Precomputed section centers (recalculated on resize / content changes)
   - IntersectionObservers for animations
   - Passive scroll listener
   - Safe DOM checks
   - Keeps your Web3Forms contact submit logic
*/

'use strict';

/* ---------------------------
   Cached DOM references
   --------------------------- */
const navItems = Array.from(document.querySelectorAll('.nav-item'));
const sections = Array.from(document.querySelectorAll('section'));
const mainContent = document.querySelector('.main');

/* If mainContent missing, bail early */
if (!mainContent) {
  console.warn('main.js: .main container not found — aborting some behaviors.');
}

/* ---------------------------
   Utilities & state
   --------------------------- */
let ticking = false; // rAF throttle flag
let sectionCenters = []; // cached center positions relative to scrollTop
let lastContainerHeight = 0;

/* ---------------------------
   Compute & cache section centers
   (distance calculation uses values relative to mainContent.scrollTop)
   --------------------------- */
function computeSectionCenters() {
  if (!mainContent) return;

  const scrollTop = mainContent.scrollTop;
  const containerRect = mainContent.getBoundingClientRect();
  const containerTop = containerRect.top;

  sectionCenters = sections.map(sec => {
    const rect = sec.getBoundingClientRect();
    // rect.top is relative to viewport; convert to position relative to scrollTop
    const absoluteTop = scrollTop + (rect.top - containerTop);
    const center = absoluteTop + rect.height / 2;
    return { id: sec.id, center, height: rect.height };
  });

  lastContainerHeight = mainContent.clientHeight;
}

/* initialize cached positions */
computeSectionCenters();

/* Recompute on resize and when mainContent size changes (e.g. dynamic content) */
if (typeof ResizeObserver !== 'undefined' && mainContent) {
  const ro = new ResizeObserver(() => {
    computeSectionCenters();
    // update active section immediately after layout change
    updateActiveSection();
  });
  ro.observe(mainContent);
}

/* Also recalc on window resize as a fallback */
window.addEventListener('resize', () => {
  computeSectionCenters();
}, { passive: true });

/* ---------------------------
   Smooth scroll on nav click
   --------------------------- */
navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    const id = item.dataset.section;
    if (!id) return;
    const section = document.getElementById(id);
    if (!section || !mainContent) return;

    // Recompute to ensure up-to-date values
    computeSectionCenters();

    // Find cached center for this section
    const info = sectionCenters.find(s => s.id === id);
    const containerHeight = mainContent.clientHeight || lastContainerHeight || 0;
    let targetTop;
    if (info) {
      // scrollTop should position container so section center aligns to container center
      targetTop = info.center - (containerHeight / 2);
    } else {
      // fallback: compute using DOM properties
      const sectionOffset = section.offsetTop || 0;
      const sectionHeight = section.offsetHeight || 0;
      targetTop = sectionOffset - (containerHeight / 2) + (sectionHeight / 2);
    }

    mainContent.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });

    // update active class immediately for perceived responsiveness
    navItems.forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');
  });
});

/* ---------------------------
   IntersectionObservers for animations
   --------------------------- */
const observeOnce = (elements, options, onEnter) => {
  if (!elements || elements.length === 0) return;
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        onEnter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, options);
  elements.forEach(el => observer.observe(el));
};

// skills
observeOnce(document.querySelectorAll('.skill'), { threshold: 0.2 }, el => el.classList.add('visible'));

// cards
observeOnce(document.querySelectorAll('.card'), { threshold: 0.2 }, el => el.classList.add('visible'));

/* slide-in-right (single element) */
const slideElement = document.querySelector('.slide-in-right');
if (slideElement) {
  const slideObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('slide-in-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });
  slideObs.observe(slideElement);
}

/* ---------------------------
   Active section update (rAF throttled)
   --------------------------- */
function updateActiveSection() {
  if (!mainContent || sectionCenters.length === 0) return;

  const scrollTop = mainContent.scrollTop;
  const containerHeight = mainContent.clientHeight || lastContainerHeight || 0;
  const containerCenter = scrollTop + containerHeight / 2;

  // find closest section using cached centers
  let minDistance = Infinity;
  let closestId = sectionCenters[0]?.id || null;

  for (let i = 0; i < sectionCenters.length; i++) {
    const s = sectionCenters[i];
    const distance = Math.abs(containerCenter - s.center);
    if (distance < minDistance) {
      minDistance = distance;
      closestId = s.id;
    }
  }

  if (closestId) {
    navItems.forEach(nav => {
      nav.classList.toggle('active', nav.dataset.section === closestId);
    });
  }
}

/* rAF-throttled scroll handler */
if (mainContent) {
  mainContent.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        // If container height changed (e.g. due to dynamic content), recompute centers
        if (mainContent.clientHeight !== lastContainerHeight) {
          computeSectionCenters();
        }
        updateActiveSection();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ---------------------------
   Contact form (Web3Forms) — DOMContentLoaded safe
   --------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const ACCESS_KEY = '24e00843-76f5-4eea-8b41-b73e4bcacd9c'; // replace if needed
  const form = document.getElementById('contactForm');
  if (!form) return;

  // create status message container if missing
  let statusMessage = document.getElementById('statusMessage');
  if (!statusMessage) {
    statusMessage = document.createElement('div');
    statusMessage.id = 'statusMessage';
    statusMessage.className = 'status-message';
    statusMessage.style.display = 'none';
    form.parentNode.appendChild(statusMessage);
  }

  const submitBtn = form.querySelector('.send-btn');
  const btnIcon = submitBtn ? submitBtn.querySelector('i') : null;
  const rawText = submitBtn ? submitBtn.textContent.replace(btnIcon?.outerHTML || '', '').trim() : 'Send Message';
  const btnText = document.createTextNode(rawText);

  if (submitBtn) {
    submitBtn.innerHTML = '';
    submitBtn.appendChild(btnText);
    if (btnIcon) submitBtn.appendChild(btnIcon);
  }

  let lastSubmitTime = 0;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastSubmitTime < 10000) { // 10s cooldown
      showMessage('Please wait a few seconds before sending again.', 'error');
      return;
    }
    lastSubmitTime = now;

    if (submitBtn) {
      submitBtn.disabled = true;
      btnText.textContent = 'Sending...';
      if (btnIcon) btnIcon.className = 'spinner';
    }
    statusMessage.style.display = 'none';

    const formData = new FormData(form);
    formData.append('access_key', ACCESS_KEY);

    try {
      const resp = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });
      const result = await resp.json();
      if (result.success) {
        showMessage("Message sent successfully! We'll get back to you soon.", 'success');
        form.reset();
      } else {
        if (result.message && result.message.includes('domain')) {
          showMessage("Submission blocked: Web3Forms domain restriction. Add your domain in Web3Forms dashboard.", 'error');
        } else {
          showMessage(result.message || 'Something went wrong. Please try again.', 'error');
        }
      }
    } catch (err) {
      console.error('Contact submit error:', err);
      showMessage('Network error. Please check your connection and try again.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        btnText.textContent = rawText;
        if (btnIcon) btnIcon.className = 'fas fa-paper-plane';
      }
    }
  });

  function showMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type} show`;
    statusMessage.style.display = 'block';
    setTimeout(() => statusMessage.classList.remove('show'), 5000);
  }
});

/* ---------------------------
   Small safety: log if sections/nav mismatch
   --------------------------- */
if (sections.length === 0 || navItems.length === 0) {
  // no-op but helpful during development
  // console.info('main.js: no sections or nav items found');
}
