define(['lib/three'], function(THREE) {

	var renderer, scene, camera;

	var view = {
		width: window.innerWidth,
		height: window.innerHeight,

		angle: 45,
		aspect: window.innerWidth / window.innerHeight,
		near: 0.1,
		far: 1000,

		resize: function(renderer, camera) {
			this.width = window.innerWidth;
			this.height = window.innerHeight;
			renderer.setSize(view.width, view.height);
			this.aspect = this.width / this.height;
			camera.aspect = this.aspect;
			camera.updateProjectionMatrix();
		}
	};

	window.addEventListener('resize', function() { view.resize(renderer, camera); }, false);

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(view.angle, view.aspect, view.near, view.far);
	scene.add(camera);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(view.width, view.height);
	document.getElementsByTagName('body')[0].appendChild(renderer.domElement);

	return {

		scene: scene,
		camera: camera,
		renderer: renderer,

		update: function(world, entities, hud) {
			//for (var i = 0; i < world.l)
		},

		draw: function(world, entities, hud) {

			renderer.render(scene, camera);
		}

	};
});