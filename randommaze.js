
/*
  
applying algorithms from here
http://www.physics.buffalo.edu/phy411-506/topic3/topic3-lec1.pdf

http://www.physics.buffalo.edu/phy411-506/topic3/sawalk.cpp
 
seeking random empty points, beside the  path
 
*/

/*jslint browser: true*/
/*global alert, THREE, container, ColorKeywords,geometry*/

var mazeSize = 20,
    startX = 0,
    startY = 0,
    gridDim = 20,
    s = {},
    freePoints = [],
    paths = [],
    colors = [];
var rightEdge = mazeSize * gridDim / 2,
    leftEdge = -mazeSize * gridDim / 2,
    bottomEdge = mazeSize * gridDim / 2,
    topEdge = -mazeSize * gridDim / 2;
var height = 15;
var n_steps,
    freePoints,
    beginningPoint;
var boudaries = { xLeft: 0, xRight: mazeSize, yTop: 0, yBottom: mazeSize };
var ball;
var mouseX = 0, mouseY = 0;
var renderer = null,
    scene = null,
    camera = null,
    //terra = null,
    animating = false;
var prevTime = 0.001 * Date.now();
//var kdobj;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var vx = 0,
    vz = 0,
    ax = 0,
    az = 0;
var rotaAngle;
var allFreePoints = [];
var prevSec = 0;
var bounce = -0.7;


function setUpRender() {

    var container = document.getElementById("container");
    renderer = new THREE.WebGLRenderer({ antialias: true });
    // console.log("container.offsetWidth " + container.offsetWidth);
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);
    scene = new THREE.Scene();
}

function setCamera() {
    camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 1, 4000);
    camera.position.set(-2, 130, 80);
    camera.lookAt(new THREE.Vector3(0, -10, 0));
}

function letThereBeLight() {
    var light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(0, 5, 60);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff));
}


for (var prop in ColorKeywords) {

    colors.push(ColorKeywords[prop]);
}


function freeInTheBeginning() {
    var freePointsArray = [];
    for (var i = boudaries.xLeft; i < boudaries.xRight; ++i) {
        for (var j = boudaries.yTop; j < boudaries.yBottom; ++j) {
            freePointsArray.push({ x: i, y: j });
        }
    }
    return freePointsArray;
}


function removeFromFree(point) {
    for (var i = 0; i < freePoints.length; ++i) {
        if (point.x == freePoints[i].x && point.y == freePoints[i].y) {
            freePoints.splice(i, 1);
            break;
        }
    }
}

function isFree(x, y, freePoints) {
    var valid = false;
    // tarkastetaan onko uusi satunnainen point jo varattu
    for (var i = 0; i < freePoints.length; i++) {

        if (x == freePoints[i].x && y == freePoints[i].y) {
            valid = true;
            break; // jos on niin keskeytetään tarkistussilmukka
        }
    }
    return valid;
}


function possibleNewPoints(x, y, freePoints) {
    var possiblePoints = [];
    var right = x + 1; // step East
    if (isFree(right, y, freePoints)) possiblePoints.push({ x: right, y: y, "dir": "right" });
    var down = y + 1; // step North
    if (isFree(x, down, freePoints)) possiblePoints.push({ x: x, y: down, "dir": "down" });
    var left = x - 1; // step West
    if (isFree(left, y, freePoints)) possiblePoints.push({ x: left, y: y, "dir": "left" });
    var up = y - 1; // step South
    if (isFree(x, up, freePoints)) possiblePoints.push({ x: x, y: up, "dir": "up" });
    return possiblePoints;
}


function lineInBetween(point1, point2) {

    var foundPoints = 0;
    /* 	var pointtiedot= haeSubPath(point1); */
    for (var j = 0; j < paths.length; j++) {
        var subpath = paths[j];
        foundPoints = 0;
        for (var i = 0; i < subpath.length; i++) {
            if (i < subpath.length - 1 && (point1.x == subpath[i].x && point1.y == subpath[i].y) && (point2.x == subpath[i + 1].x && point2.y == subpath[i + 1].y)) {
                foundPoints += 1;
                return true;

            }
            if (i > 0 && (point1.x == subpath[i].x && point1.y == subpath[i].y) && (point2.x == subpath[i - 1].x && point2.y == subpath[i - 1].y)) {
                foundPoints += 1;
                return true;

            }
        }
        //console.log("foundPoints " + foundPoints);

    }
    //console.dir("pointtiedot " + pointtiedot.subpindx +" " +  pointtiedot.pindx);
    return false;

}

