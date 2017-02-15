
/*
applying algorithms from here
http://www.physics.buffalo.edu/phy411-506/topic3/topic3-lec1.pdf
http://www.physics.buffalo.edu/phy411-506/topic3/sawalk.cpp
seeking random empty points, beside the  path
*/

/*jslint browser: true*/
/*global $, alert, THREE, container, ColorKeywords,geometry,Ball*/
/* eslint-disable   no-console */

var mazeSize = 20, gridDim = 20;
var steppedMouse = false;
var pathVisible = true;
var gridBoundariesBebugActive = false;
var debuggingAcive = false;
var closeUpCamera = false;
var ballSize = 5;

var soundOn = false;
var boardActive = false;
var lookatVec = new THREE.Vector3(0, -10, 0);
var endPoint = { x: mazeSize - 1, y: mazeSize - 1 };
var startX = 0,
    startY = 0,
    s = {},
    freePoints = [],
    paths = [],
    colors = [];
var rightEdge = mazeSize * gridDim / 2,
    leftEdge = -mazeSize * gridDim / 2,
    bottomEdge = - mazeSize * gridDim / 2,
    topEdge = mazeSize * gridDim / 2;
var height = 15;
var n_steps,
    beginningPoint;
var boudaries = { xLeft: 0, xRight: mazeSize, yTop: 0, yBottom: mazeSize };
var ball;
var mouseX = 0, mouseY = 0;
var mesh, renderer = null,
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
//var rotaAngle;
var allFreePoints = [];
var prevSec = 0;
var bounce = -0.7;
//var rightBoundary, leftBoundary, topBoundary, bottomBoundary;
var lineEdgeL, lineEdgeR, lineEdgeTop, lineEdgeDown, obj3d, obj3ds;
var hit;
var $lastR = 0;
var $lastL = 0;
var returnPath = [];
var enpointPathIndx;
var flag;
var hitSec = 0;
var stats;
function initStats() {

    stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms
    // Align top-left
    stats.domElement.style.position = "absolute";
    stats.domElement.style.left = "0px";
    stats.domElement.style.top = "0px";
    document.getElementById("Stats-output").appendChild(stats.domElement);

    return stats;
}

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
    if (closeUpCamera) {

        camera.position.set(0, 30, 220);
    } else {
        camera.position.set(-7, 140, 80);
        camera.lookAt(lookatVec);
    }

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

    /* 	var pointtiedot= haeSubPath(point1); */
    for (var j = 0; j < paths.length; j++) {
        var subpath = paths[j];
        var foundPoints = 0;
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
            point2 = { x: row + 1, y: i }; // right edge
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

function listIndex(beginningPoint, branchingPoints) {
    var foundOnList = false;
    for (var i = 0; i < branchingPoints.length; i++) {
        if (beginningPoint.x == branchingPoints[i].x && beginningPoint.y == branchingPoints[i].y) {
            foundOnList = true;
            break;
        }
    }
    return { "found": foundOnList, "indx": i };
}


var branchingPaths = [];
function createMazePath() {

    var returnPaths = []
    var goalPath = paths[enpointPathIndx];
    var returnIndex = enpointPathIndx;
    var endPointPathIndx = listIndex(endPoint, goalPath);
    returnPaths.push(goalPath.slice(0, endPointPathIndx.indx + 1));
    var prevPathConnectionPoint = goalPath[0];
    var returnpathIndx;
    var collectedIndexes = [];

    while (enpointPathIndx > 0) {
        for (var indx = enpointPathIndx - 1; indx >= 0; indx--) {
            returnpathIndx = listIndex(prevPathConnectionPoint, paths[indx]);
            var inlistIndx = paths[indx].indexOf(prevPathConnectionPoint);
            if (inlistIndx != -1) {
                goalPath = paths[indx];
                collectedIndexes.push(indx);
                if (inlistIndx < goalPath.length - 1) {
                    branchingPaths.push(goalPath.slice(inlistIndx));
                }
                returnPaths.push(goalPath.slice(0, inlistIndx));
                prevPathConnectionPoint = goalPath[0];
                enpointPathIndx = indx;
                break;
                //console.dir(returnpathIndx);
            }
        }
    }

    returnPaths.reverse();
    returnPaths.forEach(function (subpath) {
        subpath.forEach(function (pointInPath) {
            returnPath.push(pointInPath);
        });
    });
    var potentialAdditionalBranches = [];
    for (var i = 0; i < paths.length; i++) {
        if (collectedIndexes.indexOf(i) == -1) {
            potentialAdditionalBranches.push(paths[i])
        }
    }

    returnPath.forEach(function (pointInPath) {
        potentialAdditionalBranches.forEach(function (potentialBranch) {
            if (potentialBranch.indexOf(pointInPath) != -1) {
                branchingPaths.push(potentialBranch);
            }
        })
    });
    console.dir
    if (pathVisible) {
        drawmazePath();
    }
}
function drawmazePath() {

    var line_material3 = new THREE.LineBasicMaterial({ color: 0x50F626 });

    for (var i = 0; i < returnPath.length - 1; i++) {

        var line_geometry = new THREE.Geometry();

        var xPos = returnPath[i].x * gridDim - mazeSize * gridDim / 2 + gridDim / 2;
        var zPos = - (returnPath[i].y) * gridDim + mazeSize * gridDim / 2 - gridDim / 2;
        var xPos2 = returnPath[i + 1].x * gridDim - mazeSize * gridDim / 2 + gridDim / 2;
        var zPos2 = - (returnPath[i + 1].y) * gridDim + mazeSize * gridDim / 2 - gridDim / 2;

        line_geometry.vertices.push(new THREE.Vector3(xPos, 0, zPos));
        line_geometry.vertices.push(new THREE.Vector3(xPos2, 0, zPos2));

        var lineDir = new THREE.LineSegments(line_geometry, line_material3);
        mesh.add(lineDir);

    }
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
    //var siteGroups = [];

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
        if (onList(endPoint, subpath)) {
            enpointPathIndx = paths.length - 1;
        }
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


}
function positionBall() {
    ball = Ball(ballSize);
    ball.position.y = 5;
    ball.position.x = - (mazeSize * gridDim / 2) + gridDim / 2;
    ball.position.z = (mazeSize * gridDim / 2) - gridDim / 2;
    mesh.add(ball);
}

function initMaze() {
    drawSaw();
    drawMaze();
    positionBall();

}
function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
}

