// requestAnimationFrame polyfill.
( function () {
	var lastTime = 0;
	var vendors = [ 'ms', 'moz', 'webkit', 'o' ];
	for ( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++ x ) {
		window.requestAnimationFrame = window[ vendors[ x ] + 'RequestAnimationFrame' ];
		window.cancelAnimationFrame = window[ vendors[ x ] + 'CancelAnimationFrame' ] || window[ vendors[ x ] + 'CancelRequestAnimationFrame' ];
	}
	if ( window.requestAnimationFrame === undefined ) {
		window.requestAnimationFrame = function ( callback, element ) {
			var currTime = Date.now(), timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
			var id = window.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
			lastTime = currTime + timeToCall;
			return id;
		};
	}
	if ( window.cancelAnimationFrame === undefined ) {
		window.cancelAnimationFrame = function ( id ) { clearTimeout( id ); };
	}
}() );

// Math TAU and DEGRAD additions.
Math.TAU = Math.PI * 2;
Math.DEGRAD = Math.TAU / 360;

// Start up engine.
require(['game'],function(game){
	window.Game = game;
	game.start();
});