// sokkelo:

function drawMaze() {


    //var offset = gridDim / 2;

    //this.material = new THREE.LineBasicMaterial({ color: 0xff0fff });
    this.material = new THREE.MeshPhongMaterial({ color: 0xaa0fff, specular: 0xaaaacc, side: THREE.DoubleSide });   // , ambient : 0x9999ff

    this.geometry = new THREE.Geometry();

    this.geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    this.geometry.vertices.push(new THREE.Vector3(mazeSize * gridDim, 0, 0));
    this.geometry.vertices.push(new THREE.Vector3(0, 0, height));
    this.geometry.vertices.push(new THREE.Vector3(mazeSize * gridDim, 0, height));
    geometry.faces.push(new THREE.Face3(0, 1, 2));
    geometry.faces.push(new THREE.Face3(1, 2, 3));

    this.geometry.vertices.push(new THREE.Vector3(mazeSize * gridDim, 0, 0));
    this.geometry.vertices.push(new THREE.Vector3(mazeSize * gridDim, (mazeSize - 1) * gridDim, 0));
    this.geometry.vertices.push(new THREE.Vector3(mazeSize * gridDim, 0, height));
    this.geometry.vertices.push(new THREE.Vector3(mazeSize * gridDim, (mazeSize - 1) * gridDim, height));
    geometry.faces.push(new THREE.Face3(4 + 0, 4 + 1, 4 + 2));
    geometry.faces.push(new THREE.Face3(4 + 1, 4 + 2, 4 + 3));

    this.geometry.vertices.push(new THREE.Vector3(mazeSize * gridDim, mazeSize * gridDim, 0));
    this.geometry.vertices.push(new THREE.Vector3(0, mazeSize * gridDim, 0));
    this.geometry.vertices.push(new THREE.Vector3(mazeSize * gridDim, mazeSize * gridDim, height));
    this.geometry.vertices.push(new THREE.Vector3(0, mazeSize * gridDim, height));
    geometry.faces.push(new THREE.Face3(8 + 0, 8 + 1, 8 + 2));
    geometry.faces.push(new THREE.Face3(8 + 1, 8 + 2, 8 + 3));

    this.geometry.vertices.push(new THREE.Vector3(0, mazeSize * gridDim, 0));
    this.geometry.vertices.push(new THREE.Vector3(0, gridDim, 0));
    this.geometry.vertices.push(new THREE.Vector3(0, mazeSize * gridDim, height));
    this.geometry.vertices.push(new THREE.Vector3(0, gridDim, height));

    geometry.faces.push(new THREE.Face3(12 + 0, 12 + 1, 12 + 2));
    geometry.faces.push(new THREE.Face3(12 + 1, 12 + 2, 12 + 3));

    var segments = 0;

    for (var row = 0; row < mazeSize - 1; row++) {
        for (var i = 0; i < mazeSize; i++) {

            var point1 = { x: i, y: row };
            var point2 = { x: i, y: row + 1 };
            //console.log("i " + i);
            if (!lineInBetween(point1, point2)) {

                segments += 1;
                this.geometry.vertices.push(new THREE.Vector3(i * gridDim, (row + 1) * gridDim, 0));
                this.geometry.vertices.push(new THREE.Vector3((i + 1) * gridDim, (row + 1) * gridDim, 0));
                this.geometry.vertices.push(new THREE.Vector3(i * gridDim, (row + 1) * gridDim, height));
                this.geometry.vertices.push(new THREE.Vector3((i + 1) * gridDim, (row + 1) * gridDim, height));
                geometry.faces.push(new THREE.Face3(segments * 4 + 12 + 0, segments * 4 + 12 + 1, segments * 4 + 12 + 2));
                geometry.faces.push(new THREE.Face3(segments * 4 + 12 + 1, segments * 4 + 12 + 2, segments * 4 + 12 + 3));

            }

            point1 = { x: row, y: i };
            point2 = { x: row + 1, y: i };
            //console.log("i " + i);
            if (!lineInBetween(point1, point2)) {

                segments += 1;
                this.geometry.vertices.push(new THREE.Vector3((row + 1) * gridDim, i * gridDim, 0));
                this.geometry.vertices.push(new THREE.Vector3((row + 1) * gridDim, (i + 1) * gridDim, 0));
                this.geometry.vertices.push(new THREE.Vector3((row + 1) * gridDim, i * gridDim, height));
                this.geometry.vertices.push(new THREE.Vector3((row + 1) * gridDim, (i + 1) * gridDim, height));
                geometry.faces.push(new THREE.Face3(segments * 4 + 12 + 0, segments * 4 + 12 + 1, segments * 4 + 12 + 2));
                geometry.faces.push(new THREE.Face3(segments * 4 + 12 + 1, segments * 4 + 12 + 2, segments * 4 + 12 + 3));

            }
        }
    }

    this.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-mazeSize * gridDim / 2, -mazeSize * gridDim / 2, 0));
    this.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(- Math.PI / 2));

    this.geometry.computeBoundingSphere();
    this.geometry.computeFaceNormals();

    this.mesh = new THREE.Mesh(this.geometry, this.material);

    scene.add(this.mesh);
    /* 		this.mesh.position.x = -30;*/
    this.mesh.position.y = -20;
    this.mesh.scale.set(0.3, 0.3, 0.3);
    //this.mesh.rotation.y = Math.PI / 2;

}


