
/*
  
lähtökohtana algoritmit:
http://www.physics.buffalo.edu/phy411-506/topic3/topic3-lec1.pdf

http://www.physics.buffalo.edu/phy411-506/topic3/sawalk.cpp
 
yritys: haetaan random tyhjä piste, joka on reitillä olevan pisteem vieressä
 
*/

var dimesiot = 20;
var n_steps = (dimesiot + 1) * (dimesiot + 1) - 10;
var boudaries = { xLeft: 0, xRight: dimesiot, yTop: 0, yBottom: dimesiot };
var startX = 0;
var startY = 0;
var gridDim = 20;
var vapaat = [];
var paths = [];
var vareja = [];
var alkupiste = { x: 0, y: 0 };
var s = {};

var renderer = null,
    scene = null,
    camera = null,
    terra = null,
    animating = false;

var kdobj;

function setUpRender() {

    var container = document.getElementById("container");
    renderer = new THREE.WebGLRenderer({ antialias: true });
    console.log("container.offsetWidth " + container.offsetWidth);
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

    vareja.push(ColorKeywords[prop])
}


function vapaatAlussa() {
    var vapaatPisteet = [];
    for (var i = boudaries.xLeft; i < boudaries.xRight; ++i) {
        for (var j = boudaries.yTop; j < boudaries.yBottom; ++j) {
            vapaatPisteet.push({ x: i, y: j });
        }
    }
    return vapaatPisteet;
}


function poistaVapaista(piste) {
    for (var i = 0; i < vapaat.length; ++i) {
        if (piste.x == vapaat[i].x && piste.y == vapaat[i].y) {
            vapaat.splice(i, 1);
            break;
        }
    }
}

function onVapaa(x, y, vapaat) {
    var valid = false;
    // tarkastetaan onko uusi satunnainen piste jo varattu
    for (var i = 0; i < vapaat.length; i++) {

        if (x == vapaat[i].x && y == vapaat[i].y) {
            valid = true;
            break; // jos on niin keskeytetään tarkistussilmukka
        }
    }
    return valid;
}

function mahdollisetUudetPisteet(x, y, vapaat) {
    var mahdolliset = [];
    var right = x + 1; // step East
    if (onVapaa(right, y, vapaat)) mahdolliset.push({ x: right, y: y });
    var down = y + 1; // step North
    if (onVapaa(x, down, vapaat)) mahdolliset.push({ x: x, y: down });
    var left = x - 1; // step West
    if (onVapaa(left, y, vapaat)) mahdolliset.push({ x: left, y: y });
    var up = y - 1; // step South
    if (onVapaa(x, up, vapaat)) mahdolliset.push({ x: x, y: up });
    return mahdolliset;
}


function viivaValilla(piste1, piste2) {

    var pisteitaloytyi = 0;
    /* 	var pistetiedot= haeSubPath(piste1); */
    for (var j = 0; j < paths.length; j++) {
        var subpath = paths[j];
        pisteitaloytyi = 0;
        for (var i = 0; i < subpath.length; i++) {
            if (i < subpath.length - 1 && (piste1.x == subpath[i].x && piste1.y == subpath[i].y) && (piste2.x == subpath[i + 1].x && piste2.y == subpath[i + 1].y)) {
                pisteitaloytyi += 1;
                return true;

            }
            if (i > 0 && (piste1.x == subpath[i].x && piste1.y == subpath[i].y) && (piste2.x == subpath[i - 1].x && piste2.y == subpath[i - 1].y)) {
                pisteitaloytyi += 1;
                return true;

            }
        }
        //console.log("pisteitaloytyi " + pisteitaloytyi);

    }
    //console.dir("pistetiedot " + pistetiedot.subpindx +" " +  pistetiedot.pindx);
    return false;

}

// sokkelo:

function piirraSokkelo() {


    var offset = gridDim / 2;

    //this.material = new THREE.LineBasicMaterial({ color: 0xff0fff });
    this.material = new THREE.MeshPhongMaterial({ color: 0xaa0fff, specular: 0xaaaacc, side: THREE.DoubleSide });   // , ambient : 0x9999ff

    this.geometry = new THREE.Geometry();
    var korkeus = 5;
    this.geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    this.geometry.vertices.push(new THREE.Vector3(dimesiot * gridDim, 0, 0));
    this.geometry.vertices.push(new THREE.Vector3(0, 0, korkeus));
    this.geometry.vertices.push(new THREE.Vector3(dimesiot * gridDim, 0, korkeus));
    geometry.faces.push(new THREE.Face3(0, 1, 2));
    geometry.faces.push(new THREE.Face3(1, 2, 3));

    this.geometry.vertices.push(new THREE.Vector3(dimesiot * gridDim, 0, 0));
    this.geometry.vertices.push(new THREE.Vector3(dimesiot * gridDim, (dimesiot - 1) * gridDim, 0));
    this.geometry.vertices.push(new THREE.Vector3(dimesiot * gridDim, 0, korkeus));
    this.geometry.vertices.push(new THREE.Vector3(dimesiot * gridDim, (dimesiot - 1) * gridDim, korkeus));
    geometry.faces.push(new THREE.Face3(4 + 0, 4 + 1, 4 + 2));
    geometry.faces.push(new THREE.Face3(4 + 1, 4 + 2, 4 + 3));

    this.geometry.vertices.push(new THREE.Vector3(dimesiot * gridDim, dimesiot * gridDim, 0));
    this.geometry.vertices.push(new THREE.Vector3(0, dimesiot * gridDim, 0));
    this.geometry.vertices.push(new THREE.Vector3(dimesiot * gridDim, dimesiot * gridDim, korkeus));
    this.geometry.vertices.push(new THREE.Vector3(0, dimesiot * gridDim, korkeus));
    geometry.faces.push(new THREE.Face3(8 + 0, 8 + 1, 8 + 2));
    geometry.faces.push(new THREE.Face3(8 + 1, 8 + 2, 8 + 3));

    this.geometry.vertices.push(new THREE.Vector3(0, dimesiot * gridDim, 0));
    this.geometry.vertices.push(new THREE.Vector3(0, gridDim, 0));
    this.geometry.vertices.push(new THREE.Vector3(0, dimesiot * gridDim, korkeus));
    this.geometry.vertices.push(new THREE.Vector3(0, gridDim, korkeus));

    geometry.faces.push(new THREE.Face3(12 + 0, 12 + 1, 12 + 2));
    geometry.faces.push(new THREE.Face3(12 + 1, 12 + 2, 12 + 3));

    var segmentit = 0;

    for (var rivi = 0; rivi < dimesiot - 1; rivi++) {
        for (var i = 0; i < dimesiot; i++) {

            var piste1 = { x: i, y: rivi };
            var piste2 = { x: i, y: rivi + 1 };
            //console.log("i " + i);
            if (!viivaValilla(piste1, piste2)) {

                segmentit += 1;
                this.geometry.vertices.push(new THREE.Vector3(i * gridDim, (rivi + 1) * gridDim, 0));
                this.geometry.vertices.push(new THREE.Vector3((i + 1) * gridDim, (rivi + 1) * gridDim, 0));
                this.geometry.vertices.push(new THREE.Vector3(i * gridDim, (rivi + 1) * gridDim, korkeus));
                this.geometry.vertices.push(new THREE.Vector3((i + 1) * gridDim, (rivi + 1) * gridDim, korkeus));
                geometry.faces.push(new THREE.Face3(segmentit * 4 + 12 + 0, segmentit * 4 + 12 + 1, segmentit * 4 + 12 + 2));
                geometry.faces.push(new THREE.Face3(segmentit * 4 + 12 + 1, segmentit * 4 + 12 + 2, segmentit * 4 + 12 + 3));

            }

            var piste1 = { x: rivi, y: i };
            var piste2 = { x: rivi + 1, y: i };
            //console.log("i " + i);
            if (!viivaValilla(piste1, piste2)) {

                segmentit += 1;
                this.geometry.vertices.push(new THREE.Vector3((rivi + 1) * gridDim, i * gridDim, 0));
                this.geometry.vertices.push(new THREE.Vector3((rivi + 1) * gridDim, (i + 1) * gridDim, 0));
                this.geometry.vertices.push(new THREE.Vector3((rivi + 1) * gridDim, i * gridDim, korkeus));
                this.geometry.vertices.push(new THREE.Vector3((rivi + 1) * gridDim, (i + 1) * gridDim, korkeus));
                geometry.faces.push(new THREE.Face3(segmentit * 4 + 12 + 0, segmentit * 4 + 12 + 1, segmentit * 4 + 12 + 2));
                geometry.faces.push(new THREE.Face3(segmentit * 4 + 12 + 1, segmentit * 4 + 12 + 2, segmentit * 4 + 12 + 3));

            }
        }
    }

    this.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-dimesiot * gridDim / 2, -dimesiot * gridDim / 2, 0));
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


