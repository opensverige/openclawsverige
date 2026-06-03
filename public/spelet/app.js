const canvas = document.querySelector("#viewerCanvas");
const ctx = canvas.getContext("2d", { alpha: true });
const dropZone = document.querySelector("#dropZone");
const modelInput = document.querySelector("#modelInput");
const loadLocalButton = document.querySelector("#loadLocalButton");
const resetButton = document.querySelector("#resetButton");
const copyButton = document.querySelector("#copyButton");
const modelStatus = document.querySelector("#modelStatus");
const visibleStatus = document.querySelector("#visibleStatus");
const formatStatus = document.querySelector("#formatStatus");
const modeStatus = document.querySelector("#modeStatus");
const modelBadge = document.querySelector("#modelBadge");
const pointBadge = document.querySelector("#pointBadge");

const params = new URLSearchParams(window.location.search);
if (params.has("tools")) {
  document.body.classList.add("editor-mode");
}

window.SplatStudio = {
  showEditor(enabled = true) {
    document.body.classList.toggle("editor-mode", Boolean(enabled));
    window.dispatchEvent(new CustomEvent("splat-editor-mode", { detail: { enabled: Boolean(enabled) } }));
    window.dispatchEvent(new Event("resize"));
  },
  hideEditor() {
    this.showEditor(false);
  },
};

const controls = {
  pointSize: document.querySelector("#pointSizeControl"),
  brightness: document.querySelector("#brightnessControl"),
  opacity: document.querySelector("#opacityControl"),
  zoom: document.querySelector("#zoomControl"),
  cameraAlpha: document.querySelector("#cameraAlphaControl"),
  cameraBeta: document.querySelector("#cameraBetaControl"),
  focusX: document.querySelector("#focusXControl"),
  focusY: document.querySelector("#focusYControl"),
  focusZ: document.querySelector("#focusZControl"),
  cropXMin: document.querySelector("#cropXMin"),
  cropXMax: document.querySelector("#cropXMax"),
  cropYMin: document.querySelector("#cropYMin"),
  cropYMax: document.querySelector("#cropYMax"),
  cropZMin: document.querySelector("#cropZMin"),
  cropZMax: document.querySelector("#cropZMax"),
};

const state = {
  points: [],
  fileName: "Ingen",
  format: "-",
  colorMode: "original",
  visibleCount: 0,
  camera: {
    yaw: -0.35,
    pitch: 0.78,
    roll: -0.08,
    panX: 0,
    panY: 0,
  },
  dragging: null,
};

const focusResetButton = document.querySelector("#focusResetButton");

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function updateUi() {
  const qualityActive = document.querySelector("#qualityCanvas")?.classList.contains("is-active");
  modelStatus.textContent = state.fileName;
  if (!qualityActive) {
    visibleStatus.textContent = state.visibleCount.toLocaleString("sv-SE");
    formatStatus.textContent = state.format;
    modeStatus.textContent = state.colorMode === "original" ? "Original" : state.colorMode === "height" ? "Höjd" : "Djup";
  }
  modelBadge.textContent = state.fileName;
  if (!qualityActive) pointBadge.textContent = `${state.points.length.toLocaleString("sv-SE")} punkter`;
  dropZone.classList.toggle("has-model", state.points.length > 0);
}

function resetView() {
  state.camera.yaw = -0.35;
  state.camera.pitch = 0.78;
  state.camera.roll = -0.08;
  state.camera.panX = 0;
  state.camera.panY = 0;
  controls.pointSize.value = "1.1";
  controls.brightness.value = "1.15";
  controls.opacity.value = "0.18";
  controls.zoom.value = "0.95";
  controls.cameraAlpha.value = "-2.4489";
  controls.cameraBeta.value = "4.2771";
  controls.focusX.value = "0";
  controls.focusY.value = "0";
  controls.focusZ.value = "0";
  for (const key of ["cropXMin", "cropYMin", "cropZMin"]) controls[key].value = "-1.2";
  for (const key of ["cropXMax", "cropYMax", "cropZMax"]) controls[key].value = "1.2";
  dispatchFocus();
  window.dispatchEvent(new CustomEvent("quality-view", { detail: { view: "photo" } }));
}

