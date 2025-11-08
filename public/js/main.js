/* ===== Portfolio JS ===== */

// --- Sidebar smooth scroll & highlight ---
const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll("section");
const mainContent = document.querySelector(".main");

navItems.forEach(item => {
  item.addEventListener("click", () => {
    const id = item.dataset.section;
    const section = document.getElementById(id);

    mainContent.scrollTo({ top: section.offsetTop, behavior: "smooth" });

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