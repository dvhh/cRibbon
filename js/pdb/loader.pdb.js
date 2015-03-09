// ref : http://www.cgl.ucsf.edu/chimera/docs/UsersGuide/tutorials/pdbintro.html
//HELIX	Format ( A6,1X,I3,1X,A3,2(1X,A3,1X,A1,1X,I4,A1),I2,A30,1X,I5 )
//SHEET	Format ( A6,1X,I3,1X,A3,I2,2(1X,A3,1X,A1,I4,A1),I2,2(1X,A4,A3,1X,A1,I4,A1) )

var PDBData=function() {
	this.helix=new Array();
	this.strands=new Array();
	
	this.models=new Array();
	//this.currentModel=null;
	this.currentModelIndex=-1;
};

PDBData.prototype.contructor=PDBData;

PDBData.prototype.newModel=function(record) {
	/*
	this.currentModel={
		num:record.serial,
		atoms:new Array()
	};
	*/
	this.models.push({
		num:record.serial,
		atoms:new Array()
	});
	this.currentModelIndex=this.models.length-1;
}

PDBData.prototype.addAtom=function(record) {
	if(this.currentModelIndex==-1) {
		this.newModel({serial:0});
	}
	this.models[this.currentModelIndex].atoms.push(record);
}

PDBData.prototype.addHelixInfo=function(record) {
	this.helix.push(record);
}

PDBData.prototype.addSheetInfo=function(record) {
	this.strands.push(record);
}

PDBData.prototype.parseRecord=function(line,slices) {
	var result={};
	var i;
	for(i=0;i<slices.length;i++) {
		var slice=slices[i];
		var field=line.substr(slice.start,slice.length);
		switch(slice.type) {
			case "int":field=parseInt(field);break;
			case "float":field=parseFloat(field);break;
			default:field=$.trim(field);
		}
		
		//console.log(slice.name+" "+field);
		result[slice.name]=field;
	}
	return result;
}

PDBData.prototype.processATOM=function(line) {
	// ATOM ( A6,I5,1X,A4,A1,A3,1X,A1,I4,A1,3X,3F8.3,2F6.2,10X,A2,A2 )
	var slices=[
		{name:"serial",start:6,length:5,type:"int"}, //I5
		{name:"atom",start:12,length:4,type:"char"}, //A4
		{name:"altLoc",start:16,length:1,type:"char"}, //A1
		{name:"resName",start:17,length:3,type:"char"}, //A3
		{name:"chainID",start:21,length:1,type:"char"}, //A1
		{name:"seqno",start:22,length:4,type:"int"}, //I4
		{name:"insertCode",start:26,length:1,type:"char"}, //A1
		{name:"x",start:30,length:8,type:"float"}, //F8
		{name:"y",start:38,length:8,type:"float"}, //F8
		{name:"z",start:46,length:8,type:"float"}, //F8
		{name:"occupancy",start:54,length:6,type:"float"}, //F6
		{name:"tempFactor",start:60,length:6,type:"float"} //F6
		/*
		{name:"recID",start:72,length:8,type:"char"},
		{name:"segID",start:72,length:4,type:"char"},
		{name:"element",start:76,length:2,type:"char"},
		{name:"charge",start:78,length:2,type:"char"}
		*/
	];
	
	return this.parseRecord(line,slices);
}

PDBData.prototype.processHELIX = function(line) {
	//HELIX	Format ( A6,1X,I3,1X,A3,2(1X,A3,1X,A1,1X,I4,A1),I2,A30,1X,I5 )
	var slices=[
		{name:"serial",start:7,length:3,type:"int"}, //I3
		{name:"helixID",start:11,length:3,type:"char"}, //A3
		
		{name:"initialResidue",start:15,length:3,type:"char"},
		{name:"initialChainID",start:19,length:1,type:"char"},
		{name:"initialResNum",start:21,length:4,type:"int"},
		{name:"initialInsertCode",start:25,length:1,type:"char"},
		
		{name:"terminalResidue",start:27,length:3,type:"char"},
		{name:"terminalChainID",start:31,length:1,type:"char"},
		{name:"terminalResNum",start:33,length:4,type:"int"},
		{name:"terminalInsertCode",start:37,length:1,type:"char"},
		
		{name:"helixType",start:38,length:2,type:"int"},
		{name:"comment",start:40,length:30,type:"char"},
		{name:"length",start:71,length:5,type:"int"}
	];
	
	return this.parseRecord(line,slices);
}

PDBData.prototype.processSHEET=function(line) {
	//SHEET	Format ( A6,1X,I3,1X,A3,I2,2(1X,A3,1X,A1,I4,A1),I2,2(1X,A4,A3,1X,A1,I4,A1) )
	var slices=[
		{name:"strandNum",start:7,length:3,type:"int"},
		{name:"sheetID",start:11,length:3,type:"char"},
		{name:"strandCount",start:14,length:2,type:"int"},
		
		{name:"initialResidue",start:17,length:3,type:"char"},
		{name:"initialChainID",start:21,length:1,type:"char"},
		{name:"initialResNum",start:22,length:4,type:"int"},
		{name:"initialInsertCode",start:26,length:1,type:"char"},
		
		{name:"terminalResidue",start:28,length:3,type:"char"},
		{name:"terminalChainID",start:32,length:1,type:"char"},
		{name:"terminalResNum",start:33,length:4,type:"int"},
		{name:"terminalInsertCode",start:37,length:1,type:"char"},
		
		{name:"sense",start:27,length:5,type:"char"}
		// give up for registration not necessary 
	];
	
	return this.parseRecord(line,slices);
}

PDBData.prototype.processMODEL=function (line) {
	var slices=[
		{name:"serial",start:10,length:5,type:"int"}
	];
	return this.parseRecord(line,slices);
}
PDBData.prototype.process=function (line) {
	var recordName=line.substr(0,6);
	recordName=$.trim(recordName);
	switch(recordName) {
		case "ATOM" : {
			this.addAtom(this.processATOM(line));
			break;
		}
		case "HELIX" : {
			this.addHelixInfo(this.processHELIX(line));
			break;
		}
		case "SHEET" : {
			this.addSheetInfo(this.processSHEET(line));
			break;
		}
		case "MODEL" : {
			//console.log(line);
			this.newModel(this.processMODEL(line));
			break;
		}
	}
}

var PDBLoader=function(){};
PDBLoader.prototype.load=function(url,success,error) {
	var that=this;
	$.ajax({
		url:url,
		error:error,
		success:function(data) {
			that.parse(data,success);
		}
	});
}

PDBLoader.prototype.parse=function(data,success) {
	var data=data.split("\n");
	var result=new PDBData();
	var i;
	for(i=0;i<data.length;i++) {
		result.process(data[i]);
	}
	success(result);
}