function stepPoints(beginningPoint) {
    var sites = []; // set of occupied lattice sites
    s.x = beginningPoint.x;
    s.y = beginningPoint.y;

    var walk_failed = false;
    for (var step = 0; step < n_steps; step++) {

        var possiblePoints = possibleNewPoints(s.x, s.y, freePoints);

        if (possiblePoints.length > 0) {
            var d = Math.floor(Math.random() * possiblePoints.length);

            // luodaan uusi satunnainen point

            s = possiblePoints[d];
            removeFromFree(s);
        } else { // jos step ei onnistunut   keskeytetään steps loop
            walk_failed = true;

            break;
        }

        sites.push({ x: s.x, y: s.y });
    }
    return sites;
}


function allOnPathWithFreeOnSide(freePoints, sites) {
    var possiblePoints_branching = [];
    for (var i = 0; i < sites.length; i++) {
        /* 		console.log(" sites[i].x " + sites[i].x); */
        var pointsBesideThePath = possibleNewPoints(sites[i].x, sites[i].y, freePoints);
        for (var j = 0; j < pointsBesideThePath.length; j++) {
            for (var k = 0; k < freePoints.length; k++) {
                if (pointsBesideThePath[j].x == freePoints[k].x && pointsBesideThePath[j].y == freePoints[k].y) {
                    possiblePoints_branching.push(sites[i]);
                }

            }
        }
    }
    return possiblePoints_branching;
}

function beginningOfBranch(freePoints, sites) {

    var readyToBranch = allOnPathWithFreeOnSide(freePoints, sites);
    var randindx = Math.floor(Math.random() * readyToBranch.length);
    return readyToBranch[randindx];
}

function onList(beginningPoint, branchingPoints) {
    var foundOnList = false;
    for (var i = 0; i < branchingPoints.length; i++) {
        if (beginningPoint.x == branchingPoints[i].x && beginningPoint.y == branchingPoints[i].y) {
            foundOnList = true;
            break;
        }
    }
    return foundOnList;
}


function drawSaw() {

    n_steps = (mazeSize + 1) * (mazeSize + 1) - 10;
    boudaries = { xLeft: 0, xRight: mazeSize, yTop: 0, yBottom: mazeSize };
    startX = 0;
    startY = 0;

    freePoints = [];
    paths = [];
    colors = [];
    beginningPoint = { x: 0, y: 0 };
    s = {};

    scene.children;
    if (scene.children.length > 2) {
        scene.remove(scene.children[2]);
    }

    var freeInit = freeInTheBeginning();
    freePoints = freeInit;
    var siteGroups = [];

    removeFromFree(beginningPoint);

    beginningPoint.x = startX;
    beginningPoint.y = startY;
    var allSites = [];
    var branchingPoints = [];


    while (freePoints.length > 0 && beginningPoint != null) {

        var sites = stepPoints(beginningPoint);
        var subpath = [];
        subpath.push(beginningPoint);
        subpath = subpath.concat(sites);
        paths.push(subpath);

        allSites = allSites.concat(beginningPoint);
        allSites = allSites.concat(sites);

        beginningPoint = beginningOfBranch(freePoints, allSites);
        if (beginningPoint != null) {
            while (onList(beginningPoint, branchingPoints)) { // rolling to find a new branching point 
                beginningPoint = beginningOfBranch(freePoints, allSites);
            }

        }
        branchingPoints.push(beginningPoint);

    }

    //console.log("pathslength " + paths.length);

    drawMaze();
}