function seedDemo() {
  const points = [];
  for (let row = 0; row < 46; row += 1) {
    for (let col = 0; col < 72; col += 1) {
      const x = (col / 71 - 0.5) * 1.2;
      const y = (row / 45 - 0.5) * 0.7;
      const z = Math.sin(col * 0.18) * 0.025;
      const keyboard = row > 25;
      points.push({
        x,
        y: y - (keyboard ? 0.16 : 0),
        z: z + (keyboard ? 0.08 : -0.12),
        r: keyboard ? 48 : 190,
        g: keyboard ? 50 : 197,
        b: keyboard ? 52 : 185,
        size: keyboard ? 0.9 : 1.3,
      });
    }
  }
  state.points = normalizePoints(points);
  state.fileName = "Demo-dator";
  state.format = "syntetisk";
  updateUi();
}

function robustBounds(points) {
  const strong = points.filter((point) => (point.opacity ?? 1) >= 0.22);
  const source = strong.length > 1000 ? strong : points;
  const sorted = (axis) => source.map((point) => point[axis]).sort((a, b) => a - b);
  const xs = sorted("x");
  const ys = sorted("y");
  const zs = sorted("z");
  const at = (values, q) => values[Math.max(0, Math.min(values.length - 1, Math.floor(values.length * q)))];
  return {
    minX: at(xs, 0.04),
    maxX: at(xs, 0.96),
    minY: at(ys, 0.04),
    maxY: at(ys, 0.96),
    minZ: at(zs, 0.04),
    maxZ: at(zs, 0.96),
  };
}

function normalizePoints(points) {
  if (!points.length) return [];
  const bounds = robustBounds(points);
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  const cz = (bounds.minZ + bounds.maxZ) / 2;
  const size = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY, bounds.maxZ - bounds.minZ, 1);
  const sizes = points.map((point) => point.size || 1).sort((a, b) => a - b);
  const medianSize = sizes[Math.floor(sizes.length / 2)] || 1;

  return points.map((point) => ({
    x: (point.x - cx) / size,
    y: (point.y - cy) / size,
    z: (point.z - cz) / size,
    r: clamp(point.r ?? 235, 0, 255),
    g: clamp(point.g ?? 235, 0, 255),
    b: clamp(point.b ?? 235, 0, 255),
    size: clamp(Math.sqrt((point.size || 1) / medianSize), 0.45, 1.8),
    opacity: clamp(point.opacity ?? 1, 0, 1),
  }));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function colorFromDc(values, indexes) {
  const sh0 = 0.28209479177387814;
  const convert = (value) => clamp((0.5 + sh0 * value) * 255, 0, 255);
  return {
    r: convert(values[indexes.r]),
    g: convert(values[indexes.g]),
    b: convert(values[indexes.b]),
  };
}

function sigmoid(value) {
  return 1 / (1 + Math.exp(-value));
}

function propertyIndex(properties, names) {
  return names.map((name) => properties.indexOf(name)).find((index) => index >= 0);
}

