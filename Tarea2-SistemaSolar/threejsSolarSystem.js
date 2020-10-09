let renderer = null,
    scene = null,
    camera = null,
    astrosObjects = [],
    solarSystem = null,
    orbitController = null

let duration = 5000; // ms
let currentTime = Date.now();

function animate() {
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;


    // Iterate through each planet group and rotate them in y axis
    astrosObjects.forEach(astroObject => {
        astroObject.astroGroup.rotation.y += Math.PI * astroObject.groupRotationSpeed * fract;
        astroObject.astro.rotation.y += Math.PI * astroObject.groupRotationSpeed * fract;

        //Noisemap para el sol
        if (astroObject.uniforms) {
            astroObject.uniforms.time.value += fract;

        }

        //Rotacion del anillo
        if (astroObject.ring) {
            astroObject.ring.rotation.z -= Math.PI * astroObject.groupRotationSpeed * fract;
        }

        //Rotación de la lista de satelites
        astroObject.satelites.forEach(satelite => {
            satelite.astroGroup.rotation.y -= Math.PI * satelite.groupRotationSpeed * fract;
        });

    });

}

function run() {
    requestAnimationFrame(function () {
        run();
    });

    // Render the scene
    renderer.render(scene, camera);

    //Orbit Controller de camara
    orbitController.update();

    // Spin the planets and satelites for next frame
    animate();
}

function createScene(canvas) {
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Loader de Background
    const loader = new THREE.TextureLoader();
    const bgTexture = loader.load('./images/planetarium_background.jpg');
    scene.background = bgTexture;

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 1, 4000);
    camera.rotation.x -= .30;
    camera.position.y = 100;
    camera.position.z = 300;
    scene.add(camera);

    //create the orbit controller
    orbitController = new THREE.OrbitControls(camera, renderer.domElement);

    // Add a directional light to show off the objects
    let light = new THREE.PointLight(0xffffff, 1.0, 100000);
    // Position the light out from the scene, pointing at the origin
    light.position.set(0, 0, 0);
    // light.target.position.set(0, -2, 0);
    scene.add(light);

    // This light globally illuminates all objects in the scene equally.
    let ambientLight = new THREE.AmbientLight(0xffccaa, 0.1);
    scene.add(ambientLight);

    //creation of the 3d object that will contain the system
    solarSystem = new THREE.Object3D;
    scene.add(solarSystem);

    //Funcion que agrega planetas
    addAstros();

    // Add button handlers to add planets, satelites and reset scene
    addButtonHandlers(canvas, solarSystem);
}

//Class of Planets that have a list  of satelites (moons), radius of planet, position, texture, orbit, etc
class Astro {
    constructor({
        radius = 1,
        textureUrl = "",
        x = 0,
        y = 0,
        z = 0,
        groupRotationSpeed = 0,
        giveOrbit = false,
        orbitInnerRadius = 0,
        includeNoise = false
    } = {
        radius: 1,
        textureUrl: "",
        x: 0,
        y: 0,
        z: 0,
        groupRotationSpeed: 0,
        giveOrbit: false,
        orbitInnerRadius: 0,
        includeNoise: false
    }) {

        this.radius = radius
        this.giveOrbit = giveOrbit;
        this.orbitInnerRadius = orbitInnerRadius;

        this.geometry = new THREE.SphereGeometry(this.radius, 30, 30);

        if (includeNoise) {
            let COLORMAP = new THREE.TextureLoader().load(textureUrl);
            let NOISEMAP = new THREE.TextureLoader().load("./images/cloud.png");

            this.uniforms = {
                time: {
                    type: "f",
                    value: 0.5
                },
                noiseTexture: {
                    type: "t",
                    value: NOISEMAP
                },
                glowTexture: {
                    type: "t",
                    value: COLORMAP
                }
            };

            this.uniforms.noiseTexture.value.wrapS = this.uniforms.noiseTexture.value.wrapT = THREE.RepeatWrapping;
            this.uniforms.glowTexture.value.wrapS = this.uniforms.glowTexture.value.wrapT = THREE.RepeatWrapping;

            this.material = new THREE.ShaderMaterial({
                uniforms: this.uniforms,
                vertexShader: document.getElementById('vertexShader').textContent,
                fragmentShader: document.getElementById('fragmentShader').textContent,
                transparent: false,
            });
        } else {
            this.texture = new THREE.TextureLoader().load(textureUrl);
            this.material = new THREE.MeshPhongMaterial({
                map: this.texture
            });
            this.uniforms = null;
        }

        this.astroGroup = new THREE.Object3D;
        this.astro = new THREE.Mesh(this.geometry, this.material);

        this.x = x;
        this.y = y;
        this.z = z;
        this.groupRotationSpeed = groupRotationSpeed;
        this.ring = null;
        this.satelites = [];
    }

    //Function in charge of adding planets to the system
    addAstro() {
        this.astroGroup.add(this.astro);
        this.astroGroup.position.set(0, 0, 0);
        this.astro.position.set(this.x, this.y, this.z);
        solarSystem.add(this.astroGroup)
        this.astroGroup.updateMatrixWorld();

        if (this.giveOrbit) {
            this.addOrbit();
        }
    }

