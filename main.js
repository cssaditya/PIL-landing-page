// main.js
import { SmokeParticleSystem } from './js/smoke-particles.js';

let scene, camera, renderer, controls;
let smokeSystem;

import scrollManager from './js/scrollManager.js';
import { setBoxTrackballControl } from './js/three-animation.js';

class SceneSetup {
    constructor() {
        this.initScene();
        this.setupLights();
        this.setupControls();
        this.setupResize();
        this.animate();
    }

    initScene() {
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.035);

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(renderer.domElement);

        camera.position.set(0, 2, 5);

        // Initialize smoke particle system
        smokeSystem = new SmokeParticleSystem(scene);
    }

    setupLights() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0x444444, 0.5);
        scene.add(ambient);

        // Main spotlight
        const mainLight = new THREE.SpotLight(0xff3366, 2);
        mainLight.position.set(0, 10, 0);
        mainLight.angle = Math.PI / 4;
        mainLight.penumbra = 0.5;
        mainLight.decay = 2;
        mainLight.distance = 50;
        mainLight.castShadow = true;
        scene.add(mainLight);
    }

    setupControls() {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 3;
        controls.maxDistance = 10;
        controls.maxPolarAngle = Math.PI / 2;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
    }

    setupResize() {
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        controls.update();
        
        // Update smoke particles
        if (smokeSystem) {
            smokeSystem.update(Date.now() * 0.001);
        }
        
        renderer.render(scene, camera);
    }
}

// Initialize scene
new SceneSetup();

