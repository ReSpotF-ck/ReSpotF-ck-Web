// Shared JavaScript functionality for all pages

// Beta Banner Handler
function setupBetaBanner() {
    const betaBanner = document.getElementById('betaBanner');
    const betaBannerClose = document.getElementById('betaBannerClose');
    const betaBannerDismissed = localStorage.getItem('betaBannerDismissed');
    
    if (betaBannerDismissed === 'true' && betaBanner) {
        betaBanner.classList.add('hidden');
    }
    
    if (betaBannerClose) {
        betaBannerClose.addEventListener('click', () => {
            betaBanner.classList.add('hidden');
            localStorage.setItem('betaBannerDismissed', 'true');
        });
    }
}

// Security Modal Handler
function setupSecurityModal() {
    const securityModal = document.getElementById('securityModal');
    const securityAccepted = localStorage.getItem('securityAccepted');
    
    if (!securityAccepted && securityModal) {
        securityModal.style.display = 'flex';
        
        const securityAcceptBtn = document.getElementById('securityAcceptBtn');
        const securityCloseBtn = document.getElementById('securityCloseBtn');
        
        if (securityAcceptBtn) {
            // Remove any existing listeners first
            const newBtn = securityAcceptBtn.cloneNode(true);
            securityAcceptBtn.parentNode.replaceChild(newBtn, securityAcceptBtn);
            
            newBtn.addEventListener('click', function(e) {
                console.log('Security button clicked!');
                localStorage.setItem('securityAccepted', 'true');
                securityModal.style.display = 'none';
            });
        }
        
        if (securityCloseBtn) {
            securityCloseBtn.addEventListener('click', function(e) {
                securityModal.style.display = 'none';
            });
        }
    } else if (securityModal) {
        securityModal.style.display = 'none';
    }
}

// DMCA Modal Handler
function setupDMCAModal() {
    const dmcaFooterBtn = document.getElementById('dmcaFooterBtn');
    const dmcaModal = document.getElementById('dmcaModal');
    const dmcaCloseBtn = document.getElementById('dmcaCloseBtn');
    const dmcaAcknowledgeBtn = document.getElementById('dmcaAcknowledgeBtn');
    
    if (dmcaFooterBtn && dmcaModal) {
        dmcaFooterBtn.addEventListener('click', () => {
            dmcaModal.classList.add('active');
        });
        
        if (dmcaCloseBtn) {
            dmcaCloseBtn.addEventListener('click', () => {
                dmcaModal.classList.remove('active');
            });
        }
        
        if (dmcaAcknowledgeBtn) {
            dmcaAcknowledgeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                localStorage.setItem('dmcaAcknowledged', 'true');
                dmcaModal.classList.remove('active');
            });
        }
        
        dmcaModal.addEventListener('click', (e) => {
            if (e.target === dmcaModal) {
                dmcaModal.classList.remove('active');
            }
        });
    }
}

// Initialize shared components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setupBetaBanner();
    setupSecurityModal();
    setupDMCAModal();
    
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed: ', error);
                });
        });
    }
    
    // Add particle styles and initialize particles if needed
    if (document.getElementById('particles')) {
        addParticleStyles();
        createParticles();
    }
});

// Create floating particles effect
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    // Reduce particle count for better performance
    const particleCount = window.innerWidth < 768 ? 20 : 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        container.appendChild(particle);
    }
}

// Add particle styles if not present
function addParticleStyles() {
    if (document.getElementById('particle-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'particle-styles';
    style.textContent = `
        .particles {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
            z-index: 0;
        }
        
        .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: var(--primary);
            border-radius: 50%;
            opacity: 0.3;
            animation: float 15s infinite;
        }
        
        @keyframes float {
            0%, 100% {
                transform: translateY(100vh) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 0.3;
            }
            90% {
                opacity: 0.3;
            }
            100% {
                transform: translateY(-100vh) rotate(720deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}