function parseAsciiPly(text) {
  const headerEnd = text.indexOf("end_header");
  const header = text.slice(0, headerEnd).split(/\r?\n/);
  const countLine = header.find((line) => line.startsWith("element vertex"));
  const vertexCount = countLine ? Number(countLine.split(/\s+/).at(-1)) : 0;
  const properties = [];
  let inVertex = false;

  for (const line of header) {
    if (line.startsWith("element vertex")) inVertex = true;
    else if (line.startsWith("element ") && !line.startsWith("element vertex")) inVertex = false;
    else if (inVertex && line.startsWith("property")) properties.push(line.trim().split(/\s+/).at(-1));
  }

  const ix = propertyIndex(properties, ["x"]);
  const iy = propertyIndex(properties, ["y"]);
  const iz = propertyIndex(properties, ["z"]);
  const ir = propertyIndex(properties, ["red", "r", "diffuse_red"]);
  const ig = propertyIndex(properties, ["green", "g", "diffuse_green"]);
  const ib = propertyIndex(properties, ["blue", "b", "diffuse_blue"]);
  const idcr = propertyIndex(properties, ["f_dc_0"]);
  const idcg = propertyIndex(properties, ["f_dc_1"]);
  const idcb = propertyIndex(properties, ["f_dc_2"]);
  const is0 = propertyIndex(properties, ["scale_0"]);
  const is1 = propertyIndex(properties, ["scale_1"]);
  const is2 = propertyIndex(properties, ["scale_2"]);
  const io = propertyIndex(properties, ["opacity", "alpha"]);
  const body = text.slice(headerEnd + "end_header".length).trim().split(/\r?\n/);
  const limit = Math.min(vertexCount || body.length, body.length, 140000);
  const step = Math.max(1, Math.floor((vertexCount || body.length) / 65000));
  const points = [];

  for (let i = 0; i < limit; i += step) {
    const values = body[i].trim().split(/\s+/).map(Number);
    if ([ix, iy, iz].some((index) => index < 0 || Number.isNaN(values[index]))) continue;
    const dcColor = [idcr, idcg, idcb].every((index) => index >= 0)
      ? colorFromDc(values, { r: idcr, g: idcg, b: idcb })
      : null;
    const splatSize = [is0, is1, is2]
      .filter((index) => index >= 0)
      .reduce((sum, index) => sum + Math.exp(clamp(values[index], -8, 3)), 0);
    points.push({
      x: values[ix],
      y: values[iy],
      z: values[iz],
      r: dcColor ? dcColor.r : ir >= 0 ? values[ir] : 235,
      g: dcColor ? dcColor.g : ig >= 0 ? values[ig] : 235,
      b: dcColor ? dcColor.b : ib >= 0 ? values[ib] : 235,
      size: splatSize || 1,
      opacity: io >= 0 ? sigmoid(values[io]) : 1,
    });
  }

  return normalizePoints(points);
}

function parseBinaryLittleEndianPly(buffer, headerText, dataOffset) {
  const header = headerText.split(/\r?\n/);
  const countLine = header.find((line) => line.startsWith("element vertex"));
  const vertexCount = countLine ? Number(countLine.split(/\s+/).at(-1)) : 0;
  const typeSizes = { char: 1, uchar: 1, int8: 1, uint8: 1, short: 2, ushort: 2, int16: 2, uint16: 2, int: 4, uint: 4, int32: 4, uint32: 4, float: 4, float32: 4, double: 8, float64: 8 };
  const properties = [];
  let inVertex = false;

  for (const line of header) {
    const parts = line.trim().split(/\s+/);
    if (line.startsWith("element vertex")) inVertex = true;
    else if (line.startsWith("element ") && !line.startsWith("element vertex")) inVertex = false;
    else if (inVertex && parts[0] === "property" && parts[1] !== "list") {
      properties.push({ type: parts[1], name: parts[2], size: typeSizes[parts[1]] || 4 });
    }
  }

  const stride = properties.reduce((sum, prop) => sum + prop.size, 0);
  const view = new DataView(buffer);
  const read = (offset, type) => {
    if (type === "char" || type === "int8") return view.getInt8(offset);
    if (type === "uchar" || type === "uint8") return view.getUint8(offset);
    if (type === "short" || type === "int16") return view.getInt16(offset, true);
    if (type === "ushort" || type === "uint16") return view.getUint16(offset, true);
    if (type === "int" || type === "int32") return view.getInt32(offset, true);
    if (type === "uint" || type === "uint32") return view.getUint32(offset, true);
    if (type === "double" || type === "float64") return view.getFloat64(offset, true);
    return view.getFloat32(offset, true);
  };

  const propOffset = new Map();
  const propByName = {};
  let running = 0;
  for (const prop of properties) {
    propOffset.set(prop.name, running);
    propByName[prop.name] = prop;
    running += prop.size;
  }

  const find = (names) => names.find((name) => propOffset.has(name));
  const px = find(["x"]);
  const py = find(["y"]);
  const pz = find(["z"]);
  const pr = find(["red", "r", "diffuse_red"]);
  const pg = find(["green", "g", "diffuse_green"]);
  const pb = find(["blue", "b", "diffuse_blue"]);
  const pdcr = find(["f_dc_0"]);
  const pdcg = find(["f_dc_1"]);
  const pdcb = find(["f_dc_2"]);
  const scaleNames = [find(["scale_0"]), find(["scale_1"]), find(["scale_2"])].filter(Boolean);
  const po = find(["opacity", "alpha"]);
  const step = Math.max(1, Math.floor(vertexCount / 65000));
  const points = [];

  for (let i = 0; i < vertexCount; i += step) {
    const base = dataOffset + i * stride;
    if (base + stride > buffer.byteLength) break;
    const x = read(base + propOffset.get(px), propByName[px].type);
    const y = read(base + propOffset.get(py), propByName[py].type);
    const z = read(base + propOffset.get(pz), propByName[pz].type);
    if (![x, y, z].every(Number.isFinite)) continue;

    let dcColor = null;
    if (pdcr && pdcg && pdcb) {
      const values = {
        [pdcr]: read(base + propOffset.get(pdcr), propByName[pdcr].type),
        [pdcg]: read(base + propOffset.get(pdcg), propByName[pdcg].type),
        [pdcb]: read(base + propOffset.get(pdcb), propByName[pdcb].type),
      };
      dcColor = colorFromDc(values, { r: pdcr, g: pdcg, b: pdcb });
    }

    const splatSize = scaleNames.reduce((sum, name) => {
      const raw = read(base + propOffset.get(name), propByName[name].type);
      return sum + Math.exp(clamp(raw, -8, 3));
    }, 0);

    points.push({
      x,
      y,
      z,
      r: dcColor ? dcColor.r : pr ? read(base + propOffset.get(pr), propByName[pr].type) : 235,
      g: dcColor ? dcColor.g : pg ? read(base + propOffset.get(pg), propByName[pg].type) : 235,
      b: dcColor ? dcColor.b : pb ? read(base + propOffset.get(pb), propByName[pb].type) : 235,
      size: splatSize || 1,
      opacity: po ? sigmoid(read(base + propOffset.get(po), propByName[po].type)) : 1,
    });
  }

  return normalizePoints(points);
}