// --- Perlin Noise Implementation ---
const Perlin = (() => {
    let perm = new Uint8Array(512);
    let grad3 = [
        [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
        [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
        [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
    ];
    function seed(s) {
        if(s > 0 && s < 1) s *= 65536;
        s = Math.floor(s);
        if(s < 256) s |= s << 8;
        for(let i = 0; i < 256; i++) {
            let v;
            if (i & 1) {
                v = perm[i] ^ (s & 255);
            } else {
                v = perm[i] ^ ((s>>8) & 255);
            }
            perm[i] = perm[i + 256] = v;
        }
    }
    function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    function lerp(a, b, t) { return (1-t)*a + t*b; }
    function grad(hash, x, y, z) {
        let h = hash & 15;
        let u = h<8 ? x : y;
        let v = h<4 ? y : h===12||h===14 ? x : z;
        return ((h&1)===0 ? u : -u) + ((h&2)===0 ? v : -v);
    }
    function noise(x, y, z) {
        let X = Math.floor(x) & 255;
        let Y = Math.floor(y) & 255;
        let Z = Math.floor(z) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);
        let u = fade(x);
        let v = fade(y);
        let w = fade(z);
        let A = perm[X]+Y, AA = perm[A]+Z, AB = perm[A+1]+Z;
        let B = perm[X+1]+Y, BA = perm[B]+Z, BB = perm[B+1]+Z;
        return lerp(
            lerp(
                lerp(grad(perm[AA], x, y, z), grad(perm[BA], x-1, y, z), u),
                lerp(grad(perm[AB], x, y-1, z), grad(perm[BB], x-1, y-1, z), u),
                v
            ),
            lerp(
                lerp(grad(perm[AA+1], x, y, z-1), grad(perm[BA+1], x-1, y, z-1), u),
                lerp(grad(perm[AB+1], x, y-1, z-1), grad(perm[BB+1], x-1, y-1, z-1), u),
                v
            ),
            w
        );
    }
    // Seed with a random value for variety
    for(let i=0; i<256; i++) perm[i] = i;
    for(let i=0; i<256; i++) {
        let j = Math.floor(Math.random() * 256);
        let tmp = perm[i];
        perm[i] = perm[j];
        perm[j] = tmp;
        perm[i+256] = perm[i];
    }
    return { noise };
})();

function animateSmoke() {
    const canvas = document.getElementById('smoke-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    // Render at higher resolution for better detail
    const lw = Math.floor(w / 2);
    const lh = Math.floor(h / 2);
    const tempCanvas1 = document.createElement('canvas');
    tempCanvas1.width = lw;
    tempCanvas1.height = lh;
    const tempCtx1 = tempCanvas1.getContext('2d');
    const tempCanvas2 = document.createElement('canvas');
    tempCanvas2.width = lw;
    tempCanvas2.height = lh;
    const tempCtx2 = tempCanvas2.getContext('2d');
    const tempCanvas3 = document.createElement('canvas');
    tempCanvas3.width = lw;
    tempCanvas3.height = lh;
    const tempCtx3 = tempCanvas3.getContext('2d');

    function drawSmoke(t) {
        // Base layer - slow moving, large scale
        const imageData1 = tempCtx1.createImageData(lw, lh);
        for (let y = 0; y < lh; y++) {
            for (let x = 0; x < lw; x++) {
                let nx = x / lw, ny = y / lh;
                // Add elliptical distortion
                let dx = (nx - 0.5) * 2;
                let dy = (ny - 0.5) * 2;
                let dist = Math.sqrt(dx * dx + dy * dy);
                let angle = Math.atan2(dy, dx);
                
                // Create elliptical flow
                let flowX = Math.cos(angle) * dist * 0.5;
                let flowY = Math.sin(angle) * dist * 0.8;
                
                let value = Perlin.noise(
                    nx * 1.5 + flowX + t * 0.05,
                    ny * 1.5 + flowY + t * 0.05,
                    t * 0.1
                );
                value = (value + 1) / 2;
                
                // Add depth with distance
                value *= (1 - dist * 0.5);
                
                imageData1.data[(y * lw + x) * 4 + 0] = 100 + value * 100;  // Red
                imageData1.data[(y * lw + x) * 4 + 1] = value * 20;         // Green
                imageData1.data[(y * lw + x) * 4 + 2] = value * 30;         // Blue
                imageData1.data[(y * lw + x) * 4 + 3] = 80 + value * 70;    // Alpha
            }
        }
        tempCtx1.putImageData(imageData1, 0, 0);

        // Middle layer - medium scale detail
        const imageData2 = tempCtx2.createImageData(lw, lh);
        for (let y = 0; y < lh; y++) {
            for (let x = 0; x < lw; x++) {
                let nx = x / lw, ny = y / lh;
                let dx = (nx - 0.5) * 2;
                let dy = (ny - 0.5) * 2;
                let dist = Math.sqrt(dx * dx + dy * dy);
                let angle = Math.atan2(dy, dx);
                
                let flowX = Math.cos(angle) * dist * 0.3;
                let flowY = Math.sin(angle) * dist * 0.6;
                
                let value = Perlin.noise(
                    nx * 3.0 + flowX + t * 0.08,
                    ny * 3.0 + flowY + t * 0.08,
                    t * 0.15
                );
                value = (value + 1) / 2;
                value *= (1 - dist * 0.3);
                
                imageData2.data[(y * lw + x) * 4 + 0] = 140 + value * 80;   // Red
                imageData2.data[(y * lw + x) * 4 + 1] = value * 15;         // Green
                imageData2.data[(y * lw + x) * 4 + 2] = value * 25;         // Blue
                imageData2.data[(y * lw + x) * 4 + 3] = 60 + value * 40;    // Alpha
            }
        }
        tempCtx2.putImageData(imageData2, 0, 0);

        // Detail layer - small scale wisps
        const imageData3 = tempCtx3.createImageData(lw, lh);
        for (let y = 0; y < lh; y++) {
            for (let x = 0; x < lw; x++) {
                let nx = x / lw, ny = y / lh;
                let dx = (nx - 0.5) * 2;
                let dy = (ny - 0.5) * 2;
                let dist = Math.sqrt(dx * dx + dy * dy);
                let angle = Math.atan2(dy, dx);
                
                let flowX = Math.cos(angle) * dist * 0.2;
                let flowY = Math.sin(angle) * dist * 0.4;
                
                let value = Perlin.noise(
                    nx * 5.0 + flowX + t * 0.12,
                    ny * 5.0 + flowY + t * 0.12,
                    t * 0.2
                );
                value = (value + 1) / 2;
                value *= (1 - dist * 0.2);
                
                imageData3.data[(y * lw + x) * 4 + 0] = 160 + value * 60;   // Red
                imageData3.data[(y * lw + x) * 4 + 1] = value * 10;         // Green
                imageData3.data[(y * lw + x) * 4 + 2] = value * 20;         // Blue
                imageData3.data[(y * lw + x) * 4 + 3] = 40 + value * 30;    // Alpha
            }
        }
        tempCtx3.putImageData(imageData3, 0, 0);

        // Draw and blend layers onto main canvas
        ctx.clearRect(0, 0, w, h);
        ctx.save();
        
        // Base layer
        ctx.filter = 'blur(12px)';
        ctx.globalAlpha = 0.8;
        ctx.drawImage(tempCanvas1, 0, 0, w, h);
        
        // Middle layer
        ctx.filter = 'blur(8px)';
        ctx.globalAlpha = 0.6;
        ctx.drawImage(tempCanvas2, 0, 0, w, h);
        
        // Detail layer
        ctx.filter = 'blur(4px)';
        ctx.globalAlpha = 0.4;
        ctx.drawImage(tempCanvas3, 0, 0, w, h);
        
        ctx.restore();
    }

    function loop(t) {
        drawSmoke((t || 0) / 1000);
        requestAnimationFrame(loop);
    }

    loop();
}

window.addEventListener('DOMContentLoaded', animateSmoke);
window.addEventListener('resize', animateSmoke);

const trackballUI = document.getElementById('trackball-ui');
let isDragging = false;
let lastX = 0, lastY = 0;

// Show/hide the trackball UI based on scroll progress
scrollManager.addListener(progress => {
    if (progress >= 1) {
        trackballUI.classList.add('visible');
    } else {
        trackballUI.classList.remove('visible');
        setBoxTrackballControl(null); // Reset control when UI is hidden
    }
});

// Trackball drag logic
trackballUI.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    setBoxTrackballControl({ dx, dy });
});

document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        document.body.style.userSelect = '';
        setBoxTrackballControl(null); // Optionally stop control on mouse up
    }
});

// Touch support
trackballUI.addEventListener('touchstart', (e) => {
    isDragging = true;
    const touch = e.touches[0];
    lastX = touch.clientX;
    lastY = touch.clientY;
}, { passive: false });

document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const dx = touch.clientX - lastX;
    const dy = touch.clientY - lastY;
    lastX = touch.clientX;
    lastY = touch.clientY;
    setBoxTrackballControl({ dx, dy });
}, { passive: false });

document.addEventListener('touchend', () => {
    if (isDragging) {
        isDragging = false;
        setBoxTrackballControl(null);
    }
}); 