const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

camera.position.z = 8;

const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(5, 5, 5);
scene.add(light);

const covers = [];

function createCover(name, x, y, color) {
  const geometry = new THREE.BoxGeometry(2, 0.4, 2);

  const material = new THREE.MeshPhongMaterial({
    color: color
  });

  const mesh = new THREE.Mesh(
    geometry,
    material
  );

  mesh.position.set(x, y, 0);
  mesh.name = name;

  scene.add(mesh);
  covers.push(mesh);

  return mesh;
}

createCover("A", 0, 1.5, 0x8888ff);
createCover("B", -1.5, -1, 0x88ff88);
createCover("C", 1.5, -1, 0xff8888);

const dependencies = {
  A: [],
  B: ["A"],
  C: ["A"]
};

const removed = [];

function canRemove(name) {
  return dependencies[name].every(
    dep => removed.includes(dep)
  );
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click", event => {

  mouse.x =
    (event.clientX / window.innerWidth) * 2 - 1;

  mouse.y =
    -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const hits =
    raycaster.intersectObjects(covers);

  if (hits.length === 0) return;

  const part = hits[0].object;

  if (removed.includes(part.name))
    return;

  if (canRemove(part.name)) {

    part.material.color.set(0x00ff00);

    removed.push(part.name);

    document.getElementById(
      "message"
    ).innerText =
      `Correct: Removed ${part.name}`;

  } else {

    part.material.color.set(0xff0000);

    document.getElementById(
      "message"
    ).innerText =
      `${part.name} blocked. Remove ${dependencies[part.name].join(", ")} first`;
  }
});

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

animate();