function findPlyDataOffset(bytes) {
  const marker = new TextEncoder().encode("end_header");
  for (let i = 0; i <= bytes.length - marker.length; i += 1) {
    let found = true;
    for (let j = 0; j < marker.length; j += 1) {
      if (bytes[i + j] !== marker[j]) {
        found = false;
        break;
      }
    }
    if (!found) continue;
    let offset = i + marker.length;
    if (bytes[offset] === 13 && bytes[offset + 1] === 10) offset += 2;
    else if (bytes[offset] === 10) offset += 1;
    return offset;
  }
  return 0;
}

async function loadModel(file) {
  window.__currentSplatFile = file;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const decoder = new TextDecoder("utf-8");
  const preview = decoder.decode(bytes.slice(0, Math.min(bytes.length, 16000)));
  const headerEnd = preview.indexOf("end_header");

  if (file.name.toLowerCase().endsWith(".spz")) {
    window.dispatchEvent(new CustomEvent("quality-splat-selected", { detail: { file } }));
    state.fileName = file.name;
    state.format = "SPZ";
    state.points = [];
    updateUi();
    dropZone.querySelector("p").textContent = "SPZ vald";
    dropZone.querySelector("small").textContent = "Kvalitetsrenderaren laddar SPZ. Om inget syns, välj PLY som fallback.";
    return;
  }

  window.dispatchEvent(new CustomEvent("quality-renderer-reset"));
  if (headerEnd < 0 || !preview.startsWith("ply")) return;
  const headerText = preview.slice(0, headerEnd + "end_header".length);
  const offset = findPlyDataOffset(bytes);
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  state.points = headerText.includes("format ascii")
    ? parseAsciiPly(decoder.decode(bytes))
    : parseBinaryLittleEndianPly(buffer, headerText, offset);
  state.fileName = file.name;
  state.format = headerText.includes("f_dc_0") ? "Gaussian PLY" : "PLY";
  resetView();
  dropZone.querySelector("p").textContent = "PLY laddad";
  dropZone.querySelector("small").textContent = "Beskär bort vägg/bord och hitta datorn innan vi lägger på ägg.";
  updateUi();
}

async function loadLocalModel() {
  const candidates = ["./Centrum.spz", "./Centrum.ply"];
  for (const path of candidates) {
    try {
      const response = await fetch(path);
      if (!response.ok) continue;
      const blob = await response.blob();
      const file = new File([blob], path.split("/").pop(), { type: blob.type || "application/octet-stream" });
      await loadModel(file);
      return;
    } catch {
      continue;
    }
  }
}

