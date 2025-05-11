import scrollManager from './scrollManager.js';

let bgRenderer, bgScene, bgCamera, bgMesh, bgUniforms;

function initAnimatedBackground() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Renderer for background
    bgRenderer = new THREE.WebGLRenderer({ alpha: true });
    bgRenderer.setSize(width, height);
    bgRenderer.setClearColor(0x000000, 1);
    bgRenderer.domElement.style.position = 'fixed';
    bgRenderer.domElement.style.top = '0';
    bgRenderer.domElement.style.left = '0';
    bgRenderer.domElement.style.width = '100vw';
    bgRenderer.domElement.style.height = '100vh';
    bgRenderer.domElement.style.zIndex = '0';
    document.body.prepend(bgRenderer.domElement);

    // Scene and camera
    bgScene = new THREE.Scene();
    bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Shader uniforms
    bgUniforms = {
        u_time: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2(width, height) },
        u_scroll: { value: 0.0 }
    };

    // Shader material
    const bgMaterial = new THREE.ShaderMaterial({
        uniforms: bgUniforms,
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            uniform float u_time;
            uniform float u_scroll;
            uniform vec2 u_resolution;

            float hash(vec2 p) {
                p = 50.0 * fract(p * 0.3183099 + vec2(0.71, 0.113));
                return -1.0 + 2.0 * fract(p.x * p.y * (p.x + p.y));
            }

            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(
                    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
                    u.y
                );
            }

            void main() {
                vec2 uv = vUv * 2.0 - 1.0;
                uv.x *= u_resolution.x / u_resolution.y;
                
                float scrollOffset = u_scroll * 2.0;
                
                // Create morphing effect using time-based noise
                float time = u_time * 0.5;
                vec2 morphOffset = vec2(
                    noise(uv * 2.0 + time),
                    noise(uv * 2.0 + time + 1.0)
                ) * 0.1;
                
                // Apply morphing to UV coordinates
                vec2 morphedUV = uv + morphOffset;
                
                // Generate base noise with morphing
                float n = noise(morphedUV * 2.0 + scrollOffset);
                n = (n + 1.0) * 0.5;
                
                vec3 baseColor = vec3(0.8, 0.0, 0.0);
                vec3 darkColor = vec3(0.05, 0.0, 0.0);
                vec3 blackColor = vec3(0.0, 0.0, 0.0);
                
                vec3 color = mix(darkColor, baseColor, n);
                color = mix(color, blackColor, 1.0 - n * 0.8);
                
                gl_FragColor = vec4(color, 1.0);
            }
        `
    });

    // Fullscreen quad
    const bgGeometry = new THREE.PlaneGeometry(2, 2);
    bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
    bgScene.add(bgMesh);

    // Add scroll listener
    scrollManager.addListener((progress) => {
        bgUniforms.u_scroll.value = progress;
    });

    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        bgRenderer.setSize(width, height);
        bgUniforms.u_resolution.value.set(width, height);
    });

    function animateBg() {
        bgUniforms.u_time.value = performance.now() / 1000.0;
        bgRenderer.render(bgScene, bgCamera);
        requestAnimationFrame(animateBg);
    }
    animateBg();
}

window.addEventListener('DOMContentLoaded', initAnimatedBackground); 