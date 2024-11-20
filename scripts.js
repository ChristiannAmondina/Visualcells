import './style.css'; 
import * as THREE from 'three';
import gsap from 'gsap';
import { GUI } from 'lil-gui'; // Import lil-gui


// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xafc0c1);

const loader = new THREE.TextureLoader();
scene.background = loader.load();

// Sphere geometry (flattened red blood cell shape)
const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 6);
sphereGeometry.scale(1, 0.5, 1);

// Sphere material (red blood cell-like)
const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0xda0000,
    roughness: 0.2,
    metalness: 0.3,
    emissive: 0x3e0000,
    emissiveIntensity: 0.2,
    transparent: true,
    opacity: 0.9
});

// Create and add a single red blood cell to the scene
const redBloodCell = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(redBloodCell);

// Array to hold multiple spheres and their velocity
const spheres = [];

// Function to create multiple spheres with random positions and velocities
const createSpheres = (count) => {
    for (let i = 0; i < count; i++) {
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

        // Randomize sphere position
        sphere.position.set(
            (Math.random() - 0.5) * 35,
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 10
        );

        // Define random movement and rotation velocities for jittering
        const velocity = {
            rotationX: (Math.random() - 0.5) * 0.02,
            rotationY: (Math.random() - 0.5) * 0.02,
            positionX: (Math.random() - 0.5) * 0.01,
            positionY: (Math.random() - 0.5) * 0.01
        };

        spheres.push({ sphere, velocity });
        scene.add(sphere);
    }
};

// Create 150 spheres
createSpheres(350);

// Lighting setup
const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(15, 15, 5);
scene.add(directionalLight);

// Window resize handler
const sizes = { width: window.innerWidth, height: window.innerHeight };

// Camera setup
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 1, 1000);
camera.position.set(23, 22, 15);
scene.add(camera);




// Renderer setup
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('canvas.webgl') });
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);

// Cursor tracking for camera movement
const cursor = { x: 0, y: 0 };
window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5;
    cursor.y = event.clientY / sizes.height - 0.5;
});

// Handle window resizing
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Double-click event to toggle fullscreen mode
window.addEventListener('dblclick', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
});

// Mouse wheel zoom control
let zoomSpeed = 0.4;
window.addEventListener('wheel', (event) => {
    camera.position.z += event.deltaY < 0 ? -zoomSpeed : zoomSpeed;
    camera.position.z = Math.max(Math.min(camera.position.z, 12), 5);
});

// Animation loop
const clock = new THREE.Clock();

const time = {
    startTime: Date.now(),
    currentTime: 0,
    elapsedTime: 0,
    deltaTime: 0,
};

const transform = {
    rotation1: 0,
    rotation2: 0,
    rotation3: 0,
};

const cameraXPos = {
    current: 0,
    target: 0,
    ease: 0.1,
};

const cameraYPos = {
    current: 0,
    target: 0,
    ease: 0.1,
};

const tick = () => {
    const cTime = Date.now();
    time.elapsedTime = cTime - time.startTime;
    time.deltaTime = cTime - time.currentTime;
    time.currentTime = cTime;

    transform.rotation1 += time.deltaTime * 0.00055;
    transform.rotation2 += time.deltaTime * 0.00045;
    transform.rotation3 += time.deltaTime * 0.00025;

    // Rotate spheres
    spheres.forEach(({ sphere, velocity }) => {
        sphere.rotation.x += velocity.rotationX;
        sphere.rotation.y += velocity.rotationY;
        sphere.position.x += velocity.positionX;
        sphere.position.y += velocity.positionY;

        if (Math.abs(sphere.position.x) > 10) velocity.positionX *= -1;
        if (Math.abs(sphere.position.y) > 10) velocity.positionY *= -1;
    });

    // Update camera position based on cursor
    cameraXPos.current = gsap.utils.interpolate(
        cameraXPos.current,
        cameraXPos.target,
        cameraXPos.ease
    );
    cameraYPos.current = gsap.utils.interpolate(
        cameraYPos.current,
        cameraYPos.target,
        cameraYPos.ease
    );
    camera.position.x = cameraXPos.current * 18;
    camera.position.y = cameraYPos.current * 9;
    camera.lookAt(new THREE.Vector3(0));

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();

// Cursor event to control camera position
window.addEventListener('mousemove', e => {
    cameraXPos.target = (e.clientX / sizes.width - 0.5) * 2;
    cameraYPos.target = (e.clientY / sizes.height - 0.5) * 2;
});

// GUI Setup
const gui = new GUI();
const sphereFolder = gui.addFolder('Mutate the Cells');
sphereFolder.open();

// GUI Styling
gui.domElement.style.position = 'fixed';
gui.domElement.style.top = '3.7vw';
gui.domElement.style.right = '10px';
gui.domElement.style.borderStyle= 'dashed';
gui.domElement.style.color = '#7f0000';
gui.domElement.style.backgroundColor = '#7f0000';



// Elevation (Y-position) control
const elevationControl = sphereFolder.add({ elevation: 0 }, 'elevation', -30, 30, 0.1);
elevationControl.onChange(value => {
    spheres.forEach(({ sphere }) => {
        sphere.position.y = value;
    });
});

// Visibility control
const visibleControl = sphereFolder.add({ visible: true }, 'visible');
visibleControl.onChange(value => {
    spheres.forEach(({ sphere }) => {
        sphere.visible = value;
    });
});

// Wireframe control
const wireframeControl = sphereFolder.add({ wireframe: false }, 'wireframe');
wireframeControl.onChange(value => {
    spheres.forEach(({ sphere }) => {
        sphere.material.wireframe = value;
    });
});

// Color control
const colorControl = sphereFolder.addColor({ color: 0xda0000 }, 'color');
colorControl.onChange(value => {
    spheres.forEach(({ sphere }) => {
        sphere.material.color.set(value);
    });
});

// Metalness control (new feature)
const metalnessControl = sphereFolder.add({ metalness: 0.3 }, 'metalness', 0, 1, 0.01);
metalnessControl.onChange(value => {
    spheres.forEach(({ sphere }) => {
        sphere.material.metalness = value;
    });
});

// Roughness control (new feature)
const roughnessControl = sphereFolder.add({ roughness: 0.2 }, 'roughness', 0, 1, 0.01);
roughnessControl.onChange(value => {
    spheres.forEach(({ sphere }) => {
        sphere.material.roughness = value;
    });
});

// Adding material textures
const textureLoader = new THREE.TextureLoader();
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg');
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg');

// Apply texture controls
const textureControlFolder = gui.addFolder('Texture Controls');
textureControlFolder.add({ 'Metalness Texture': false }, 'Metalness Texture').onChange(value => {
    spheres.forEach(({ sphere }) => {
        sphere.material.metalnessMap = value ? doorMetalnessTexture : null;
    });
});
textureControlFolder.add({ 'Roughness Texture': false }, 'Roughness Texture').onChange(value => {
    spheres.forEach(({ sphere }) => {
        sphere.material.roughnessMap = value ? doorRoughnessTexture : null;
    });
});

tick();