function getCrop() {
  return {
    xMin: Number(controls.cropXMin.value),
    xMax: Number(controls.cropXMax.value),
    yMin: Number(controls.cropYMin.value),
    yMax: Number(controls.cropYMax.value),
    zMin: Number(controls.cropZMin.value),
    zMax: Number(controls.cropZMax.value),
  };
}

function projectPoint(point, width, height) {
  const { yaw, pitch, roll, panX, panY } = state.camera;
  const zoom = Number(controls.zoom.value);
  const scale = Math.min(width, height) * 0.95 * zoom;
  const cr = Math.cos(roll);
  const sr = Math.sin(roll);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);

  let x = point.x;
  let y = point.y;
  let z = point.z;
  const rx = x * cr - y * sr;
  const ry = x * sr + y * cr;
  const py = ry * cp - z * sp;
  const pz = ry * sp + z * cp;
  const vx = rx * cy - pz * sy;
  const vz = rx * sy + pz * cy;
  const depth = 1.75 + vz;

  return {
    x: width / 2 + panX + (vx / depth) * scale,
    y: height / 2 + panY - (py / depth) * scale,
    depth,
    heightValue: point.y,
  };
}

function pointColor(point, projected) {
  const brightness = Number(controls.brightness.value);
  if (state.colorMode === "height") {
    const t = clamp((point.y + 0.55) / 1.1, 0, 1);
    return [70 + 185 * t, 220 - 60 * t, 255 - 210 * t];
  }
  if (state.colorMode === "depth") {
    const t = clamp((projected.depth - 1.15) / 1.3, 0, 1);
    return [231 * (1 - t) + 80 * t, 255 * (1 - t) + 130 * t, 98 * (1 - t) + 255 * t];
  }
  return [point.r * brightness, point.g * brightness, point.b * brightness];
}

function draw() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);
  drawAxes(width, height);

  const crop = getCrop();
  const pointSize = Number(controls.pointSize.value);
  const opacityCutoff = Number(controls.opacity.value);
  const projected = [];
  for (const point of state.points) {
    if (point.opacity < opacityCutoff) continue;
    if (
      point.x < crop.xMin || point.x > crop.xMax ||
      point.y < crop.yMin || point.y > crop.yMax ||
      point.z < crop.zMin || point.z > crop.zMax
    ) continue;
    const item = projectPoint(point, width, height);
    if (item.x < -80 || item.x > width + 80 || item.y < -80 || item.y > height + 80) continue;
    projected.push({ point, ...item });
  }
  projected.sort((a, b) => b.depth - a.depth);
  state.visibleCount = projected.length;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const item of projected) {
    const [r, g, b] = pointColor(item.point, item).map((value) => clamp(value, 0, 255));
    const radius = clamp((pointSize * item.point.size) / item.depth, 0.45, 7);
    const alpha = clamp((1.15 / item.depth) * item.point.opacity, 0.06, 0.92);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(item.x, item.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  updateUi();
  requestAnimationFrame(draw);
}

function drawAxes(width, height) {
  ctx.save();
  ctx.strokeStyle = "rgba(231,255,98,0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 90, height / 2);
  ctx.lineTo(width / 2 + 90, height / 2);
  ctx.moveTo(width / 2, height / 2 - 90);
  ctx.lineTo(width / 2, height / 2 + 90);
  ctx.stroke();
  ctx.restore();
}

function setView(view) {
  if (view === "photo") {
    state.camera.yaw = -0.35;
    state.camera.pitch = 0.78;
    state.camera.roll = -0.08;
    controls.zoom.value = "0.95";
  } else if (view === "front") {
    state.camera.yaw = 0;
    state.camera.pitch = 0;
    state.camera.roll = 0;
    controls.zoom.value = "1.6";
  } else if (view === "top") {
    state.camera.yaw = 0;
    state.camera.pitch = Math.PI / 2;
    state.camera.roll = 0;
    controls.zoom.value = "1.6";
  } else if (view === "side") {
    state.camera.yaw = Math.PI / 2;
    state.camera.pitch = 0;
    state.camera.roll = 0;
    controls.zoom.value = "1.6";
  }
}

function handleFiles(files) {
  for (const file of files) {
    const name = file.name.toLowerCase();
    if (name.endsWith(".ply") || name.endsWith(".spz")) loadModel(file);
  }
}

dropZone.addEventListener("click", () => modelInput.click());
loadLocalButton.addEventListener("click", loadLocalModel);
modelInput.addEventListener("change", (event) => handleFiles(event.target.files));
resetButton.addEventListener("click", resetView);

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    setView(button.dataset.view);
  window.dispatchEvent(new CustomEvent("quality-view", { detail: { view: button.dataset.view } }));
  });
});