    // Function in charge of adding the orbit to the planet
    addOrbit() {
        let ringGeometry = new THREE.RingGeometry(this.orbitInnerRadius, this.orbitInnerRadius + .2, 100);
        let ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide
        });
        this.orbit = new THREE.Mesh(ringGeometry, ringMaterial);
        this.astroGroup.add(this.orbit);
        this.orbit.position.set(0, 0, 0);
        this.orbit.rotation.set(11, 0, 0);
    }

    //Function of adding the ring to Saturn
    addRing() {
        let ringTexture = new THREE.TextureLoader().load("./images/saturn_ring.png");
        let ringGeometry = new THREE.RingGeometry(13, 20, 64);
        let ringMaterial = new THREE.MeshBasicMaterial({
            map: ringTexture,
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true
        });
        this.ring = new THREE.Mesh(ringGeometry, ringMaterial);
        this.astroGroup.add(this.ring);
        this.ring.position.set(160, 0, 0);
        this.ring.rotation.set(2, 0, 0);
    }

    // Function in charge of adding satelites (moons) to each planet
    addSatelite(satelite) {
        satelite.astroGroup.add(satelite.astro)
        satelite.astroGroup.position.set(this.x, this.y, this.z)
        satelite.astro.position.set(satelite.x, satelite.y, satelite.z)

        this.astroGroup.add(satelite.astroGroup)
        this.satelites.push(satelite)
        satelite.astroGroup.updateMatrixWorld();
    }

    //Function that add the bump to the moons or planets
    addBump(mapUrl, bumpMapUrl) {
        // Create a textre phong material for the cube
        // First, create the texture map
        this.texture = new THREE.TextureLoader().load(mapUrl);
        this.bumpMap = new THREE.TextureLoader().load(bumpMapUrl);

        this.material = new THREE.MeshPhongMaterial({
            map: this.texture,
            bumpMap: this.bumpMap,
            bumpScale: .7
        });

        this.astro.material = this.material
    }

    // Function that add the normal to the Earth
    addNormal() {
        let mapUrl = "./images/earth_atmos_2048.jpg";
        let normalMapUrl = "./images/earth_normal_2048.jpg";
        let specularMapUrl = "./images/earth_specular_spec_1k.jpg";

        let map = new THREE.TextureLoader().load(mapUrl);
        let normalMap = new THREE.TextureLoader().load(normalMapUrl);
        let specularMap = new THREE.TextureLoader().load(specularMapUrl);

        this.material = new THREE.MeshPhongMaterial({
            map: map,
            normalMap: normalMap,
            specularMap: specularMap
        });

        this.astro.material = this.material
    }
}



