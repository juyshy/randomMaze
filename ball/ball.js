
if (!Detector.webgl) Detector.addGetWebGLMessage();

var container, stats;

var camera, scene, renderer;
var particleLight;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var objects = [], materials = [];
var prevTime = 0.001 * Date.now();
var geometry;
var line,
    ball, ballWrappper, obj3d;
var ballSize = 75;
var vx = 0,
    vz = 0,
    ax = 0,
    az = 0;

var lineDir, rotLineDir;
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
    camera.position.set(0, 500, 800);

    scene = new THREE.Scene();

    // Grid

    var line_material = new THREE.LineBasicMaterial({ color: 0x909030 }),

        floor = -75, step = 25;
    geometry = new THREE.Geometry();
    for (var i = 0; i <= 40; i++) {

        geometry.vertices.push(new THREE.Vector3(- 500, floor, i * step - 500));
        geometry.vertices.push(new THREE.Vector3(500, floor, i * step - 500));

        geometry.vertices.push(new THREE.Vector3(i * step - 500, floor, -500));
        geometry.vertices.push(new THREE.Vector3(i * step - 500, floor, 500));

    }

    line = new THREE.LineSegments(geometry, line_material);


    scene.add(line);

    // Materials

    var texture = new THREE.Texture(generateTexture());
    texture.needsUpdate = true;

    materials.push(new THREE.MeshLambertMaterial({ map: texture, transparent: true }));
    materials.push(new THREE.MeshLambertMaterial({ color: 0xdddddd, shading: THREE.FlatShading }));
    materials.push(new THREE.MeshPhongMaterial({ color: 0xdddddd, specular: 0x009900, shininess: 30, shading: THREE.FlatShading }));
    materials.push(new THREE.MeshNormalMaterial());
    materials.push(new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, blending: THREE.AdditiveBlending }));
    //materials.push( new THREE.MeshBasicMaterial( { color: 0xff0000, blending: THREE.SubtractiveBlending } ) );

    materials.push(new THREE.MeshLambertMaterial({ color: 0xdddddd, shading: THREE.SmoothShading }));
    materials.push(new THREE.MeshPhongMaterial({ color: 0xdddddd, specular: 0x009900, shininess: 30, shading: THREE.SmoothShading, map: texture, transparent: true }));
    materials.push(new THREE.MeshNormalMaterial({ shading: THREE.SmoothShading }));
    materials.push(new THREE.MeshBasicMaterial({ color: 0xffaa00, wireframe: true }));

    materials.push(new THREE.MeshDepthMaterial());

    materials.push(new THREE.MeshLambertMaterial({ color: 0x666666, emissive: 0xff0000, shading: THREE.SmoothShading }));
    materials.push(new THREE.MeshPhongMaterial({ color: 0x000000, specular: 0x666666, emissive: 0xff0000, shininess: 10, shading: THREE.SmoothShading, opacity: 0.9, transparent: true }));

    materials.push(new THREE.MeshBasicMaterial({ map: texture, transparent: true }));

    // Spheres geometry

    var geometry = new THREE.SphereGeometry(130, 32, 16);

    for (var i = 0, l = geometry.faces.length; i < l; i++) {

        var face = geometry.faces[i];
        face.materialIndex = Math.floor(Math.random() * materials.length);

    }

    geometry.sortFacesByMaterialIndex();

    // Spheres geometry

    var geometry = new THREE.SphereGeometry(ballSize, 22, 16);

    objects = [];

    //for ( var i = 0, l = materials.length; i < l; i ++ ) {


    ball = new THREE.Mesh(geometry, materials[0]);

    ball.position.x = 0;
    ball.position.z = 0;

    ballWrappper = new THREE.Object3D();
    objects.push(ball);

    line.add(ballWrappper);
    ballWrappper.add(ball);

    var line_geometry2 = new THREE.Geometry();
    line_geometry2.vertices.push(new THREE.Vector3(0, 0, 0));
    line_geometry2.vertices.push(new THREE.Vector3(150, 0, 0));
    var line_material2 = new THREE.LineBasicMaterial({ color: 0xF05626 });
    var line_material3 = new THREE.LineBasicMaterial({ color: 0x50F626 });
    lineDir = new THREE.LineSegments(line_geometry2, line_material2);
    rotLineDir = new THREE.LineSegments(line_geometry2, line_material3);
    rotLineDir.rotation.y = lineDir.rotation.y + Math.PI / 2;
    // ballWrappper.add(lineDir);
    //ballWrappper.add(rotLineDir);
    particleLight = new THREE.Mesh(new THREE.SphereGeometry(4, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    scene.add(particleLight);

    obj3d = new THREE.Mesh(new THREE.SphereGeometry(4, 5, 5), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    obj3d.position.x = 0;
    obj3d.position.z = 100;
    //ballWrappper.add(obj3d);

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
    particleLight.position.y = 700;
    particleLight.position.z = 300;


    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    //

    stats = new Stats();
    container.appendChild(stats.dom);

    //
    document.addEventListener('mousemove', onDocumentMouseMove, false);



}

function generateTexture() {

    var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;

    var context = canvas.getContext('2d');
    var image = context.getImageData(0, 0, 256, 256);

    var x = 0, y = 0;

    for (var i = 0, j = 0, l = image.data.length; i < l; i += 4, j++) {

        x = j % 256;
        y = x == 0 ? y + 1 : y;

        image.data[i] = 255;
        image.data[i + 1] = 255;
        image.data[i + 2] = 255;
        image.data[i + 3] = Math.floor(x ^ y);

    }

    context.putImageData(image, 0, 0);

    return canvas;

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
var counter = 0, lastsec;
function render() {

    var timer = 0.001 * Date.now();
    //console.log(timer);
    var timedelta = timer - prevTime;
    prevTime = timer;
    camera.lookAt(scene.position);

    line.rotation.z += (mouseX * 0.0005 - line.rotation.z) * 0.02;
    line.rotation.x += (mouseY * 0.0005 - line.rotation.x) * 0.02;
    //console.log("line.rotation.z " + line.rotation.z);
    var gravity = 9.8 * timedelta;

    ax = gravity * Math.sin(line.rotation.z);
    az = gravity * Math.sin(line.rotation.x);
    vx += az; //line.rotation.z * mult ;
    vz += ax; //line.rotation.x * mult ;

    var angle = Math.atan2(vx, vz);
    ballWrappper.rotation.y = angle + Math.PI;

    var speed = Math.sqrt(vx * vx + vz * vz);
    var friction = 1 - speed * 0.004;
    //var friction = 0.99;
    vx *= friction;
    vz *= friction;
    speed = Math.sqrt(vx * vx + vz * vz);
    var rotaspeed = speed / (2 * ballSize);
    ball.rotation.z -= rotaspeed;

    ballWrappper.position.x -= vz;
    ballWrappper.position.z += vx;

    renderer.render(scene, camera);

}
