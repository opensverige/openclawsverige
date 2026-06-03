import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { SparkRenderer, SplatMesh } from "@sparkjsdev/spark";

const mount = document.querySelector("#sparkMount");
const formatStatus = document.querySelector("#formatStatus");
const modeStatus = document.querySelector("#modeStatus");
const modelBadge = document.querySelector("#modelBadge");

let renderer;
let scene;
let camera;
let controls;
let spark;
let activeMesh;
let animationStarted = false;

function setSparkStatus(status, detail = "") {
  window.__sparkLoadState = { status, detail, time: new Date().toISOString() };
  mount.dataset.status = status;
  mount.dataset.detail = detail;
  modeStatus.textContent = status;
  if (detail) {
    document.querySelector("#pointBadge").textContent = detail;
  }
}

function clearSpark() {
  if (activeMesh && scene) {
    scene.remove(activeMesh);
    activeMesh.dispose?.();
    activeMesh = null;
  }
  mount.classList.remove("is-active");
  mount.dataset.status = "";
  mount.dataset.detail = "";
}

function initSpark() {
  if (renderer) return;
  setSparkStatus("Initierar");

  scene = new THREE.Scene();
  scene.background = null;

  camera = new THREE.PerspectiveCamera(58, 1, 0.01, 1000);
  camera.position.set(0, 0.15, 2.4);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  mount.appendChild(renderer.domElement);

  spark = new SparkRenderer({ renderer });
  scene.add(spark);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 0, 0);

  window.addEventListener("resize", resizeSpark);
  resizeSpark();

  if (!animationStarted) {
    animationStarted = true;
    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });
  }
}

function resizeSpark() {
  if (!renderer) return;
  const rect = mount.getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

async function loadSparkFile(file) {
  const extension = file.name.toLowerCase().split(".").pop();
  if (!["spz", "ply", "splat", "ksplat"].includes(extension)) return;

  setSparkStatus("Startar", file.name);
  initSpark();
  mount.classList.add("is-active");
  formatStatus.textContent = extension === "spz" ? "SPZ / Spark" : `${extension.toUpperCase()} / Spark`;
  modeStatus.textContent = "Kvalitet";
  modelBadge.textContent = file.name;

  if (activeMesh) {
    scene.remove(activeMesh);
    activeMesh.dispose?.();
    activeMesh = null;
  }
  setSparkStatus("Dekodar", file.name);
  const fileBytes = await readSplatBytes(file);
  activeMesh = new SplatMesh({
    fileBytes,
    fileType: extension,
    fileName: file.name,
    lod: true,
    onLoad: (mesh) => {
      const count = mesh.packedSplats?.numSplats;
      if (count) {
        document.querySelector("#visibleStatus").textContent = count.toLocaleString("sv-SE");
        document.querySelector("#pointBadge").textContent = `${count.toLocaleString("sv-SE")} splats`;
      }
    },
  });

  activeMesh.position.set(0, 0, 0);
  activeMesh.scale.setScalar(1);
  scene.add(activeMesh);

  window.__sparkDebug = { activeMesh, scene, camera, controls };

  setSparkStatus("Väntar", "SPZ avkodas");
  await activeMesh.initialized;
  setSparkStatus("Placerar", "Beräknar vy");
  const count = activeMesh.packedSplats?.numSplats || activeMesh.numSplats || 0;
  const box = activeMesh.getBoundingBox(true);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  activeMesh.position.copy(center).multiplyScalar(-1 / maxDim);
  activeMesh.scale.setScalar(1 / maxDim);
  camera.position.set(0, 0.08, 2.1);
  controls.target.set(0, 0, 0);
  controls.update();

  document.querySelector("#visibleStatus").textContent = count.toLocaleString("sv-SE");
  document.querySelector("#pointBadge").textContent = `${count.toLocaleString("sv-SE")} splats`;
  formatStatus.textContent = extension === "spz" ? "SPZ / Spark" : `${extension.toUpperCase()} / Spark`;
  modeStatus.textContent = "Kvalitet";
  setSparkStatus("Kvalitet", `${count.toLocaleString("sv-SE")} splats`);
}

async function readSplatBytes(file) {
  const source = new Uint8Array(await file.arrayBuffer());
  const isGzip = source[0] === 0x1f && source[1] === 0x8b;
  if (!isGzip || !("DecompressionStream" in window)) return source;

  setSparkStatus("Packar upp", file.name);
  const stream = new Blob([source]).stream().pipeThrough(new DecompressionStream("gzip"));
  const decompressed = await new Response(stream).arrayBuffer();
  return new Uint8Array(decompressed);
}

window.addEventListener("splat-file-selected", (event) => {
  loadSparkFile(event.detail.file).catch((error) => {
    console.error(error);
    setSparkStatus("Sparkfel", error?.message || String(error));
    mount.classList.remove("is-active");
    formatStatus.textContent = "Fallback";
    modeStatus.textContent = "Punktvy";
  });
});

window.addEventListener("splat-renderer-reset", clearSpark);

if (window.__currentSplatFile?.name?.toLowerCase().endsWith(".spz")) {
  loadSparkFile(window.__currentSplatFile).catch((error) => {
    console.error(error);
    setSparkStatus("Sparkfel", error?.message || String(error));
    mount.classList.remove("is-active");
    formatStatus.textContent = "Fallback";
    modeStatus.textContent = "Punktvy";
  });
}
