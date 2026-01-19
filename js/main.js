/**
 * GENTLERAIN CLONE - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', initApp);

let lenis = null;
let scrollTrigger = null;

function initApp() {
    if (typeof Lenis === 'undefined' || typeof gsap === 'undefined') {
        setTimeout(initApp, 100);
        return;
    }
    
    gsap.registerPlugin(ScrollTrigger);
    scrollTrigger = ScrollTrigger;
    
    initSmoothScroll();
    initNavigation();
    initHumanVideoScroll();
    initHorizontalCards();
    initCardVideos();
    initNewHorizontalScroll();
    initHeroWaterEffect();
    initRainEffect();
    initScrollReveal();
    
    requestAnimationFrame(() => {
        document.body.classList.add('loaded');
    });
}

function initSmoothScroll() {
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
    
    lenis.on('scroll', ScrollTrigger.update);
    
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    
    gsap.ticker.lagSmoothing(0);
    
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

function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    
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
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            document.body.classList.toggle('menu-open');
        });
    }
}

function initHeroAnimations() {
    const heroTl = gsap.timeline({
        defaults: { duration: 1, ease: 'power3.out' }
    });
    
    heroTl.to({}, { duration: 0.3 });
    
    heroTl.to('.hero-text-wavy', {
        opacity: 0.9,
        y: 0,
        duration: 1.2,
    });
    
    heroTl.to('.hero-lottie-container', {
        opacity: 1,
        y: 0,
        duration: 0.8,
    }, '-=0.8');
    
    heroTl.to('.hero-subtitle', {
        opacity: 0.95,
        y: 0,
        duration: 0.8,
    }, '-=0.5');
    
    heroTl.to('.hero-cta-group', {
        opacity: 1,
        y: 0,
        duration: 0.6,
    }, '-=0.4');
    
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

let humanVideoInitialized = false;

function initHumanVideoScroll() {
    const section = document.querySelector('.human-section');
    const video = document.querySelector('.human-video');
    const texts = document.querySelectorAll('.human-text');
    
    if (!section || !video) return;
    if (humanVideoInitialized) return;
    
    const isMobile = window.innerWidth <= 768;
    
    ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === section) {
            st.kill();
        }
    });
    
    if (isMobile) {
        humanVideoInitialized = true;
        texts.forEach((text, i) => {
            gsap.set(text, { opacity: i === 0 ? 1 : 0, y: 0 });
        });
        video.play().catch(() => {});
        return;
    }
    
    video.preload = 'auto';
    video.load();
    
    const initScrollVideo = () => {
        const duration = video.duration;
        
        if (!duration || isNaN(duration)) {
            setTimeout(initScrollVideo, 500);
            return;
        }
        
        humanVideoInitialized = true;
        
        ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.3,
            onUpdate: (self) => {
                const targetTime = self.progress * duration;
                
                if (Math.abs(video.currentTime - targetTime) > 0.05) {
                    try {
                        video.currentTime = targetTime;
                    } catch (e) {}
                }
                
                if (texts.length > 0) {
                    const textIndex = Math.min(
                        Math.floor(self.progress * texts.length),
                        texts.length - 1
                    );
                    texts.forEach((text, i) => {
                        if (i === textIndex) {
                            gsap.to(text, { opacity: 1, y: 0, duration: 0.3 });
                        } else {
                            gsap.to(text, { opacity: 0, y: 20, duration: 0.3 });
                        }
                    });
                }
            }
        });
        
        texts.forEach((text, i) => {
            gsap.set(text, { opacity: i === 0 ? 1 : 0, y: i === 0 ? 0 : 20 });
        });
    };

    if (video.readyState >= 1) {
        initScrollVideo();
    } else {
        video.addEventListener('loadedmetadata', initScrollVideo, { once: true });
        setTimeout(() => {
            if (!humanVideoInitialized) {
                initScrollVideo();
            }
        }, 2000);
    }
}

function initHorizontalCards() {
    const slides = document.querySelectorAll('.feature-slide');
    const cardsSection = document.querySelector('.cards-section');
    
    if (!slides.length || !cardsSection) return;
    
    const isMobile = window.innerWidth <= 768;
    
    ScrollTrigger.getAll().forEach(st => {
        if (st.vars.id && (st.vars.id.startsWith('pin-slide') || st.vars.id.startsWith('fade-slide'))) {
            st.kill();
        }
    });
    
    if (isMobile) {
        slides.forEach((slide, i) => {
            gsap.set(slide, { zIndex: i + 1 });
            
            gsap.from(slide, {
                opacity: 0,
                y: 50,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: slide,
                    start: 'top 85%',
                    end: 'top 50%',
                    toggleActions: 'play none none reverse',
                    id: `mobile-reveal-${i}`
                }
            });
            
            gsap.from(slide.querySelectorAll('.slide-text, .slide-visual'), {
                y: 40,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: slide,
                    start: 'top 80%',
                    end: 'top 40%',
                    toggleActions: 'play none none reverse'
                }
            });
        });
    } else {
        const cardScrollHeight = window.innerHeight;
        
        slides.forEach((slide, i) => {
            gsap.set(slide, { 
                zIndex: i + 1,
                position: 'relative',
                top: 0
            });
            
            ScrollTrigger.create({
                trigger: slide,
                start: 'top top',
                end: () => `+=${cardScrollHeight}`,
                pin: true,
                pinSpacing: false,
                scrub: 0.5,
                invalidateOnRefresh: true,
                anticipatePin: 1,
                id: `pin-slide-${i}`
            });
            
            if (i < slides.length - 1) {
                gsap.to(slide, {
                    scale: 0.9,
                    filter: 'blur(10px)',
                    opacity: 0.3,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: slide,
                        start: 'top top',
                        end: () => `+=${cardScrollHeight}`,
                        scrub: true,
                        invalidateOnRefresh: true,
                        id: `fade-slide-${i}`
                    }
                });
            }
            
            gsap.from(slide.querySelectorAll('.slide-text, .slide-visual'), {
                y: 60,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: slide,
                    start: 'top 85%',
                    end: 'top 50%',
                    toggleActions: 'play none none reverse'
                }
            });
        });
    }
    
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const wasMobile = isMobile;
            const nowMobile = window.innerWidth <= 768;
            if (wasMobile !== nowMobile) {
                initHorizontalCards();
            } else {
                ScrollTrigger.refresh();
            }
        }, 200);
    });
}

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

window.addEventListener('resize', debounce(() => {
    ScrollTrigger.refresh();
}, 250));

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initApp, lenis };
}

function initNewHorizontalScroll() {
    const section = document.querySelector('.horizontal-section');
    const track = document.querySelector('.horizontal-track');
    const cards = document.querySelectorAll('.horiz-card');
    
    if (!section || !track) return;
    
    if (window.innerWidth <= 768) {
        ScrollTrigger.getAll().forEach(st => {
            if (st.trigger === section) {
                st.kill();
            }
        });
        gsap.set(track, { x: 0, clearProps: 'transform' });
        gsap.set(cards, { skewX: 0, rotationY: 0, clearProps: 'transform' });
        return;
    }

    gsap.fromTo(section, 
        { backgroundColor: '#e75323' },
        { 
            backgroundColor: '#0f3c4c',
            ease: 'none',
            scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'center center',
                scrub: true
            }
        }
    );
    
    const getScrollAmount = () => {
        let trackWidth = track.scrollWidth;
        return -(trackWidth - window.innerWidth + 100); 
    };
    
    gsap.to(track, {
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
            onUpdate: (self) => {
                const velocity = self.getVelocity();
                const skew = velocity / 250;
                const clampedSkew = Math.max(Math.min(skew, 15), -15);
                
                gsap.to(cards, {
                    skewX: clampedSkew,
                    rotationY: clampedSkew * 0.5,
                    overwrite: 'auto',
                    duration: 0.1,
                    ease: 'power1.out'
                });
            },
            onScrubComplete: () => {
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

function initHeroWaterEffect() {
    const container = document.getElementById('webgl-hero');
    if (!container) return;

    const CONFIG = {
        TRAIL_LENGTH: 15,
        TRAIL_RADIUS: 0.12,
        DISTORTION_STRENGTH: 0.06,
        EDGE_THRESHOLD: 0.4,
        MOUSE_LERP: 0.1,
        DECAY_RATE: 0.92,
        IDLE_NOISE_SCALE: 4.0,
        IDLE_NOISE_STRENGTH: 0.003
    };

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    function createTextTexture() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const aspect = window.innerWidth / window.innerHeight;
        canvas.width = 2048;
        canvas.height = 2048 / aspect;
        
        const fontSize = canvas.width * 0.17;
        const yPos = canvas.height * 0.38;
        
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = `700 ${fontSize}px "Gabarito", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFF0B3';
        
        ctx.fillText('gentlerain', canvas.width / 2, yPos);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;
        return texture;
    }

    let textTexture = createTextTexture();

    const mouseTrail = [];
    for (let i = 0; i < CONFIG.TRAIL_LENGTH; i++) {
        mouseTrail.push({ x: -10, y: -10, strength: 0 });
    }

    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        precision highp float;
        
        uniform float uTime;
        uniform sampler2D uTexture;
        uniform vec2 uResolution;
        uniform vec2 uTrail[${CONFIG.TRAIL_LENGTH}];
        uniform float uTrailStrength[${CONFIG.TRAIL_LENGTH}];
        
        varying vec2 vUv;
        
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
        
        float getFluidField(vec2 p) {
            float field = 0.0;
            for (int i = 0; i < ${CONFIG.TRAIL_LENGTH}; i++) {
                float dist = distance(p, uTrail[i]);
                float radius = ${CONFIG.TRAIL_RADIUS.toFixed(3)};
                field += (radius * radius * uTrailStrength[i]) / (dist * dist + 0.0001);
            }
            return field;
        }
        
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
            
            float idleNoise = noise(uv * ${CONFIG.IDLE_NOISE_SCALE.toFixed(1)} + uTime * 0.5);
            idleNoise += noise(uv * ${(CONFIG.IDLE_NOISE_SCALE * 2.0).toFixed(1)} - uTime * 0.3) * 0.5;
            vec2 idleOffset = vec2(
                sin(idleNoise * 6.28) * ${CONFIG.IDLE_NOISE_STRENGTH.toFixed(4)},
                cos(idleNoise * 6.28) * ${CONFIG.IDLE_NOISE_STRENGTH.toFixed(4)}
            );
            
            float field = getFluidField(aspectUv);
            vec2 gradient = getFluidGradient(aspectUv);
            float distortionAmount = smoothstep(0.0, ${CONFIG.EDGE_THRESHOLD.toFixed(2)}, field);
            
            vec2 fluidOffset = vec2(0.0);
            if (length(gradient) > 0.001) {
                fluidOffset = -normalize(gradient) * distortionAmount * ${CONFIG.DISTORTION_STRENGTH.toFixed(3)};
            }
            
            vec2 finalUV = uv + idleOffset + fluidOffset;
            vec4 texColor = texture2D(uTexture, finalUV);
            
            gl_FragColor = texColor;
        }
    `;

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

        mouse.x += (mouse.targetX - mouse.x) * CONFIG.MOUSE_LERP;
        mouse.y += (mouse.targetY - mouse.y) * CONFIG.MOUSE_LERP;

        const dx = mouse.x - mouse.prevX;
        const dy = mouse.y - mouse.prevY;
        const currentVelocity = Math.sqrt(dx * dx + dy * dy);
        velocity = velocity * 0.85 + currentVelocity * 15;
        
        mouse.prevX = mouse.x;
        mouse.prevY = mouse.y;

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
    
    setInterval(createDrop, 100);
}
