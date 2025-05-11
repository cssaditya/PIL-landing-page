export class SmokeParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particleCount = 2000;
        this.particles = [];
        this.init();
    }

    init() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const sizes = new Float32Array(this.particleCount);
        const opacities = new Float32Array(this.particleCount);

        const texture = new THREE.TextureLoader().load('textures/smoke.png');
        const material = new THREE.PointsMaterial({
            size: 16,
            map: texture,
            transparent: true,
            opacity: 0.18,
            depthWrite: false,
            blending: THREE.NormalBlending
        });

        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            const angle = Math.random() * Math.PI * 2;
            const radius = 1.5 + Math.random() * 2.5;
            positions[i3] = Math.cos(angle) * radius;
            positions[i3 + 1] = Math.random() * 2 - 1;
            positions[i3 + 2] = Math.sin(angle) * radius;
            sizes[i] = 12 + Math.random() * 16;
            opacities[i] = 0.1 + Math.random() * 0.2;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

        this.particleSystem = new THREE.Points(geometry, material);
        this.scene.add(this.particleSystem);
        this.initialPositions = positions.slice();
    }

    update(time) {
        const positions = this.particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            const initialX = this.initialPositions[i3];
            const initialY = this.initialPositions[i3 + 1];
            const initialZ = this.initialPositions[i3 + 2];

            // Gentle swirling and slow rise
            const swirl = 0.3 * Math.sin(time * 0.2 + i);
            positions[i3] = initialX + swirl * Math.cos(time * 0.1 + i);
            positions[i3 + 1] = initialY + (time * 0.05 + i * 0.002) % 4 - 2;
            positions[i3 + 2] = initialZ + swirl * Math.sin(time * 0.1 + i);

            // Reset particle if it goes too high
            if (positions[i3 + 1] > 2) {
                positions[i3 + 1] = -2;
            }
        }
        this.particleSystem.geometry.attributes.position.needsUpdate = true;
    }
} 