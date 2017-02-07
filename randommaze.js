
/*
  
applying algorithms from here
http://www.physics.buffalo.edu/phy411-506/topic3/topic3-lec1.pdf

http://www.physics.buffalo.edu/phy411-506/topic3/sawalk.cpp
 
seeking random empty points, beside the  path
 
*/

/*jslint browser: true*/
/*global alert, THREE, container, ColorKeywords,geometry*/

var mazeSize = 20;
var n_steps = (mazeSize + 1) * (mazeSize + 1) - 10;
var boudaries = { xLeft: 0, xRight: mazeSize, yTop: 0, yBottom: mazeSize };
var startX = 0;
var startY = 0;
var gridDim = 20;
var freePoints = [];
var paths = [];
var colors = [];
var beginningPoint = { x: 0, y: 0 };
var s = {};

var renderer = null,
    scene = null,
    camera = null,
    //terra = null,
    animating = false;

//var kdobj;

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
    camera.position.set(0, 30, 90);
    camera.lookAt(new THREE.Vector3(0, -10, 0));
}

function letThereBeLight() {
    var light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(0, 0, 1);
    scene.add(light);
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
    if (isFree(right, y, freePoints)) possiblePoints.push({ x: right, y: y });
    var down = y + 1; // step North
    if (isFree(x, down, freePoints)) possiblePoints.push({ x: x, y: down });
    var left = x - 1; // step West
    if (isFree(left, y, freePoints)) possiblePoints.push({ x: left, y: y });
    var up = y - 1; // step South
    if (isFree(x, up, freePoints)) possiblePoints.push({ x: x, y: up });
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
    var korkeus = 5;
    this.geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    this.geometry.vertices.push(new THREE.Vector3(mazeSize * gridDim, 0, 0));
    this.geometry.vertices.push(new THREE.Vector3(0, 0, korkeus));
    this.geometry.vertices.push(new THREE.Vector3(mazeSize * gridDim, 0, korkeus));
    geometry.faces.push(new THREE.Face3(0, 1, 2));
    geometry.faces.push(new THREE.Face3(1, 2, 3));

    this.geometry.vertices.push(new THREE.Vector3(mazeSize * gridDim, 0, 0));
    this.geometry.vertices.push(new THREE.Vector3(mazeSize * gridDim, (mazeSize - 1) * gridDim, 0));
    this.geometry.vertices.push(new THREE.Vector3(mazeSize * gridDim, 0, korkeus));
    this.geometry.vertices.push(new THREE.Vector3(mazeSize * gridDim, (mazeSize - 1) * gridDim, korkeus));
    geometry.faces.push(new THREE.Face3(4 + 0, 4 + 1, 4 + 2));
    geometry.faces.push(new THREE.Face3(4 + 1, 4 + 2, 4 + 3));

    this.geometry.vertices.push(new THREE.Vector3(mazeSize * gridDim, mazeSize * gridDim, 0));
    this.geometry.vertices.push(new THREE.Vector3(0, mazeSize * gridDim, 0));
    this.geometry.vertices.push(new THREE.Vector3(mazeSize * gridDim, mazeSize * gridDim, korkeus));
    this.geometry.vertices.push(new THREE.Vector3(0, mazeSize * gridDim, korkeus));
    geometry.faces.push(new THREE.Face3(8 + 0, 8 + 1, 8 + 2));
    geometry.faces.push(new THREE.Face3(8 + 1, 8 + 2, 8 + 3));

    this.geometry.vertices.push(new THREE.Vector3(0, mazeSize * gridDim, 0));
    this.geometry.vertices.push(new THREE.Vector3(0, gridDim, 0));
    this.geometry.vertices.push(new THREE.Vector3(0, mazeSize * gridDim, korkeus));
    this.geometry.vertices.push(new THREE.Vector3(0, gridDim, korkeus));

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
                this.geometry.vertices.push(new THREE.Vector3(i * gridDim, (row + 1) * gridDim, korkeus));
                this.geometry.vertices.push(new THREE.Vector3((i + 1) * gridDim, (row + 1) * gridDim, korkeus));
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
                this.geometry.vertices.push(new THREE.Vector3((row + 1) * gridDim, i * gridDim, korkeus));
                this.geometry.vertices.push(new THREE.Vector3((row + 1) * gridDim, (i + 1) * gridDim, korkeus));
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
    this.mesh.scale.set(0.15, 0.15, 0.15);
    this.mesh.rotation.y = Math.PI / 4;

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

window.onload = function () {

    setUpRender();
    setCamera();
    letThereBeLight();
    drawSaw();
    addMouseHandler();
    run();

};


function run() {
    // Render the scene
    renderer.render(scene, camera);

    // Spin the terra for next frame
    if (animating) {
        mesh.rotation.y -= 0.01;
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