function addAstros() {
    // Creating the Sun
    let sun = new Astro({
        radius: 20,
        textureUrl: "./images/sun.jpg",
        groupRotationSpeed: 0.5,
        includeNoise: true
    });
    // Add and push of the Sun to the scene
    sun.addAstro();
    astrosObjects.push(sun)

    // Creating Mercury
    let mercury = new Astro({
        radius: 3,
        textureUrl: "./images/mercury.jpg",
        x: 25,
        groupRotationSpeed: 5,
        giveOrbit: true,
        orbitInnerRadius: 25
    });
    // Add and push of Mercury and adding the bump to the planet
    mercury.addAstro();
    mercury.addBump("./images/mercury.jpg", "./images/moon_bump.jpg")
    astrosObjects.push(mercury)

    // Creating Venus
    let venus = new Astro({
        radius: 6,
        textureUrl: "./images/venus.jpg",
        z: -35,
        groupRotationSpeed: 4.5,
        giveOrbit: true,
        orbitInnerRadius: 35
    });
    // Add and push of Venus and adding the bump to the planet
    venus.addAstro();
    venus.addBump("./images/venus.jpg", "./images/moon_bump.jpg")
    astrosObjects.push(venus)

    // Creating Earth
    let earth = new Astro({
        radius: 6,
        textureUrl: "./images/earth.jpg",
        x: 50,
        groupRotationSpeed: 3.5,
        giveOrbit: true,
        orbitInnerRadius: 50
    });
    // Add and push of Earth and adding the bump to the moon of the planet
    earth.addAstro();
    //Add the normal to the Earth
    earth.addNormal();
    astrosObjects.push(earth)
    let moon = new Astro({
        radius: 1,
        textureUrl: "./images/moon.jpg",
        x: 10,
        y: 3,
        groupRotationSpeed: (Math.random() * 10) + 1,
        giveOrbit: true
    });
    moon.addBump("./images/moon.jpg", "./images/moon_bump.jpg")
    //Add the satelite (moon) to the Earth
    earth.addSatelite(moon);

    //Creating Mars
    let mars = new Astro({
        radius: 4.5,
        textureUrl: "./images/mars.jpg",
        x: -65,
        groupRotationSpeed: 2.8,
        giveOrbit: true,
        orbitInnerRadius: 65
    });
    mars.addAstro();
    //Adding the bump to Mars
    mars.addBump("./images/mars.jpg", "./images/moon_bump.jpg")
    astrosObjects.push(mars)
    //Add of Satelites to the planet
    for (let index = 0; index < 2; index++) {
        moon = new Astro({
            radius: 1,
            textureUrl: "./images/moon.jpg",
            x: getRndInteger(5, 3),
            y: getRndInteger(5, 3),
            z: getRndInteger(5, 3),
            groupRotationSpeed: (Math.random() * 10) + 1
        });
        //Add bump to the moon
        moon.addBump("./images/moon.jpg", "./images/moon_bump.jpg")
        mars.addSatelite(moon);
    }

    //Creation of asteroids
    let asteroid = null;
    for (let index = 0; index < 100; index++) {
        asteroid = new Astro({
            radius: (Math.random()) + 1,
            textureUrl: "./images/moon.jpg",
            x: getRndInteger(80, 50),
            z: getRndInteger(80, 50),
            groupRotationSpeed: (Math.random() * 5) + 1,
            giveOrbit: false,
        });
        asteroid.addAstro();
        asteroid.addBump("./images/moon.jpg", "./images/moon_bump.jpg")
        astrosObjects.push(asteroid)
    }

    //Creation of Jupiter
    let jupiter = new Astro({
        radius: 15,
        textureUrl: "./images/jupiter.jpg",
        z: 135,
        groupRotationSpeed: 2,
        giveOrbit: true,
        orbitInnerRadius: 120
    });
    jupiter.addAstro();
    astrosObjects.push(jupiter)
    for (let index = 0; index < 40; index++) {
        moon = new Astro({
            radius: 1,
            textureUrl: "./images/moon.jpg",
            x: getRndInteger(15, 10),
            y: getRndInteger(15, 10),
            z: getRndInteger(15, 10),
            groupRotationSpeed: (Math.random() * 10) + 1,
        });
        moon.addBump("./images/moon.jpg", "./images/moon_bump.jpg")
        jupiter.addSatelite(moon);
    }

    //Creation of Saturn
    let saturn = new Astro({
        radius: 9,
        textureUrl: "./images/saturn.jpg",
        x: 160,
        groupRotationSpeed: 1.5,
        giveOrbit: true,
        orbitInnerRadius: 160
    });
    saturn.addAstro();
    //Add the ring to the planet
    saturn.addRing();
    astrosObjects.push(saturn)
    //Add moons to Saturn
    for (let index = 0; index < 25; index++) {
        moon = new Astro({
            radius: 1,
            textureUrl: "./images/moon.jpg",
            x: getRndInteger(11, 8),
            y: getRndInteger(11, 8),
            z: getRndInteger(11, 8),
            groupRotationSpeed: (Math.random() * 10) + 1
        });
        //Add bump to the moons
        moon.addBump("./images/moon.jpg", "./images/moon_bump.jpg")
        saturn.addSatelite(moon);
    }

    //Creation of Uranus
    let uranus = new Astro({
        radius: 6,
        textureUrl: "./images/uranus.jpg",
        z: 185,
        groupRotationSpeed: 1.2,
        giveOrbit: true,
        orbitInnerRadius: 185
    });
    uranus.addAstro();
    astrosObjects.push(uranus)
    //Add the moons to Uranus
    for (let index = 0; index < 13; index++) {
        moon = new Astro({
            radius: 1,
            textureUrl: "./images/moon.jpg",
            x: getRndInteger(7, 5),
            y: getRndInteger(7, 5),
            z: getRndInteger(7, 5),
            groupRotationSpeed: (Math.random() * 10) + 1
        });
        //Add bump to the moons
        moon.addBump("./images/moon.jpg", "./images/moon_bump.jpg")
        uranus.addSatelite(moon);
    }

    //Creation of Neptune
    let neptune = new Astro({
        radius: 6,
        textureUrl: "./images/neptune.jpg",
        z: -200,
        groupRotationSpeed: .8,
        giveOrbit: true,
        orbitInnerRadius: 200
    });
    neptune.addAstro();
    astrosObjects.push(neptune)
    //Add moons
    for (let index = 0; index < 7; index++) {
        moon = new Astro({
            radius: 1,
            textureUrl: "./images/moon.jpg",
            x: getRndInteger(7, 5),
            y: getRndInteger(7, 5),
            z: getRndInteger(7, 5),
            groupRotationSpeed: (Math.random() * 10) + 1
        });
        moon.addBump("./images/moon.jpg", "./images/moon_bump.jpg")
        neptune.addSatelite(moon);
    }

    //Creation of Pluto
    let pluto = new Astro({
        radius: 2,
        textureUrl: "./images/pluto.jpg",
        x: 210,
        groupRotationSpeed: 1,
        giveOrbit: true,
        orbitInnerRadius: 210
    });
    pluto.addAstro();
    //Add bump to Pluto
    mercury.addBump("./images/pluto.jpg", "./images/moon_bump.jpg")
    astrosObjects.push(pluto)
}

//Function that crateas a random number
function getRndInteger(max, min) {
    let plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    return (Math.floor(Math.random() * (max - min)) + min) * plusOrMinus;
}