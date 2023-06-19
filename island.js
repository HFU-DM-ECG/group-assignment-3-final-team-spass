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

// orbit controls
let controls;
controls = new OrbitControls(camera, dom);
controls.target.set(0, 1.6, 0);
controls.update();

// timer
let currentTime = 0;
let timer = document.getElementById('timer');
let timerInterval;
let isTimerRunning = false;

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
    airship.position.set(0, 2.7, -3);
    airship.rotateY(-1.49);
}, undefined, function (error) {
    console.error(error);
});

class CheckBox {
    constructor(position, rotation, width, height, depth, passed = false) {
        this.position = position;
        this.rotation = rotation;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.passed = passed;
    }
}

const checkBoxList = [];
let passedCheckpoints = 0;

function registerCheckBox(position, rotation, width, height, depth, passed) {
    let newCheckpoint = new CheckBox(position, rotation, width, height, depth, passed);
    checkBoxList.push(newCheckpoint);
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0 });
    const plane = new THREE.Mesh(geometry, material);
    collection.add(plane);
    // console.log(CheckBoxList);
    plane.position.set(position.x, position.y+0.5, position.z);
    plane.applyQuaternion(rotation);
}

const numberOfCheckpoints = 17;

loader.load('models/checkpoint.glb', function (gltf) {
    let checkpoint = gltf.scene;
    for (let i = 0; i < numberOfCheckpoints; i++) {
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

function placeCheckpoint (index, x, y, z, rotation) {
    checkpoints.children[index].position.set(x, y, z);
    checkpoints.children[index].rotateY(rotation);
    registerCheckBox(new THREE.Vector3(x, y, z), checkpoints.children[index].quaternion, 2, 2, 2);
}
// place checkpoints
function placeCheckpoints() {
    placeCheckpoint(0, 3, 3.5, -3.5, 0);
    placeCheckpoint(1, 6, 3.5, -4, 0.5);
    placeCheckpoint(2, 9, 3.5, -7, 1);
    placeCheckpoint(3, 11, 3.5, -11, 1.7);
    placeCheckpoint(4, 10, 3.5, -15, 2.2);
    placeCheckpoint(5, 6, 3.5, -17, 3.1);
    placeCheckpoint(6, 2, 3.5, -16, 3.6);
    placeCheckpoint(7,-2, 3.5, -13, 4);
    placeCheckpoint(8, -6.5, 3.5, -11, 3.5);
    placeCheckpoint(9, -11, 3.5, -12, 3);
    placeCheckpoint(10,-16, 3.5, -13, 3.5);
    placeCheckpoint(11, -20, 3.5, -10, 4);
    placeCheckpoint(12, -22, 3.5, -5, 4.5);
    placeCheckpoint(13, -20, 3.5, 1, 5.4);
    placeCheckpoint(14, -15, 3.5, 3, 6.1);
    placeCheckpoint(15, -10, 3.5, 3, 6.3);
    placeCheckpoint(16, -6, 3.5, 2, 0);
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
        position: { top: document.height / 2 +'px', left: document.height / 2 + "px" },
        dynamicPage: true,
    }
    joystickManager = nipplejs.create(options);

    joystickManager['0'].on('move', function (event, data) {

        // top of joystick should be the y=100, bottom should be y=-100, left x=-100, right x=100
        const forward = data.instance.frontPosition.y;
        const turn = data.instance.frontPosition.x
        if (forward > 0) {
            forwardsValue = Math.abs(forward) / 2000
            backwardsValue = 0
        } else if (forward < 0) {
            forwardsValue = 0
            backwardsValue = Math.abs(forward) / 2000
        }

        if (turn > 0) {
            leftValue = 0
            rightValue = Math.abs(turn) / 2000
        } else if (turn < 0) {
            leftValue = Math.abs(turn) / 2000
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
    let checkBox = checkBoxList[index];
    let point1 = new THREE.Vector3(checkBox.position.x + checkBox.width / 2, checkBox.position.y + checkBox.height / 2, checkBox.position.z + checkBox.depth / 2);
    let point2 = new THREE.Vector3(checkBox.position.x - checkBox.width / 2, checkBox.position.y - checkBox.height / 2, checkBox.position.z - checkBox.depth / 2);

    let checkX = (airship.position.x > point2.x && airship.position.x < point1.x);
    let checkY = (airship.position.y > point2.y && airship.position.y < point1.y);
    let checkZ = (airship.position.z > point2.z && airship.position.z < point1.z);

    return checkX && checkY && checkZ;
}

function nearCheckBox(distance) { // Only check near Checkpoints
    for (let i = 0; i < checkBoxList.length; i++) {
        if (!checkBoxList[i].passed) {
            if (Math.abs(new THREE.Vector3(checkBoxList[i].position.x - airship.position.x,
                                           checkBoxList[i].position.y - airship.position.y,
                                           checkBoxList[i].position.z - airship.position.z).length()) < distance) {
                if (checkCheckBox(i)) {
                    // start run
                    if (!isTimerRunning && i == 0) {
                        startTimer();
                    }
                    // during run
                    else if (isTimerRunning) {
                        // last checkpoint
                        if (i == checkBoxList.length - 1) {
                            // check if all previous checkpoints have been passed
                            if (passedCheckpoints == checkBoxList.length - 1) {
                                passedCheckpoints += 1;
                                checkBoxList[i].passed = true;
                                console.log("Checkpoint passed!");
                                stopTimer();
                            }
                        }
                        // all checkpoints but the last
                        else {
                            passedCheckpoints += 1;
                            checkBoxList[i].passed = true;
                            console.log("Checkpoint passed!");
                            console.log("Progress: " + passedCheckpoints + " out of " + checkBoxList.length);
                        }
                    }                    
                }
            }
        }
    }
}

function startTimer() {   
    if (isTimerRunning) return;

    isTimerRunning = true;
    timerInterval = setInterval(updateCountdown, 1000);
    currentTime = 0;
        
    function updateCountdown() {
        let minutes = Math.floor(currentTime/60);
        let seconds = (currentTime % 60).toString().padStart(2, '0');
        timer.children[0].innerHTML = `${minutes} : ${seconds}`;
        timer.children[1].innerHTML = `${passedCheckpoints} / ${checkBoxList.length}`;
        currentTime++;
    }
}

function stopTimer() {

    isTimerRunning = false;
    checkBoxList.forEach((checkpoint) => {
        checkpoint.passed = false;
    });
    clearInterval(timerInterval);
    timer.children[1].innerHTML = `${checkBoxList.length} / ${checkBoxList.length}`;
    passedCheckpoints = 0;
}

function animate() {
    collection.scale.set(0.2, 0.2, 0.2);
    collection.position.set(0, 0, 0);
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
addJoystick();
animate();