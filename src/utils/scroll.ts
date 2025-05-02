
// Add smooth scrolling behavior
export const initSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      const href = this.getAttribute('href');
      if (!href) return;

      const target = document.querySelector(href);
      if (!target) return;

      target.scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
};

// Initialize scroll reveal animation with enhanced effects
export const initScrollReveal = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          
          // Add specific animations based on data attributes
          const element = entry.target as HTMLElement;
          if (element.dataset.animation === 'fade-up') {
            element.style.animationName = 'fadeInUp';
          } else if (element.dataset.animation === 'fade-in') {
            element.style.animationName = 'fadeIn';
          } else if (element.dataset.animation === 'slide-in') {
            element.style.animationName = 'slideIn';
          }
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
  );

  const elements = document.querySelectorAll('.reveal');
  elements.forEach(el => {
    observer.observe(el);
  });
};

// Add parallax scrolling effect
export const initParallax = () => {
  const parallaxElements = document.querySelectorAll('.parallax');
  
  const handleScroll = () => {
    const scrollY = window.scrollY;
    
    parallaxElements.forEach((element) => {
      const speed = Number((element as HTMLElement).dataset.speed || 0.2);
      const offset = scrollY * speed;
      (element as HTMLElement).style.transform = `translateY(${offset}px)`;
    });
  };
  
  window.addEventListener('scroll', handleScroll);
  
  // Initialize on first load
  handleScroll();
  
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};

// Initialize all scroll effects
export const initScrollEffects = () => {
  initSmoothScroll();
  initScrollReveal();
  initParallax();
};
