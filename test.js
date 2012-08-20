window.addEventListener('load', init, false);

var renderer, camera, scene, controls, clock, gamepad, keys = [];

var points = [];

var player = {
	position: new THREE.Vector3(),
	speed: 0,
	direction: 0,
	geom: null,
	mat: null,
	mesh: null,
	rpm: 0.1
};

var world = {
	plane: null
};

var track;
var mat, mat2;

var pse, psc;

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
	var map_reflect = THREE.ImageUtils.loadTexture('images/racer_reflect.png');
	var map_lum = THREE.ImageUtils.loadTexture('images/racer_lum.png');
	var map_ao = THREE.ImageUtils.loadTexture('images/racer_full.png');
	var map_noise = THREE.ImageUtils.loadTexture('images/noise.png');
	var map_cube = THREE.ImageUtils.loadTexture('images/noise.png');

	mat = new THREE.ShaderMaterial({
		fragmentShader: document.getElementById('shader_frag').textContent,
		vertexShader: document.getElementById('shader_vert').textContent,
		uniforms: {
			'tDiffuse': { type: 't', value: 0, texture: map_diff },
			'tLuminance': { type: 't', value: 1, texture: map_lum },
			'tAO': { type: 't', value: 2, texture: map_ao },
			'tReflection': { type: 't', value: 3, texture: map_reflect },
			'tCube': { type: 't', value: 4, texture: map_cube },
			'fHeat': { type: 'f', value: 0 },
			'tPass': { type: 'i', value: 0 }
		}
	});
	mat2 = new THREE.ShaderMaterial({
		fragmentShader: document.getElementById('shader_frag_trail').textContent,
		vertexShader: document.getElementById('shader_vert').textContent,
		uniforms: {
			'tNoise': { type: 't', value: 0, texture: map_noise },
			'fHeat': { type: 'f', value: 0 },
			'fTime': { type: 'f', value: 0 }
		},
		transparent: true
	});
	loader.load('models/racer.js', function(geom) {
		var mesh = new THREE.Mesh(geom, mat);
		player.geom = geom;
		player.mat = mat;
		player.mesh = mesh;
		scene.add(mesh);
		loader.load('models/racer_trail.js', function(geom) {
			var mesh = new THREE.Mesh(geom, mat2);
			player.mesh.add(mesh);
		});
	});

	points.push(new THREE.Vector3(-5, 0, 50));
	points.push(new THREE.Vector3(0, 0, -50));
	points.push(new THREE.Vector3(5, 0, 50));
	track = buildTrack(points);
	scene.add(track);

	var plane = new THREE.PlaneGeometry(1000, 1000, 100, 100);
	var pmesh = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({wireframe: true, color: 0xffffff}));
	pmesh.rotation.set(Math.PI / 2, 0, 0);
	scene.add(pmesh);

	// Audio stuff

	if (typeof webkitAudioContext !== 'undefined') {
		actx = new webkitAudioContext();
		if (samples.engine === undefined) loadSound('engine', function(buffer) {
			var src = actx.createBufferSource();
			sounds.push(src);
			src.buffer = buffer;
			src.loop = true;
			src.connect(actx.destination);
			src.noteOn(0);
		});
	}

	// Misc stuff

	//controls = new THREE.TrackballControls(camera);
	//controls.noPan = true;

	pse = document.getElementById('padstate');
	psc = document.getElementById('padcontrols');

	clock = new THREE.Clock();

	//window.addEventListener('mousemove', function(e) { player.rpm = 1 - e.clientY / window.innerHeight; }, false);
	window.addEventListener('keydown', function(e) { keys[e.keyCode] = true; }, false);
	window.addEventListener('keyup', function(e) { keys[e.keyCode] = false; }, false);
	window.addEventListener('resize', function() { renderer.setSize(window.innerWidth, window.innerHeight); camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); }, false);

	setInterval(loop, 16);
	requestAnimationFrame(draw);
}

function loop() {

	var delta = clock.getDelta();

	gamepad = Gamepad.getState(0);

	var p = new THREE.Vector3();

	if (typeof gamepad !== 'undefined') {

		pse.style.display = 'none';
		psc.style.display = 'block';

		if (psc.innerHTML.length === 0) {
			psc.appendChild(makeImg(gamepad.images.leftStick));
			psc.innerHTML += 'Steering<br />';
			psc.appendChild(makeImg(gamepad.images.rightStick));
			psc.innerHTML += 'Camera<br />';
			psc.appendChild(makeImg(gamepad.images.rightShoulder1));
			psc.innerHTML += 'Throttle';
		}

		player.rpm += (gamepad.rightShoulder1 - player.rpm) * delta * 3;

		p = new THREE.Vector3(-gamepad.rightStickX, 0, -gamepad.rightStickY);
		if (p.length() < 0.4) {
			p.set(0, 0.7, 1);
		} else {
			p.normalize();
			p.setY(0.7);
		}
		p = p.multiplyScalar(20);


	} else {

		pse.style.display = 'block';
		psc.style.display = 'none';

		player.rpm += ((keys[38] ? 1 : 0) - player.rpm) * delta * 3;

	}

	if (p.length() < 0.1) {
		p.set(0, 14, 20);
	}



	//player.speed = player.speed + player.rpm * delta;
	//player.speed -= 0.2 * delta;
	//player.speed += 0.01;
	//if (player.speed < 0) player.speed = 0;

	player.direction = (player.direction - (Math.abs(gamepad.leftStickX) > gamepad.deadZoneLeftStick ? gamepad.leftStickX * delta : 0)) % (Math.PI * 2);

	player.mesh.position.set( Math.cos(player.direction) * player.speed * 100 * delta, 0, Math.sin(player.direction) * player.speed * 100 * delta );
	player.mesh.rotation.setY(player.direction);
	player.mesh.rotation.setX(player.rpm * -0.1);


	camera.position.set(camera.position.x + ((player.mesh.position.x + p.x) - camera.position.x) * delta * 16,
	camera.position.y + ((player.mesh.position.y + p.y) - camera.position.y) * delta * 16,
	camera.position.z + ((player.mesh.position.z + p.z) - camera.position.z) * delta * 16);

	camera.position.addSelf(new THREE.Vector3(
		((player.mesh.position.x + p.x) - camera.position.x) * delta * 16,
		((player.mesh.position.x + p.y) - camera.position.y) * delta * 16,
		((player.mesh.position.x + p.z) - camera.position.z) * delta * 16
	));
	camera.lookAt(player.mesh.position);

	//mat.uniforms.fHeat.value = Math.sin(Date.now() % 2000 / 1000 * Math.PI) * 0.75 + 1 + 0.2 * Math.random();
	mat.uniforms.fHeat.value = (player.rpm * 2.25 + 0.25) * (1.0 + 0.2 * Math.random());
	mat2.uniforms.fHeat.value = player.rpm * 2.25 + 0.25;
	mat2.uniforms.fTime.value = (mat2.uniforms.fTime.value + delta * player.rpm * 10) % 1;

	// Set audio speed?
	if (sounds.length > 0) sounds[0].playbackRate.value = (player.rpm + 0.12) * 2 > 0.35 ? (player.rpm + 0.12) * 2 : 0.35;
}



function draw() {
	requestAnimationFrame(draw);

	renderer.render(scene, camera);
}



function buildTrack(points) {
	var spline = new THREE.Spline(points);
	return spline;
}



function loadSound(sound, callback) {
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
}

function makeImg(src) {
	var img = new Image();
	img.src = src;
	return img;
}