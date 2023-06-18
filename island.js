import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ARButton } from './ARButton.js';

// camera configuration
const FOV = 75;
const near_plane = 0.1;
const far_plane = 1000;

// scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, near_plane, far_plane);
const collection = new THREE.Object3D();
scene.add(collection);
collection.position.z = -3;
collection.scale.divideScalar(3);

// time
var time = Date.now() / 1000;

// joystick
let joystickManager;
let forwardsValue = 0;
let backwardsValue = 0;
let rightValue = 0;
let leftValue = 0;

// light
/// light from the sky
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
hemisphereLight.color.setHSL(0.6, 1, 1);
hemisphereLight.groundColor.setHSL(0.095, 1, 0.75);
hemisphereLight.position.set(0, 10, 0);
scene.add(hemisphereLight)
const hemiLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 1);
hemiLightHelper.visible = false;
scene.add(hemiLightHelper);

/// light from the sun
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.color.setHSL(0.9, 1, 0.9);
directionalLight.position.set(-2.5, 10, -2.5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = directionalLight.shadow.mapSize.height = 2048
scene.add(directionalLight);
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
directionalLightHelper.visible = false;
scene.add(directionalLightHelper);

// renderer
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
var dom = renderer.domElement;
renderer.xr.enabled = true;
document.body.appendChild(ARButton.createButton(renderer));
document.body.appendChild(dom);

// object loading
const island1 = new THREE.Object3D();
const island2 = new THREE.Object3D();
const island3 = new THREE.Object3D();
const airship = new THREE.Object3D();
const checkpoints = new THREE.Object3D();
const loader = new GLTFLoader();

// orbit Controls
let controls;
controls = new OrbitControls(camera, dom);
controls.target.set(0, 1.6, 0);
controls.update();

// loading in the 3D models, saving them into usable variables and adding them to the scene.
loader.load('models/insel.glb', function (gltf) {
    // its always children[0] because the child gets removed from gltf.scene once you add it to the actual scene
    island1.add(gltf.scene.children[0]);
    island1.children[0].children[0].castShadow = true;
    island1.children[0].children[0].receiveShadow = true;
    island1.name = "island1";
    collection.add(island1);

    island2.add(gltf.scene.children[0]);
    island2.children[0].children[0].castShadow = true;
    island2.children[0].children[0].receiveShadow = true;
    island2.name = "island2";
    collection.add(island2);

    island3.add(gltf.scene.children[0]);
    island3.children[0].children[0].castShadow = true;
    island3.children[0].children[0].receiveShadow = true;
    island3.name = "island3";
    collection.add(island3);
    island1.scale.set(3, 3, 3);
    island2.scale.set(3, 3, 3);
    island3.scale.set(3, 3, 3);

}, undefined, function (error) {
    console.error(error);
});

loader.load('models/airship.glb', function (gltf) {
    airship.add(gltf.scene.children[0]);
    airship.name = "airship";
    airship.children[0].children[0].castShadow = true;
    airship.children[0].children[0].receiveShadow = true;
    collection.add(airship);
    airship.scale.set(2, 2, 2);
    airship.position.set(0, 2.8, 0);
    airship.rotateY(-1.49);
}, undefined, function (error) {
    console.error(error);
});

class CheckBox {
    constructor(position, rotation, width, height, depth) {
        this.position = position;
        this.rotation = rotation;
        this.width = width;
        this.height = height;
        this.depth = depth;
    }
}

const CheckBoxList = [];
let passedCheckpoints = 0;

function registerCheckBox(position, rotation, width, height, depth) {
    let newCheckpoint = new CheckBox(position, rotation, width, height, depth);
    CheckBoxList.push(newCheckpoint);
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(geometry, material);
    collection.add(plane);
    console.log(CheckBoxList);
    plane.position.set(position.x, position.y+0.5, position.z);
    plane.applyQuaternion(rotation);
}

loader.load('models/checkpoint.glb', function (gltf) {
    let checkpoint = gltf.scene;
    for (let i = 0; i < 17; i++) {
        let checkpointCopy = checkpoint.clone();
        checkpointCopy.scale.set(1.5,1.5,1.5);
        checkpoints.children.push(checkpointCopy);
        collection.add(checkpointCopy);
    }
    checkpoints.name = "checkpoints";
    placeCheckpoints();
    console.log(checkpoints);
    console.log(collection);
});

function placeCheckpoint (index,x,y,z,rotation) {
    checkpoints.children[index].position.set(x, y, z);
    checkpoints.children[index].rotateY(rotation);
    registerCheckBox(new THREE.Vector3(x, y, z), checkpoints.children[index].quaternion, 2, 2, 2);
}
// place checkpoints
function placeCheckpoints() {
    placeCheckpoint(0,3, 3.5, -3.5,0);
    checkpoints.children[1].position.set(6, 1, -4);
    checkpoints.children[1].rotateY(0.5);
    checkpoints.children[2].position.set(9, 1, -7);
    checkpoints.children[2].rotateY(1);
    checkpoints.children[3].position.set(11, 1, -11);
    checkpoints.children[3].rotateY(1.7);
    checkpoints.children[4].position.set(10, 1, -15);
    checkpoints.children[4].rotateY(2.2);
    checkpoints.children[5].position.set(6, 1, -17);
    checkpoints.children[5].rotateY(3.1);
    checkpoints.children[6].position.set(2, 1, -16);
    checkpoints.children[6].rotateY(3.6);
    checkpoints.children[7].position.set(-2, 1, -13);
    checkpoints.children[7].rotateY(4);
    checkpoints.children[8].position.set(-6.5, 1, -11);
    checkpoints.children[8].rotateY(3.5);
    checkpoints.children[9].position.set(-11, 1, -12);
    checkpoints.children[9].rotateY(3);
    checkpoints.children[10].position.set(-16, 1, -13);
    checkpoints.children[10].rotateY(3.5);
    checkpoints.children[11].position.set(-20, 1, -10);
    checkpoints.children[11].rotateY(4);
    checkpoints.children[12].position.set(-22, 1, -5);
    checkpoints.children[12].rotateY(4.5);
    checkpoints.children[13].position.set(-20, 1, 1);
    checkpoints.children[13].rotateY(5.4);
    checkpoints.children[14].position.set(-15, 1, 3);
    checkpoints.children[14].rotateY(6.1);
    checkpoints.children[15].position.set(-10, 1, 3);
    checkpoints.children[15].rotateY(6.3);
    checkpoints.children[16].position.set(-6, 1, 2);
    checkpoints.children[16].rotateY(0);
}

// object floating up and down
function floating(object, floatingFrequency, amplitude, currentTime) {
    const scalingFactor = 1 / 1000;
    var midPosition = object.position.y;
    object.position.y = midPosition + (Math.sin(currentTime * floatingFrequency) * scalingFactor * amplitude);
}

function addJoystick() {
    const options = {
        zone: document.getElementById('joystickWrapper'),
        size: 200,
        multitouch: true,
        maxNumberOfNipples: 2,
        mode: 'static',
        restJoystick: true,
        shape: 'circle',
        position: { top: '150px', left: '150px' },
        dynamicPage: true,
    }
    joystickManager = nipplejs.create(options);

    joystickManager['0'].on('move', function (event, data) {

        // top of joystick should be the y=100, bottom should be y=-100, left x=-100, right x=100
        const forward = data.instance.frontPosition.y;
        const turn = data.instance.frontPosition.x
        if (forward > 0) {
            forwardsValue = Math.abs(forward) / 1000
            backwardsValue = 0
        } else if (forward < 0) {
            forwardsValue = 0
            backwardsValue = Math.abs(forward) / 1000
        }

        if (turn > 0) {
            leftValue = 0
            rightValue = Math.abs(turn) / 1000
        } else if (turn < 0) {
            leftValue = Math.abs(turn) / 1000
            rightValue = 0
        }
    });

    joystickManager['0'].on('end', function (event) {
        backwardsValue = 0
        forwardsValue = 0
        leftValue = 0
        rightValue = 0
    })
}

function moveAirship() {
    let tempVector = new THREE.Vector3();

    if (forwardsValue > 0) {
        tempVector.set(forwardsValue, 0, 0);
        airship.position.addScaledVector(tempVector.applyQuaternion(airship.quaternion).applyAxisAngle(new THREE.Vector3(0, 1, 0), -90), 1);
    }
    if (backwardsValue > 0) {
        tempVector.set(-backwardsValue, 0, 0);
        airship.position.addScaledVector(tempVector.applyQuaternion(airship.quaternion).applyAxisAngle(new THREE.Vector3(0, 1, 0), -90), 1);
    }
    if (leftValue > 0) {
        airship.rotateY(leftValue);
    }
    if (rightValue > 0) {
        airship.rotateY(-rightValue);
    }
}

function checkCheckBox(index) {
    let checkBox = CheckBoxList[index];
    let point1 = new THREE.Vector3(checkBox.position.x + checkBox.width / 2, checkBox.position.y + checkBox.height / 2, checkBox.position.z + checkBox.depth / 2);
    let point2 = new THREE.Vector3(checkBox.position.x - checkBox.width / 2, checkBox.position.y - checkBox.height / 2, checkBox.position.z - checkBox.depth / 2);

    let checkX = (airship.position.x > point2.x && airship.position.x < point1.x);
    let checkY = (airship.position.y > point2.y && airship.position.y < point1.y);
    let checkZ = (airship.position.z > point2.z && airship.position.z < point1.z);

    return checkX && checkY && checkZ;
}

function nearCheckBox(distance) { // Only check near Checkpoints
    for (let i = 0; i < CheckBoxList.length; i++) {
        if (CheckBoxList[i] != null) {
            if (Math.abs(new THREE.Vector3( CheckBoxList[i].position.x - airship.position.x,
                                            CheckBoxList[i].position.y - airship.position.y,
                                            CheckBoxList[i].position.z - airship.position.z).length()) < distance) {
                if (checkCheckBox(i)) {
                    passedCheckpoints += 1;
                    console.log("passedCheckpoints: " + passedCheckpoints);
                    CheckBoxList[i] = null;
                }
            }

        }
    }
}

function startTimer() {
    let time = 0;

    let countdown = document.getElementById('countdown');
    
    setInterval(updateCountdown, 1000);
    
    function updateCountdown() {
        let minutes = Math.floor(time/60);
        let seconds = time % 60;
        countdown.innerHTML = `${minutes} : ${seconds}`;
        time++;
    }
}

function animate() {
    renderer.setAnimationLoop(function () {
        // time management
        /// scaling to seconds
        const currentTime = Date.now() / 1000;
        time = currentTime;

        // animation: islands floating up and down in different intervals
        floating(island1, 1, 1, time);
        floating(island2, 1.5, 1, time);
        floating(island3, 2.2, 2, time);

        moveAirship();
        nearCheckBox(10);

        // rendering
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.shadowMap.enabled = true;
        renderer.render(scene, camera);
    })
}

startTimer();
addJoystick();
animate();