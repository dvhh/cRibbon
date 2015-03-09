var groupColors=[
[0x00,0x00,0xFF],//0
[0x00,0xFF,0xFF],//1
[0x00,0xFF,0x00],//2
[0xFF,0xFF,0x00],//3
[0xFF,0x00,0x00] //4
/*
0x0000FF, //0
0x00FFFF, //1
0x00FF00, //2
0xFFFF00, //3
0xFF0000, //4
*/
];
function getValue(t,a,b) {
	return a+(b-a)*t;
}
function getGroupColor(n) {
	var m=n*4;
	var r=1;
	var g=1;
	var b=1;
	
	if( (m<1) ) {
		r=0;
		g=m;
		b=1;
	}else if( (m>=1)&&(m<2) ) {
		r=0;
		g=1;
		b=(1-(m-1));
	}else if( (m>=2)&&(m<3) ) {
		r=(m-2);
		g=1;
		b=0;
	}else if( (m>=3)&&(m<4) ) {
		r=1;
		g=(1-(m-3));
		b=0;
	}else{
		console.log(m,n);
	}
	var c=new THREE.Color();
	c.setRGB(r,g,b);
	return c;
}

function inRange(value,range) {
	return ((value>=range.start)&&(value<=range.end));
}

function inRanges(value,ranges) {
	var i;
	for(i=0;i<ranges.length;i++) {
		var range=ranges[i];
		if(inRange(value,range)) {
			return true;
		}
	}
	return false;
}

function atomSort(a,b) {
	if(a.serial<b.serial) return -1;
	if(a.serial>b.serial) return 1;
	return 0
}

function getAtomHash(atom) {
	return atom.resName + atom.chainID + atom.seqno;
}

function getNewResidueData() {
	return {
		aminoAcid:"",
		chainID:"",
		seqno:0,
		hash:"",
		type:"coil",
		atoms:{}
	};
}
function atom2Vector3(atom) {
	return new THREE.Vector3(atom.x,atom.y,atom.z);
}
function residueVectors(residue,next) {
	
	var CA=atom2Vector3(residue.atoms["CA"]);
	var CA2=atom2Vector3(residue.atoms["N"]);
	if(next!=null) {
		CA2=atom2Vector3(next.atoms["CA"]);
	}
	
	//var N=residue.atoms["N"]
	var O=atom2Vector3(residue.atoms["O"]);
	var u=new THREE.Vector3();
	var u2=new THREE.Vector3();
	u.sub(CA2,CA);
	u2.sub(O,CA);
	var v=new THREE.Vector3();
	var w=new THREE.Vector3();
	v.cross(u,u2);
	w.cross(u,v);
	v.normalize();
	w.normalize();
	
	residue.u=u;
	residue.v=v;
	residue.w=w;
	
}
function Pdbdata2ResidueData(input,model) {
	var helix_ranges=new Array();
	var strand_ranges=new Array();
	
	var i;
	for(i=0;i<input.helix.length;i++) {
		helix_ranges.push({
			start:input.helix[i].initialResNum,
			end:input.helix[i].terminalResNum,
			type:input.helix[i].helixType
		});
	}
	for(i=0;i<input.strands.length;i++) {
		strand_ranges.push({
			start:input.strands[i].initialResNum,
			end:input.strands[i].terminalResNum,
		});
	}
	
	var atoms=input.models[model].atoms;
	
	atoms.sort(atomSort);
	var residues=new Array();
	var currentResidueIndex=0;

	var currentResidue=getNewResidueData();
	residues.push(currentResidue);
	
	for(i=0;i<atoms.length;i++) {
		atom=atoms[i];
		if(currentResidue.hash=="") {
			currentResidue.hash=getAtomHash(atom);
			currentResidue.aminoAcid=atom.resName;
			currentResidue.chainID=atom.chainID;
			currentResidue.seqno=atom.seqno;
			
			currentResidue.hash=getAtomHash(atom);
			
			if(inRanges(currentResidue.seqno,helix_ranges)) {
				currentResidue.type="helix";
			}
			if(inRanges(currentResidue.seqno,strand_ranges)) {
				currentResidue.type="strand";
			}
		}
		
		if(currentResidue.hash!=getAtomHash(atom)) {
			//residueVectors(currentResidue);
			
			currentResidue=getNewResidueData();
			
			currentResidue.aminoAcid=atom.resName;
			currentResidue.chainID=atom.chainID;
			currentResidue.seqno=atom.seqno;
			
			currentResidue.hash=getAtomHash(atom);
			
			if(inRanges(currentResidue.seqno,helix_ranges)) {
				currentResidue.type="helix";
			}
			if(inRanges(currentResidue.seqno,strand_ranges)) {
				currentResidue.type="strand";
			}
			
			residues.push(currentResidue);
		}
		currentResidue.atoms[atom.atom]={
			atom:atom.atom,
			serial:atom.serial,
			x:atom.x,
			y:atom.y,
			z:atom.z
		}
	}
	return residues;
}

