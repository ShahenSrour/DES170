// 1. Initialize Three.js scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xF2F2F2);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('model-container').appendChild(renderer.domElement);

// 2. Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
scene.add(hemisphereLight);

// 3. Model loading
const loader = new THREE.GLTFLoader();
let model;

loader.load(
  'assets/model.glb',
  (gltf) => {
    model = gltf.scene;

    const bbox = new THREE.Box3().setFromObject(model);
    const center = bbox.getCenter(new THREE.Vector3());
    const size = bbox.getSize(new THREE.Vector3());

    model.position.sub(center);
    const scaleFactor = 2 / Math.max(size.x, size.y, size.z);
    model.scale.set(scaleFactor, scaleFactor, scaleFactor);

    scene.add(model);

    // Set initial camera distance based on model size
    camera.position.z = Math.max(size.x, size.y, size.z) * 1000;
  },
  undefined,
  (error) => console.error("Error loading model:", error)
);

// 4. Mouse controls
const mouse = { x: 0, y: 0 };
const targetRotation = { x: 0, y: 0 };
const sensitivity = 0.5; // Rotation speed

window.addEventListener('mousemove', (e) => {
  // Fixed: No more inverted Y-axis
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = (e.clientY / window.innerHeight) * 2 - 1;

  targetRotation.y = mouse.x * Math.PI * sensitivity;
  targetRotation.x = mouse.y * Math.PI * sensitivity;
});

// 5. Zoom with scroll wheel
window.addEventListener('wheel', (e) => {
  e.preventDefault();
  camera.position.z += e.deltaY * 0.0005; // Zoom speed
  camera.position.z = Math.max(2, Math.min(camera.position.z, 5)); // Limits
});

// 6. Animation loop
function animate() {
  requestAnimationFrame(animate);

  if (model) {
    // Smoother rotation with lerp
    model.rotation.y += (targetRotation.y - model.rotation.y) * 0.1;
    model.rotation.x += (targetRotation.x - model.rotation.x) * 0.1;
  }

  renderer.render(scene, camera);
}
animate();

// 7. Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});