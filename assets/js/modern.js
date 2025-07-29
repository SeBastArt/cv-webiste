/**
 * Modern JavaScript for Sebastian Schüler Portfolio
 * Vanilla JS implementation replacing jQuery dependencies
 * ES6+ features and modern best practices
 */

'use strict';

// Utility functions
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

// Debounce function for performance optimization
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for scroll events
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Modern App Class
class PortfolioApp {
  constructor() {
    this.isLoaded = false;
    this.currentTheme = localStorage.getItem('theme') || 'light';
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
    } else {
      this.onDOMReady();
    }

    // Handle page load
    window.addEventListener('load', () => this.onPageLoad());
  }

  onDOMReady() {
    this.initTheme();
    this.initNavigation();
    this.initScrollspy();
    this.initTypedText();
    this.initParticles();
    this.initReturnToTop();
    this.initEmailLinks();
    this.initExternalLinks();
    console.log('Portfolio app initialized successfully');
  }

  onPageLoad() {
    this.hidePreloader();
    this.initAnimations();
    this.initProgressBars();
    this.initCounters();
    this.isLoaded = true;
    console.log('Portfolio app fully loaded');
  }

  // Theme Management
  initTheme() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    
    const themeToggle = $('#theme-toggle');
    if (themeToggle) {
      this.updateThemeIcon();
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    localStorage.setItem('theme', this.currentTheme);
    this.updateThemeIcon();
    
    // Animate theme transition
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  }

  updateThemeIcon() {
    const icon = $('#theme-icon');
    if (icon) {
      icon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
  }

  // Navigation
  initNavigation() {
    const navbar = $('.navigation');
    const navToggle = $('.navbar-toggler');
    const navCollapse = $('#navigation');
    
    // Smooth scrolling for navigation links
    $$('.nav-link[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const target = $(`#${targetId}`);
        
        if (target) {
          const headerHeight = navbar?.offsetHeight || 80;
          const targetPosition = target.offsetTop - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // Close mobile menu if open
          if (navCollapse && navCollapse.classList.contains('show')) {
            this.closeMobileMenu();
          }
        }
      });
    });

    // Handle scroll for navbar transparency
    const handleScroll = throttle(() => {
      if (navbar) {
        const scrolled = window.scrollY > 50;
        navbar.classList.toggle('transparent_header', !scrolled);
      }
    }, 16);

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    // Mobile menu toggle
    if (navToggle && navCollapse) {
      navToggle.addEventListener('click', () => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isExpanded);
        navCollapse.classList.toggle('show');
      });
    }
  }

  closeMobileMenu() {
    const navToggle = $('.navbar-toggler');
    const navCollapse = $('#navigation');
    
    if (navToggle && navCollapse) {
      navToggle.setAttribute('aria-expanded', 'false');
      navCollapse.classList.remove('show');
    }
  }

  // Scrollspy
  initScrollspy() {
    const sections = $$('section[id]');
    const navLinks = $$('.nav-link[href^="#"]');
    
    if (sections.length === 0 || navLinks.length === 0) return;

    const handleScrollspy = throttle(() => {
      const scrollPosition = window.scrollY + 100;
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, 16);

    window.addEventListener('scroll', handleScrollspy);
    handleScrollspy(); // Initial call
  }

  // Typed Text Animation
  initTypedText() {
    const typedElement = $('.welcome-text-type');
    if (!typedElement) return;

    const options = typedElement.getAttribute('data-options');
    if (!options) return;

    const strings = options.split(',').map(s => s.trim());
    let currentIndex = 0;
    let currentChar = 0;
    let isDeleting = false;

    const typeSpeed = 100;
    const deleteSpeed = 50;
    const pauseTime = 2000;

    const type = () => {
      const currentString = strings[currentIndex];
      
      if (isDeleting) {
        typedElement.textContent = currentString.substring(0, currentChar - 1);
        currentChar--;
        
        if (currentChar === 0) {
          isDeleting = false;
          currentIndex = (currentIndex + 1) % strings.length;
          setTimeout(type, 500);
          return;
        }
      } else {
        typedElement.textContent = currentString.substring(0, currentChar + 1);
        currentChar++;
        
        if (currentChar === currentString.length) {
          isDeleting = true;
          setTimeout(type, pauseTime);
          return;
        }
      }
      
      setTimeout(type, isDeleting ? deleteSpeed : typeSpeed);
    };

    // Start typing animation
    setTimeout(type, 1000);
  }

  // Particles Background
  initParticles() {
    const particleContainer = $('#particlebackground');
    if (!particleContainer) return;

    // Simple particle system using Canvas API
    const canvas = particleContainer;
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    let animationId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.2
    });

    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 10000));
      
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
      }
    };

    const updateParticles = () => {
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
      });
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const isDark = this.currentTheme === 'dark';
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

      particles.forEach(particle => {
        ctx.globalAlpha = particle.opacity;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections
        particles.forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.globalAlpha = (1 - distance / 150) * 0.2;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });
    };

    const animate = () => {
      updateParticles();
      drawParticles();
      animationId = requestAnimationFrame(animate);
    };

    // Initialize
    resizeCanvas();
    initParticles();
    animate();

    // Handle resize
    window.addEventListener('resize', debounce(() => {
      resizeCanvas();
      initParticles();
    }, 250));

    // Pause animation when tab is not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        animate();
      }
    });
  }

  // Animations (AOS replacement)
  initAnimations() {
    const animatedElements = $$('[data-aos]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => {
      observer.observe(el);
    });
  }

  // Progress Bars
  initProgressBars() {
    const progressBars = $$('.progress-bar[data-percent]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const percent = bar.getAttribute('data-percent');
          
          bar.style.width = '0%';
          setTimeout(() => {
            bar.style.transition = 'width 2s ease-in-out';
            bar.style.width = `${percent}%`;
          }, 100);
          
          observer.unobserve(bar);
        }
      });
    }, { threshold: 0.5 });

    progressBars.forEach(bar => observer.observe(bar));
  }

  // Counters
  initCounters() {
    const counters = $$('.tmcounter[data-to]');
    
    const animateCounter = (counter) => {
      const target = parseInt(counter.getAttribute('data-to'));
      const duration = 2000;
      const increment = target / (duration / 16);
      let current = 0;
      
      const updateCounter = () => {
        current += increment;
        if (current < target) {
          counter.textContent = Math.floor(current);
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target;
        }
      };
      
      updateCounter();
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  }

  // Email Link Enhancement
  initEmailLinks() {
    const emailLinks = $$('a[href^="mailto:"]');
    
    emailLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Add tracking or analytics if needed
        console.log('Email link clicked:', link.href);
      });
    });
  }

  // Preloader
  hidePreloader() {
    const preloader = $('#preloader');
    if (preloader) {
      setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => {
          preloader.style.display = 'none';
          document.body.style.overflow = '';
        }, 500);
      }, 400);
    }
  }

  // Return to top button
  initReturnToTop() {
    const returnToTopBtn = $('#return-to-top');
    if (!returnToTopBtn) return;

    const handleScroll = throttle(() => {
      const scrolled = window.scrollY > 300;
      returnToTopBtn.style.display = scrolled ? 'flex' : 'none';
    }, 16);

    window.addEventListener('scroll', handleScroll);

    returnToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // External Link Enhancement
  initExternalLinks() {
    const externalLinks = $$('a[target="_blank"]');
    
    externalLinks.forEach(link => {
      // Ensure proper security attributes
      if (!link.hasAttribute('rel')) {
        link.setAttribute('rel', 'noopener noreferrer');
      }
      
      // Add click tracking if needed
      link.addEventListener('click', (e) => {
        console.log('External link clicked:', link.href);
      });
    });
  }
}

// Initialize the app
const portfolioApp = new PortfolioApp();

// Export for potential external use
window.PortfolioApp = PortfolioApp;