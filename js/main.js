/**
 * GENTLERAIN CLONE - Main JavaScript
 * Pixel-perfect animations and interactions
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', initApp);

// Global references
let lenis = null;
let scrollTrigger = null;

/**
 * Initialize the application
 */
function initApp() {
    // Wait for libraries to load
    if (typeof Lenis === 'undefined' || typeof gsap === 'undefined') {
        setTimeout(initApp, 100);
        return;
    }
    
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);
    scrollTrigger = ScrollTrigger;
    
    // Initialize all modules
    initSmoothScroll();
    initNavigation();
    initHumanVideoScroll();
    initHorizontalCards();
    initCardVideos();
    initNewHorizontalScroll(); // NEW
    initHeroWaterEffect(); // Water Ripple
    initRainEffect();      // Rain Drops
    initScrollReveal();
    
    // Mark body as loaded for CSS animations
    requestAnimationFrame(() => {
        document.body.classList.add('loaded');
    });
}

/**
 * Smooth Scroll with Lenis
 */
function initSmoothScroll() {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }
    
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
    });
    
    // Integrate with GSAP
    lenis.on('scroll', ScrollTrigger.update);
    
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    
    gsap.ticker.lagSmoothing(0);
    
    // Handle anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    lenis.scrollTo(target, {
                        offset: -100,
                        duration: 1.5,
                    });
                }
            }
        });
    });
}

/**
 * Navigation scroll effects
 */
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    
    // Scroll-based navbar background
    ScrollTrigger.create({
        start: 'top -80',
        onUpdate: (self) => {
            if (self.progress > 0) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });
    
    // Mobile menu toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            document.body.classList.toggle('menu-open');
        });
    }
}

/**
 * Hero section entrance animations
 */
function initHeroAnimations() {
    const heroTl = gsap.timeline({
        defaults: { duration: 1, ease: 'power3.out' }
    });
    
    // Initial delay for page load
    heroTl.to({}, { duration: 0.3 });
    
    // Wavy text appears
    heroTl.to('.hero-text-wavy', {
        opacity: 0.9,
        y: 0,
        duration: 1.2,
    });
    
    // Lottie animation
    heroTl.to('.hero-lottie-container', {
        opacity: 1,
        y: 0,
        duration: 0.8,
    }, '-=0.8');
    
    // Subtitle
    heroTl.to('.hero-subtitle', {
        opacity: 0.95,
        y: 0,
        duration: 0.8,
    }, '-=0.5');
    
    // CTA buttons
    heroTl.to('.hero-cta-group', {
        opacity: 1,
        y: 0,
        duration: 0.6,
    }, '-=0.4');
    
    // SVG Filter Animation (Liquid Text)
    const turbulence = document.querySelector('#liquid-filter feTurbulence');
    if (turbulence) {
        gsap.to(turbulence, {
            duration: 8,
            attr: { baseFrequency: '0.02 0.01' },
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }

    // Parallax on scroll
    gsap.to('.hero-text-wavy', {
        yPercent: -30,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
        }
    });
    

}

/**
 * Human video scroll-controlled playback
 */
function initHumanVideoScroll() {
    const section = document.querySelector('.human-section');
    const video = document.querySelector('.human-video');
    const texts = document.querySelectorAll('.human-text');
    
    if (!section || !video) return;
    
    // Wait for video metadata to load
    const initScrollVideo = () => {
        const duration = video.duration;
        
        ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5,
            onUpdate: (self) => {
                // Update video playback time based on scroll
                if (duration && !isNaN(duration)) {
                    try {
                        video.currentTime = self.progress * duration;
                    } catch (e) {
                        // Ignore potential seeking errors
                    }
                }
                
                // Update text visibility
                const textIndex = Math.floor(self.progress * texts.length);
                texts.forEach((text, i) => {
                    text.classList.toggle('active', i === textIndex);
                });
            }
        });
    };

    if (video.readyState >= 1) {
        initScrollVideo();
    } else {
        video.addEventListener('loadedmetadata', initScrollVideo);
        // Fallback if metadata takes too long
        setTimeout(initScrollVideo, 1000);
    }
    
    // Fallback if metadata doesn't load
    video.load();
}


/**
 * Horizontal scrolling cards
 */
/**
 * Horizontal scrolling cards
 */
/**
 * Feature Slides - Sticky Stack Effect
 * "Previous card overlaps by the next card"
 */
