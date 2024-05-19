import * as THREE from 'three';
import {OBJLoader} from 'https://threejs.org/examples/jsm/loaders/OBJLoader.js';
import {MTLLoader} from 'https://threejs.org/examples/jsm/loaders/MTLLoader.js';
import {OrbitControls} from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';

let canvas;
let renderer;
let camera;
let scene;
let cubes;
let sky;

main();
function main() {
    canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    const fov = 45;
    const aspect = 2;
    const near = 0.1;
    const far = 100;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 10, 20);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 2, 2);
    controls.update();

    scene = new THREE.Scene();
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const sphGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const cylGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);

    const map = [];
    cubes = [];
    for (let r = 0; r < 8; r += 2) {
        const row = [];
        for (let c = 0; c < 10; c += 2) {
            let rand = Math.floor(Math.random() * 3) + 1;
            row.push(rand);
            let shape;
            switch (rand) {
                case 1:
                    shape = cubeGeometry;
                    break;
                case 2:
                    shape = sphGeometry;
                    break;
                case 3:
                    shape = cylGeometry;
                    break;
            }
            const color = new THREE.Color(Math.random(), Math.random(), Math.random());
            cubes.push(makeInstance(shape, color, c - 4, r + 2.5));
        }
        map.push(row);
    }
    console.log(map);

    const SKY_PATH = './sunset.jpg';
    const skyLoader = new THREE.CubeTextureLoader();
    sky = skyLoader.load([SKY_PATH, SKY_PATH, SKY_PATH, SKY_PATH, SKY_PATH, SKY_PATH]);
    scene.background = sky;

    // light yellow light
    const ambLight = new THREE.AmbientLight(0xffff66, 0.5);
    scene.add(ambLight);
    
    const dirLight = new THREE.DirectionalLight('white', 3);
    dirLight.position.set(-1, 2, 4);
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight('white', 10);
    scene.add(spotLight);
    scene.add(spotLight.target);

    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader();
    mtlLoader.load('./moped/materials.mtl', (mtl) => {
        mtl.preload();
        objLoader.setMaterials(mtl);
        objLoader.load('./moped/model.obj', (root) => {
            scene.add(root);
        });
    });
    renderer.render(scene, camera);
}

requestAnimationFrame(render);
function render(time) {
    time *= 0.001;

    if (canvas.height != window.innerHeight || canvas.width != window.innerWidth) {
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        camera.aspect = canvas.width / canvas.height;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.width, canvas.height);
    }

    cubes.forEach((cube, ndx) => {
        const speed = 1 + ndx * .1;
        const rot = time * speed;
        cube.rotation.x = rot;
        cube.rotation.y = rot;
    });

    scene.background = sky;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

function makeInstance(geometry, color, x, y) {
    const loader = new THREE.TextureLoader();
    const texture = loader.load('wall.jpg');
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshPhongMaterial({color, map: texture});
    const shape = new THREE.Mesh(geometry, material);
    scene.add(shape);
    shape.position.x = x;
    shape.position.y = y;
    return shape;
}
