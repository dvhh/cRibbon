
var _scene;
var scene;
var camera;
var controls;
var update=true;
function setupScene(width,height) {
	_scene = new THREE.Scene();
	scene=new THREE.Object3D();
	_scene.add(scene);
	
	camera = new THREE.PerspectiveCamera(75,
                                    (width) / (height),
                                    1, 10000);
    camera.position.z = 1000;
	
    projector = new THREE.Projector();
	renderer = new THREE.CanvasRenderer();
	//renderer = new THREE.WebGLRenderer ();
	renderer.setSize(width,height);
	document.body.appendChild(renderer.domElement);
    renderer.setSize(width,height);

    document.body.appendChild(renderer.domElement);
    controls = new THREE.TrackballControls( camera ,renderer.domElement);
    controls.addEventListener("change",function (event){
    	update=true;
    });
	requestAnimationFrame(animate);
}

function animate()
{
    requestAnimationFrame(animate);
	controls.update();
	//TWEEN.update();
	//scene.rotation.y+=(0.01);
	if(update) {
    	render();
    	update=false;
	}
	//update();
}

function render() {
	renderer.render(_scene, camera);	
}
