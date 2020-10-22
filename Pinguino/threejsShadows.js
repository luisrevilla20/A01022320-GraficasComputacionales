// 1. Enable shadow mapping in the renderer. 
// 2. Enable shadows and set shadow parameters for the lights that cast shadows. 
// Both the THREE.DirectionalLight type and the THREE.SpotLight type support shadows. 
// 3. Indicate which geometry objects cast and receive shadows.

let renderer = null,
    scene = null,
    camera = null,
    root = null,
    group = null,
    objectList = [],
    orbitControls = null,
    penguinGroup = null,
    penguinAnimator = null,
    animatePenguin = true;

let objLoader = null,
    jsonLoader = null,
    penguin = null;

let duration = 10; // sec
let currentTime = Date.now();

let directionalLight = null;
let spotLight = null;
let ambientLight = null;
let pointLight = null;
let mapUrl = "../images/floor15.jpg";

let SHADOW_MAP_WIDTH = 4096,
    SHADOW_MAP_HEIGHT = 4096;

let objModelUrl = {
    obj: '../models/obj/Penguin_obj/penguin.obj',
    map: '../models/obj/Penguin_obj/peng_texture.jpg'
};
// let objModelUrl = {obj:'../../models/obj/cerberus/Cerberus.obj', map:'../../models/obj/cerberus/Cerberus_A.jpg', normalMap:'../../models/obj/cerberus/Cerberus_N.jpg', specularMap: '../../models/obj/cerberus/Cerberus_M.jpg'};

let jsonModelUrl = {
    url: '../models/json/teapot-claraio.json'
};

function promisifyLoader(loader, onProgress) {
    function promiseLoader(url) {

        return new Promise((resolve, reject) => {

            loader.load(url, resolve, onProgress, reject);

        });
    }

    return {
        originalLoader: loader,
        load: promiseLoader,
    };
}

const onError = ((err) => {
    console.error(err);
});


async function loadObj(objModelUrl, objectList) {
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        penguin = await objPromiseLoader.load(objModelUrl.obj);

        let texture = objModelUrl.hasOwnProperty('map') ? new THREE.TextureLoader().load(objModelUrl.map) : null;
        let normalMap = objModelUrl.hasOwnProperty('normalMap') ? new THREE.TextureLoader().load(objModelUrl.normalMap) : null;
        let specularMap = objModelUrl.hasOwnProperty('specularMap') ? new THREE.TextureLoader().load(objModelUrl.specularMap) : null;

        // console.log(penguin);

        penguin.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.map = texture;
                child.material.normalMap = normalMap;
                child.material.specularMap = specularMap;
            }
        });

        penguin.scale.set(0.5, 0.5, 0.5);
        penguin.position.z = 0;
        penguin.position.x = 0;
        penguin.rotation.y = 0;
        penguin.name = "objObject";
        objectList.push(penguin);
        // scene.add(penguin);
        penguinGroup.add(penguin)

        // Animate penguin
        playAnimations();

    } catch (err) {
        return onError(err);
    }
}


function run() {
    requestAnimationFrame(function () {
        run();
    });

    // Render the scene
    renderer.render(scene, camera);

    // Update the animations
    KF.update();

    // Update the camera controller
    orbitControls.update();
}


function createScene(canvas) {
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.BasicShadowMap;

    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 1, 4000);
    camera.position.set(0, 40, 60)
    scene.add(camera);

    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

    // Create a group to hold all the objects
    root = new THREE.Object3D;

    // // Add a directional light to show off the object
    // directionalLight = new THREE.DirectionalLight( 0xaaaaaa, 1);

    // // Create and add all the lights
    // directionalLight.position.set(.5, 1, -3);
    // directionalLight.target.position.set(0,0,0);
    // directionalLight.castShadow = true;
    // root.add(directionalLight);

    spotLight = new THREE.SpotLight(0xaaaaaa, 1, 0, Math.PI / 6);
    spotLight.position.set(0, 40, 40);
    spotLight.target.position.set(-30, 30, 0);
    root.add(spotLight);
    // spotlightHelper = new THREE.SpotLightHelper(spotLight);
    // scene.add(spotlightHelper);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 200;
    spotLight.shadow.camera.fov = 45;

    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    // ambientLight = new THREE.AmbientLight ( 0x444444, 0.3);
    // root.add(ambientLight);

    penguinGroup = new THREE.Object3D;
    root.add(penguinGroup);

    // Create the objects
    loadObj(objModelUrl, objectList);

    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    // Create a texture map
    let map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    let color = 0xffffff;

    // Put in a ground plane to show off the lighting
    let geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
        color: color,
        map: map,
        side: THREE.DoubleSide
    }));

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0;
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    group.add(mesh);

    scene.add(root);
}