function gridBoundriesDebug() {

    obj3ds = [];
    for (var i = 0; i < 3; i++) {
        obj3d = new THREE.Mesh(new THREE.SphereGeometry(2, 5, 5),
            new THREE.MeshBasicMaterial({ color: 0xccffcc }));
        obj3d.position.x = 0;
        obj3d.position.z = 0;
        obj3d.position.y = height;
        obj3d.visible = false;
        mesh.add(obj3d);
        obj3ds.push(obj3d);
    }

    var line_geometry2 = new THREE.Geometry();
    line_geometry2.vertices.push(new THREE.Vector3(0, 0, 0));
    line_geometry2.vertices.push(new THREE.Vector3(gridDim, 0, 0));
    var line_materialL = new THREE.LineBasicMaterial({ color: 0xF0F686, linewidth: 6 });
    var line_materialR = new THREE.LineBasicMaterial({ color: 0x4036F6, linewidth: 6 });
    var line_materialT = new THREE.LineBasicMaterial({ color: 0xFF5646, linewidth: 6 });
    var line_materialB = new THREE.LineBasicMaterial({ color: 0x00F6f6, linewidth: 6 });

    var line_geometry3 = new THREE.Geometry();
    line_geometry3.vertices.push(new THREE.Vector3(0, 0, 0));
    line_geometry3.vertices.push(new THREE.Vector3(0, 0, gridDim));

    lineEdgeL = new THREE.LineSegments(line_geometry3, line_materialL);
    lineEdgeR = new THREE.LineSegments(line_geometry3, line_materialR);
    lineEdgeTop = new THREE.LineSegments(line_geometry2, line_materialT);
    lineEdgeDown = new THREE.LineSegments(line_geometry2, line_materialB);

    lineEdgeL.position.y = gridDim;
    lineEdgeR.position.y = gridDim;
    lineEdgeTop.position.y = gridDim;
    lineEdgeDown.position.y = gridDim;
    lineEdgeR.position.x = gridDim;
    lineEdgeDown.position.z = gridDim;

    mesh.add(lineEdgeL);
    mesh.add(lineEdgeR);
    mesh.add(lineEdgeTop);
    mesh.add(lineEdgeDown);
}
function setup() {
    //Initialize sounds here
    hit = sounds["sound///hit.wav"];
}
function initSound() {
    //    snd = new Audio("sound///hit.wav"); // buffers automatically when created
    try {
        sounds.load([
            "sound///hit.wav",/* 
        "sounds/music.wav",
        "sounds/bounce.mp3"*/
        ]);
        sounds.whenLoaded = setup;
    } catch (err) {
        console.log(err);
    }
}
function createMesh(geom, imageFile) {
    var texture = THREE.ImageUtils.loadTexture("images/" + imageFile)
    var mat = new THREE.MeshPhongMaterial();
    mat.map = texture;

    var mesh = new THREE.Mesh(geom, mat);
    return mesh;
}


