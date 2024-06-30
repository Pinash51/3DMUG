const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerWidth, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize($('#model_view').innerWidth(), $('#model_view').innerWidth());
renderer.setPixelRatio(window.devicePixelRatio);
$('#model_view').append(renderer.domElement);

const textureLoader = new THREE.TextureLoader();
let textureUrl = 'img.jpg';
let mugTexture;

$('#image').on('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const textureUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            mugTexture = textureLoader.load(textureUrl);
            URL.revokeObjectURL(textureUrl);
            createMug();
        };
        img.src = textureUrl;
    }
});

textureLoader.load(
    textureUrl,
    (texture) => {
        mugTexture = texture;
        createMug();
    },
    undefined,
    (error) => {
        console.log('An error occurred while loading the texture.', error);
    }
);

function createMug() {
    scene.clear(); // Clear existing scene content

    const outerMugGeometry = new THREE.CylinderGeometry(5, 5, 10, 100, 1, true, 1.6);
    const innerMugGeometry = new THREE.CylinderGeometry(4.7, 4.7, 10, 100, 1, true);
    const bottomGeometry = new THREE.CircleGeometry(5, 64);

    const outerMugMaterial = new THREE.MeshPhongMaterial({ map: mugTexture, shininess: 100, side: THREE.DoubleSide });
    const innerMugMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, shininess: 100, side: THREE.DoubleSide });

    const outerMug = new THREE.Mesh(outerMugGeometry, outerMugMaterial);
    const innerMug = new THREE.Mesh(innerMugGeometry, innerMugMaterial);

    const topRingGeometry = new THREE.TorusGeometry(4.85, 0.15, 100, 100);
    const topRingMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const topRing = new THREE.Mesh(topRingGeometry, topRingMaterial);
    topRing.position.set(0, 5, 0);
    topRing.rotation.set(Math.PI / 2, 0, 0); 

    const bottomRingGeometry = new THREE.TorusGeometry(4.85, 0.15, 100, 100);
    const bottomRingMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const bottomRing = new THREE.Mesh(bottomRingGeometry, bottomRingMaterial);
    bottomRing.position.set(0, -5, 0);
    bottomRing.rotation.set(Math.PI / 2, 0, 0); 

    const bottom = new THREE.Mesh(bottomGeometry, innerMugMaterial);
    bottom.rotation.x = -Math.PI / 2;
    bottom.position.y = -5;
    
    const handleGeometry = new THREE.TorusGeometry(3.5, 0.5, 100, 100, Math.PI * 1);
    const handleMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(5, 0, 0);
    handle.rotation.z = Math.PI * 1.5;

    const mug = new THREE.Group();
    mug.add(outerMug);
    mug.add(innerMug);
    mug.add(topRing);
    mug.add(bottomRing);
    mug.add(bottom);
    mug.add(handle);
    scene.add(mug);
    
    mug.rotation.y = -0.9;
    mug.rotation.x = 0.5;

    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(10, 10, 10);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    camera.position.z = 20;

    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    function onPointerDown(event) {
        isDragging = true;
        prevMouseX = event.clientX || event.touches[0].clientX;
        prevMouseY = event.clientY || event.touches[0].clientY;
        $('#model_view').addClass('grabbing');
    }

    function onPointerMove(event) {
        if (isDragging) {
            const clientX = event.clientX || event.touches[0].clientX;
            const clientY = event.clientY || event.touches[0].clientY;

            const deltaX = clientX - prevMouseX;
            const deltaY = clientY - prevMouseY;

            mug.rotation.y += deltaX * 0.01;
            mug.rotation.x += deltaY * 0.01;

            prevMouseX = clientX;
            prevMouseY = clientY;

            renderer.render(scene, camera);
        }
    }

    function onPointerUp() {
        isDragging = false;
        $('#model_view').removeClass('grabbing');
    }

    $('#model_view').on('mousedown touchstart', onPointerDown);
    $('#model_view').on('mousemove touchmove', onPointerMove);
    $('#model_view').on('mouseup touchend', onPointerUp);

    $('#model_view').on('wheel', (event) => {
        event.preventDefault();
        const zoomSpeed = 0.01;
        camera.position.z += event.originalEvent.deltaY * zoomSpeed;
        camera.position.z = Math.max(5, Math.min(camera.position.z, 20));
        renderer.render(scene, camera);
    });

    renderer.render(scene, camera);
}

// Handle window resizing
window.addEventListener('resize', () => {
    const width = $('#model_view').innerWidth();
    const height = width;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
});