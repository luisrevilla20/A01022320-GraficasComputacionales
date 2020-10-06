let renderer = null,
scene = null,
camera = null,
astrosObjects = [],
solarSystem = null

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


        astroObject.satelites.forEach(satelite => {
            satelite.astroGroup.rotation.y += Math.PI * satelite.groupRotationSpeed * fract;
            // satelite.astro.rotation.y += Math.PI * satelite.groupRotationSpeed * fract;

        });

    });

}

function run() {
    requestAnimationFrame(function () {
        run();
    });

    // Render the scene
    renderer.render(scene, camera);

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

    const loader = new THREE.TextureLoader();
    const bgTexture = loader.load('./images/planetarium_background.jpg');
    scene.background = bgTexture;

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 1, 4000);
    camera.rotation.x -= .30;
    camera.position.y = 100;
    camera.position.z = 300;
    scene.add(camera);

    // Add a directional light to show off the objects
    let light = new THREE.DirectionalLight(0xffffff, 1.0);
    // let light = new THREE.DirectionalLight( "rgb(255, 255, 100)", 1.5);

    // Position the light out from the scene, pointing at the origin
    light.position.set(-.5, .2, 1);
    light.target.position.set(0, -2, 0);
    scene.add(light);
    // This light globally illuminates all objects in the scene equally.
    // Cannot cast shadows
    let ambientLight = new THREE.AmbientLight(0xffccaa, 0.2);
    scene.add(ambientLight);

    solarSystem = new THREE.Object3D;
    scene.add(solarSystem);

    addAstros();
    
    // Add button handlers to add planets, satelites and reset scene
    addButtonHandlers(canvas, solarSystem);
}

class Astro{
    constructor({radius=1, textureUrl="", x=0, y=0, z=0, groupRotationSpeed=0}=
                {radius:1, textureUrl:"", x:0, y:0, z:0, groupRotationSpeed:0}){

        this.geometry = new THREE.SphereGeometry(radius, 30, 30);

        this.texture = new THREE.TextureLoader().load(textureUrl);
        this.material = new THREE.MeshPhongMaterial({
            map: this.texture
        });
        this.astroGroup = new THREE.Object3D;
        this.astro = new THREE.Mesh(this.geometry, this.material);
        this.x = x;
        this.y = y;
        this.z = z;
        this.groupRotationSpeed = groupRotationSpeed;
        this.satelites = [];
    }
    addAstro(){
        this.astroGroup.add(this.astro);
        this.astroGroup.position.set(0, 0, 0);
        this.astro.position.set(this.x, this.y, this.z);
        solarSystem.add(this.astroGroup)
        this.astroGroup.updateMatrixWorld();
    }

    // Satelite is an instance of Astro
    addSatelite(satelite){
        satelite.astroGroup.add(satelite.astro)
        satelite.astroGroup.position.set(this.x, this.y, this.z)
        satelite.astro.position.set(satelite.x, satelite.y, satelite.z)

        this.astroGroup.add(satelite.astroGroup)

        //console.log(satelite.astroGroup.position);
        //console.log(this.astro.position);
        
        this.satelites.push(satelite)

        satelite.astroGroup.updateMatrixWorld();
        // satelite.groupRotationSpeed = this.groupRotationSpeed;
        // console.log(satelite.astroGroup.position);
        // console.log(satelite.astro.position);
        // console.log(this.astro.position);
        // console.log(this.astroGroup.position);
    }
}

function addAstros(){
    let sun = new Astro({radius:20, textureUrl:"./images/sun.jpg", groupRotationSpeed:0.5});
    sun.addAstro();
    astrosObjects.push(sun)

    let mercury = new Astro({radius:3, textureUrl:"./images/mercury.jpg", x:25, groupRotationSpeed:5});
    mercury.addAstro();
    astrosObjects.push(mercury)

    let venus = new Astro({radius:6, textureUrl:"./images/venus.jpg", z:-35, groupRotationSpeed:4.5});
    venus.addAstro();
    astrosObjects.push(venus)

    let earth = new Astro({radius:6, textureUrl:"./images/earth.jpg", x:50, groupRotationSpeed:2});
    earth.addAstro();
    astrosObjects.push(earth)
    let moon = new Astro({radius:1, textureUrl:"./images/moon.jpg", x:10, y:3, groupRotationSpeed:5});
    earth.addSatelite(moon);

    let mars = new Astro({radius:4.5, textureUrl:"./images/mars.jpg", x:-65, groupRotationSpeed:2.8});
    mars.addAstro();
    astrosObjects.push(mars)

    let jupiter = new Astro({radius:15, textureUrl:"./images/jupiter.jpg", z:90, groupRotationSpeed:2});
    jupiter.addAstro();
    astrosObjects.push(jupiter)
    for (let index = 0; index < 7; index++) {
        moon = new Astro({radius:2, textureUrl:"./images/moon.jpg", x:getRndInteger(), y:getRndInteger(), z:getRndInteger(), groupRotationSpeed:5});
        jupiter.addSatelite(moon);
    }

    let saturn = new Astro({radius:9, textureUrl:"./images/saturn.jpg", x:120, groupRotationSpeed:1.5});
    saturn.addAstro();
    astrosObjects.push(saturn)

    let uranus = new Astro({radius:6, textureUrl:"./images/uranus.jpg", z:140, groupRotationSpeed:1.2});
    uranus.addAstro();
    astrosObjects.push(uranus)

    let neptune = new Astro({radius:6, textureUrl:"./images/neptune.jpg", z:-170, groupRotationSpeed:.8});
    neptune.addAstro();
    astrosObjects.push(neptune)

    let pluto = new Astro({radius:1, textureUrl:"./images/pluto.jpg", x:180, groupRotationSpeed:1});
    pluto.addAstro();
    astrosObjects.push(pluto)
}

function getRndInteger() {
    let plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    return (Math.floor(Math.random() * (15 - 10) ) + 10) * plusOrMinus;
  }