function dispatchCamera() {
  window.dispatchEvent(new CustomEvent("quality-camera", {
    detail: {
      alpha: Number(controls.cameraAlpha.value),
      beta: Number(controls.cameraBeta.value),
    },
  }));
}

for (const key of ["cameraAlpha", "cameraBeta"]) {
  controls[key].addEventListener("input", dispatchCamera);
}

window.addEventListener("quality-camera-changed", (event) => {
  controls.cameraAlpha.value = String(event.detail.alpha);
  controls.cameraBeta.value = String(event.detail.beta);
});

controls.zoom.addEventListener("input", () => {
  window.dispatchEvent(new CustomEvent("quality-zoom", { detail: { zoom: Number(controls.zoom.value) } }));
});

function dispatchFocus() {
  window.dispatchEvent(new CustomEvent("quality-focus", {
    detail: {
      x: Number(controls.focusX.value),
      y: Number(controls.focusY.value),
      z: Number(controls.focusZ.value),
    },
  }));
}

for (const key of ["focusX", "focusY", "focusZ"]) {
  controls[key].addEventListener("input", dispatchFocus);
}

focusResetButton.addEventListener("click", () => {
  controls.focusX.value = "0";
  controls.focusY.value = "0";
  controls.focusZ.value = "0";
  dispatchFocus();
});

document.querySelectorAll("[data-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-mode]").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    state.colorMode = button.dataset.mode;
  });
});

copyButton.addEventListener("click", async () => {
  const payload = {
    file: state.fileName,
    format: state.format,
    camera: state.camera,
    qualityCamera: window.__qualityEditorState?.() || null,
    pointSize: Number(controls.pointSize.value),
    brightness: Number(controls.brightness.value),
    zoom: Number(controls.zoom.value),
    crop: getCrop(),
    colorMode: state.colorMode,
  };
  await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
});

canvas.addEventListener("pointerdown", (event) => {
  canvas.setPointerCapture(event.pointerId);
  canvas.classList.add("is-dragging");
  state.dragging = {
    x: event.clientX,
    y: event.clientY,
    pan: event.shiftKey || event.button === 2,
    panX: state.camera.panX,
    panY: state.camera.panY,
    yaw: state.camera.yaw,
    pitch: state.camera.pitch,
  };
});

canvas.addEventListener("pointermove", (event) => {
  if (!state.dragging) return;
  const dx = event.clientX - state.dragging.x;
  const dy = event.clientY - state.dragging.y;
  if (state.dragging.pan || event.shiftKey) {
    state.camera.panX = state.dragging.panX + dx;
    state.camera.panY = state.dragging.panY + dy;
  } else {
    state.camera.yaw = state.dragging.yaw + dx * 0.008;
    state.camera.pitch = clamp(state.dragging.pitch + dy * 0.008, -1.45, 1.45);
  }
});

canvas.addEventListener("pointerup", () => {
  canvas.classList.remove("is-dragging");
  state.dragging = null;
});

canvas.addEventListener("contextmenu", (event) => event.preventDefault());
canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  const current = Number(controls.zoom.value);
  controls.zoom.value = String(clamp(current * (event.deltaY > 0 ? 0.92 : 1.08), 0.35, 5));
}, { passive: false });

["dragenter", "dragover"].forEach((eventName) => {
  window.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add("is-hot");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  window.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove("is-hot");
  });
});

window.addEventListener("drop", (event) => handleFiles(event.dataTransfer.files));
window.addEventListener("resize", resizeCanvas);

resizeCanvas();
resetView();
seedDemo();
window.setTimeout(loadLocalModel, 500);
draw();