function initHorizontalCards() {
    const slides = document.querySelectorAll('.feature-slide');
    
    // Create a subtle scale animation for the card being covered
    slides.forEach((slide, i) => {
        if (i === slides.length - 1) return; // Last slide doesn't need to scale down
        
        gsap.to(slide, {
            scale: 0.95, // Subtle push back
            filter: 'blur(10px)', // Modern depth of field effect
            opacity: 0.5, // Fade out smoothly
            ease: 'none',
            scrollTrigger: {
                trigger: slide,
                start: 'top top',
                end: 'bottom top', // As it scrolls out
                scrub: true,
                invalidateOnRefresh: true
            }
        });
        
        // Ensure content inside enters nicely
        gsap.from(slide.children, {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            scrollTrigger: {
                trigger: slide,
                start: 'top 60%',
                toggleActions: 'play none none reverse'
            }
        });
    });
}

/**
 * Card video hover play
 */
function initCardVideos() {
    const cards = document.querySelectorAll('.scroll-card');
    
    cards.forEach(card => {
        const video = card.querySelector('.card-video');
        if (!video) return;
        
        card.addEventListener('mouseenter', () => {
            video.play().catch(() => {});
        });
        
        card.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });
    });
}

/**
 * Scroll reveal animations
 */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    
    revealElements.forEach(el => {
        ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            onEnter: () => el.classList.add('visible'),
            once: true,
        });
    });
    
    // Section-specific reveals
    const sections = ['.concept-section', '.business-section', '.footer'];
    
    sections.forEach(selector => {
        const section = document.querySelector(selector);
        if (!section) return;
        
        gsap.from(section.children, {
            opacity: 0,
            y: 40,
            stagger: 0.1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                once: true,
            }
        });
    });
}

/**
 * Utility: Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Handle window resize
 */
window.addEventListener('resize', debounce(() => {
    ScrollTrigger.refresh();
}, 250));

/**
 * Export for potential module use
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initApp, lenis };
}

/**
 * NEW Horizontal Scroll Section Logic
 * Includes Background Color Transition & 3D Effects
 */
function initNewHorizontalScroll() {
    const section = document.querySelector('.horizontal-section');
    const track = document.querySelector('.horizontal-track');
    const cards = document.querySelectorAll('.horiz-card');
    
    if (!section || !track) return;

    // 1. Background Color Transition
    // Animates from Orange (Vertical Section) to Deep Teal (Horizontal Section)
    gsap.fromTo(section, 
        { backgroundColor: '#e75323' }, // Core orange
        { 
            backgroundColor: '#0f3c4c', // Deep Teal / Dark Blue
            ease: 'none',
            scrollTrigger: {
                trigger: section,
                start: 'top bottom', // Start when section enters viewport
                end: 'center center', // Complete when section is centered
                scrub: true
            }
        }
    );
    
    // Calculate scroll amount
    const getScrollAmount = () => {
        let trackWidth = track.scrollWidth;
        return -(trackWidth - window.innerWidth + 100); 
    };
    
    // 2. Horizontal Scroll Tween
    const scrollTween = gsap.to(track, {
        x: getScrollAmount,
        ease: 'none',
        scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${getScrollAmount() * -1}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            // 3. 3D Skew Effect on Update
            onUpdate: (self) => {
                const velocity = self.getVelocity();
                const skew = velocity / 250; // Use velocity to determine skew amount
                
                // Clamp skew to avoid excessive distortion
                const clampedSkew = Math.max(Math.min(skew, 15), -15);
                
                gsap.to(cards, {
                    skewX: clampedSkew,
                    rotationY: clampedSkew * 0.5, // Slight Y rotation for 3D feel
                    overwrite: 'auto',
                    duration: 0.1,
                    ease: 'power1.out'
                });
            },
            onScrubComplete: () => {
                 // Return to normal when stopped
                 gsap.to(cards, {
                    skewX: 0,
                    rotationY: 0,
                    duration: 0.5,
                    ease: 'elastic.out(1, 0.5)'
                });
            }
        }
    });
}

/**
 * Hero Water Ripple & Rain Effect
 */
/**
 * Hero Water Ripple & Rain Effect
 */
/**
 * Hero Water Ripple & Rain Effect
 */
/**
 * ELITE WEBGL HERO - Fluid Simulation
 * Exact replica of gentlerain.ai water effect
 * NO chromatic aberration - pure fluid displacement only
 */
