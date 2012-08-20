window.addEventListener('load', init, false);

var renderer, camera, scene, controls, clock;

var points = [];

var track;
var mat;
var heatVal = 0;

var actx, samples = {}, sounds = [];

function init() {
	renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(-20, 20, -20);
	camera.lookAt(new THREE.Vector3(0,0,0));
	scene.add(camera);

	scene.add(new THREE.AmbientLight(0xffffff));

	var loader = new THREE.JSONLoader();
	var map_diff = THREE.ImageUtils.loadTexture('images/racer_diff.png');
	//var map_spec = THREE.ImageUtils.loadTexture('images/racer_spec.png');
	var map_lum = THREE.ImageUtils.loadTexture('images/racer_lum.png');
	var map_ao = THREE.ImageUtils.loadTexture('images/racer_full.png');

	mat = new THREE.ShaderMaterial({
		fragmentShader: document.getElementById('shader_frag').textContent,
		vertexShader: document.getElementById('shader_vert').textContent,
		uniforms: {
			'tDiffuse': { type: 't', value: 0, texture: map_diff },
			'tLuminance': { type: 't', value: 1, texture: map_lum },
			'tAO': { type: 't', value: 2, texture: map_ao },
			'fHeat': { type: 'f', value: 0 },
			'tPass': { type: 'i', value: 0 }
		}
	});
	loader.load('models/racer.js', function(geom) {
		var mesh = new THREE.Mesh(geom, mat);
		scene.add(mesh);
	});

	points.push(new THREE.Vector3(-5, 0, 50));
	points.push(new THREE.Vector3(0, 0, -50));
	points.push(new THREE.Vector3(5, 0, 50));
	track = buildTrack(points);
	scene.add(track);

	// Audio stuff

	if (typeof webkitAudioContext !== 'undefined') {
		actx = new webkitAudioContext();
	} else {
		actx = new AudioContext();
	}
	if (samples.engine === undefined) loadSound('engine', function(buffer) {
		console.log(buffer);
		var src = actx.createBufferSource();
		sounds.push(src);
		src.buffer = buffer;
		src.loop = true;
		src.connect(actx.destination);
		src.noteOn(0);
	});

	// Misc stuff

	controls = new THREE.TrackballControls(camera);
	controls.noPan = true;

	clock = new THREE.Clock();

	window.addEventListener('mousemove', function(e) { heatVal = 1 - e.clientY / window.innerHeight; }, false);

	requestAnimationFrame(draw);
}

function draw() {
	requestAnimationFrame(draw);

	var delta = clock.getDelta();

	controls.update(delta);

	//mat.uniforms.fHeat.value = Math.sin(Date.now() % 2000 / 1000 * Math.PI) * 0.75 + 1 + 0.2 * Math.random();
	mat.uniforms.fHeat.value = heatVal * 2.25 + 0.25 + 0.3 * Math.random();

	// Set audio speed?
	if (sounds.length > 0) sounds[0].playbackRate.value = (heatVal + 0.12) * 2 > 0.35 ? (heatVal + 0.12) * 2 : 0.35;

	renderer.render(scene, camera);
}

function buildTrack(points) {
	var spline = new THREE.Spline(points);
	return spline;
}

function loadSound(sound, callback) {
	if (typeof actx.decodeAudioData !== 'undefined') {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'sfx/'+sound+'.wav', true);
		xhr.responseType = 'arraybuffer';

		xhr.addEventListener('load', function() {
			actx.decodeAudioData(xhr.response, function(buffer) {
				samples[sound] = buffer;
				if (typeof callback == 'function') {
					callback(buffer);
				}
			}, console.log);
		}, false);
		xhr.send(null);
	} else {
		var ar = actx.createAudioRequest('sfx/'+sound+'.aiff');
		ar.onload = function() {
			console.log(this);
			samples[sound] = ar.buffer;
			if (typeof callback == 'function') {
				callback(ar.buffer);
			}
		};
		ar.send();
	}
}