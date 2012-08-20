define(['lib/three', 'loader'], function(THREE, loader) {
	var Entity = function(o) {
		var scope = this;
		o = o || {};
		this.type = (o.type !== undefined) ? o.type : 'mesh';
		switch (this.type) {
			case 'mesh':
				THREE.Mesh.call(this, new THREE.SphereGeometry(1), new THREE.MeshBasicMaterial(0xff0000));
				if (o.material !== undefined) {
					this.material = o.material;
				} else {
					this.material = new MeshBasicMaterial(0xff0000);
				}
				if (o.geometry !== undefined) {
					this.geometry = o.geometry;
				} else {
					this.geometry = new THREE.SphereGeometry(1);
				}
				break;
			case 'sprite':
				THREE.Sprite.call(this);
				if (o.texture !== undefined) {
					this.map = o.texture;
				} else {
					this.map = function() {
						var c = document.createElement('canvas');
						var g = c.getContext('2d');
						c.width = 32;
						c.height = 32;
						g.fillRect(0,0,32,32);
						return c;
					}();
				}
				break;
			default:
				THREE.Object3D.call(this);
		}

		this.velocity = o.velocity !== undefined ? o.velocity : new THREE.Vector3();
		this.rotVelocity = o.rotVelocity !== undefined ? o.rotVelocity : 0;

		this.rotAxis = o.rotAxis !== undefined ? o.rotAxis : new THREE.Vector3(0, 1, 0);
		this.rotMatrix = new THREE.Matrix4();
		this.rotMatrix.setRotationAxis(this.rotAxis, this.rotVelocity);

		this.mass = o.mass !== undefined ? o.mass : 0;

		this.loop = function(delta) {
			var epsilon = delta / 1000;
			scope.position.set(scope.position.x + scope.velocity.x, scope.position.y + scope.velocity.y - scope.mass, scope.position.z + scope.velocity.z);
			scope.rotMatrix.setRotationMatrix(scope.rotAxis, scope.rotVelocity);
			scope.rotMatrix.multiply(scope.rotation);

			scope.position.addSelf(scope.velocity);
			scope.position.setY(scope.position.y - scope.mass);
			scope.rotation.addSelf(scope.rotVelocity);
		};
	};

	return {
		Entity: Entity,
		list: [],
		loop: function(delta) {
			var i;
			for (i = 0; i < this.list.length; i++) {
				this.list[i].loop(delta);
			}
		},
		add: function(ent) {
			var i, exist = -1;
			for (i = 0; i < this.list.length; i++) {
				if (ent.id === this.list[i].id) {
					exist = i;
				}
			}
			if (exist !== -1) {

			}
		}
	};
});