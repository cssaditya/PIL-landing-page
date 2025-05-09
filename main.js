// main.js
let scene, camera, renderer, controls;

class SceneSetup {
    constructor() {
        this.initScene();
        this.setupLights();
        this.createRoom();
        this.createMysteryBox();
        this.createGamingSetup();
        this.setupControls();
        this.setupResize();
        this.setupUI();
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

        // Neon lights
        const neonLight1 = new THREE.PointLight(0xff3366, 3, 10);
        neonLight1.position.set(0, 3, -1);
        scene.add(neonLight1);

        const neonLight2 = new THREE.PointLight(0xff3366, 5, 8);
        neonLight2.position.set(-3, 1, 0);
        scene.add(neonLight2);

        // RGB keyboard light
        const keyboardLight = new THREE.PointLight(0x00ff00, 2, 5);
        keyboardLight.position.set(3, 0.7, 0);
        scene.add(keyboardLight);

        // Animate RGB light
        gsap.to(keyboardLight.color, {
            duration: 3,
            r: 1,
            g: 0,
            b: 0,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }

    createRoom() {
        // Floor with grid
        const floorGeometry = new THREE.PlaneGeometry(40, 40, 40, 40);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            metalness: 0.5,
            roughness: 0.8,
            wireframe: true
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -0.5;
        scene.add(floor);

        // Solid floor beneath
        const solidFloor = new THREE.Mesh(
            new THREE.PlaneGeometry(40, 40),
            new THREE.MeshStandardMaterial({
                color: 0x0a0a0a,
                metalness: 0.3,
                roughness: 0.8
            })
        );
        solidFloor.rotation.x = -Math.PI / 2;
        solidFloor.position.y = -0.51;
        solidFloor.receiveShadow = true;
        scene.add(solidFloor);

        // Back wall
        const wallGeometry = new THREE.PlaneGeometry(40, 20);
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            metalness: 0.2,
            roughness: 0.8
        });
        const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
        backWall.position.z = -10;
        backWall.position.y = 9;
        backWall.receiveShadow = true;
        scene.add(backWall);
    }

