// Navbar scroll effect
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Mobile menu toggle
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navActions = document.querySelector('.nav-actions');

mobileMenuToggle?.addEventListener('click', () => {
    mobileMenuToggle.classList.toggle('active');
    navLinks?.classList.toggle('active');
    navActions?.classList.toggle('active');
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all feature cards, pricing cards, and testimonials
const animatedElements = document.querySelectorAll(
    '.feature-card, .pricing-card, .testimonial-card, .step-card'
);

animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Dashboard mockup animation
const dashboardImage = document.getElementById('dashboard-image');
if (dashboardImage) {
    // Create animated dashboard visualization
    const createDashboardViz = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        dashboardImage.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let animationFrame;

        // Animated data visualization
        const bars = [];
        const barCount = 12;
        const barWidth = canvas.width / (barCount * 2);

        for (let i = 0; i < barCount; i++) {
            bars.push({
                x: i * (barWidth * 2) + barWidth / 2,
                height: Math.random() * 200 + 50,
                targetHeight: Math.random() * 200 + 50,
                color: `hsl(${239 + i * 5}, 84%, 67%)`
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw grid
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 5; i++) {
                const y = (canvas.height / 5) * i;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Draw and animate bars
            bars.forEach((bar, index) => {
                // Smooth animation
                const diff = bar.targetHeight - bar.height;
                bar.height += diff * 0.05;

                // Randomly change target height
                if (Math.random() < 0.01) {
                    bar.targetHeight = Math.random() * 200 + 50;
                }

                // Draw bar
                const gradient = ctx.createLinearGradient(0, canvas.height - bar.height, 0, canvas.height);
                gradient.addColorStop(0, bar.color);
                gradient.addColorStop(1, 'rgba(99, 102, 241, 0.3)');

                ctx.fillStyle = gradient;
                ctx.fillRect(
                    bar.x,
                    canvas.height - bar.height,
                    barWidth,
                    bar.height
                );

                // Draw glow effect
                ctx.shadowBlur = 20;
                ctx.shadowColor = bar.color;
                ctx.fillRect(
                    bar.x,
                    canvas.height - bar.height,
                    barWidth,
                    5
                );
                ctx.shadowBlur = 0;
            });

            // Draw connecting line
            ctx.strokeStyle = 'rgba(139, 92, 246, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            bars.forEach((bar, index) => {
                const x = bar.x + barWidth / 2;
                const y = canvas.height - bar.height;
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();

            // Draw points
            bars.forEach(bar => {
                const x = bar.x + barWidth / 2;
                const y = canvas.height - bar.height;

                ctx.fillStyle = 'rgba(139, 92, 246, 1)';
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.stroke();
            });

            animationFrame = requestAnimationFrame(animate);
        };

        animate();

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            cancelAnimationFrame(animationFrame);
        });
    };

    createDashboardViz();
}

// Button click handlers with visual feedback
const addButtonFeedback = (button) => {
    button.addEventListener('click', function (e) {
        // Create ripple effect
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.5)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s ease-out';
        ripple.style.pointerEvents = 'none';

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
};

// Add ripple effect to all buttons
document.querySelectorAll('button').forEach(addButtonFeedback);

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Parallax effect for hero orbs
window.addEventListener('mousemove', (e) => {
    const orbs = document.querySelectorAll('.gradient-orb');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    orbs.forEach((orb, index) => {
        const speed = (index + 1) * 10;
        const x = (mouseX - 0.5) * speed;
        const y = (mouseY - 0.5) * speed;
        orb.style.transform = `translate(${x}px, ${y}px)`;
    });
});

// Counter animation for stats
const animateCounter = (element, target, duration = 2000) => {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }

        // Format number
        let displayValue = Math.floor(current);
        if (target >= 1000000) {
            displayValue = (current / 1000000).toFixed(1) + 'M+';
        } else if (target >= 1000) {
            displayValue = (current / 1000).toFixed(1) + 'K+';
        } else if (target < 100) {
            displayValue = Math.floor(current) + '%';
        }

        element.textContent = displayValue;
    }, 16);
};

// Observe stats section
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statValues = entry.target.querySelectorAll('.stat-value');
            statValues.forEach((stat, index) => {
                const targets = [50, 15, 70];
                setTimeout(() => {
                    animateCounter(stat, targets[index], 2000);
                }, index * 200);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// Form validation and interaction (for future forms)
const handleFormSubmit = (formId, callback) => {
    const form = document.getElementById(formId);
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (callback) callback(new FormData(form));
        });
    }
};

// Console easter egg
console.log('%c🚀 Workforce AI', 'font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #6366F1, #8B5CF6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;');
console.log('%cInterested in joining our team? Check out our careers page!', 'font-size: 14px; color: #6366F1;');

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page load time:', Math.round(perfData.loadEventEnd - perfData.fetchStart), 'ms');
    });
}

// Accessibility: Focus visible for keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
});

// Add keyboard navigation styles
const a11yStyle = document.createElement('style');
a11yStyle.textContent = `
    .keyboard-nav *:focus {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
    }
`;
document.head.appendChild(a11yStyle);

// ===== AI CHAT MODAL =====
const aiChatButton = document.getElementById('ai-chat-button');
const aiChatModal = document.getElementById('ai-chat-modal');
const aiChatClose = document.getElementById('ai-chat-close');

// Open AI chat modal
const heroStartBtn = document.getElementById('btn-hero-start');
const heroDemoBtn = document.getElementById('btn-hero-demo');
const tryAvatarBtn = document.getElementById('btn-try-avatar');

function openAiModal() {
    aiChatModal?.classList.add('active');
}

function scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (!target) return;

    const offsetTop = target.offsetTop - 80;
    window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
    });
}

heroStartBtn?.addEventListener('click', () => scrollToSection('ai-avatars'));
heroDemoBtn?.addEventListener('click', () => scrollToSection('games'));
tryAvatarBtn?.addEventListener('click', openAiModal);

// Close AI chat modal
// aiChatClose?.addEventListener('click', () => {
//     aiChatModal.classList.remove('active');
// });

// Close modal when clicking outside
aiChatModal?.addEventListener('click', (e) => {
    if (e.target === aiChatModal) {
        aiChatModal.classList.remove('active');
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && aiChatModal.classList.contains('active')) {
        aiChatModal.classList.remove('active');
    }
});
