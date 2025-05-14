

let scene, camera, renderer, controls;


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
      
        
        renderer.render(scene, camera);
    }
}

// Initialize scene
new SceneSetup();

// --- Perlin Noise Implementation ---






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