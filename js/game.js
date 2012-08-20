define(['lib/three', 'gfx', 'world', 'entities', 'hud', 'controls', 'player'], function(THREE, GFX, World, Entities, HUD, Controls, Player) {
	for (var a = 0; a < arguments.length; a++) {
		window[['THREE', 'GFX', 'World', 'Entities', 'HUD', 'Controls', 'Player'][a]] = arguments[a];
	}

	var scope = {

		clock: new THREE.Clock(),

		start: function() {


			requestAnimationFrame(this.draw);
			setInterval(this.loop, 16);
		},

		draw: function() {
			GFX.draw(World, Entities, HUD);
		},

		loop: function() {
			var delta = scope.clock.getDelta();

			World.loop();
			Entities.loop();
			HUD.loop();


		}

	};
	return scope;
});