function setupScene(width,height) {
	var scene;
	var camera;
	var controls;
	var renderer;
	
	var update=true;
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75,
                                    (width) / (height),
                                    1, 10000);
	camera.position.z = 1000;
	//var projector = new THREE.Projector();
	renderer = new THREE.CanvasRenderer();
	try{
	if(Modernizr.webgl)	{
		renderer = new THREE.WebGLRenderer ();
	}
	}
	catch(e) {
		//alert(e);
	}
	renderer.setSize(width,height);
   controls = new THREE.TrackballControls( camera ,renderer.domElement);
   controls.addEventListener("change",function (event){
   	update=true;
   	requestAnimationFrame(animate);
   });

   var fps=25;
   var lastExecution = new Date().getTime();
   var stats;
   if(typeof(Stats) != "undefined") {
		stats=new Stats();
		stats.setMode(1);
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.left = '0px';
		stats.domElement.style.top = '0px';
		document.body.appendChild( stats.domElement );
	}
   var animate=function(step) {
   		//document.title=step;
   		//console.log(step);
   		
   		var now = new Date().getTime();
		controls.update();
   		if((now - lastExecution) > (1000 / fps)) {
			if(update) {
					if(stats) {stats.begin();}
	   	 		renderer.render(scene, camera);	
	    			update=false;
	    			if(stats) {stats.end();}
			}
			lastExecution=new Date().getTime();
		}
		
		setTimeout(function () {
			requestAnimationFrame(animate);
		},1000 / fps);
   }
   function setUpdate() {
   	update=true;
   	requestAnimationFrame(animate);
   }
   requestAnimationFrame(animate);
	return {
		scene:scene,
		camera:camera,
		controls:controls,
		renderer:renderer,
		update:setUpdate
	}
}
window.error=function(e) {
	alert(error);
}