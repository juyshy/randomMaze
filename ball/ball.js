
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
    ball, ballWrappper, ballWrappper_helpers, obj3d;
var ballSize = 75;
var vx = 0,
    vz = 0,
    ax = 0,
    az = 0;
var rotaAngle ;
var bounce = -0.7;

var lineDir, rotLineDir;
init();
animate();

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
}


var left = -500, right = 500, top = -500, bottom = 500;

 

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

    ball = Ball();
 

    ballWrappper = new THREE.Object3D();
    ballWrappper_helpers = new THREE.Object3D();
    objects.push(ball);

    line.add(ballWrappper);
    ballWrappper.add(ball);
    ballWrappper.add(ballWrappper_helpers);


    var line_geometry2 = new THREE.Geometry();
    line_geometry2.vertices.push(new THREE.Vector3(0, 0, 0));
    line_geometry2.vertices.push(new THREE.Vector3(150, 0, 0));
    var line_material2 = new THREE.LineBasicMaterial({ color: 0xF05626 });
    var line_material3 = new THREE.LineBasicMaterial({ color: 0x50F626 });
    lineDir = new THREE.LineSegments(line_geometry2, line_material2);
    rotLineDir = new THREE.LineSegments(line_geometry2, line_material3);
    rotLineDir.rotation.y = lineDir.rotation.y + Math.PI / 2;
    ballWrappper_helpers.add(lineDir);
    ballWrappper_helpers.add(rotLineDir);
    particleLight = new THREE.Mesh(new THREE.SphereGeometry(4, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    scene.add(particleLight);

    obj3d = new THREE.Mesh(new THREE.SphereGeometry(4, 5, 5), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    obj3d.position.x = 0;
    obj3d.position.z = 100;
    ballWrappper.add(obj3d);

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
    line.rotation.z += (mouseX * 0.0005 - line.rotation.z) * 0.02;
    line.rotation.x -= (mouseY * 0.0005 + line.rotation.x) * 0.02;
    
    camera.lookAt(scene.position);
    //console.log("line.rotation.z " + line.rotation.z);


    var gravity = 9.8 * timedelta;
    ax = gravity * Math.sin(line.rotation.z);
    az = gravity * Math.sin(line.rotation.x);
    vx += az; //line.rotation.z * mult ;
    vz += ax; //line.rotation.x * mult ;

    var angle = Math.atan2(vx, vz);
    ballWrappper_helpers.rotation.y = angle + Math.PI;
    var rotaAxis = new THREE.Vector3();
    rotaAxis.x = - Math.sin(ballWrappper_helpers.rotation.y);
    rotaAxis.z = -Math.cos(ballWrappper_helpers.rotation.y);

    var speed = Math.sqrt(vx * vx + vz * vz);
    var friction = 1 - speed * 0.004;
    //var friction = 0.99;
    //vx *= friction;
    //vz *= friction;

    // ballWrappper.rotation.y = angle + Math.PI;
    ballWrappper.position.x -= vz;
    ballWrappper.position.z += vx;

    if (ballWrappper.position.x + ballSize > right) {
        ballWrappper.position.x = right - ballSize;
        vx *= bounce;
        vz *= 0.7;
    } else if (ballWrappper.position.x - ballSize < left) {
        ballWrappper.position.x = left + ballSize;
        vx *= bounce;
        vz *=  0.7;
    }
    if (ballWrappper.position.z + ballSize > bottom) {
        ballWrappper.position.z = bottom - ballSize;
        vz *= bounce;
        vx *=  0.7;
    } else if (ballWrappper.position.z - ballSize < top) {
        ballWrappper.position.z = top + ballSize;
        vz *= bounce;
        vx *=  0.7;
    }
    speed = Math.sqrt(vx * vx + vz * vz);
    var rotaspeed = speed / (2 * ballSize);
    //ball.rotation.z -= rotaspeed;
    rotaAxis.normalize();

    rotaAngle += rotaspeed;
    
    var quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle( rotaAxis, rotaAngle );

    //ball.setRotationFromQuaternion(quaternion)
    obj3d.position.z = rotaAxis.z * 100;
    obj3d.position.x = rotaAxis.x * 100;


    renderer.render(scene, camera);


}