function drawRibbon(geometry,u,v,dwu,dwv,num) {
	var a=new THREE.Vector3();
	var b=new THREE.Vector3();
	var c=new THREE.Vector3();
	var d=new THREE.Vector3();
	a.add(u,dwu);
	b.sub(u,dwu);
	d.add(v,dwv);
	c.sub(v,dwv);
	var index=geometry.vertices.length;
	geometry.vertices.push(a);
	geometry.vertices.push(b);
	geometry.vertices.push(c);
	geometry.vertices.push(d);
	
	var segment=new THREE.Face4(index,index+1,index+2,index+3);
	segment.materialIndex=num;
	geometry.faces.push(segment);
}
function getColor(residue,colorScheme,chainCount) {
	var color=0xdddddd;
	switch(colorScheme){
		case "secondary" : {
			switch(residue.type) {
				case "helix": {
					color=new THREE.Color(0xFF0080);
					break;
				}
				case "strand": {
					color=new THREE.Color(0xFFC800);
					break;
				}
				case "coil" : {
					color=new THREE.Color(0xdddddd);
					break;
				}
				default:
				{
					console.log(residue.type);
				}
			}
			//color=new THREE.Color(0xdddddd);
			break;
		}
		case "group" : {
			//console.log(residue.chainID)
			if(residue.type=="coil") {
				color=new THREE.Color(0xdddddd);
			}else{
				color=getGroupColor(residue.ChainIndex/(chainCount[residue.chainID]));
			}
			break;
		}
	}
	return color;
}

function Pdbdata2Cartoon3(input,model,colorScheme) {
	var residues=Pdbdata2ResidueData(input,model);
	//console.log(residues);	
	var result = new THREE.Object3D();
	var geometry = new THREE.Geometry();
	var i;
	chainCount={};
	currentChainNum=1;
	currentChain="";
	for(i=0;i<residues.length;i++) {
		var residue=residues[i];
		if(currentChain!=residue.chainID) {
			currentChainNum=0;
			currentChain=residue.chainID;
			chainCount[currentChain]=0;
		}
		residue.ChainIndex=currentChainNum++;
		chainCount[currentChain]++;
		
		var next=null;
		if(i<(residues.length-1)) {
			next=residues[i+1];
		}
		residueVectors(residue,next)
	}

	var r0,r1,r2,r3;
	
	var r=1;
	if(residues[0].type=="coil") {
		r=0.1;
	}
	
	var color=getColor(residues[0],colorScheme,chainCount);
	r0=residues[0];
	r1=residues[1];
	r2=residues[2];
	r3=residues[3];
	drawSmoothRibbon(r0,r1,r2,r3,[1,0,0],geometry,0,r);
	geometry.materials.push(new THREE.MeshBasicMaterial     ({color:color,side:THREE.DoubleSide,wireframe:false}))
	for(i=0;i<residues.length-4;i++) {
		var r=1;
		if(residues[i+1].type=="coil") {
			r=0.1;
		}
		
		var r0=residues[i];
		var r1=residues[i+1];
		var r2=residues[i+2];
		var r3=residues[i+3];
		if(r1.chainID == r2.chainID) {
			drawSmoothRibbon(r0,r1,r2,r3,[0,1,0],geometry,i,r);
		}
		color=getColor(residues[i+2],colorScheme,chainCount);
		geometry.materials.push(new THREE.MeshBasicMaterial     ({color:color,side:THREE.DoubleSide,wireframe:false}))
	}
	r=1;
	if(residues[residues.length-2].type=="coil") {
		r=0.1;
	}
	r0=residues[residues.length-4];
	r1=residues[residues.length-3];
	r2=residues[residues.length-2];
	r3=residues[residues.length-1];
	color=getColor(residues[residues.length-2],colorScheme,chainCount);
	drawSmoothRibbon(r0,r1,r2,r3,[0,0,1],geometry,residues.length-1,r);
	geometry.materials.push(new THREE.MeshBasicMaterial     ({color:color,side:THREE.DoubleSide,wireframe:false}))
	

	geometry.mergeVertices();
	geometry.computeCentroids();
	geometry.computeFaceNormals();
	geometry.computeVertexNormals();
	result.add(new THREE.Mesh ( geometry, 
		new THREE.MeshFaceMaterial()
	));
	result.doubleSided = true;
	return result;	
}

function getAB(residue,r) {
	var v0=atom2Vector3(residue.atoms["CA"]);
	var v1=atom2Vector3(residue.atoms["CA"]);
	dw=residue.w.clone();
	dw.multiplyScalar(r);
	return [v0.addSelf(dw),v1.subSelf(dw)]
}

