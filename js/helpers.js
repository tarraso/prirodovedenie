function set_force(force, x, y){
	var magnitude = game.world.pxmi()
	
	force[0] += magnitude * x;
	force[1] += magnitude * y;
}