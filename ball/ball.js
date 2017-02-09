
if (!Detector.webgl) Detector.addGetWebGLMessage();

var container, stats;

var camera, scene, renderer;
var particleLight;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var objects = [], materials = [];
var line;
init();
animate();

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
}

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(0, 200, 800);

    scene = new THREE.Scene();

    // Grid

    var line_material = new THREE.LineBasicMaterial({ color: 0x909030 }),
        geometry = new THREE.Geometry(),
        floor = -75, step = 25;

    for (var i = 0; i <= 40; i++) {

        geometry.vertices.push(new THREE.Vector3(- 500, floor, i * step - 500));
        geometry.vertices.push(new THREE.Vector3(500, floor, i * step - 500));

        geometry.vertices.push(new THREE.Vector3(i * step - 500, floor, -500));
        geometry.vertices.push(new THREE.Vector3(i * step - 500, floor, 500));

    }

    line = new THREE.LineSegments(geometry, line_material);
    scene.add(line);

    // Materials
 
    materials.push(new THREE.MeshLambertMaterial({ color: 0xdddddd, shading: THREE.SmoothShading }));

 
    // Spheres geometry

    var geometry = new THREE.SphereGeometry(75, 22, 16);

    objects = [];

    //for ( var i = 0, l = materials.length; i < l; i ++ ) {

    addMesh(geometry, materials[0]);


    particleLight = new THREE.Mesh(new THREE.SphereGeometry(4, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    scene.add(particleLight);

    // Lights

    scene.add(new THREE.AmbientLight(0x555555));

    var directionalLight = new THREE.DirectionalLight( /*Math.random() * */ 0xffffff, 0.125);

    directionalLight.position.x = Math.random() - 0.5;
    directionalLight.position.y = Math.random() - 0.5;
    directionalLight.position.z = Math.random() - 0.5;

    directionalLight.position.normalize();

    scene.add(directionalLight);

    var pointLight = new THREE.PointLight(0xffffff, 1);
    particleLight.add(pointLight);
    particleLight.position.x = 140;
    particleLight.position.y = 200;
    particleLight.position.z = 300;


    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    //

    stats = new Stats();
    container.appendChild(stats.dom);

    //
     document.addEventListener( 'mousemove', onDocumentMouseMove, false );

    window.addEventListener('resize', onWindowResize, false);
   
}

function addMesh(geometry, material) {

    var mesh = new THREE.Mesh(geometry, material);

    mesh.position.x = 0; 
    mesh.position.z = 0; 
 
    objects.push(mesh);

    scene.add(mesh);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}
 
//

function animate() {

    requestAnimationFrame(animate);

    render();
    stats.update();

}

function render() {

    var timer = 0.0001 * Date.now();

    camera.lookAt(scene.position);

    line.rotation.z += ( mouseX * 0.0005 - line.rotation.z ) * 0.02;
    line.rotation.x += ( mouseY * 0.0005 - line.rotation.x ) * 0.02;

    renderer.render(scene, camera);

}
