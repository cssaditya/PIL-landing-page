// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize animations for UI elements
    initializeUIAnimations();
    
    // Initialize Three.js scene
    initializeThreeJS();
});

// Global variables for scroll animation
let currentSection = 0;
const totalSections = 5; // Total number of scroll sections
let scrollProgress = 0;
let targetRotationY = 0;
let targetRotationX = 0;
let targetZoom = 5;
let mainMesh; // Make mainMesh global

// Handle UI animations
function initializeUIAnimations() {
    setTimeout(() => {
        document.querySelector('.title').classList.add('visible');
        document.querySelector('.subtitle').classList.add('visible');
        document.querySelector('.nav').classList.add('visible');
    }, 500);
}

// Initialize Three.js scene and components
function initializeThreeJS() {
    // Get container dimensions
    const container = document.getElementById('canvas-container');
    const canvasWidth = container.clientWidth;
    const canvasHeight = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // Let CSS show through

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
        75,
        canvasWidth / canvasHeight,
        0.1,
        1000
    );
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create main geometric mesh
    mainMesh = createMainMesh();
    scene.add(mainMesh);

    // Add lighting
    setupLighting(scene);

    // Setup mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    setupMouseInteraction(mouseX, mouseY);

    // Setup scroll interaction
    setupScrollInteraction();

    // Start animation loop
    const clock = new THREE.Clock();
    animate(clock, scene, camera, renderer, mainMesh, mouseX, mouseY);

    // Handle window resizing
    setupResizeHandler(container, camera, renderer);
}

// Create main geometric mesh
function createMainMesh() {
    const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    
    // Create materials for each side with different colors
    const materials = [
        new THREE.MeshStandardMaterial({ color: 0xff0064, metalness: 0.7, roughness: 0.2, emissive: 0xff0064, emissiveIntensity: 0.2, transparent: true, opacity: 0.8, wireframe: true }), // Right
        new THREE.MeshStandardMaterial({ color: 0x0064ff, metalness: 0.7, roughness: 0.2, emissive: 0x0064ff, emissiveIntensity: 0.2, transparent: true, opacity: 0.8, wireframe: true }), // Left
        new THREE.MeshStandardMaterial({ color: 0x64ff00, metalness: 0.7, roughness: 0.2, emissive: 0x64ff00, emissiveIntensity: 0.2, transparent: true, opacity: 0.8, wireframe: true }), // Top
        new THREE.MeshStandardMaterial({ color: 0xffff00, metalness: 0.7, roughness: 0.2, emissive: 0xffff00, emissiveIntensity: 0.2, transparent: true, opacity: 0.8, wireframe: true }), // Bottom
        new THREE.MeshStandardMaterial({ color: 0xff00ff, metalness: 0.7, roughness: 0.2, emissive: 0xff00ff, emissiveIntensity: 0.2, transparent: true, opacity: 0.8, wireframe: true }), // Front
        new THREE.MeshStandardMaterial({ color: 0x00ffff, metalness: 0.7, roughness: 0.2, emissive: 0x00ffff, emissiveIntensity: 0.2, transparent: true, opacity: 0.8, wireframe: true }), // Back
    ];

    const mesh = new THREE.Mesh(geometry, materials);
    mesh.userData.targetRotation = new THREE.Vector3(0, 0, 0);
    return mesh;
}

// Setup lighting
function setupLighting(scene) {
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xff0064, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xff0064, 1, 10);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);
}

// Setup mouse interaction
function setupMouseInteraction(mouseX, mouseY) {
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Add subtle glitch effect to title on mouse move
        if (Math.random() > 0.9) {
            document.querySelector('.title').style.transform = 
                `translate(${Math.random() * 2 - 1}px, ${Math.random() * 2 - 1}px)`;
            setTimeout(() => {
                document.querySelector('.title').style.transform = 'translate(0)';
            }, 100);
        }
    });
}

// Setup scroll interaction
function setupScrollInteraction() {
    // Create a tall scrollable container
    const scrollContainer = document.createElement('div');
    scrollContainer.style.height = `${100 * totalSections}vh`;
    scrollContainer.style.position = 'relative';
    scrollContainer.style.width = '100%';
    scrollContainer.style.zIndex = '-2';
    document.body.appendChild(scrollContainer);

    // Create scroll sections for each content section
    for (let i = 0; i < totalSections; i++) {
        const section = document.createElement('div');
        section.style.height = '100vh';
        section.style.width = '100%';
        scrollContainer.appendChild(section);
    }

    // Add scroll event listener
    window.addEventListener('scroll', () => {
        // Calculate scroll progress (0 to 1)
        scrollProgress = window.scrollY / (scrollContainer.offsetHeight - window.innerHeight);
        
        // Update current section
        const newSection = Math.floor(scrollProgress * totalSections);
        
        if (newSection !== currentSection) {
            // Update section visibility
            updateSectionVisibility(newSection);
            // Update progress indicator
            updateProgressIndicator(newSection);
            currentSection = newSection;
        }
        
        // Calculate rotation and zoom based on scroll position
        updateBoxTransformation();
    });

    // Initialize first section
    updateSectionVisibility(0);
    updateProgressIndicator(0);
}

// Update section visibility
function updateSectionVisibility(sectionIndex) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show current section
    const currentSection = document.querySelector(`#section-${sectionIndex + 1}`);
    if (currentSection) {
        currentSection.classList.add('active');
    }
}

// Update progress indicator
function updateProgressIndicator(sectionIndex) {
    // Update progress dots
    document.querySelectorAll('.progress-dot').forEach((dot, index) => {
        if (index <= sectionIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Update box transformation based on scroll position
function updateBoxTransformation() {
    const sectionProgress = (scrollProgress * totalSections) % 1;
    
    switch(currentSection) {
        case 0: // Initial state
            targetRotationY = 0;
            targetRotationX = 0;
            targetZoom = 5;
            break;
        case 1: // Right turn
            targetRotationY = Math.PI * 0.5;
            targetZoom = 3;
            break;
        case 2: // Left turn
            targetRotationY = -Math.PI * 0.5;
            targetZoom = 3;
            break;
        case 3: // Top view
            targetRotationX = -Math.PI * 0.5;
            targetRotationY = 0;
            targetZoom = 3;
            break;
        case 4: // Bottom view
            targetRotationX = Math.PI * 0.5;
            targetRotationY = 0;
            targetZoom = 3;
            break;
    }

    // Add smooth transitions between sections
    const smoothProgress = sectionProgress * Math.PI * 2;
    mainMesh.position.z = Math.sin(smoothProgress) * 0.5;
}

// Animation loop
function animate(clock, scene, camera, renderer, mainMesh, mouseX, mouseY) {
    requestAnimationFrame(() => animate(clock, scene, camera, renderer, mainMesh, mouseX, mouseY));

    const elapsedTime = clock.getElapsedTime();

    // Smoothly interpolate box rotation
    mainMesh.rotation.x += (targetRotationX - mainMesh.rotation.x) * 0.05;
    mainMesh.rotation.y += (targetRotationY - mainMesh.rotation.y) * 0.05;

    // Add gentle floating motion
    mainMesh.position.y = Math.sin(elapsedTime * 0.5) * 0.1;

    // Smoothly interpolate camera position
    camera.position.z += (targetZoom - camera.position.z) * 0.05;
    camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.03;
    camera.position.y += (mouseY * 1.5 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

// Handle window resizing
function setupResizeHandler(container, camera, renderer) {
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;

        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(newWidth, newHeight);
    });
} 