function playAnimations() {
    // position animation
    if (penguinAnimator)
        penguinAnimator.stop();

    // console.log(penguin);
    penguinGroup.position.set(0, 0, 0);
    penguinGroup.rotation.set(0, 0, 0);

    if (animatePenguin && penguin!=null) {
        penguinAnimator = new KF.KeyFrameAnimator;
        penguinAnimator.init({
            interps: [{
                    keys: [0.0, 0.07142857142857142, 0.14285714285714285, 0.21428571428571427, 0.2857142857142857, 0.35714285714285715, 0.42857142857142855, 0.5, 0.5714285714285714, 0.6428571428571429, 0.7142857142857143, 0.7857142857142857, 0.8571428571428571, 0.9285714285714286, 1.0],                    
                    values: [
                        {x: 0, z: 0},
                        {x: -3, z: 4},
                        {x: -4.5, z: 1.75},
                        {x: -6, z: 0},
                        {x: -4.5, z: -1.75},
                        {x: -3, z: -4},

                        {x: -1.5, z: -1.75},
                        {x: 0, z: 0},
                        {x: 1.5, z: 1.75},

                        {x: 3, z: 4},
                        {x: 4.5, z: 1.75},
                        {x: 6, z: 0},
                        {x: 4.5, z: -1.75},
                        {x: 3, z: -4},
                        {x: 0, z: 0},
                    ],
                    target: penguinGroup.position
                },
                {
                    keys: [0.0, 0.14285714285714285, 0.2857142857142857, 0.42857142857142855, 0.5714285714285714, 0.7142857142857143, 0.8571428571428571, 1.0],                    
                    values: [
                        {y: 11 * Math.PI / 6,},
                        {y: 5 * Math.PI / 6,},
                        {y: 2 * Math.PI / 3,},
                        {y: 1 * Math.PI / 6,},
                        {y: 1 * Math.PI / 6,},
                        {y: 3 * Math.PI / 4,},
                        {y: 4 * Math.PI / 3,},
                        {y: 11 * Math.PI / 6,},
                    ],
                    target: penguinGroup.rotation
                },
                {
                    // 40 keys
                    keys: [0.0,
                        0.025,
                        0.05,
                        0.075,
                        0.1,
                        0.125,
                        0.15,
                        0.175,
                        0.2,
                        0.225,
                        0.25,
                        0.275,
                        0.3,
                        0.325,
                        0.35,
                        0.375,
                        0.4,
                        0.425,
                        0.45,
                        0.475,
                        0.5,
                        0.525,
                        0.55,
                        0.575,
                        0.6,
                        0.625,
                        0.65,
                        0.675,
                        0.7,
                        0.725,
                        0.75,
                        0.775,
                        0.8,
                        0.825,
                        0.85,
                        0.875,
                        0.9,
                        0.925,
                        0.95,
                        0.975,
                        1.0
                    ],
                    values: [{
                            z: 2 * Math.PI,
                        },
                        {
                            z: 11 * Math.PI / 6,
                        },
                        {
                            z: 2 * Math.PI,
                        },
                        {
                            z: 13 * Math.PI / 6,
                        },
                        {
                            z: 2 * Math.PI,
                        },
                        {
                            z: 11 * Math.PI / 6,
                        },
                        {
                            z: 2 * Math.PI,
                        },
                        {
                            z: 13 * Math.PI / 6,
                        },
                        {
                            z: 2 * Math.PI,
                        },
                        {
                            z: 11 * Math.PI / 6,
                        },
                        {
                            z: 2 * Math.PI,
                        },
                        {
                            z: 13 * Math.PI / 6,
                        },
                        {
                            z: 2 * Math.PI,
                        },
                        {
                            z: 11 * Math.PI / 6,
                        },
                        {
                            z: 2 * Math.PI,
                        },
                        {
                            z: 13 * Math.PI / 6,
                        },
                        {
                            z: 2 * Math.PI,
                        },
                        {
                            z: 11 * Math.PI / 6,
                        },
                        {
                            z: 2 * Math.PI,
                        },
                        {
                            z: 13 * Math.PI / 6,
                        },
                        {
                            z: 2 * Math.PI,
                        },
                        {
                            z: 11 * Math.PI / 6,
                        },
                        {
                            z: 2 * Math.PI,
                        },
                        {
                            z: 13 * Math.PI / 6,
                        },
                        {
                            z: 2 * Math.PI,
                        },
                        {
                            z: 11 * Math.PI / 6,
                        },
                        {
                            z: 2 * Math.PI,
                        },
                        {
                            z: 13 * Math.PI / 6,
                        },
                        {
                            z: 2 * Math.PI,
                        },
                        {
                            z: 11 * Math.PI / 6,
                        },
                        {
                            z: 2 * Math.PI,
                        },
                        {
                            z: 13 * Math.PI / 6,
                        },
                        {
                            z: 2 * Math.PI,
                        },
                        {
                            z: 11 * Math.PI / 6,
                        },
                        {
                            z: 2 * Math.PI,
                        },
                        {
                            z: 13 * Math.PI / 6,
                        },
                        {
                            z: 2 * Math.PI,
                        },
                        {
                            z: 11 * Math.PI / 6,
                        },
                        {
                            z: 2 * Math.PI,
                        },
                        {
                            z: 13 * Math.PI / 6,
                        },
                        {
                            z: 2 * Math.PI,
                        },
                    ],
                    target: penguin.rotation
                },
            ],
            loop: true,
            duration: duration * 1000,
            easing: TWEEN.Easing.Circular.InOut,
        });
        penguinAnimator.start();

    }
}