function luo3DObjekti() {

    this.material = new THREE.LineBasicMaterial({ color: 0xff0fff });
    this.geometry = new THREE.Geometry();
    this.geometry.vertices.push(new THREE.Vector3(-1, 0, 0));
    this.geometry.vertices.push(new THREE.Vector3(1, 0, 0));
    this.geometry.vertices.push(new THREE.Vector3(0, 1, 0));
    this.geometry.vertices.push(new THREE.Vector3(3, 0, 0));

    this.mesh = new THREE.Line(this.geometry, this.material, THREE.LinePieces);

    scene.add(this.mesh);
}

function initMaze() {
    drawSaw();
    ball = Ball(5);
    ball.position.y = 5;
    ball.position.x = - (mazeSize * gridDim / 2) + gridDim / 2;
    ball.position.z = (mazeSize * gridDim / 2) - gridDim / 2;
    mesh.add(ball);
}
function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
}


$(function () {

    setUpRender();
    setCamera();
    letThereBeLight();
    allFreePoints = freeInTheBeginning();
    initMaze();

    addMouseHandler();
    run();

    $("button#reload")
        .click(function () {
            initMaze();
        });
    document.addEventListener('mousemove', onDocumentMouseMove, false);

});


function run() {
    // Render the scene
    var timer = 0.001 * Date.now();
    //console.log(timer);
    var timedelta = timer - prevTime;
    prevTime = timer;
    mesh.rotation.z -= (mouseX * 0.0003 + mesh.rotation.z) * 0.02;
    mesh.rotation.x += (mouseY * 0.0004 - mesh.rotation.x) * 0.02;

    var secs = Math.round(timer);
    var gridPos = { x: 0, y: 0 };
    gridPos.x = Math.round(((ball.position.x + (mazeSize * gridDim / 2)) / (gridDim / 2) - 1) / 2);
    gridPos.y = - Math.round(((ball.position.z - (mazeSize * gridDim / 2)) / (gridDim / 2) - 1) / 2) - 1;
    //ball.position.z = (mazeSize * gridDim / 2) - gridDim / 2;
    var neighbourGridPositions = possibleNewPoints(gridPos.x, gridPos.y, allFreePoints);
    var gridPosBoundaries = [];

    neighbourGridPositions.forEach(function (element) {
        var passage = lineInBetween(gridPos, element);
        gridPosBoundaries.push({ "passage": passage, "neighbour": element })
    });

    if (prevSec != secs) {
        console.log(ball.position);
        console.log(gridPos, neighbourGridPositions);

        console.log(gridPosBoundaries);


    }
    prevSec = secs;
    if (timedelta > 1) {
        timedelta = 0.015;
    }
    var gravity = 9.8 * timedelta;
    ax = gravity * Math.sin(mesh.rotation.z);
    az = gravity * Math.sin(mesh.rotation.x);
    vx += ax; //line.rotation.z * mult ;
    vz += az; //line.rotation.x * mult ;

    var angle = Math.atan2(vx, vz);


    var speed = Math.sqrt(vx * vx + vz * vz);
    var friction = 1 - speed * 0.004;
    friction = 0.98;
    vx *= friction;
    vz *= friction;
    ball.position.x -= vx;
    ball.position.z += vz;

    if (ball.position.x + ballSize > rightEdge) {
        ball.position.x = rightEdge - ballSize;
        vx *= bounce;
        vz *= 0.9;
    } else if (ball.position.x - ballSize < leftEdge) {
        ball.position.x = leftEdge + ballSize;
        vx *= bounce;
        vz *= 0.9;
    }
    if (ball.position.z + ballSize > bottomEdge) {
        ball.position.z = bottomEdge - ballSize;
        vz *= bounce;
        vx *= 0.9;
    } else if (ball.position.z - ballSize < topEdge) {
        ball.position.z = topEdge + ballSize;
        vz *= bounce;
        vx *= 0.9;
    }

    renderer.render(scene, camera);

    // Spin the terra for next frame
    if (animating) {
        // mesh.rotation.y -= 0.01;
    }

    // Ask for another frame
    requestAnimationFrame(run);
}

function addMouseHandler() {
    var dom = renderer.domElement;

    dom.addEventListener("mouseup", onMouseUp, false);
}

function onMouseUp(event) {
    event.preventDefault();

    animating = !animating;
}