function stepPoints(alkupiste) {
    var sites = []; // set of occupied lattice sites
    s.x = alkupiste.x;
    s.y = alkupiste.y;

    var walk_failed = false;
    for (var step = 0; step < n_steps; step++) {

        var mahdolliset = mahdollisetUudetPisteet(s.x, s.y, vapaat);

        if (mahdolliset.length > 0) {
            var d = Math.floor(Math.random() * mahdolliset.length);

            // luodaan uusi satunnainen piste

            s = mahdolliset[d];
            poistaVapaista(s);
        } else { // jos step ei onnistunut   keskeytetään steps loop
            walk_failed = true;

            break;
        }

        sites.push({ x: s.x, y: s.y });
    }
    return sites;
}


function kaikkiReitillaJoillaVapaaVieressa(vapaat, sites) {
    var mahdolliset_haarautuvat = []
    for (var i = 0; i < sites.length; i++) {
        /* 		console.log(" sites[i].x " + sites[i].x); */
        var reitinvieressaOlevatPisteet = mahdollisetUudetPisteet(sites[i].x, sites[i].y, vapaat);
        for (var j = 0; j < reitinvieressaOlevatPisteet.length; j++) {
            for (var k = 0; k < vapaat.length; k++) {
                if (reitinvieressaOlevatPisteet[j].x == vapaat[k].x && reitinvieressaOlevatPisteet[j].y == vapaat[k].y) {
                    mahdolliset_haarautuvat.push(sites[i]);
                }

            }
        }
    }
    return mahdolliset_haarautuvat;
}

function haarautumanAlku(vapaat, sites) {

    var valmiitHaarautumaan = kaikkiReitillaJoillaVapaaVieressa(vapaat, sites);
    var randindx = Math.floor(Math.random() * valmiitHaarautumaan.length);
    return valmiitHaarautumaan[randindx];
}

function onListassa(alkupiste, haarautumaPisteet) {
    var listassa = false;
    for (var i = 0; i < haarautumaPisteet.length; i++) {
        if (alkupiste.x == haarautumaPisteet[i].x && alkupiste.y == haarautumaPisteet[i].y) {
            listassa = true;
            break;
        }
    }
    return listassa;
}
function drawSaw(context) {

    var vapaatInit = vapaatAlussa();
    vapaat = vapaatInit
    var siteGroups = [];

    poistaVapaista(alkupiste);

    alkupiste.x = startX;
    alkupiste.y = startY;
    var kaikkisites = [];
    var haarautumaPisteet = [];


    while (vapaat.length > 0 && alkupiste != null) {

        var sites = stepPoints(alkupiste);
        var subpath = [];
        subpath.push(alkupiste);
        subpath = subpath.concat(sites);
        paths.push(subpath);

        kaikkisites = kaikkisites.concat(alkupiste);
        kaikkisites = kaikkisites.concat(sites);

        alkupiste = haarautumanAlku(vapaat, kaikkisites);
        if (alkupiste != null) {
            while (onListassa(alkupiste, haarautumaPisteet)) { // kelataan pisteitä kunnes löydetään uusi haarautumapiste 
                alkupiste = haarautumanAlku(vapaat, kaikkisites);
            }

        }
        haarautumaPisteet.push(alkupiste);

    }

    console.log("pathslength " + paths.length);

    piirraSokkelo();
}


function luo3DObjekti() {

    this.material = new THREE.LineBasicMaterial({ color: 0xff0fff });
    this.geometry = new THREE.Geometry()
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

    dom.addEventListener('mouseup', onMouseUp, false);
}

function onMouseUp(event) {
    event.preventDefault();

    animating = !animating;
}