$(function () {

    initSound();
    initStats();
    setUpRender();
    setCamera();
    letThereBeLight();
    allFreePoints = freeInTheBeginning();
    initMaze();

    createMazePath()

    var imageFile = "checkered.jpg";
    var flagSize = 50;
    flag = new THREE.Object3D();
    var geom = new THREE.PlaneGeometry(flagSize, flagSize * 3 / 5);
    var geometry = new THREE.CylinderGeometry(gridDim / 8, gridDim / 8, height * 3 / 2 + flagSize, 3);
    var material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    var cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.y = (height * 3 / 2 + flagSize) / 2;
    var flagFlag = createMesh(geom, imageFile);
    flagFlag.position.y = height * 3;
    flagFlag.position.x = flagSize / 2;
    flag.add(flagFlag)
    flag.add(cylinder)
    flag.position.x = (mazeSize * gridDim / 2) - gridDim / 2;
    flag.position.z = - (mazeSize * gridDim / 2) + gridDim / 2;

    var dirToFlag = new THREE.Vector3(0, 1, 0);



    mesh.add(flag);

    if (gridBoundariesBebugActive) {
        gridBoundriesDebug();

    }
    addMouseHandler();
    run();

    $("button#reload")
        .click(function () {
            initMaze();
        });
    document.addEventListener("mousemove", onDocumentMouseMove, false);

});
function shootSound(vol, freq) {
    soundEffect(
        freq,           //frequency
        0,                //attack
        0.1,              //decay
        "sawtooth",       //waveform
        vol,                //Volume
        -0.8,             //pan
        0,                //wait before playing
        1200,             //pitch bend amount
        false,            //reverse bend
        0,                //random pitch range
        45,               //dissonance
        [0.1, 0.1, 1000], //echo array: [delay, feedback, filter]
        undefined         //reverb array: [duration, decay, reverse?]
    );
}

