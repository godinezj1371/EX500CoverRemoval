import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

//Initialize scene
const scene = new THREE.Scene();

scene.background = new THREE.Color(0xdddddd);

//Initialize camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.z = 8;

//Initialize renderer + orbit controls
const renderer = new THREE.WebGLRenderer();

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

document.body.appendChild(
  renderer.domElement
);
const controls = new OrbitControls(
  camera,
  renderer.domElement
);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

controls.minDistance = 3;
controls.maxDistance = 20;

//Initialize light
const light = new THREE.DirectionalLight(
  0xffffff,
  3
);

light.position.set(5, 5, 5);

const light2 = new THREE.DirectionalLight(
  0xffffff,
  3
);

light2.position.set(-5, -5, -5);

scene.add(light);
scene.add(light2);

/*
Hardcoding a gray block as the machine
const machineGeometry =
  new THREE.BoxGeometry(
    8,
    4,
    4
  );

const machineMaterial =
  new THREE.MeshPhongMaterial({
    color: 0x888888
  });

const machine =
  new THREE.Mesh(
    machineGeometry,
    machineMaterial
  );

scene.add(machine);
*/

//Creating machine from parts
function createMachinePart(width,height,depth,x,y,z,color) {
  const geometry =
    new THREE.BoxGeometry(
      width,
      height,
      depth
    );

  const material =
    new THREE.MeshPhongMaterial({
      color
    });

  const mesh =
    new THREE.Mesh(
      geometry,
      material
    );

  mesh.position.set(
    x,
    y,
    z
  );

  scene.add(mesh);

  return mesh;
}
//arm
createMachinePart(
  4, 1, 1.5,
  0, 1, 1.75,
  0x666666
);
//console
createMachinePart(
  1.5, 4, 5,
  1.25, -0.5, 0,
  0x666666
);
/*test parts
createMachinePart(
  1,1,1,0,0,0,0xff9999
);
createMachinePart(
  1,1,1,0,0,1,0x666666
);
createMachinePart(
  1,1,1,0,0,2,0xff9999
);
*/

//Creating covers
const covers = [];
function createCover(name, x, y, z, color, w, h, d) {
  const geometry = new THREE.BoxGeometry(
    w,
    h,
    d
  );

  const material =
    new THREE.MeshPhongMaterial({
      color
    });

  const mesh = new THREE.Mesh(
    geometry,
    material
  );

  mesh.position.set(x, y, z);
  mesh.userData.name = name;
  mesh.userData.defaultColor = color;

  scene.add(mesh);
  covers.push(mesh);

  return mesh;
}

createCover("A", -0.85, 1.15, 1.75, 0x0F52BA,2.5,0.9,1.6);
createCover("B", -2, -0.5, 2.1, 0x0F52BA);
createCover("C", 2, -0.5, 2.1, 0xD3D3D3);
createCover("D",0,-2,2.1,0xD3D3D3);

//
//
//Dependencies and interaction (main content)
//
//
const dependencies = {
  A: [],
  B: ["A"],
  C: ["A"],
  D: ["B","C"]
};

const removed = [];

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

//depending on which part it is, which direction will it move when removed
function moveDirection(part) {
  if ([].includes(part.userData.name))
    part.position.z += 1;
  else if ([].includes(part.userData.name))
    part.position.z -= 1;
  else if (["A"].includes(part.userData.name))
    part.position.y += 1;
  else if (["D"].includes(part.userData.name))
    part.position.y -= 1;
  else if (["C"].includes(part.userData.name))
    part.position.x += 1;
  else if (["B"].includes(part.userData.name))
    part.position.x -= 1;
};

window.addEventListener("click", (event) => {

  mouse.x =
    (event.clientX / window.innerWidth) * 2 - 1;

  mouse.y =
    -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(
    mouse,
    camera
  );
    //hit = click
  const hits =
    raycaster.intersectObjects(covers);
    //if it didn't click anything, don't do anything
  if (hits.length === 0) return;
    //part is the object that was clicked
  const part = hits[0].object;
    //partName is the name within userData of the object that was clicked
  const partName =
    part.userData.name;
    //if the part that was clicked is already removed, don't do anything
  if (
    removed.includes(partName)
  ) {
    return;
  }
  //only valid if all dependencies of the object that was clicked are included in the removed list
  const valid =
    dependencies[partName].every(
      dep => removed.includes(dep)
    );

    //if they clicked a cover that can be removed
  if (valid) {
    //color changes (currently to green)
    part.material.color.set(
      0x00ff00
    );
    //the clicked part is added to list of removed covers
    removed.push(partName);
    //part gets moved a certain direction
    moveDirection(part);
    //successful message is printed at the top left
    document.getElementById(
      "message"
    ).innerText =
      `Correct: Removed ${partName}`;
  
  }
  //if it's not a valid move
  else {
    
    //color changes (currently to red)
    part.material.color.set(0xff0000);
    //failure message
    document.getElementById(
      "message"
    ).innerText =
    `${partName} blocked. Remove ${dependencies[partName].join(", ")} first.`;
    //Waits 1.5 seconds and resets the color from red
    setTimeout(() => part.material.color.set(part.userData.defaultColor), 1500);
  }

});

function animate() {
  requestAnimationFrame(
    animate
  );

  controls.update();

  renderer.render(
    scene,
    camera
  );
}

animate();