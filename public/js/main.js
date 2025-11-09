/* ===== Portfolio JS ===== */

// --- Sidebar smooth scroll & highlight ---
const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll("section");
const mainContent = document.querySelector(".main");

navItems.forEach(item => {
  item.addEventListener("click", () => {
    const id = item.dataset.section;
    const section = document.getElementById(id);

    const containerHeight = mainContent.clientHeight;
    const sectionHeight = section.offsetHeight;
    const scrollTop = section.offsetTop - (containerHeight / 2) + (sectionHeight / 2);

    mainContent.scrollTo({ top: scrollTop, behavior: "smooth" });

    navItems.forEach(nav => nav.classList.remove("active"));
    item.classList.add("active");
  });
});



// Animate skills on scroll
const skillElements = document.querySelectorAll(".skill");
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
skillElements.forEach(skill => skillObserver.observe(skill));

// Animate cards on scroll
const cards = document.querySelectorAll(".card");
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      cardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
cards.forEach(card => cardObserver.observe(card));

// Highlight sidebar based on scroll
mainContent.addEventListener("scroll", () => {
  const scrollTop = mainContent.scrollTop;
  const containerHeight = mainContent.clientHeight;
  const containerCenter = scrollTop + containerHeight / 2;

  let closestSection = sections[0];
  let minDistance = Infinity;

  sections.forEach(section => {
    const sectionCenter = section.offsetTop + section.offsetHeight / 2;
    const distance = Math.abs(containerCenter - sectionCenter);
    if (distance < minDistance) {
      minDistance = distance;
      closestSection = section;
    }
  });

  const activeId = closestSection.id;
  navItems.forEach(nav => {
    nav.classList.toggle("active", nav.dataset.section === activeId);
  });
});

// --- Contact Form Submission (Web3Forms) ---
document.addEventListener("DOMContentLoaded", () => {
  const ACCESS_KEY = "24e00843-76f5-4eea-8b41-b73e4bcacd9c"; // <-- Replace with your Web3Forms key
  const form = document.getElementById('contactForm');

  // Create a status message element dynamically if it doesn't exist
  let statusMessage = document.getElementById('statusMessage');
  if (!statusMessage) {
    statusMessage = document.createElement('div');
    statusMessage.id = 'statusMessage';
    statusMessage.className = 'status-message';
    statusMessage.style.display = 'none';
    form.parentNode.appendChild(statusMessage);
  }

  const submitBtn = form.querySelector('.send-btn');
  const btnIcon = submitBtn.querySelector('i');
  const btnText = document.createTextNode(submitBtn.textContent.replace(btnIcon?.outerHTML || '', '').trim());

  submitBtn.innerHTML = '';
  submitBtn.appendChild(btnText);
  if (btnIcon) submitBtn.appendChild(btnIcon);

  let lastSubmitTime = 0;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const now = Date.now();
    if (now - lastSubmitTime < 10000) { // 10-second cooldown
      showMessage('Please wait a few seconds before sending again.', 'error');
      return;
    }
    lastSubmitTime = now;

    // Disable button and show loading state
    submitBtn.disabled = true;
    btnText.textContent = 'Sending...';
    if (btnIcon) btnIcon.className = 'spinner';
    statusMessage.style.display = 'none';

    const formData = new FormData(form);
    formData.append('access_key', ACCESS_KEY);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      console.log('Web3Forms response:', result);

      if (result.success) {
        showMessage("Message sent successfully! We'll get back to you soon.", 'success');
        form.reset();
      } else {
        if (result.message && result.message.includes('domain')) {
          showMessage(
            "Submission blocked: Web3Forms domain restriction. Add http://localhost or your domain in Web3Forms dashboard.",
            'error'
          );
        } else {
          showMessage(result.message || 'Something went wrong. Please try again.', 'error');
        }
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      showMessage('Network error. Please check your connection and try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      btnText.textContent = 'Send Message';
      if (btnIcon) btnIcon.className = 'fas fa-paper-plane';
    }
  });

function showMessage(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type} show`; // add "show" for animation
  statusMessage.style.display = 'block';

  setTimeout(() => {
    statusMessage.classList.remove('show'); // hide smoothly
  }, 5000);
}

});