function run() {
    // Render the scene
    var timer = 0.001 * Date.now();
    //console.log(timer);
    var timedelta = timer - prevTime;
    prevTime = timer;
    if (!boardActive) {
        if (steppedMouse) { // for debugging style 
            mesh.rotation.z = -(mouseX / 50 % 50 * 0.012);
            mesh.rotation.x = (mouseY / 50 % 50 * 0.012);
        } else {
            mesh.rotation.z -= (mouseX * 0.0006 + mesh.rotation.z) * 0.06;
            mesh.rotation.x += (mouseY * 0.0010 - mesh.rotation.x) * 0.06;
        }
    } else {
        mesh.rotation.z += ($lastL * 2 - mesh.rotation.z) * 0.02;
        mesh.rotation.x -= ($lastR * 2 + mesh.rotation.x) * 0.02;
    }
    var secs = Math.round(timer);
    var gridPos = { x: 0, y: 0 };
    gridPos.x = Math.round(((ball.position.x + (mazeSize * gridDim / 2)) / (gridDim / 2) - 1) / 2);
    gridPos.y = - Math.round(((ball.position.z - (mazeSize * gridDim / 2)) / (gridDim / 2) - 1) / 2) - 1;
    //ball.position.z = (mazeSize * gridDim / 2) - gridDim / 2;
    var neighbourGridPositions = possibleNewPoints(gridPos.x, gridPos.y, allFreePoints);

    var gridPosBoundaries = {};
    gridPosBoundaries.right = (gridPos.x + 1) * gridDim - mazeSize * gridDim / 2;
    gridPosBoundaries.left = (gridPos.x) * gridDim - mazeSize * gridDim / 2;
    gridPosBoundaries.down = - (gridPos.y + 1) * gridDim + mazeSize * gridDim / 2;
    gridPosBoundaries.up = - (gridPos.y) * gridDim + mazeSize * gridDim / 2;
    var boundariesActive = { "right": true, "down": true, "left": true, "up": true };
    var openCorners = [];
    var boundaries = { right: rightEdge, left: leftEdge, down: bottomEdge, up: topEdge };
    for (var posIndx = 0; posIndx < neighbourGridPositions.length; posIndx++) {
        //    neighbourGridPositions.forEach(function (element) {
        element = neighbourGridPositions[posIndx];
        var passage = lineInBetween(gridPos, element);
        var nextIdx = posIndx + 1;
        if (nextIdx > neighbourGridPositions.length - 1) {
            nextIdx = 0;
        }
        if (element.dir == "right" && passage) {
            boundariesActive.right = false;
            if (neighbourGridPositions[nextIdx].dir == "down"
                && lineInBetween(gridPos, neighbourGridPositions[nextIdx])) {
                openCorners.push({ indx: 0, inBetween: "right, down" });
            }
        } else if (element.dir == "right" && !passage) {
            boundaries.right = (element.x) * gridDim - mazeSize * gridDim / 2;
        }
        if (element.dir == "down" && passage) {
            boundariesActive.down = false;
            if (neighbourGridPositions[nextIdx].dir == "left"
                && lineInBetween(gridPos, neighbourGridPositions[nextIdx])) {
                openCorners.push({ indx: 1, inBetween: "down, left" });
            }
        } else if (element.dir == "down" && !passage) {
            boundaries.down = - (element.y) * gridDim + mazeSize * gridDim / 2;
        }
        if (element.dir == "left" && passage) {
            boundariesActive.left = false;
            if (neighbourGridPositions[nextIdx].dir == "up"
                && lineInBetween(gridPos, neighbourGridPositions[nextIdx])) {
                openCorners.push({ indx: 2, inBetween: "left,up" });
            }
        } else if (element.dir == "left" && !passage) {
            boundaries.left = (element.x + 1) * gridDim - mazeSize * gridDim / 2;
        }
        if (element.dir == "up" && passage) {
            boundariesActive.up = false;
            if (neighbourGridPositions[nextIdx].dir == "right"
                && lineInBetween(gridPos, neighbourGridPositions[nextIdx])) {
                openCorners.push({ indx: 3, inBetween: "up,right" });
            }
        } else if (element.dir == "up" && !passage) {
            boundaries.up = - (element.y + 1) * gridDim + mazeSize * gridDim / 2;
        }
        /* boundaries.right = (element.x) * gridDim - mazeSize * gridDim / 2;
         boundaries.down = - (element.y) * gridDim + mazeSize * gridDim / 2;
         boundaries.left = (element.x + 1) * gridDim - mazeSize * gridDim / 2;
         boundaries.up = - (element.y + 1) * gridDim + mazeSize * gridDim / 2;*/
    }//);


    var cornerPointCoords = [
        { x: gridPosBoundaries.right, z: gridPosBoundaries.down },
        { x: gridPosBoundaries.left, z: gridPosBoundaries.down },
        { x: gridPosBoundaries.left, z: gridPosBoundaries.up },
        { x: gridPosBoundaries.right, z: gridPosBoundaries.up }
    ];

    openCorners.forEach(function (element) {
        element.cornerPoint = cornerPointCoords[element.indx];
    });

    if (gridBoundariesBebugActive) {
        lineEdgeL.position.x = gridPosBoundaries.left;
        lineEdgeL.position.z = gridPosBoundaries.down;
        lineEdgeR.position.x = gridPosBoundaries.right;
        lineEdgeR.position.z = gridPosBoundaries.down;
        lineEdgeTop.position.z = gridPosBoundaries.up;
        lineEdgeTop.position.x = gridPosBoundaries.left;
        lineEdgeDown.position.z = gridPosBoundaries.down;
        lineEdgeDown.position.x = gridPosBoundaries.left;
        var debugObCount = 0;
        obj3ds.forEach(function (obj3dElem) {
            obj3dElem.visible = false;
        });
        if (openCorners.length > 0) {
            openCorners.forEach(function (element) {
                obj3ds[debugObCount].position.x = element.cornerPoint.x;
                obj3ds[debugObCount].position.z = element.cornerPoint.z;
                obj3ds[debugObCount].visible = true;
                debugObCount++;
            });
        }
    }




    // lineEdge.position.z = boundaries.down;
    if (debuggingAcive) {
        if (prevSec != secs) {
            console.log(ball.position);
            var gridPosBoundaries = [];
            neighbourGridPositions.forEach(function (element) {

                var passage = lineInBetween(gridPos, element);
                gridPosBoundaries.push({ "passage": passage, "neighbour": element });
            });
            console.log(gridPos, neighbourGridPositions);
            console.log(gridPosBoundaries);
            console.log(boundaries);
            gridPosBoundaries.forEach(function (element) {
                console.log(element.passage, element.neighbour.dir);
                if (!element.passage) {
                    console.log("boundary in ", element.neighbour.dir, element.neighbour);
                }
            });
        }
        prevSec = secs;
    }
    // for debugging:
    if (timedelta > 1) {
        timedelta = 0.015;
    }
    var gravity = 9.8 * timedelta;
    ax = -gravity * Math.sin(mesh.rotation.z);
    az = gravity * Math.sin(mesh.rotation.x);
    vx += ax;
    vz += az;
    //var angle = Math.atan2(vx, vz);

    var speed = Math.sqrt(vx * vx + vz * vz);
    var friction = 1 - speed * 0.004;
    friction = 0.98;
    vx *= friction;
    vz *= friction;
    ball.position.x += vx;
    ball.position.z += vz;
    flag.rotation.setFromRotationMatrix(camera.matrix);
    if (closeUpCamera) {
        var ballWPos = ball.getWorldPosition();
        lookatVec.x += (ballWPos.x - lookatVec.x) * 0.04;
        lookatVec.z += (ballWPos.z - lookatVec.z) * 0.04;

        camera.lookAt(lookatVec);

        camera.position.set(lookatVec.x, 30, lookatVec.z + 5);
    } else {
        camera.position.set(-7, 140, 80);
        camera.lookAt(new THREE.Vector3(0, -10, 0));

    }
    var minumumSoundPause = 0.7;
    var sefvolume = 1;
    var angle = Math.atan2(vx, vz);
    //console.log(angle * (180 / Math.PI));

    openCorners.forEach(function (element) {
        var xdist = element.cornerPoint.x - ball.position.x;
        var zdist = element.cornerPoint.z - ball.position.z;
        var dist = Math.sqrt(xdist * xdist + zdist * zdist);
        if (dist < ballSize) {
            var distangle = Math.atan2(xdist, zdist);
            var distangleDeg2 = distangle * (180 / Math.PI);
            if (element.indx == 0) { //angle >= 0 && 
                if (angle < distangle) {
                    ball.position.z = element.cornerPoint.z + ballSize;
                    vz *= bounce;
                } else {
                    ball.position.x = element.cornerPoint.x - ballSize;
                    vx *= bounce;
                }
            } else if (element.indx == 1) {
                if (angle < distangle) {


                    ball.position.x = element.cornerPoint.x + ballSize;
                    vx *= bounce;
                } else {

                    ball.position.z = element.cornerPoint.z + ballSize;
                    vz *= bounce;
                }
            } else if (element.indx == 2) {
                if (angle < distangle) {
                    ball.position.z = element.cornerPoint.z - ballSize;
                    vz *= bounce;
                } else {
                    ball.position.x = element.cornerPoint.x + ballSize;
                    vx *= bounce;


                }
            } else if (element.indx == 3) {
                if (angle < distangle) {
                    ball.position.x = element.cornerPoint.x - ballSize;
                    vx *= bounce;
                } else {

                    ball.position.z = element.cornerPoint.z - ballSize;
                    vz *= bounce;

                }
            }

            if (soundOn) {
                var prevSoundTime = timer - hitSec;
                if (prevSoundTime > minumumSoundPause) {
                    sefvolume = vx * prevSoundTime * 0.4;
                    if (sefvolume > 1) {
                        sefvolume = 1;
                    }

                    shootSound(sefvolume, prevSoundTime * 400);

                    //hit.volume = sefvolume;
                    //hit.pause();
                    //hit.playFrom(0);
                    hitSec = timer;
                }
            }
        }
    });

    if (boundariesActive.right && ball.position.x + ballSize > boundaries.right) {
        ball.position.x = boundaries.right - ballSize;
        vx *= bounce;

        if (soundOn) {
            var prevSoundTime = timer - hitSec;
            if (prevSoundTime > minumumSoundPause) {
                sefvolume = vx * prevSoundTime * 0.4;
                if (sefvolume > 1) {
                    sefvolume = 1;
                }

                shootSound(sefvolume, prevSoundTime * 400);

                //hit.volume = sefvolume;
                //hit.pause();
                //hit.playFrom(0);
                hitSec = timer;
            }
        }

        //   //hit.play();
        //vz *= 0.9;
    }
    if (boundariesActive.left && ball.position.x - ballSize < boundaries.left) {
        ball.position.x = boundaries.left + ballSize;
        vx *= bounce;
        if (soundOn) {
            var prevSoundTime = timer - hitSec;
            if (prevSoundTime > minumumSoundPause) {
                sefvolume = vx * prevSoundTime * 0.4;
                if (sefvolume > 1) {
                    sefvolume = 1;
                }
                shootSound(sefvolume, prevSoundTime * 300);
                hitSec = timer;

                //hit.volume = sefvolume;
                //hit.pause();
                //hit.playFrom(0);
            }
        }
        //    //hit.play();
        // vz *= 0.9;
    }
    if (boundariesActive.down && ball.position.z - ballSize < boundaries.down) {
        ball.position.z = boundaries.down + ballSize;
        vz *= bounce;
        if (soundOn) {
            var prevSoundTime = timer - hitSec;
            if (prevSoundTime > minumumSoundPause) {
                sefvolume = vx * prevSoundTime * 0.4;
                if (sefvolume > 1) {
                    sefvolume = 1;
                }
                shootSound(sefvolume, prevSoundTime * 500);
                hitSec = timer;
                sefvolume = vx * prevSoundTime * 0.4;

                //hit.volume = sefvolume;
                //hit.pause();
                //hit.playFrom(0);
            }
        }

        // vx *= 0.9;
    }
    if (boundariesActive.up && ball.position.z + ballSize > boundaries.up) {
        ball.position.z = boundaries.up - ballSize;
        vz *= bounce;
        //   //hit.play();
        if (soundOn) {
            var prevSoundTime = timer - hitSec;
            if (prevSoundTime > minumumSoundPause) {
                sefvolume = vx * prevSoundTime * 0.4;
                if (sefvolume > 1) {
                    sefvolume = 1;
                }
                shootSound(sefvolume, prevSoundTime * 600);
                hitSec = timer;

                //hit.volume = sefvolume;
                //hit.pause();
                //hit.playFrom(0);
            }
        }
        //vx *= 0.9;
    }

    /*
        if (ball.position.x + ballSize > rightEdge) {
            ball.position.x = rightEdge - ballSize;
            vx *= bounce;
            vz *= 0.9;
        } else if (ball.position.x - ballSize < leftEdge) {
            ball.position.x = leftEdge + ballSize;
            vx *= bounce;
            vz *= 0.9;
        }
        if (ball.position.z + ballSize > topEdge) {
            ball.position.z = topEdge - ballSize;
            vz *= bounce;
            vx *= 0.9;
        } else if (ball.position.z - ballSize < bottomEdge) {
            ball.position.z = bottomEdge + ballSize;
            vz *= bounce;
            vx *= 0.9;
        } */

    renderer.render(scene, camera);
    stats.update();


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


try {
    var socket = io.connect("/", {
        "reconnect": true,
        "reconnection delay": 500,
        "max reconnection attempts": 10
    });
} catch (err) {
    console.log(err);

}

try {

    socket.on("message", function (data) {
        //console.log(data);
        data = process_data(data);

        /* Initial position */
        if ($lastR == -1) {
            $lastR = data.x;
            $lastL = data.y;
        }

        $lastR = data.r;
        //console.log($lastR);
        $lastL = data.l;
        //renderScene();

    });
} catch (err) {
    console.log(err);

}

function process_data(data) {

    if (data.indexOf("boardActive:") != -1) {
        // console.log(data);
        var boardActiveParamsArray = data.split(':');
        if (boardActiveParamsArray[1] == '1' || boardActiveParamsArray[1] == 'true') {
            boardActive = true;
        } else {
            boardActive = false;
        }
    }
    var ret = {
        r: 0,
        l: 0
    };

    var array = data.split(',');

    if (array.length < 2)
        return ret;

    ret.r = array[0];
    ret.l = array[1];

    ret = sanitize_size(ret);

    return ret;
}

/* Convert pot values to row oar degrees. */
function sanitize_size(values) {
    var ret = {
        r: 0,
        l: 0
    };
    var accelVal1Rest = 224;
    var accelVal2Rest = 130;


    degreeR = ((values.r - accelVal1Rest) * 0.01);
    degreeL = (values.l - accelVal2Rest) * 0.01;
    ret.r = -degreeR * 0.0174533;
    ret.l = -degreeL * 0.0174533;
    //console.log(values.r, (values.r - min_potR), degreeR, ret.r);
    return ret;
}