var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update:update, render: render });

function preload() {

	game.load.image('elevator', './assets/sprites/elevator.png');
	game.load.image('some_object', './assets/sprites/object.png');
	game.load.image('tile', './assets/sprites/tile.png');
	game.load.image('back', './assets/sprites/back.png');
	game.load.image('enemy', './assets/sprites/enemy.png');
	game.load.image('banka', './assets/sprites/banka.png');
	game.load.image('butylka', './assets/sprites/butylka.png');
	game.load.physics('physicsData', './assets/sprites.json');
	game.load.image('tile1', './assets/sprites/tile1.png');
	game.load.image('tile2', './assets/sprites/tile2.png');
	game.load.image('tile2-3', './assets/sprites/tile2-3.png');
	game.load.image('tile3', './assets/sprites/tile3.png');
	game.load.image('tile3-4', './assets/sprites/tile3-4.png');
	game.load.image('tile4', './assets/sprites/tile4.png');
	game.load.image('tile4-4', './assets/sprites/tile4-4.png');
	game.load.image('tile4-5', './assets/sprites/tile4-5.png');
	game.load.image('tile5', './assets/sprites/tile5.png');
	game.load.image('tile5-6', './assets/sprites/tile5-6.png');
	game.load.image('tile6', './assets/sprites/tile6.png');
	game.load.image('tile6-6', './assets/sprites/tile6.png');
	game.load.audio('soundtrack', ['./assets/music/old29-1.mp3']);

};
var elevator;
var some_object;
var cursors;
var tiles;
var enemies;
var walls_reconstruction_y = 0;
function create() {

	music = game.sound.play('soundtrack');

	//  This creates a simple sprite that is using our loaded image and
	//  displays it on-screen

	game.world.setBounds(0, 0, 600, 6000000);  
	back = game.add.tileSprite(0, 0, 800, 600, 'back');
	back.fixedToCamera = true;

 
	game.physics.startSystem(Phaser.Physics.P2JS);

	game.physics.p2.gravity.y = 300;
	game.physics.p2.restitution = 0.8;

	cursors = game.input.keyboard.createCursorKeys();

	elevator = game.add.sprite(300, 400, 'elevator');
	game.physics.enable(elevator, Phaser.Physics.P2JS);
 	//elevator.body.loadPolygon('physicsData', 'elevator');
	some_object = game.add.sprite(400,100, 'some_object');
	game.physics.enable( some_object, Phaser.Physics.P2JS);
	
	var spring = game.physics.p2.createSpring(some_object, elevator, 
		340,
		100,//stiffne
		30,//damping
		null,//dampiing);
		null,
		null,
		[0,50]);
	
	some_object.body.kinematic = true;


	tiles = game.add.group();
    tiles.physicsBodyType = Phaser.Physics.P2JS;
	tiles.setAll("body.static", true);
	tiles.createMultiple(180, "tile");
	tiles.enableBody = true;
	for(var i=0; i<26; i++){
		var y = -1000 + 128*i;
		create_layer(y);
	}
	walls_reconstruction_y = -1000+ 25*128;

	enemies = game.add.group();
	enemies.physicsBodyType = Phaser.Physics.P2JS;
	enemies.createMultiple(60, "enemy");
	enemies.enableBody = true;

}


var speed_mode = 1;
var speed_change_time = 0;
function update(){

	game.camera.y = some_object.body.y+200;
	if(game.time.now > speed_change_time){
		if (cursors.up.isDown)
		{
			speed_mode-=2;
			speed_change_time = game.time.now + 500;
		}
		else if (cursors.down.isDown)
		{
			speed_mode++;
			speed_change_time = game.time.now+ 500;
		}
	}
	speed_mode = Math.max(-1, Math.min(speed_mode, 14));
	some_object.body.velocity.y = speed_mode*150;

	if (cursors.left.isDown)
	{
		rottrust(elevator.body, 150);
	}
	else if (cursors.right.isDown)
	{
		rottrust(elevator.body, -150);
	}

	back.tilePosition.x = -game.camera.x;
	back.tilePosition.y = -game.camera.y;

	reconstruct_walls();
	generate_enemies();

	kill_enemies();

	if(elevator.body.y<some_object.body.y){
		location.reload();
	}

}

function render(){

}

function start_game(){

}

function generate_enemies(){
	if((Math.random()*30<1)&&(enemies.countLiving()<90)){
		var sprite = ['butylka','banka'][Math.round(Math.random()*2)];
		var enemy = enemies.create(some_object.body.x - 100 + Math.random()*200, some_object.body.y + 120, sprite);
		enemy.body.mass = 0.5;
	}
}


function kill_enemies(){
	enemies.forEach(function(enemy){
		if(enemy.alive&&(Math.abs(elevator.body.y - enemy.body.y)>1000)){
			enemy.kill();
		}
	}, true)
}

function reconstruct_walls(){
	
	if(walls_reconstruction_y - elevator.body.y < 500){
		for(var i=1;i<=10; i++){
			var x1 = 128 + 128 * Math.round(Math.random());
			var x2 = 630 + 128 * Math.round(Math.random());
			var y =  walls_reconstruction_y + i*128
			create_layer(y);

		}
		walls_reconstruction_y +=1280;
	}
}

function create_layer(y){
	var r1 = 2+Math.round(Math.random());
	var r2 = 2+Math.round(Math.random());
	var required_kill = (tiles.countLiving()>150);
	for(var i=1; i<=r1; i++){
		var tile = tiles.create(-160+128*i, y, tileChooser(y));
		tile.body.static = true;
		if(required_kill)
			tiles.getFirstAlive().kill();
	}
	for(var i=1; i<=r2; i++){
		var tile = tiles.create(960-128*i, y, tileChooser(y));
		tile.body.static = true;
		if(required_kill)
			tiles.getFirstAlive().kill();
	}
}

function rottrust(body, speed) {

	var magnitude = body.world.pxmi(-speed);
	var angle = body.data.angle + Math.PI / 2;

	body.data.force[0] += magnitude * Math.sin(angle);
	body.data.force[1] += magnitude * Math.cos(angle);

}

function tileChooser(y){
	if(y<=128){
		return "tile1"
	}
	if((y>128)&&(y<=15000)){
		return "tile2"
	}
	if((y>15000)&&(y<=15128)){
		return "tile2-3"
	}
	if((y>15128)&&(y<=26000)){
		return "tile3"
	}
	if((y>26000)&&(y<=26128)){
		return "tile3-4"
	}
	if((y>26128)&&(y<=35000)){
		if((Math.random()>0.5))
			return "tile4"
		else
			return "tile4-4"
	}
	if((y>35000)&&(y<=35128)){
		return "tile4-5"
	}
	if((y>35128)&&(y<45000)){
		return "tile5"
	}
	if((y>45000)&&(y<45128)){
		return "tile5-6"
	}
	if((y>45128)){
		if(Math.random()>0.5)
			return "tile6"
		else
			return "tile6-6"
	}
}