function initHeroWaterEffect() {
    const container = document.getElementById('webgl-hero');
    if (!container) return;

    // --- Configuration (tuned to match real site) ---
    const CONFIG = {
        TRAIL_LENGTH: 15,           // Mouse trail points
        TRAIL_RADIUS: 0.12,         // Radius of influence
        DISTORTION_STRENGTH: 0.06,  // Melting intensity
        EDGE_THRESHOLD: 0.4,        // When distortion kicks in
        MOUSE_LERP: 0.1,            // Mouse smoothing
        DECAY_RATE: 0.92,           // Trail fade speed
        IDLE_NOISE_SCALE: 4.0,      // Edge simmering frequency
        IDLE_NOISE_STRENGTH: 0.003  // Edge simmering amplitude
    };

    // --- 1. Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- 2. Text Texture Creation ---
    function createTextTexture() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const aspect = window.innerWidth / window.innerHeight;
        canvas.width = 2048;
        canvas.height = 2048 / aspect;
        
        // Position text in upper third of hero
        const fontSize = canvas.width * 0.17;
        const yPos = canvas.height * 0.38;
        
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = `700 ${fontSize}px "Gabarito", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // CORRECT color from forensic analysis: #FFF0B3
        ctx.fillStyle = '#FFF0B3';
        
        ctx.fillText('gentlerain', canvas.width / 2, yPos);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;
        return texture;
    }

    let textTexture = createTextTexture();

    // --- 3. Mouse Trail System ---
    const mouseTrail = [];
    for (let i = 0; i < CONFIG.TRAIL_LENGTH; i++) {
        mouseTrail.push({ x: -10, y: -10, strength: 0 }); // Start offscreen
    }

    // --- 4. Shaders ---
    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `;

    // Fluid displacement shader - NO chromatic aberration
    const fragmentShader = `
        precision highp float;
        
        uniform float uTime;
        uniform sampler2D uTexture;
        uniform vec2 uResolution;
        uniform vec2 uTrail[${CONFIG.TRAIL_LENGTH}];
        uniform float uTrailStrength[${CONFIG.TRAIL_LENGTH}];
        
        varying vec2 vUv;
        
        // Simple noise for idle edge simmering
        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        
        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }
        
        // Fluid field from mouse trail
        float getFluidField(vec2 p) {
            float field = 0.0;
            for (int i = 0; i < ${CONFIG.TRAIL_LENGTH}; i++) {
                float dist = distance(p, uTrail[i]);
                float radius = ${CONFIG.TRAIL_RADIUS.toFixed(3)};
                field += (radius * radius * uTrailStrength[i]) / (dist * dist + 0.0001);
            }
            return field;
        }
        
        // Gradient for distortion direction
        vec2 getFluidGradient(vec2 p) {
            float eps = 0.002;
            float fx = getFluidField(vec2(p.x + eps, p.y)) - getFluidField(vec2(p.x - eps, p.y));
            float fy = getFluidField(vec2(p.x, p.y + eps)) - getFluidField(vec2(p.x, p.y - eps));
            return vec2(fx, fy) / (2.0 * eps);
        }
        
        void main() {
            vec2 uv = vUv;
            vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
            vec2 aspectUv = uv * aspect;
            
            // 1. IDLE EDGE SIMMERING (always active, even without mouse)
            float idleNoise = noise(uv * ${CONFIG.IDLE_NOISE_SCALE.toFixed(1)} + uTime * 0.5);
            idleNoise += noise(uv * ${(CONFIG.IDLE_NOISE_SCALE * 2.0).toFixed(1)} - uTime * 0.3) * 0.5;
            vec2 idleOffset = vec2(
                sin(idleNoise * 6.28) * ${CONFIG.IDLE_NOISE_STRENGTH.toFixed(4)},
                cos(idleNoise * 6.28) * ${CONFIG.IDLE_NOISE_STRENGTH.toFixed(4)}
            );
            
            // 2. MOUSE FLUID DISTORTION
            float field = getFluidField(aspectUv);
            vec2 gradient = getFluidGradient(aspectUv);
            float distortionAmount = smoothstep(0.0, ${CONFIG.EDGE_THRESHOLD.toFixed(2)}, field);
            
            // Apply displacement (melting effect)
            vec2 fluidOffset = vec2(0.0);
            if (length(gradient) > 0.001) {
                fluidOffset = -normalize(gradient) * distortionAmount * ${CONFIG.DISTORTION_STRENGTH.toFixed(3)};
            }
            
            // 3. COMBINE: idle simmering + mouse fluid
            vec2 finalUV = uv + idleOffset + fluidOffset;
            
            // 4. SAMPLE TEXTURE (NO chromatic aberration - single sample)
            vec4 texColor = texture2D(uTexture, finalUV);
            
            gl_FragColor = texColor;
        }
    `;

    // Initialize trail uniforms
    const trailPositions = [];
    const trailStrengths = [];
    
    for (let i = 0; i < CONFIG.TRAIL_LENGTH; i++) {
        trailPositions.push(new THREE.Vector2(-10, -10));
        trailStrengths.push(0);
    }

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            uTime: { value: 0 },
            uTexture: { value: textTexture },
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            uTrail: { value: trailPositions },
            uTrailStrength: { value: trailStrengths }
        },
        transparent: true
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    // --- 5. Mouse Tracking ---
    const mouse = { x: -10, y: -10, targetX: -10, targetY: -10, prevX: -10, prevY: -10 };
    let velocity = 0;
    let isMouseInHero = false;

    container.addEventListener('mouseenter', () => { isMouseInHero = true; });
    container.addEventListener('mouseleave', () => { isMouseInHero = false; });

    window.addEventListener('mousemove', (e) => {
        mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
        material.uniforms.uTexture.value = createTextTexture();
    });

    const clock = new THREE.Clock();
    let frameCount = 0;

    function animate() {
        const time = clock.getElapsedTime();
        material.uniforms.uTime.value = time;

        // Smooth mouse follow
        mouse.x += (mouse.targetX - mouse.x) * CONFIG.MOUSE_LERP;
        mouse.y += (mouse.targetY - mouse.y) * CONFIG.MOUSE_LERP;

        // Calculate velocity
        const dx = mouse.x - mouse.prevX;
        const dy = mouse.y - mouse.prevY;
        const currentVelocity = Math.sqrt(dx * dx + dy * dy);
        velocity = velocity * 0.85 + currentVelocity * 15;
        
        mouse.prevX = mouse.x;
        mouse.prevY = mouse.y;

        // Update mouse trail
        if (frameCount % 2 === 0) {
            for (let i = CONFIG.TRAIL_LENGTH - 1; i > 0; i--) {
                mouseTrail[i].x = mouseTrail[i - 1].x;
                mouseTrail[i].y = mouseTrail[i - 1].y;
                mouseTrail[i].strength = mouseTrail[i - 1].strength * CONFIG.DECAY_RATE;
            }
            
            const aspect = window.innerWidth / window.innerHeight;
            mouseTrail[0].x = (mouse.x * 0.5 + 0.5) * aspect;
            mouseTrail[0].y = mouse.y * 0.5 + 0.5;
            mouseTrail[0].strength = isMouseInHero ? Math.min(velocity * 2.5, 4.0) : 0;
        }

        // Update uniforms
        for (let i = 0; i < CONFIG.TRAIL_LENGTH; i++) {
            trailPositions[i].set(mouseTrail[i].x, mouseTrail[i].y);
            trailStrengths[i] = mouseTrail[i].strength;
        }
        
        material.uniforms.uTrail.value = trailPositions;
        material.uniforms.uTrailStrength.value = trailStrengths;

        renderer.render(scene, camera);
        frameCount++;
        requestAnimationFrame(animate);
    }

    animate();
}

function initRainEffect() {
    const container = document.querySelector('.rain-container');
    if (!container) return;
    
    const createDrop = () => {
        const drop = document.createElement('div');
        drop.className = 'rain-drop';
        container.appendChild(drop);
        
        const startLeft = Math.random() * window.innerWidth;
        const duration = gsap.utils.random(0.8, 1.5);
        const height = gsap.utils.random(20, 50);
        
        gsap.set(drop, {
            left: startLeft,
            height: height,
            opacity: gsap.utils.random(0.3, 0.7)
        });
        
        gsap.to(drop, {
            y: window.innerHeight + 100,
            duration: duration,
            ease: 'none',
            onComplete: () => {
                drop.remove();
            }
        });
    };
    
    // Spawn drops frequently
    setInterval(createDrop, 100); // 10 drops per second
}