    createMysteryBox() {
        // Platform with glowing ring
        const ringGeometry = new THREE.TorusGeometry(0.8, 0.05, 16, 100);
        const ringMaterial = new THREE.MeshStandardMaterial({
            color: 0xff3366,
            emissive: 0xff3366,
            emissiveIntensity: 1,
            metalness: 0.7,
            roughness: 0.3
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.set(-3, 0, 0);
        ring.rotation.x = Math.PI / 2;
        scene.add(ring);

        // Pedestal
        const pedestal = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.7, 0.5, 32),
            new THREE.MeshStandardMaterial({ 
                color: 0x222222,
                metalness: 0.5,
                roughness: 0.5
            })
        );
        pedestal.position.set(-3, 0.5, 0);
        pedestal.castShadow = true;
        pedestal.receiveShadow = true;
        scene.add(pedestal);

        // Box
        const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
        const boxMaterial = new THREE.MeshStandardMaterial({
            color: 0xcc1133,
            emissive: 0xff3366,
            emissiveIntensity: 1,
            metalness: 0.5,
            roughness: 0.4
        });

        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.position.set(-3, 1.25, 0);
        box.castShadow = true;
        scene.add(box);

        // Box animations
        gsap.to(box.rotation, {
            duration: 8,
            y: Math.PI * 2,
            repeat: -1,
            ease: 'none'
        });

        gsap.to(box.position, {
            duration: 2,
            y: 1.35,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });

        gsap.to(boxMaterial, {
            duration: 2,
            emissiveIntensity: 2,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut'
        });

        // Glow effect
        const glowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff3366,
            transparent: true,
            opacity: 0.2
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(-3, 1.25, 0);
        scene.add(glow);

        gsap.to(glowMaterial, {
            duration: 2,
            opacity: 0.4,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });

        // Ring animation
        gsap.to(ring.rotation, {
            duration: 8,
            z: Math.PI * 2,
            repeat: -1,
            ease: 'none'
        });

        gsap.to(ringMaterial, {
            duration: 1.5,
            emissiveIntensity: 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }

    createGamingSetup() {
        // Desk
        const desk = new THREE.Mesh(
            new THREE.BoxGeometry(4, 0.2, 2),
            new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.3 })
        );
        desk.position.set(3, 0.5, 0);
        desk.castShadow = true;
        desk.receiveShadow = true;
        scene.add(desk);

        // Monitor
        const monitor = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 1, 0.1),
            new THREE.MeshStandardMaterial({ 
                color: 0x000000,
                emissive: 0x00ff00,
                emissiveIntensity: 0.5
            })
        );
        monitor.position.set(3, 1.3, 0);
        monitor.castShadow = true;
        scene.add(monitor);

        // Monitor stand
        const stand = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.3, 0.2),
            new THREE.MeshStandardMaterial({ color: 0x333333 })
        );
        stand.position.set(3, 0.8, 0);
        stand.castShadow = true;
        scene.add(stand);

        // Keyboard with RGB effect
        const keyboard = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.1, 0.4),
            new THREE.MeshStandardMaterial({ 
                color: 0x111111,
                emissive: 0x00ff00,
                emissiveIntensity: 0.2
            })
        );
        keyboard.position.set(3, 0.7, 0);
        keyboard.castShadow = true;
        scene.add(keyboard);

        // Mouse with RGB
        const mouse = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.1, 0.3),
            new THREE.MeshStandardMaterial({ 
                color: 0x111111,
                emissive: 0xff0000,
                emissiveIntensity: 0.2
            })
        );
        mouse.position.set(3.8, 0.7, 0);
        mouse.castShadow = true;
        scene.add(mouse);

        // Headset
        const headset = new THREE.Mesh(
            new THREE.TorusGeometry(0.2, 0.05, 16, 32),
            new THREE.MeshStandardMaterial({ 
                color: 0x222222,
                emissive: 0xff3366,
                emissiveIntensity: 0.2
            })
        );
        headset.position.set(4, 1.3, 0);
        headset.rotation.x = Math.PI / 2;
        headset.castShadow = true;
        scene.add(headset);
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

        // Disable controls initially
        controls.enabled = false;
    }

    setupResize() {
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    setupUI() {
        // Show loading text
        const loading = document.querySelector('.loading');
        loading.classList.add('visible');

        // Animate letters
        const letters = document.querySelectorAll('.letter');
        const subtitle = document.querySelector('.subtitle');
        const info = document.querySelector('.info');
        const cta = document.querySelector('.cta-button');

        // Initial camera position
        camera.position.set(0, 2, 8);

        // Timeline for intro animation
        const tl = gsap.timeline({ delay: 1 });

        // Fade out loading
        tl.to(loading, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => loading.style.display = 'none'
        });

        // Animate letters
        letters.forEach((letter, index) => {
            tl.to(letter, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out'
            }, 0.2 + index * 0.1);
        });

        // Animate subtitle
        tl.to(subtitle, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out'
        }, 0.5);

        // Animate info section
        tl.to(info, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out'
        }, 0.8);

        // Animate CTA button
        tl.to(cta, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out'
        }, 1);

        // Camera movement
        tl.to(camera.position, {
            x: 0,
            y: 2,
            z: 5,
            duration: 2,
            ease: 'power2.inOut',
            onComplete: () => {
                controls.enabled = true;
            }
        }, 0.5);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        controls.update();
        
        // Subtle camera movement when controls are disabled
        if (!controls.enabled) {
            camera.position.x = Math.sin(Date.now() * 0.0005) * 0.5;
            camera.position.z = 5 + Math.cos(Date.now() * 0.0005) * 0.2;
        }
        
        renderer.render(scene, camera);
    }
}

// Initialize scene
new SceneSetup(); 