function drawSmoothRibbon(p0,p1,p2,p3,section,geometry,materialIndex,r) {
	//console.log(p0,p1,p2,p3);
	var a=new Array();
	var b=new Array();
	var vertices=getAB(p0,r)
	a.push(vertices[0]);
	b.push(vertices[1]);
	var vertices=getAB(p1,r)
	a.push(vertices[0]);
	b.push(vertices[1]);
	var vertices=getAB(p2,r)
	a.push(vertices[0]);
	b.push(vertices[1]);
	var vertices=getAB(p3,r)
	a.push(vertices[0]);
	b.push(vertices[1]);
	
	var a_splines=spline3d(a[0],a[1],a[2],a[3],0.3333);
	var b_splines=spline3d(b[0],b[1],b[2],b[3],0.3333);
	
	var i;
	for(i=0;i<3;i++) {
		if(section[i]==1) {
			var j;
			for(j=0;j<a_splines[i].length-1;j++) {
				a=a_splines[i][j];
				b=b_splines[i][j];
				d=a_splines[i][j+1];
				c=b_splines[i][j+1];
				
				var index=geometry.vertices.length;
				geometry.vertices.push(a);
				geometry.vertices.push(b);
				geometry.vertices.push(c);
				geometry.vertices.push(d);
				
				var segment=new THREE.Face4(index,index+1,index+2,index+3);
				segment.materialIndex=materialIndex;
				geometry.faces.push(segment);
				
			}
		}
	}
}

function spline3d(p0,p1,p2,p3,precision) {
	var m0=tangent(p1,p0);
	var m1=tangent(p2,p0);
	var m2=tangent(p3,p1);
	var m3=tangent(p3,p2);
	
	var s0=new Array();
	var s1=new Array();
	var s2=new Array();
	
	for(var t=0;t<=1;t+=precision) {
		var vertices=interpolate(p0,p1,p2,p3,m0,m1,m2,m3,t);
		s0.push(vertices[0]);
		s1.push(vertices[1]);
		s2.push(vertices[2]);
	}
	return [s0,s1,s2];
}

function tangent(pk,pk1) {
	result=new THREE.Vector3();
	result.sub(pk,pk1);
	result.divideScalar(2);
	return result;
}
function weightedSum(w0,p0,w1,p1,w2,p2,w3,p3) {
	var v0=p0.clone();
	var v1=p1.clone();
	var v2=p2.clone();
	var v3=p3.clone();
	v0.multiplyScalar(w0);
	v1.multiplyScalar(w1);
	v2.multiplyScalar(w2);
	v3.multiplyScalar(w3);
	var result=v0.clone();
	result.addSelf(v1);
	result.addSelf(v2);
	result.addSelf(v3);
	return result;
}

function interpolate(p0,p1,p2,p3,m0,m1,m2,m3,t) {
	var t_2=t*t;
	var _1_t = 1-t;
	var _2t=2*t;
	var _1_t_2= _1_t * _1_t;
	
	var h00 = (1 + _2t) * (_1_t_2);
	var h10 = t * _1_t_2;
	var h01 = t_2 * (3 - _2t);
	var h11 = t_2 * (t - 1);
	
	var v0=weightedSum(h00,p0,h10,m0,h01,p1,h11,m1);
	var v1=weightedSum(h00,p1,h10,m1,h01,p2,h11,m2);
	var v2=weightedSum(h00,p2,h10,m2,h01,p3,h11,m3);
	return [v0,v1,v2];
}
/*
src : http://actionsnippet.com/?p=1031
function curve(p0:Sprite, p1:Sprite, p2:Sprite, p3:Sprite, rez:Number=.02):void{
    var px:Number = 0;
    var py:Number = 0;
    var m0:Point = tangent(p1, p0);
    var m1:Point = tangent(p2, p0);
    var m2:Point = tangent(p3, p1);
    var m3:Point = tangent(p3, p2);
   
    for (var t:Number = 0; t <1; t+=rez){
         var t_2:Number = t * t;
         var _1_t:Number = 1 - t;
         var _2t:Number = 2 * t;
         
         var h00:Number =  (1 + _2t) * (_1_t) * (_1_t);
         var h10:Number =  t  * (_1_t) * (_1_t);
         var h01:Number =  t_2 * (3 - _2t);
         var h11:Number =  t_2 * (t - 1);
         
         px = h00 * p0.x + h10 * m0.x + h01 * p1.x + h11 * m1.x;
         py = h00 * p0.y + h10 * m0.y + h01 * p1.y + h11 * m1.y;
         canvas.setPixel(px, py, 0xFFFFFF);
         
         px = h00 * p1.x + h10 * m1.x + h01 * p2.x + h11 * m2.x;
         py = h00 * p1.y + h10 * m1.y + h01 * p2.y + h11 * m2.y;
         canvas.setPixel(px, py, 0xFFFFFF);
         
         px = h00 * p2.x + h10 * m2.x + h01 * p3.x + h11 * m3.x;
         py = h00 * p2.y + h10 * m2.y + h01 * p3.y + h11 * m3.y;
         canvas.setPixel(px, py, 0xFFFFFF);
    }
}
 
function tangent(pk1:Sprite, pk_1:Sprite){
    return new Point((pk1.x - pk_1.x) / 2, (pk1.y - pk_1.y) / 2);
}
*/
