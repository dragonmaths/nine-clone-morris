import { room } from "./network";

// Listen to patches comming
room.onPatch.add(function(patches) {
    console.log("Server state changed: ", patches);
});

const canvas = document.getElementById('game') as HTMLCanvasElement;
const engine = new BABYLON.Engine(canvas, true);

var createScene = function() {
    var scene = new BABYLON.Scene(engine);

    var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 4, 20, BABYLON.Vector3.Zero(), scene);

	
    camera.attachControl(canvas, false);
	
	var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
	var light2 = new BABYLON.HemisphericLight("light2", new BABYLON.Vector3(0, 1, 0), scene);
	var light3 = new BABYLON.DirectionalLight("light3", new BABYLON.Vector3(1, 0, 0), scene);
  
                
	var base = BABYLON.MeshBuilder.CreateBox("base", {width: 14, height:1, depth:14}, scene);
	var peg = BABYLON.MeshBuilder.CreateCylinder("peg", {height:0.75, diameter:0.25}, scene);
	peg.position.y = 0.5;
	
	var baseCSG = BABYLON.CSG.FromMesh(base);
	var drill =[];
	var drills =[]
	var gap = 1.5;
	for(var sq = 0; sq < 3; sq++) {
		for(var x=0; x<3; x++) {
			for(var z=0; z<3; z++) {
				drill[x + 3 * z] = peg.clone("");
				drill[x + 3 * z].position.x = gap * x - gap;
				drill[x + 3 * z].position.z = gap * z - gap;
			}
		}
		gap +=2;
		drill[4].dispose();
		drill.splice(4,1);
		drills = drills.concat(drill);
		drill = [];
	}
	
	peg.position.x = -5.5;
	peg.position.z = -5.5;

	var mergedDrills =BABYLON.Mesh.MergeMeshes(drills, true);

	var drillsCSG = BABYLON.CSG.FromMesh(mergedDrills);
	var subCSG = baseCSG.subtract(drillsCSG);

	var board;
	board = subCSG.toMesh("board", new BABYLON.StandardMaterial("mat", scene), scene, false);
	board.material.diffuseTexture = new BABYLON.Texture("albedo.png", scene);

	base.dispose();
	mergedDrills.dispose();
	
	var blueMat = new BABYLON.StandardMaterial("blue", scene);
	blueMat.diffuseColor = new BABYLON.Color3(0, 0, 1);
	
	var redMat = new BABYLON.StandardMaterial("red", scene);
	redMat.diffuseColor = new BABYLON.Color3(1, 0, 0);
	
	var pegMats =[blueMat, redMat];
	
	var holder = [];
	var pegs = [];
	for(var i = 0; i < 2; i++) {
		var base = BABYLON.MeshBuilder.CreateBox("base", {width: 4, height:1, depth:4}, scene);
	
		var baseCSG = BABYLON.CSG.FromMesh(base);
		var drills =[]
		var gap = 1;
		for(x=0; x < 3; x++) {
			for(z=0; z<3; z++) {
				pegs[x + 3 * z + 10 * i] = peg.clone("peg"+(x + 3 * z + 10 * i));
				pegs[x + 3 * z + 10 * i].material = pegMats[i];
				drills[x + 3 * z] = peg.clone("");
				drills[x + 3 * z].position.x = gap * x - gap;
				drills[x + 3 * z].position.z = gap * z - gap;
				pegs[x + 3 * z + 10 * i].position.x = gap * x - gap + 10;
				pegs[x + 3 * z + 10 * i].position.z = gap * z - gap + (i - 0.5) * 10;
			}
		}	

		var mergedDrills =BABYLON.Mesh.MergeMeshes(drills, true);

		var drillsCSG = BABYLON.CSG.FromMesh(mergedDrills);
		var subCSG = baseCSG.subtract(drillsCSG);

		holder[i] = subCSG.toMesh("holder" + i, new BABYLON.StandardMaterial("mat", scene), scene, false);
		holder[i].material.diffuseTexture = new BABYLON.Texture("albedo.png", scene);
		holder[i].position.x = 10;
		holder[i].position.z = (i - 0.5) * 10;

		base.dispose();
		mergedDrills.dispose();
	}
	
	peg.dispose();
	
	var shinyMat = new BABYLON.PBRMaterial("", scene);
	shinyMat.albedoColor = new BABYLON.Color3(0.52, 0.5, .51);
	shinyMat.reflectivityColor = new BABYLON.Color3(0.7, 0.7, 0.7);
	shinyMat.microSurface = 0.9;
	shinyMat.usePhysicalLightFalloff = false;
	
	gap = 5.5
	for(sq = 0; sq < 3; sq++) {
		for(var i = 0; i < 2; i++) {
			var lineT = BABYLON.MeshBuilder.CreateCylinder("line", {height:gap - 0.25, diameter:0.2}, scene);
			lineT.material = shinyMat;
			lineT.rotation.z = Math.PI / 2;
			lineT.position.y = 0.42;
			lineT.position.x = gap * i - gap / 2;
			var lineB = lineT.clone("");
			lineT.position.x = gap * i - gap / 2;
			lineT.position.z = gap;
			lineB.position.z = -gap;
		}
		
		for(var i = 0; i < 2; i++) {
			var lineT = BABYLON.MeshBuilder.CreateCylinder("line", {height:gap - 0.25, diameter:0.2}, scene);
			lineT.material = shinyMat;
			lineT.rotation.x = Math.PI / 2;
			lineT.position.y = 0.42;
			lineT.position.z = gap * i - gap / 2;
			var lineB = lineT.clone("");
			lineT.position.z = gap * i - gap / 2;
			lineT.position.x = gap;
			lineB.position.x = -gap;
		}
		gap -=2;
	}
	for(var i = 0; i < 2; i++) {
		var lineT = BABYLON.MeshBuilder.CreateCylinder("line", {height:1.75, diameter:0.2}, scene);
		lineT.material = shinyMat;
		lineT.rotation.z = Math.PI / 2;
		lineT.position.y = 0.42;
		lineT.position.x = (1 + 2 * i) + 1.5;
		var lineB = lineT.clone("");
		lineB.position.x = -lineB.position.x;
	}
	for(var i = 0; i < 2; i++) {
		var lineT = BABYLON.MeshBuilder.CreateCylinder("line", {height:1.75, diameter:0.2}, scene);
		lineT.material = shinyMat;
		lineT.rotation.x = Math.PI / 2;
		lineT.position.y = 0.42;
		lineT.position.z = (1 + 2 * i) + 1.5;
		var lineB = lineT.clone("");
		lineB.position.z = -lineB.position.z;
	}
	
    return scene;
}

var scene = createScene();

// Scene render loop
engine.runRenderLoop(function() {
    scene.render();
});

// Resize the engine on window resize
window.addEventListener('resize', function() {
    engine.resize();
});
