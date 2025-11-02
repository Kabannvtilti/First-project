const fadeElements = document.querySelectorAll('.fade-text');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      observer.unobserve(entry.target); // щоб не повторювалось
    }
  });
}, {
  threshold: 0.3
});

fadeElements.forEach(el => observer.observe(el));
