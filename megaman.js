var megaman = {x: 0, y: 0, z: 0, hp: 16};
var mobs = [];

var scene, camera, renderer, keyboard;
var animation, animationPic;
var updateClock;

var background, foreground;
var backgroundTexture, foregroundTexture;
var backgroundPlane, foregroundPlane;
var backgroundMaterial, foregroundMaterial;
var megamanImg, wmegamanImg;
var megamanTexture, wmegamanTexture;
var megamanPlane;
var megamanMaterial, wmegamanMaterial;
var standingClock = 30, runningClock = 450;

var esquerda = false;

// var keyboard = new THREE.KeyboardState();
var clock = new THREE.Clock();

keyboard = new KeyboardState();
init();
animate();

function init() {
  var ScreenWidth = 800, ScreenHeight = 600;
  var viewAngle = 90;
  var near = 0.1;
  var far = 2000;

    backgroundTexture = new THREE.ImageUtils.loadTexture('sprites/background/novobg.png');
    megamanTexture = new THREE.ImageUtils.loadTexture('sprites/mmx/standingmmx.png');
    megamanTexture.minFilter = THREE.LinearFilter;
    wmegamanTexture = new THREE.ImageUtils.loadTexture('sprites/mmx/walkingmmx.png');
    wmegamanTexture.minFilter = THREE.LinearFilter;
    megamanAnim = new TextureAnimator(megamanTexture, 1, 3, 3, 30);
    wmegamanAnim = new TextureAnimator(wmegamanTexture, 1, 11, 11, 30);
    foregroundTexture = new THREE.ImageUtils.loadTexture('sprites/background/foreground.png');

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(ScreenWidth, ScreenHeight);

    container = document.getElementById('ThreeJS');
	  container.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(viewAngle, ScreenWidth/ScreenHeight, near, far);
    scene.add(camera);
    camera.position.set(-3730, 130, 100);
    camera.lookAt(-3730, 130, 100);

    backgroundMaterial = new THREE.MeshBasicMaterial( { map: backgroundTexture, side: THREE.DoubleSide, transparent: true } );
    megamanMaterial = new THREE.MeshBasicMaterial( { map: megamanTexture, side: THREE.DoubleSide, transparent: true} );
    wmegamanMaterial = new THREE.MeshBasicMaterial( { map: wmegamanTexture, side: THREE.DoubleSide, transparent: true} );
    foregroundMaterial = new THREE.MeshBasicMaterial( { map: foregroundTexture, side: THREE.DoubleSide, transparent: true } );

    backgroundPlane = new THREE.PlaneGeometry( 4693,460,1,1 );
    megamanPlane = new THREE.PlaneGeometry( 600,679 );
    foregroundPlane = new THREE.PlaneGeometry( 7680,460,1,1 );

    background = new THREE.Mesh(backgroundPlane, backgroundMaterial);
    megamanImg = new THREE.Mesh(megamanPlane, megamanMaterial);
    wmegamanImg = new THREE.Mesh(megamanPlane, wmegamanMaterial);
    foreground = new THREE.Mesh(foregroundPlane, foregroundMaterial);

    background.position.set(-550,0,0);
    background.scale.set(1.5,1,1);
    megamanImg.position.set(-3730, 119, 30);
    megamanImg.scale.set(0.035,0.035,0.035);
    wmegamanImg.position.set(-3730, 119, 30);
    wmegamanImg.scale.set(0.035,0.035,0.035);
    animationPic = megamanImg;
    animation = megamanAnim;
    updateClock = standingClock;
    megaman.x = -3730;
    megaman.y = 119;
    megaman.z = 30;
    foreground.position.set(0,0,20);

    scene.add(background);
    scene.add(animationPic);
    scene.add(foreground);

    // renderer.setClearColor( new THREE.Color(0xffffff), 1);

    renderer.render(scene, camera);
}

function animate()
{
    requestAnimationFrame( animate );
	  renderer.render(scene, camera);
	  update();
}

function update()
{
  var delta = clock.getDelta();
  var moveDistance = 50 * delta;

  keyboard.update();
  animation.update(updateClock * delta);

  megaman.x = animationPic.position.x;
  megaman.y = animationPic.position.y;
  megaman.z = animationPic.position.z;

  if ( keyboard.down("A") || keyboard.pressed("A") ){
    if(esquerda == false){
      esquerda = true;
      animationPic.scale.x *= -1;
    }
    changeAnim(wmegamanAnim, wmegamanImg, runningClock);

    if(camera.position.x > -3730 && animationPic.position.x <= camera.position.x)
      camera.translateX( -moveDistance );
    if(animationPic.position.x > -3775)
      animationPic.translateX( -moveDistance );
  }

  if ( keyboard.down("D") || keyboard.pressed("D") ){
    if(esquerda == true){
      esquerda = false;
      animationPic.scale.x *= -1;
    }
    changeAnim(wmegamanAnim, wmegamanImg, runningClock);

    if( !(animationPic.position.x < camera.position.x) )
      camera.translateX(  moveDistance );
    animationPic.translateX( moveDistance );
  }

  if( keyboard.up("A") || keyboard.up("D") ) {
    changeAnim(megamanAnim, megamanImg, standingClock);
    if( keyboard.up("A") && esquerda == false)
    {
      animationPic.scale.x *= -1;
      esquerda = true;
    }
  }
}

function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration)
{
	// note: texture passed by reference, will be updated by the update function.

	this.tilesHorizontal = tilesHoriz;
	this.tilesVertical = tilesVert;
	// how many images does this spritesheet contain?
	//  usually equals tilesHoriz * tilesVert, but not necessarily,
	//  if there at blank tiles at the bottom of the spritesheet.
	this.numberOfTiles = numTiles;
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );

	// how long should each image be displayed?
	this.tileDisplayDuration = tileDispDuration;

	// how long has the current image been displayed?
	this.currentDisplayTime = 0;

	// which image is currently being displayed?
	this.currentTile = 0;

	this.update = function( milliSec )
	{
		this.currentDisplayTime += milliSec;
		while (this.currentDisplayTime > this.tileDisplayDuration)
		{
			this.currentDisplayTime -= this.tileDisplayDuration;
			this.currentTile++;
			if (this.currentTile == this.numberOfTiles)
				this.currentTile = 0;
			var currentColumn = this.currentTile % this.tilesHorizontal;
			texture.offset.x = currentColumn / this.tilesHorizontal;
			var currentRow = Math.floor( this.currentTile / this.tilesHorizontal );
			texture.offset.y = currentRow / this.tilesVertical;
		}
	};
}

function changeAnim(novaAnim, novaImg, clockzin)
{
    if(esquerda == true)
      animationPic.scale.x *= -1;

    megaman.x = animationPic.position.x;
    megaman.y = animationPic.position.y;
    megaman.z = animationPic.position.z;
    scene.remove(animationPic);

    animation = novaAnim;
    animationPic = novaImg;
    updateClock = clockzin;
    esquerda = false;

    animationPic.position.set(megaman.x,megaman.y,megaman.z);
    scene.add(animationPic);
}
