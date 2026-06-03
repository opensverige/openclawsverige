(function () {
  const canvas = document.querySelector("#qualityCanvas");
  const overlayCanvas = document.querySelector("#defenseOverlay");
  const overlayContext = overlayCanvas?.getContext("2d");
  const modelStatus = document.querySelector("#modelStatus");
  const visibleStatus = document.querySelector("#visibleStatus");
  const formatStatus = document.querySelector("#formatStatus");
  const modeStatus = document.querySelector("#modeStatus");
  const modelBadge = document.querySelector("#modelBadge");
  const pointBadge = document.querySelector("#pointBadge");
  const dropZone = document.querySelector("#dropZone");
  const defenseScore = document.querySelector("#defenseScore");
  const defenseLevel = document.querySelector("#defenseLevel");
  const defenseLives = document.querySelector("#defenseLives");
  const defenseTimer = document.querySelector("#defenseTimer");
  const defenseMessage = document.querySelector("#defenseMessage");
  const defenseGameStartButton = document.querySelector("#defenseGameStartButton");
  const musicToggleButton = document.querySelector("#musicToggleButton");
  const effectsToggleButton = document.querySelector("#effectsToggleButton");
  const gameOverScreen = document.querySelector("#gameOverScreen");
  const gameOverSummary = document.querySelector("#gameOverSummary");
  const calibrationPanel = document.querySelector("#calibrationPanel");
  const hitboxEditor = document.querySelector("#hitboxEditor");

  let engine;
  let scene;
  let camera;
  let meshes = [];
  let activeUrl;
  let focusOffset = window.BABYLON ? new BABYLON.Vector3(0, 0, 0) : null;
  let gameTickRegistered = false;
  let audioContext = null;
  const soundCache = new Map();
  const lastSoundSource = new Map();
  const buzzAudios = new Map();
  let musicAudio = null;
  let musicIndex = -1;
  let calibrationPointer = null;

  const GAME_CONFIG = {
    screenRect: { x: 0.437, y: 0.371, width: 0.181, height: 0.217 },
    screenDepthScale: 0.82,
    rockStart: { x: 0.31, y: 0.73, depthScale: 0.72 },
    tileColumns: 6,
    tileRows: 5,
  };

  const game = {
    root: null,
    screen: null,
    crackPlane: null,
    table: null,
    rock: null,
    draggingRock: null,
    projectiles: [],
    buzzwords: [],
    fragments: [],
    cracks: [],
    shattered: false,
    screenTexture: null,
    crackContext: null,
    screenWidth: 1,
    screenHeight: 1,
    lights: [],
    motion: false,
    motionBase: null,
    impactFlash: 0,
    lastImpactAt: 0,
    overlayFragments: [],
    computerImpacts: [],
    computerDamageMarks: [],
    computerDamageMeshes: [],
    hitboxes: [],
    hitboxConfigs: [],
    anchorConfig: null,
    calibration: null,
    calibrationMarkers: [],
    calibrationSession: null,
    targets: [],
    shots: [],
    score: 0,
    level: 1,
    lives: 3,
    deadlineAt: 0,
    pausedRemaining: 0,
    waveId: 0,
    running: false,
    gameOver: false,
    inputMode: "game",
    aim: { x: 0, y: 0 },
    playSpace: null,
    lastTargetDebugAt: 0,
    musicEnabled: true,
    effectsEnabled: true,
  };

  const TARGET_WORDS = [
    "SYNERGI",
    "KEYNOTE",
    "AI-RESA",
    "AI STRATEGY",
    "VISION DECK",
    "PANELSNACK",
    "TRANSFORMATION",
    "AGENTIC AI",
    "MOGNAD",
    "INNOVATIONSHÖJD",
    "MÖJLIGGÖRARE",
    "VALUE CREATION",
    "THOUGHT LEADERSHIP",
    "PARADIGMSKIFTE",
    "FUTURE-PROOF",
    "LOW-HANGING FRUIT",
    "AI-FIRST",
    "COPILOT-RESA",
    "HYPERAUTOMATION",
    "SCALING AI",
    "CHANGE JOURNEY",
    "STRATEGIC LEVERAGE",
    "DATA-DRIVEN",
    "BEST PRACTICE",
    "DISRUPTION",
    "HUMAN IN THE LOOP",
    "AI-READINESS",
    "ORCHESTRATION",
    "FLYING WHEEL",
    "PROMPT ENGINEERING",
    "AI-AGENTER",
    "AUTONOMA AGENTER",
    "DIGITAL WORKFORCE",
    "HUMAN-AGENT COLLAB",
    "TASK-SPECIFIC AGENTS",
    "MULTI-AGENT ORCH",
    "AGENTIC WORKFLOWS",
    "AI-NATIVE",
    "AI-POWERED",
    "GEN AI TRANSFORM",
    "REVOLUTIONIZE",
    "UNLOCK VALUE",
    "AT SCALE",
    "SKALA UPP AI",
    "INTELLIGENT AUTOMATION",
    "END-TO-END AUTOMATION",
    "AUTONOMOUS DECISIONS",
    "SELF-HEALING SYSTEMS",
    "CONTEXT-AWARE AI",
    "ENTERPRISE-READY AI",
    "TRUSTWORTHY AI",
    "RESPONSIBLE AI",
    "GUARDRAILS",
    "GOVERNANCE BY DESIGN",
    "SEAMLESS INTEGRATION",
    "NEXT-GEN PRODUCTIVITY",
  ];

  const LEVEL_CONFIG = {
    firstTargetCount: 5,
    targetIncrease: 2,
    respawnDelay: 20000,
    introDuration: 5200,
    levelDuration: 60000,
    maxLives: 3,
  };
  const TARGET_LABEL_WIDTH = 0.16;
  const TARGET_LABEL_HEIGHT = TARGET_LABEL_WIDTH * 0.291;
  const TARGET_SCREEN_CLEARANCE = TARGET_LABEL_WIDTH * 1.45;
  const TARGET_SCREEN_APPROACH_BAND = TARGET_LABEL_WIDTH * 0.7;
  const TARGET_COMPUTER_CLEARANCE = TARGET_LABEL_WIDTH * 0.62;
  const TARGET_CENTER_FRACTION = 0.62;
  const TARGET_Y_MIN = -0.46;
  const TARGET_Y_MAX = 0.24;
  const TARGET_SCREEN_X_MIN = 0.1;
  const TARGET_SCREEN_X_MAX = 0.9;
  const TARGET_SCREEN_Y_MIN = 0.08;
  const TARGET_SCREEN_Y_MAX = 0.82;
  const TARGET_SCREEN_RETURN_X_MIN = 0.11;
  const TARGET_SCREEN_RETURN_X_MAX = 0.94;
  const TARGET_SCREEN_RETURN_Y_MIN = 0.08;
  const TARGET_SCREEN_RETURN_Y_MAX = 0.88;
  const TARGET_FLIGHT_X_MIN = 0.13;
  const TARGET_FLIGHT_X_MAX = 0.92;
  const TARGET_FLIGHT_Y_MIN = 0.12;
  const TARGET_FLIGHT_Y_MAX = 0.84;
  const TARGET_FLIGHT_FRONT_DEPTH = 0.72;
  const TARGET_FLIGHT_BACK_DEPTH = 1.25;
  const TARGET_RENDER_OVERLAY = true;
  const TARGET_SIDE_RANGES = {
    left: { xMin: -0.78, xMax: -0.16, screenXMin: 0.12, screenXMax: 0.42 },
    center: { xMin: -0.5, xMax: 0.42, screenXMin: 0.25, screenXMax: 0.73 },
    right: { xMin: 0.08, xMax: 0.62, screenXMin: 0.58, screenXMax: 0.86 },
  };
  const SHOT_COLLISION_STEP = 1 / 90;
  const SHOT_COLLISION_EPSILON = 0.004;
  const SHOT_DURATION = 360;
  const SHOT_MIN_DURATION = 120;
  const SHOT_MAX_DURATION = 380;
  const SHOT_WORLD_SPEED = 3.0;
  const SHOT_TAIL_T = 0.18;
  const SHOT_HIT_RADIUS = TARGET_LABEL_HEIGHT * 0.28;
  const SHOT_GUN_DEPTH_SCALE = 0.72;
  const SHOT_ARC_SCALE = 0.06;
  const SHOT_ARC_PIXELS = 56;
  const TARGET_HIT_PADDING = 28;
  const TARGET_RAY_HIT_SCALE = 1.48;
  const TARGET_HIT_DEPTH = TARGET_LABEL_WIDTH * 0.72;
  const TARGET_SCREEN_LAYER_CLEARANCE = TARGET_LABEL_WIDTH * 0.08;

  const CALIBRATED_HITBOX_DEFAULTS = [
    {
      name: "Skärm",
      x: 0,
      y: 0,
      z: 0,
      sx: 0.29450450825744834,
      sy: 0.19814528556560596,
      sz: 0.01,
      rx: 0,
      ry: 0,
      rz: 0,
    },
    {
      name: "Tangentbord",
      x: 0.0021575180832995172,
      y: -0.14511455907933413,
      z: -0.09407199840545653,
      sx: 0.29464293487847537,
      sy: 0.20578386349769315,
      sz: 0.01,
      rx: 65.8954057621532,
      ry: 0.6338470253841252,
      rz: 0.9288134705304125,
    },
  ];

  const SAVED_CALIBRATION_DEFAULT = {
    points: {
      screenTopLeft: [-0.0902, -0.1492, -0.0384],
      screenTopRight: [0.1947, -0.1505, -0.1184],
      screenBottomLeft: [-0.0691, 0.036, 0.0336],
      screenBottomRight: [0.2148, 0.0313, -0.0414],
      keyboardBackLeft: [-0.0679, 0.038, 0.0367],
      keyboardBackRight: [0.2168, 0.0357, -0.0421],
      keyboardFrontLeft: [-0.0105, 0.0433, 0.2347],
      keyboardFrontRight: [0.2725, 0.0392, 0.1556],
    },
    createdAt: 1780428816264,
  };

  const SOUND_FILES = {
    shoot: ["./sounds/shot.mp3"],
    hit: [
      "./sounds/word-hit-glass_1.mp3",
      "./sounds/word-hit-glass_2.mp3",
      "./sounds/word-hit-glass_3.mp3",
      "./sounds/word-hit-glass_4.mp3",
    ],
    miss: [
      "./sounds/miss_1.mp3",
      "./sounds/miss_2.mp3",
      "./sounds/miss_3.mp3",
      "./sounds/miss_4.mp3",
    ],
    computer: [
      "./sounds/computer-hit_1.mp3",
      "./sounds/computer-hit_2.mp3",
      "./sounds/computer-hit_3.mp3",
      "./sounds/computer-hit_4.mp3",
    ],
    level: ["./sounds/level-up.mp3"],
    gameOver: ["./sounds/game-over.mp3"],
    music: [
      "./sounds/music_1.mp3",
      "./sounds/music_2.mp3",
    ],
    buzz: [
      "./sounds/word-buzz_1.mp3",
      "./sounds/word-buzz_2.mp3",
      "./sounds/word-buzz_3.mp3",
      "./sounds/word-buzz_4.mp3",
      "./sounds/word-buzz_5.mp3",
      "./sounds/word-buzz_6.mp3",
    ],
  };

  const HITBOX_STORAGE_KEY = "keynoteDefenseHitboxes:v5";
  const ANCHOR_STORAGE_KEY = "keynoteDefenseAnchor:v1";
  const CALIBRATION_STORAGE_KEY = "keynoteDefenseCalibration:v1";
  const CALIBRATION_DISABLED_STORAGE_KEY = "keynoteDefenseCalibrationDisabled:v1";
  const CALIBRATION_OPTIONS_STORAGE_KEY = "keynoteDefenseCalibrationOptions:v1";
  const AUDIO_STORAGE_KEY = "keynoteDefenseAudio:v1";
  const CALIBRATION_VISIBLE = new URLSearchParams(window.location.search).has("calibrate");
  const CALIBRATION_POINTS = [
    { id: "screenTopLeft", label: "Skärm uppe vänster", required: true },
    { id: "screenTopRight", label: "Skärm uppe höger", required: true },
    { id: "screenBottomLeft", label: "Skärm nere vänster", required: true },
    { id: "screenBottomRight", label: "Skärm nere höger", required: true },
    { id: "keyboardBackLeft", label: "Tangentbord bak vänster", required: false },
    { id: "keyboardBackRight", label: "Tangentbord bak höger", required: false },
    { id: "keyboardFrontLeft", label: "Tangentbord fram vänster", required: false },
    { id: "keyboardFrontRight", label: "Tangentbord fram höger", required: false },
  ];
  const HITBOX_EDITOR_VISIBLE = new URLSearchParams(window.location.search).has("hitboxes");
  const HITBOX_GEOMETRY_VISIBLE = HITBOX_EDITOR_VISIBLE || CALIBRATION_VISIBLE;
  const HITBOX_FIELDS = [
    ["x", "X", 0.01],
    ["y", "Y", 0.01],
    ["z", "Z", 0.01],
    ["sx", "Bredd", 0.01],
    ["sy", "Höjd", 0.01],
    ["sz", "Djup", 0.01],
    ["rx", "Rot X", 1],
    ["ry", "Rot Y", 1],
    ["rz", "Rot Z", 1],
  ];

  const VIEW_PRESETS = {
    photo: { alpha: -2.4489, beta: 4.2771, radius: 1.3158 },
    front: { alpha: 1.25, beta: 1.35, radius: 0.85 },
    top: { alpha: -Math.PI / 2, beta: 0.12, radius: 0.82 },
    side: { alpha: 0, beta: Math.PI / 2, radius: 0.58 },
  };

  function searchNumber(name, fallback) {
    const value = Number(new URLSearchParams(window.location.search).get(name));
    return Number.isFinite(value) ? value : fallback;
  }

  function setStatus(mode, detail) {
    window.__qualityLoadState = { mode, detail, time: new Date().toISOString() };
    modeStatus.textContent = mode;
    if (detail) pointBadge.textContent = detail;
  }

  function init() {
    if (engine) return true;
    if (!window.BABYLON) {
      setStatus("Babylon saknas", "CDN ej laddad");
      return false;
    }

    engine = new BABYLON.Engine(canvas, true, {
      antialias: true,
      stencil: false,
      preserveDrawingBuffer: false,
    });
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
    scene.collisionsEnabled = false;
    scene.setRenderingAutoClearDepthStencil(2, true, true, true);
    scene.setRenderingAutoClearDepthStencil(3, true, true, true);

    game.lights = [
      new BABYLON.HemisphericLight("ambientGameLight", new BABYLON.Vector3(0.1, 1, 0.25), scene),
      new BABYLON.DirectionalLight("keyGameLight", new BABYLON.Vector3(-0.35, -0.8, 0.45), scene),
    ];
    game.lights[0].intensity = 0.74;
    game.lights[1].intensity = 1.05;

    camera = new BABYLON.ArcRotateCamera("kamera", -Math.PI / 2.2, Math.PI / 2.75, 2, BABYLON.Vector3.Zero(), scene);
    camera.lowerRadiusLimit = 0.05;
    camera.upperRadiusLimit = 50;
    camera.allowUpsideDown = true;
    camera.lowerBetaLimit = -Math.PI * 4;
    camera.upperBetaLimit = Math.PI * 4;
    camera.wheelPrecision = 75;
    camera.panningSensibility = 70;
    syncEditorCameraControls();
    camera.onViewMatrixChangedObservable.add(() => updateEditorState());

    engine.runRenderLoop(() => scene.render());
    window.addEventListener("resize", () => engine.resize());
    window.addEventListener("resize", resizeDefenseOverlay);
    window.addEventListener("splat-editor-mode", syncEditorCameraControls);
    registerGameInput();
    registerGameTick();
    loadAudioSettings();
    updateAudioButtons();
    resizeDefenseOverlay();
    window.__qualityDebug = { engine, scene, camera };
    return true;
  }

  function clear() {
    resetGame();
    canvas.classList.remove("is-active");
    for (const mesh of meshes) mesh.dispose?.();
    meshes = [];
    if (activeUrl) URL.revokeObjectURL(activeUrl);
    activeUrl = null;
  }

  async function load(file) {
    clear();
    canvas.classList.add("is-active");
    if (!init()) return;
    engine.resize();

    modelStatus.textContent = file.name;
    modelBadge.textContent = file.name;
    formatStatus.textContent = file.name.toLowerCase().endsWith(".spz") ? "SPZ / Babylon" : "PLY / Babylon";
    setStatus("Laddar", file.name);

    activeUrl = URL.createObjectURL(file);
    const extension = "." + file.name.toLowerCase().split(".").pop();
    const result = await BABYLON.SceneLoader.ImportMeshAsync(
      "",
      "",
      activeUrl,
      scene,
      undefined,
      extension,
      {
        splat: {
          flipY: true,
          spzLibraryUrl: "./vendor/spz.js",
        },
      },
    );

    meshes = result.meshes || [];
    window.__babylonDebug = {
      meshCount: meshes.length,
      names: meshes.map((mesh) => mesh.name),
      canvas: { width: canvas.width, height: canvas.height },
    };
    window.__qualityDebug = { engine, scene, camera, meshes };
    if (meshes[0]) {
      fitCamera(meshes[0]);
      applyViewPreset("photo");
    }
    setupGame();
    const count = getCount(meshes[0]);
    visibleStatus.textContent = count ? count.toLocaleString("sv-SE") : "-";
    setStatus("Kvalitet", count ? `${count.toLocaleString("sv-SE")} splats` : "Splat laddad");
    dropZone.querySelector("p").textContent = "Kvalitetsvy laddad";
    dropZone.querySelector("small").textContent = "Dra i scenen för att rotera. Scrolla för zoom.";
  }

  function fitCamera(mesh) {
    mesh.computeWorldMatrix(true);
    const vectors = mesh.getHierarchyBoundingVectors?.(true);
    const info = mesh.getBoundingInfo?.();
    const min = vectors?.min || info?.boundingBox.minimumWorld || BABYLON.Vector3.Zero();
    const max = vectors?.max || info?.boundingBox.maximumWorld || BABYLON.Vector3.One();
    const size = max.subtract(min);
    const radius = Math.max(size.x, size.y, size.z, 0.2);
    const hasHugeOutliers = radius > 10;
    const center = hasHugeOutliers ? BABYLON.Vector3.Zero() : min.add(max).scale(0.5);
    if (hasHugeOutliers) {
      focusOffset = new BABYLON.Vector3(
        searchNumber("fx", focusOffset?.x ?? 0),
        searchNumber("fy", focusOffset?.y ?? 0),
        searchNumber("fz", focusOffset?.z ?? 0),
      );
    }
    const focusRadius = hasHugeOutliers ? searchNumber("r", VIEW_PRESETS.photo.radius) : radius * 0.42;
    camera.target.copyFrom(center.add(focusOffset || BABYLON.Vector3.Zero()));
    camera.radius = focusRadius;
    camera.alpha = searchNumber("a", VIEW_PRESETS.photo.alpha);
    camera.beta = searchNumber("b", VIEW_PRESETS.photo.beta);
    camera.lowerRadiusLimit = hasHugeOutliers ? 0.06 : radius * 0.03;
    camera.upperRadiusLimit = hasHugeOutliers ? 8 : radius * 4;
    window.__qualityCameraBase = { radius: hasHugeOutliers ? 1 : radius, center: center.asArray() };
    updateEditorState();
  }

  function applyViewPreset(view) {
    if (!camera || !window.__qualityCameraBase) return;
    const preset = VIEW_PRESETS[view];
    if (!preset) return;
    const radius = window.__qualityCameraBase.radius;
    camera.alpha = preset.alpha;
    camera.beta = preset.beta;
    camera.radius = radius * preset.radius;
    camera.inertialAlphaOffset = 0;
    camera.inertialBetaOffset = 0;
    camera.inertialRadiusOffset = 0;
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;
    updateEditorState();
  }

  function updateEditorState() {
    if (!camera) return null;
    window.__qualityEditorState = () => ({
      alpha: round(camera.alpha),
      beta: round(camera.beta),
      radius: round(camera.radius),
      target: camera.target.asArray().map(round),
      focusOffset: focusOffset ? focusOffset.asArray().map(round) : null,
      url: `?a=${round(camera.alpha)}&b=${round(camera.beta)}&r=${round(camera.radius)}${focusOffset ? `&fx=${round(focusOffset.x)}&fy=${round(focusOffset.y)}&fz=${round(focusOffset.z)}` : ""}`,
    });
    window.dispatchEvent(new CustomEvent("quality-camera-changed", {
      detail: {
        alpha: camera.alpha,
        beta: camera.beta,
        radius: camera.radius,
      },
    }));
    return window.__qualityEditorState();
  }

  function round(value) {
    return Math.round(value * 10000) / 10000;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getCount(mesh) {
    return mesh?._splatCount || mesh?._vertexCount || mesh?.getTotalVertices?.() || 0;
  }

  function syncEditorCameraControls() {
    if (!camera) return;
    camera.attachControl(canvas, true);
  }

  function resetGame() {
    for (const item of game.projectiles) item.mesh?.dispose?.();
    for (const item of game.fragments) item.mesh?.dispose?.();
    for (const item of game.buzzwords) item.mesh?.dispose?.();
    for (const target of game.targets) disposeTargetMesh(target);
    clearComputerDamageMeshes();
    for (const item of game.hitboxes) {
      item.mesh?.dispose?.();
      item.occluder?.dispose?.();
      item.material?.dispose?.();
      item.occluderMaterial?.dispose?.();
    }
    clearCalibrationMarkers();
    game.root?.dispose?.();
    game.screenTexture?.dispose?.();
    game.root = null;
    game.screen = null;
    game.crackPlane = null;
    game.projectiles = [];
    game.fragments = [];
    game.buzzwords = [];
    game.cracks = [];
    game.screenTexture = null;
    game.crackContext = null;
    game.screenWidth = 1;
    game.screenHeight = 1;
    game.overlayFragments = [];
    game.computerImpacts = [];
    game.computerDamageMarks = [];
    game.computerDamageMeshes = [];
    game.hitboxes = [];
    game.hitboxConfigs = [];
    game.anchorConfig = null;
    game.calibration = null;
    game.targets = [];
    game.shots = [];
    game.score = 0;
    game.lives = LEVEL_CONFIG.maxLives;
    game.deadlineAt = 0;
    game.pausedRemaining = 0;
    game.running = false;
    game.gameOver = false;
    game.inputMode = CALIBRATION_VISIBLE ? "calibration" : "game";
    game.level = 1;
    game.waveId = 0;
    game.playSpace = null;
    stopBuzzLoop();
    clearDefenseOverlay();
    game.shattered = false;
    game.impactFlash = 0;
    game.lastImpactAt = 0;
    setButtonActive("#defenseMotionButton", false);
    setGameMessage("");
    if (defenseGameStartButton) defenseGameStartButton.textContent = "Starta";
    setGameOverVisible(false);
    updateHud();
  }

  function clearComputerDamageMeshes() {
    for (const item of game.computerDamageMeshes) {
      item.mesh?.dispose?.();
      item.material?.dispose?.();
      item.texture?.dispose?.();
    }
    game.computerDamageMeshes = [];
  }

  function setupGame() {
    if (!scene || !camera || !engine) return;
    resetGame();

    const calibration = loadCalibration();
    const anchor = createScreenAnchor(calibration);
    game.screenWidth = anchor.width;
    game.screenHeight = anchor.height;
    game.calibration = anchor.calibration || null;
    game.anchorConfig = loadAnchorConfig();
    game.root = new BABYLON.TransformNode("keynoteDefenseRoot", scene);
    game.root.position.copyFrom(anchor.center);
    game.root.rotationQuaternion = anchor.rotation;
    game.root.metadata = { width: anchor.width, height: anchor.height };
    applyAnchorConfig();

    game.screenTexture = new BABYLON.DynamicTexture("screenDamageTexture", { width: 1280, height: 760 }, scene, true);
    game.screenTexture.hasAlpha = true;
    game.crackContext = game.screenTexture.getContext();
    clearCrackTexture();

    const crackMat = new BABYLON.StandardMaterial("screenDamageMaterial", scene);
    crackMat.diffuseTexture = game.screenTexture;
    crackMat.emissiveTexture = game.screenTexture;
    crackMat.opacityTexture = game.screenTexture;
    crackMat.useAlphaFromDiffuseTexture = true;
    crackMat.disableLighting = true;
    crackMat.backFaceCulling = false;
    crackMat.alphaMode = BABYLON.Engine.ALPHA_COMBINE;

    game.crackPlane = BABYLON.MeshBuilder.CreatePlane("screenDamagePlane", {
      width: anchor.width,
      height: anchor.height,
    }, scene);
    game.crackPlane.parent = game.root;
    game.crackPlane.position.z = 0.012;
    game.crackPlane.material = crackMat;
    game.crackPlane.renderingGroupId = 1;
    game.crackPlane.alphaIndex = 0;
    markDefenseMesh(game.crackPlane);

    const hitMat = new BABYLON.StandardMaterial("screenHitMaterial", scene);
    hitMat.diffuseColor = new BABYLON.Color3(0.8, 1, 0.25);
    hitMat.emissiveColor = new BABYLON.Color3(0.35, 0.65, 0.05);
    hitMat.alpha = 0.06;
    hitMat.disableLighting = true;
    hitMat.backFaceCulling = false;

    game.screen = BABYLON.MeshBuilder.CreatePlane("screenHitPlane", {
      width: anchor.width,
      height: anchor.height,
    }, scene);
    game.screen.parent = game.root;
    game.screen.position.z = 0.006;
    game.screen.material = hitMat;
    game.screen.isPickable = true;
    markDefenseMesh(game.screen);

    game.motionBase = {
      alpha: camera.alpha,
      beta: camera.beta,
      radius: camera.radius,
      startedAt: performance.now(),
    };
    game.aim = {
      x: overlayCanvas?.clientWidth ? overlayCanvas.clientWidth / 2 : 0,
      y: overlayCanvas?.clientHeight ? overlayCanvas.clientHeight / 2 : 0,
    };
    setupPlaySpace();
    setupHitboxes();
    setupHitboxEditor();
    setupCalibrationPanel();
    if (CALIBRATION_VISIBLE) setCalibrationInputMode(game.inputMode === "calibration");
    updateScore(0);
    game.lives = LEVEL_CONFIG.maxLives;
    startLevel(1);
    registerGameButtons();
    window.__keynoteDefenseDebug = { game, anchor, hit: launchHit, start: startDefense, reset: resetGame };
  }

  function createScreenAnchor(calibration = null) {
    const calibratedAnchor = createCalibratedAnchor(calibration);
    if (calibratedAnchor) return calibratedAnchor;

    const rect = GAME_CONFIG.screenRect;
    const distance = Math.max(0.12, camera.radius * GAME_CONFIG.screenDepthScale);
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    const viewportWidth = Math.max(1, overlayCanvas?.clientWidth || canvas.clientWidth);
    const viewportHeight = Math.max(1, overlayCanvas?.clientHeight || canvas.clientHeight);
    const centerRay = scene.createPickingRay(centerX * viewportWidth, centerY * viewportHeight, BABYLON.Matrix.Identity(), camera);
    const forward = centerRay.direction.normalize();
    const center = centerRay.origin.add(forward.scale(distance));
    const cornerPoints = [
      [rect.x, rect.y],
      [rect.x + rect.width, rect.y],
      [rect.x + rect.width, rect.y + rect.height],
      [rect.x, rect.y + rect.height],
    ].map(([nx, ny]) => {
      const ray = scene.createPickingRay(nx * viewportWidth, ny * viewportHeight, BABYLON.Matrix.Identity(), camera);
      const denominator = BABYLON.Vector3.Dot(ray.direction, forward);
      const t = Math.abs(denominator) > 0.000001
        ? BABYLON.Vector3.Dot(center.subtract(ray.origin), forward) / denominator
        : distance;
      return ray.origin.add(ray.direction.scale(Math.max(0.01, t)));
    });
    const [topLeft, topRight, bottomRight, bottomLeft] = cornerPoints;
    const rawRight = topRight.subtract(topLeft).add(bottomRight.subtract(bottomLeft)).scale(0.5);
    const right = rawRight.subtract(forward.scale(BABYLON.Vector3.Dot(rawRight, forward))).normalize();
    const up = BABYLON.Vector3.Cross(forward, right).normalize();
    const matrix = BABYLON.Matrix.Identity();
    BABYLON.Matrix.FromXYZAxesToRef(right, up, forward, matrix);
    const width = (
      BABYLON.Vector3.Distance(topLeft, topRight)
      + BABYLON.Vector3.Distance(bottomLeft, bottomRight)
    ) * 0.5;
    const height = (
      BABYLON.Vector3.Distance(topLeft, bottomLeft)
      + BABYLON.Vector3.Distance(topRight, bottomRight)
    ) * 0.5;
    if (![center.x, center.y, center.z, width, height].every(Number.isFinite)) {
      const fallbackCenter = camera.target.add(camera.position.subtract(camera.target).normalize().scale(0.08));
      return {
        center: fallbackCenter,
        width: 0.42,
        height: 0.26,
        rotation: BABYLON.Quaternion.Identity(),
      };
    }
    return {
      center,
      width,
      height,
      rotation: BABYLON.Quaternion.FromRotationMatrix(matrix),
    };
  }

  function createCalibratedAnchor(calibration) {
    const points = calibration?.points;
    if (!points) return null;
    const topLeft = vectorFromArray(points.screenTopLeft);
    const topRight = vectorFromArray(points.screenTopRight);
    const bottomLeft = vectorFromArray(points.screenBottomLeft);
    const bottomRight = vectorFromArray(points.screenBottomRight);
    if (![topLeft, topRight, bottomLeft, bottomRight].every(Boolean)) return null;

    const center = topLeft.add(topRight).add(bottomLeft).add(bottomRight).scale(0.25);
    const xVector = topRight.subtract(topLeft).add(bottomRight.subtract(bottomLeft)).scale(0.5);
    const yVector = topLeft.subtract(bottomLeft).add(topRight.subtract(bottomRight)).scale(0.5);
    if (xVector.length() < 0.01 || yVector.length() < 0.01) return null;

    const right = xVector.normalize();
    const up = yVector.normalize();
    const forward = BABYLON.Vector3.Cross(right, up).normalize();
    const matrix = BABYLON.Matrix.Identity();
    BABYLON.Matrix.FromXYZAxesToRef(right, up, forward, matrix);
    const width = (
      BABYLON.Vector3.Distance(topLeft, topRight)
      + BABYLON.Vector3.Distance(bottomLeft, bottomRight)
    ) * 0.5;
    const height = (
      BABYLON.Vector3.Distance(topLeft, bottomLeft)
      + BABYLON.Vector3.Distance(topRight, bottomRight)
    ) * 0.5;
    return {
      center,
      width,
      height,
      rotation: BABYLON.Quaternion.FromRotationMatrix(matrix),
      calibration,
    };
  }

  function vectorFromArray(value) {
    if (!Array.isArray(value) || value.length < 3) return null;
    const vector = new BABYLON.Vector3(Number(value[0]), Number(value[1]), Number(value[2]));
    return [vector.x, vector.y, vector.z].every(Number.isFinite) ? vector : null;
  }

  function vectorToArray(vector) {
    return [round(vector.x), round(vector.y), round(vector.z)];
  }

  function clearCrackTexture() {
    if (!game.crackContext || !game.screenTexture) return;
    const context = game.crackContext;
    const { width, height } = game.screenTexture.getSize();
    context.clearRect(0, 0, width, height);
    game.screenTexture.update(false);
  }

  function redrawDamageTexture() {
    if (!game.crackContext || !game.screenTexture) return;
    const context = game.crackContext;
    const size = game.screenTexture.getSize();
    context.clearRect(0, 0, size.width, size.height);

    context.save();
    context.globalCompositeOperation = "lighter";
    for (let i = 0; i < game.cracks.length; i += 1) {
      drawCrack(context, size, game.cracks[i], i);
    }
    if (game.impactFlash > 0.01) {
      const latest = game.cracks.at(-1);
      if (latest) drawImpactFlash(context, size, latest);
    }
    context.restore();
    game.screenTexture.update(false);
  }

  function drawCrack(context, size, crack, index) {
    const cx = (0.5 + crack.x / game.screenWidth) * size.width;
    const cy = (0.5 - crack.y / game.screenHeight) * size.height;
    if (![cx, cy].every(Number.isFinite)) return;
    const longest = Math.max(size.width, size.height);
    const baseRadius = longest * (0.18 + index * 0.045);

    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "rgba(245,255,210,0.88)";
    context.shadowColor = "rgba(231,255,98,0.65)";
    context.shadowBlur = 12;

    for (let ray = 0; ray < 12; ray += 1) {
      const angle = crack.seed + ray * Math.PI * 0.165 + Math.sin(ray * 2.7 + crack.seed) * 0.32;
      const length = baseRadius * (0.45 + pseudoRandom(crack.seed + ray * 9.1) * 0.72);
      const endX = cx + Math.cos(angle) * length;
      const endY = cy + Math.sin(angle) * length;
      context.lineWidth = ray % 3 === 0 ? 3.2 : 1.5;
      context.beginPath();
      context.moveTo(cx, cy);
      context.lineTo(endX, endY);
      context.stroke();

      if (ray % 2 === 0) {
        const branchAt = 0.35 + pseudoRandom(crack.seed + ray) * 0.35;
        const branchX = cx + (endX - cx) * branchAt;
        const branchY = cy + (endY - cy) * branchAt;
        const branchAngle = angle + (pseudoRandom(crack.seed + ray * 3.3) > 0.5 ? 1 : -1) * (0.45 + pseudoRandom(ray + crack.seed) * 0.45);
        context.lineWidth = 1.1;
        context.beginPath();
        context.moveTo(branchX, branchY);
        context.lineTo(branchX + Math.cos(branchAngle) * length * 0.28, branchY + Math.sin(branchAngle) * length * 0.28);
        context.stroke();
      }
    }

    context.shadowBlur = 0;
    context.fillStyle = "rgba(8,10,8,0.65)";
    context.strokeStyle = "rgba(231,255,98,0.9)";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(cx, cy, 17 + index * 2, 0, Math.PI * 2);
    context.fill();
    context.stroke();

    if (index === game.cracks.length - 1) {
      context.font = "700 32px ui-sans-serif, system-ui, sans-serif";
      context.fillStyle = "rgba(231,255,98,0.96)";
      context.fillText("BUILD > TALK", Math.min(cx + 24, size.width - 280), Math.max(48, cy - 20));
    }
  }

  function drawImpactFlash(context, size, crack) {
    const cx = (0.5 + crack.x / game.screenWidth) * size.width;
    const cy = (0.5 - crack.y / game.screenHeight) * size.height;
    if (![cx, cy].every(Number.isFinite)) return;
    const radius = 210 * game.impactFlash;
    const gradient = context.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, `rgba(255,255,245,${0.9 * game.impactFlash})`);
    gradient.addColorStop(0.28, `rgba(231,255,98,${0.42 * game.impactFlash})`);
    gradient.addColorStop(1, "rgba(231,255,98,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, size.width, size.height);
  }

  function pseudoRandom(value) {
    return Math.abs(Math.sin(value * 9301.77) * 49297.13) % 1;
  }

  function getAudioContext() {
    if (audioContext) return audioContext;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
    return audioContext;
  }

  function playEffect(type) {
    if (!game.effectsEnabled) return;
    if (playSoundFile(type)) return;
    playTone(type);
  }

  function playSoundFile(type, options = {}) {
    const src = options.src || pickSoundSource(type, options.seed);
    if (!src) return false;
    const cached = soundCache.get(src);
    if (cached?.available === false) return false;

    const audio = cached?.element?.cloneNode(true) || new Audio(src);
    audio.volume = options.volume ?? 0.58;
    audio.loop = Boolean(options.loop);
    if (options.playbackRate) audio.playbackRate = options.playbackRate;
    if (!cached) soundCache.set(src, { element: audio, available: true });

    const promise = audio.play();
    if (promise?.catch) {
      promise.catch(() => {
        soundCache.set(src, { element: audio, available: false });
        if (!options.loop) playTone(type);
      });
    }
    return true;
  }

  function pickSoundSource(type, seed = performance.now()) {
    const sources = SOUND_FILES[type] || [];
    const available = sources.filter((src) => soundCache.get(src)?.available !== false);
    if (!available.length) return null;
    let index = Math.floor(pseudoRandom(seed + available.length * 17.13) * available.length);
    if (available.length > 1 && available[index] === lastSoundSource.get(type)) {
      index = (index + 1) % available.length;
    }
    const selected = available[index];
    lastSoundSource.set(type, selected);
    return selected;
  }

  function loadAudioSettings() {
    try {
      const parsed = JSON.parse(localStorage.getItem(AUDIO_STORAGE_KEY) || "null");
      if (parsed && typeof parsed === "object") {
        game.musicEnabled = parsed.musicEnabled !== false;
        game.effectsEnabled = parsed.effectsEnabled !== false;
      }
    } catch {
      game.musicEnabled = true;
      game.effectsEnabled = true;
    }
  }

  function saveAudioSettings() {
    localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify({
      musicEnabled: game.musicEnabled,
      effectsEnabled: game.effectsEnabled,
    }));
  }

  function updateAudioButtons() {
    const setAudioButton = (button, enabled, label, icon) => {
      if (!button) return;
      const status = enabled ? "på" : "av";
      const text = `${label} ${status}`;
      const iconElement = button.querySelector(".sound-toggle-icon");
      if (iconElement && iconElement.dataset.icon !== "speaker") {
        iconElement.textContent = icon;
      } else if (!iconElement) {
        button.textContent = icon;
      }
      button.setAttribute("aria-label", text);
      button.setAttribute("aria-pressed", String(enabled));
      button.title = text;
      button.classList.toggle("is-muted", !enabled);
    };
    if (musicToggleButton) {
      setAudioButton(musicToggleButton, game.musicEnabled, "Musik", "♪");
    }
    if (effectsToggleButton) {
      setAudioButton(effectsToggleButton, game.effectsEnabled, "FX", "");
    }
  }

  function setMusicEnabled(enabled) {
    game.musicEnabled = Boolean(enabled);
    saveAudioSettings();
    updateAudioButtons();
    if (game.musicEnabled) {
      startMusic();
    } else {
      stopMusic();
    }
  }

  function setEffectsEnabled(enabled) {
    game.effectsEnabled = Boolean(enabled);
    saveAudioSettings();
    updateAudioButtons();
    if (!game.effectsEnabled) {
      stopBuzzLoop();
    } else if (game.running) {
      startBuzzLoop();
    }
  }

  function startMusic() {
    if (!game.musicEnabled || !SOUND_FILES.music.length) return;
    if (musicAudio && !musicAudio.paused) return;
    if (musicIndex < 0) musicIndex = Math.floor(Math.random() * SOUND_FILES.music.length);
    playMusicTrack(musicIndex);
  }

  function stopMusic() {
    if (!musicAudio) return;
    musicAudio.pause();
    musicAudio.currentTime = 0;
  }

  function playMusicTrack(index) {
    if (!game.musicEnabled || !SOUND_FILES.music.length) return;
    musicIndex = ((index % SOUND_FILES.music.length) + SOUND_FILES.music.length) % SOUND_FILES.music.length;
    if (musicAudio) {
      musicAudio.pause();
      musicAudio.onended = null;
    }
    musicAudio = new Audio(SOUND_FILES.music[musicIndex]);
    musicAudio.volume = 0.28;
    musicAudio.loop = false;
    musicAudio.onended = () => {
      if (game.musicEnabled) playMusicTrack(musicIndex + 1);
    };
    const promise = musicAudio.play();
    if (promise?.catch) promise.catch(() => {});
  }

  function startBuzzLoop() {
    if (!game.effectsEnabled) return;
    for (const target of game.targets) {
      if (target.alive) startTargetBuzz(target);
    }
  }

  function startTargetBuzz(target) {
    if (!game.effectsEnabled) return;
    if (!target?.id || buzzAudios.has(target.id)) return;
    const src = target.buzzSrc || pickSoundSource("buzz", target.phase);
    if (!src || soundCache.get(src)?.available === false) return;
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0;
    audio.playbackRate = target.buzzRate || 1;
    buzzAudios.set(target.id, audio);
    soundCache.set(src, { element: audio, available: true });
    const promise = audio.play();
    if (promise?.catch) {
      promise.catch(() => {
        buzzAudios.delete(target.id);
        soundCache.set(src, { element: audio, available: false });
      });
    }
  }

  function stopTargetBuzz(targetId) {
    const audio = buzzAudios.get(targetId);
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    buzzAudios.delete(targetId);
  }

  function stopBuzzLoop() {
    for (const [targetId, audio] of buzzAudios) {
      audio.pause();
      audio.currentTime = 0;
      buzzAudios.delete(targetId);
    }
  }

  function updateBuzzLoop() {
    if (!buzzAudios.size) return;
    for (const target of game.targets) {
      const audio = buzzAudios.get(target.id);
      if (!audio) continue;
      const active = game.running
        && target.alive
        && target.level === game.level
        && target.waveId === game.waveId;
      const visibleBoost = target.screen ? 1 : 0.45;
      const targetVolume = active ? 0.014 * visibleBoost : 0;
      audio.volume += (targetVolume - audio.volume) * 0.08;
      if (!active && audio.volume < 0.002) stopTargetBuzz(target.id);
    }
  }

  function playTone(type) {
    const context = getAudioContext();
    if (!context) return;
    if (context.state === "suspended") context.resume();

    const now = context.currentTime;
    if (type !== "shoot" && type !== "miss" && type !== "level" && type !== "gameOver") {
      playGlassTone(context, now);
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.connect(gain);
    gain.connect(context.destination);

    if (type === "shoot") {
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(520, now);
      oscillator.frequency.exponentialRampToValueAtTime(180, now + 0.12);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.11, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
      oscillator.start(now);
      oscillator.stop(now + 0.14);
      return;
    }

    if (type === "miss") {
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(150, now);
      oscillator.frequency.exponentialRampToValueAtTime(52, now + 0.18);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      oscillator.start(now);
      oscillator.stop(now + 0.22);
      return;
    }

    if (type === "level") {
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(330, now);
      oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.16);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.09, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
      oscillator.start(now);
      oscillator.stop(now + 0.26);
      return;
    }

    if (type === "gameOver") {
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(180, now);
      oscillator.frequency.exponentialRampToValueAtTime(48, now + 0.42);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.14, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      oscillator.start(now);
      oscillator.stop(now + 0.54);
    }
  }

  function playGlassTone(context, now) {
    const noise = context.createBufferSource();
    const buffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.18), context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const filter = context.createBiquadFilter();
    const noiseGain = context.createGain();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(1800, now);
    noise.buffer = buffer;
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(context.destination);
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.16, now + 0.008);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    noise.start(now);
    noise.stop(now + 0.18);

    for (const [index, frequency] of [1180, 1720, 2460].entries()) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.82, now + 0.12);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.06 / (index + 1), now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22 + index * 0.04);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now + index * 0.012);
      oscillator.stop(now + 0.28 + index * 0.04);
    }
  }

  function createBuzzwords() {
    if (!game.root) return;
    const words = ["KEYNOTE", "AI-STRATEGI", "VISION DECK", "PANELSNACK"];
    const width = game.screenWidth;
    const height = game.screenHeight;
    const positions = [
      [width * -0.72, height * 0.86],
      [width * 0.72, height * 0.92],
      [width * -0.82, height * -0.82],
      [width * 0.86, height * -0.7],
    ];
    for (let i = 0; i < words.length; i += 1) {
      const mesh = createLabelMesh(`buzzword${i}`, words[i], 0.165, "#11140b", "#e7ff62");
      mesh.parent = game.root;
      mesh.position.set(positions[i][0], positions[i][1], 0.28 + i * 0.03);
      mesh.metadata = { baseX: positions[i][0], baseY: positions[i][1], phase: i * 1.7 };
      game.buzzwords.push({ mesh });
    }
  }

  function createLabelMesh(name, text, width, background, foreground) {
    const texture = new BABYLON.DynamicTexture(`${name}Texture`, { width: 768, height: 224 }, scene, true);
    const context = texture.getContext();
    context.clearRect(0, 0, 768, 224);
    context.fillStyle = background;
    context.fillRect(0, 0, 768, 224);
    context.fillStyle = "rgba(51,215,255,0.18)";
    context.fillRect(0, 0, 768, 18);
    context.fillStyle = "rgba(255,79,216,0.14)";
    context.fillRect(0, 188, 768, 36);
    context.strokeStyle = foreground;
    context.lineWidth = 7;
    context.strokeRect(12, 12, 744, 200);
    context.strokeStyle = "rgba(51,215,255,0.75)";
    context.lineWidth = 3;
    context.strokeRect(22, 22, 724, 180);
    context.font = "900 76px 'Arial Black', 'Courier New', sans-serif";
    context.letterSpacing = "0px";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#33d7ff";
    context.fillText(text, 390, 120, 690);
    context.fillStyle = "#ff4fd8";
    context.fillText(text, 378, 112, 690);
    context.fillStyle = foreground;
    context.fillText(text, 384, 116, 690);
    texture.hasAlpha = true;
    texture.update(false);

    const material = new BABYLON.StandardMaterial(`${name}Material`, scene);
    material.diffuseTexture = texture;
    material.emissiveTexture = texture;
    material.opacityTexture = texture;
    material.disableLighting = true;
    material.backFaceCulling = false;

    const mesh = BABYLON.MeshBuilder.CreatePlane(name, { width, height: width * 0.291 }, scene);
    mesh.material = material;
    markDefenseMesh(mesh);
    return mesh;
  }

  function setupHitboxes() {
    game.hitboxConfigs = loadHitboxConfigs();
    game.hitboxes = game.hitboxConfigs.map((config, index) => createHitboxMesh(config, index));
    updateHitboxVisibility();
  }

  function defaultHitboxConfigs() {
    const keyboardConfig = keyboardHitboxFromCalibration(game.screenWidth || 0.34, game.screenHeight || 0.22);
    const defaults = CALIBRATED_HITBOX_DEFAULTS.map((item) => ({ ...item }));
    if (keyboardConfig) {
      defaults[1] = { name: "Tangentbord", ...keyboardConfig };
    }
    return defaults;
  }

  function keyboardHitboxFromCalibration(width, height) {
    if (!game.calibration?.points || !game.root) return null;
    const backLeft = vectorFromArray(game.calibration.points.keyboardBackLeft);
    const backRight = vectorFromArray(game.calibration.points.keyboardBackRight);
    const frontLeft = vectorFromArray(game.calibration.points.keyboardFrontLeft);
    const frontRight = vectorFromArray(game.calibration.points.keyboardFrontRight);
    if (![backLeft, backRight, frontLeft, frontRight].every(Boolean)) return null;
    game.root.computeWorldMatrix(true);
    const inverse = game.root.getWorldMatrix().clone().invert();
    const localBackLeft = BABYLON.Vector3.TransformCoordinates(backLeft, inverse);
    const localBackRight = BABYLON.Vector3.TransformCoordinates(backRight, inverse);
    const localFrontLeft = BABYLON.Vector3.TransformCoordinates(frontLeft, inverse);
    const localFrontRight = BABYLON.Vector3.TransformCoordinates(frontRight, inverse);
    const localPoints = [localBackLeft, localBackRight, localFrontLeft, localFrontRight];
    const center = localPoints.reduce((sum, point) => sum.add(point), BABYLON.Vector3.Zero()).scale(0.25);
    const xVector = localBackRight.subtract(localBackLeft).add(localFrontRight.subtract(localFrontLeft)).scale(0.5);
    const yVector = localBackLeft.subtract(localFrontLeft).add(localBackRight.subtract(localFrontRight)).scale(0.5);
    if (xVector.length() < 0.01 || yVector.length() < 0.01) return null;
    const xAxis = xVector.normalize();
    let yAxis = yVector.normalize();
    const zAxis = BABYLON.Vector3.Cross(xAxis, yAxis).normalize();
    yAxis = BABYLON.Vector3.Cross(zAxis, xAxis).normalize();
    const matrix = BABYLON.Matrix.Identity();
    BABYLON.Matrix.FromXYZAxesToRef(xAxis, yAxis, zAxis, matrix);
    const rotation = BABYLON.Quaternion.FromRotationMatrix(matrix).toEulerAngles();
    return {
      x: center.x,
      y: center.y,
      z: center.z,
      sx: Math.max(0.08, (
        BABYLON.Vector3.Distance(localBackLeft, localBackRight)
        + BABYLON.Vector3.Distance(localFrontLeft, localFrontRight)
      ) * 0.5),
      sy: Math.max(0.05, (
        BABYLON.Vector3.Distance(localBackLeft, localFrontLeft)
        + BABYLON.Vector3.Distance(localBackRight, localFrontRight)
      ) * 0.5),
      sz: 0.01,
      rx: BABYLON.Tools.ToDegrees(rotation.x),
      ry: BABYLON.Tools.ToDegrees(rotation.y),
      rz: BABYLON.Tools.ToDegrees(rotation.z),
    };
  }

  function loadHitboxConfigs() {
    try {
      const parsed = JSON.parse(localStorage.getItem(HITBOX_STORAGE_KEY) || "null");
      if (Array.isArray(parsed) && parsed.length === 2) return parsed.map(normalizeHitboxConfig);
    } catch {
      // Ignore corrupt calibration and fall back to defaults.
    }
    return defaultHitboxConfigs().map(normalizeHitboxConfig);
  }

  function normalizeHitboxConfig(config, index = 0) {
    const fallback = defaultHitboxConfigs()[index] || defaultHitboxConfigs()[0];
    const output = { name: config.name || fallback.name };
    for (const [key] of HITBOX_FIELDS) {
      const value = Number(config[key]);
      output[key] = Number.isFinite(value) ? value : fallback[key];
    }
    output.sx = Math.max(0.01, output.sx);
    output.sy = Math.max(0.01, output.sy);
    output.sz = Math.max(0.01, output.sz);
    return output;
  }

  function createHitboxMesh(config, index) {
    const material = new BABYLON.StandardMaterial(`computerHitboxMaterial${index}`, scene);
    material.diffuseColor = index === 0 ? new BABYLON.Color3(0.2, 1, 0.35) : new BABYLON.Color3(0.1, 0.65, 1);
    material.emissiveColor = material.diffuseColor.scale(0.32);
    material.alpha = HITBOX_GEOMETRY_VISIBLE ? 0.08 : 0;
    material.disableLighting = true;
    material.backFaceCulling = false;
    material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;

    const mesh = BABYLON.MeshBuilder.CreateBox(`computerHitbox${index + 1}`, { size: 1 }, scene);
    mesh.parent = game.root;
    mesh.material = material;
    mesh.isPickable = true;
    mesh.alwaysSelectAsActiveMesh = true;
    mesh.renderingGroupId = 3;
    mesh.enableEdgesRendering();
    mesh.edgesWidth = 1.15;
    mesh.edgesColor = index === 0
      ? new BABYLON.Color4(0.55, 1, 0.18, HITBOX_GEOMETRY_VISIBLE ? 0.9 : 0)
      : new BABYLON.Color4(0.2, 0.75, 1, HITBOX_GEOMETRY_VISIBLE ? 0.9 : 0);

    const occluderMaterial = new BABYLON.StandardMaterial(`computerOccluderMaterial${index}`, scene);
    occluderMaterial.disableLighting = true;
    occluderMaterial.disableColorWrite = true;
    occluderMaterial.forceDepthWrite = true;
    occluderMaterial.backFaceCulling = false;

    const occluder = BABYLON.MeshBuilder.CreateBox(`computerOccluder${index + 1}`, { size: 1 }, scene);
    occluder.parent = game.root;
    occluder.material = occluderMaterial;
    occluder.isPickable = false;
    occluder.alwaysSelectAsActiveMesh = true;
    occluder.renderingGroupId = 2;
    applyHitboxConfig(mesh, config);
    applyHitboxConfig(occluder, config);
    return { mesh, material, occluder, occluderMaterial, config };
  }

  function applyHitboxConfig(mesh, config) {
    mesh.position.set(config.x, config.y, config.z);
    mesh.scaling.set(config.sx, config.sy, config.sz);
    mesh.rotation.set(
      BABYLON.Tools.ToRadians(config.rx),
      BABYLON.Tools.ToRadians(config.ry),
      BABYLON.Tools.ToRadians(config.rz),
    );
    mesh.computeWorldMatrix(true);
  }

  function updateHitboxVisibility() {
    for (const item of game.hitboxes) {
      item.material.alpha = HITBOX_GEOMETRY_VISIBLE ? 0.08 : 0;
      item.mesh.visibility = HITBOX_GEOMETRY_VISIBLE ? 1 : 0;
      item.mesh.edgesColor.a = HITBOX_GEOMETRY_VISIBLE ? 0.9 : 0;
    }
  }

  function saveHitboxConfigs() {
    localStorage.setItem(HITBOX_STORAGE_KEY, JSON.stringify(game.hitboxConfigs));
  }

  function defaultAnchorConfig() {
    return { mirrorX: true };
  }

  function loadAnchorConfig() {
    try {
      const parsed = JSON.parse(localStorage.getItem(ANCHOR_STORAGE_KEY) || "null");
      if (parsed && typeof parsed === "object") return { mirrorX: parsed.mirrorX !== false };
    } catch {
      // Ignore corrupt calibration and fall back to the Scaniverse/SPZ mirror default.
    }
    return defaultAnchorConfig();
  }

  function saveAnchorConfig() {
    localStorage.setItem(ANCHOR_STORAGE_KEY, JSON.stringify(game.anchorConfig || defaultAnchorConfig()));
  }

  function applyAnchorConfig() {
    if (!game.root) return;
    if (game.calibration) {
      game.root.scaling.x = 1;
      game.root.computeWorldMatrix(true);
      return;
    }
    const mirrorX = game.anchorConfig?.mirrorX !== false;
    game.root.scaling.x = mirrorX ? -1 : 1;
    game.root.computeWorldMatrix(true);
  }

  function updateAnchorControls() {
    const button = hitboxEditor?.querySelector('[data-hitbox-action="mirrorX"]');
    if (!button) return;
    if (game.calibration) {
      button.textContent = "Kalibrerat ankare";
      button.disabled = true;
      return;
    }
    button.disabled = false;
    button.textContent = game.anchorConfig?.mirrorX !== false ? "Sidled: speglad" : "Sidled: normal";
  }

  function setupHitboxEditor() {
    if (!hitboxEditor) return;
    hitboxEditor.classList.toggle("is-visible", HITBOX_EDITOR_VISIBLE);
    if (!HITBOX_EDITOR_VISIBLE) return;

    if (hitboxEditor.dataset.bound !== "true") {
      hitboxEditor.dataset.bound = "true";
      hitboxEditor.innerHTML = `
        <h2>Datorträff</h2>
        <p>Justera två 3D-klossar så att de täcker datorn. Bara skott som går genom klossarna kostar liv.</p>
        <div id="hitboxEditorContent"></div>
        <div class="hitbox-actions">
          <button type="button" data-hitbox-action="mirrorX"></button>
          <button type="button" data-hitbox-action="reset">Återställ</button>
          <button type="button" data-hitbox-action="copy">Kopiera JSON</button>
        </div>
        <textarea id="hitboxExport" class="hitbox-export" readonly spellcheck="false"></textarea>
      `;
    }
    renderHitboxEditorControls();
    updateAnchorControls();
    if (hitboxEditor.dataset.listenersBound === "true") return;
    hitboxEditor.dataset.listenersBound = "true";
    hitboxEditor.addEventListener("input", (event) => {
      const input = event.target.closest("[data-hitbox-index]");
      if (!input) return;
      const index = Number(input.dataset.hitboxIndex);
      const field = input.dataset.hitboxField;
      game.hitboxConfigs[index][field] = Number(input.value);
      applyHitboxConfig(game.hitboxes[index].mesh, game.hitboxConfigs[index]);
      applyHitboxConfig(game.hitboxes[index].occluder, game.hitboxConfigs[index]);
      saveHitboxConfigs();
    });
    hitboxEditor.addEventListener("click", (event) => {
      const action = event.target.closest("[data-hitbox-action]")?.dataset.hitboxAction;
      if (action === "reset") {
        game.hitboxConfigs = defaultHitboxConfigs().map(normalizeHitboxConfig);
        for (let i = 0; i < game.hitboxes.length; i += 1) {
          game.hitboxes[i].config = game.hitboxConfigs[i];
          applyHitboxConfig(game.hitboxes[i].mesh, game.hitboxConfigs[i]);
          applyHitboxConfig(game.hitboxes[i].occluder, game.hitboxConfigs[i]);
        }
        saveHitboxConfigs();
        renderHitboxEditorControls();
      }
      if (action === "mirrorX") {
        if (game.calibration) return;
        game.anchorConfig = { ...(game.anchorConfig || defaultAnchorConfig()), mirrorX: game.anchorConfig?.mirrorX === false };
        saveAnchorConfig();
        applyAnchorConfig();
        setupPlaySpace();
        startLevel(game.level);
        updateAnchorControls();
      }
      if (action === "copy") {
        copyCalibrationExport();
      }
    });
  }

  function renderHitboxEditorControls() {
    const content = hitboxEditor?.querySelector("#hitboxEditorContent");
    if (!content) return;
    content.innerHTML = game.hitboxConfigs.map((config, index) => `
      <section>
        <h3>${config.name}</h3>
        <div class="hitbox-grid">
          ${HITBOX_FIELDS.map(([key, label, step]) => `
            <label>
              ${label}
              <input
                type="number"
                step="${step}"
                data-hitbox-index="${index}"
                data-hitbox-field="${key}"
                value="${round(config[key])}"
              />
            </label>
          `).join("")}
        </div>
      </section>
    `).join("");
    const exportField = hitboxEditor?.querySelector("#hitboxExport");
    if (exportField) exportField.value = calibrationExportText();
  }

  function calibrationExportText() {
    return JSON.stringify({
      calibration: loadCalibration(),
      hitboxes: game.hitboxConfigs,
      anchor: game.anchorConfig || defaultAnchorConfig(),
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  function copyCalibrationExport() {
    const exportField = hitboxEditor?.querySelector("#hitboxExport");
    if (!exportField) return;
    exportField.value = calibrationExportText();
    exportField.focus();
    exportField.select();
    const text = exportField.value;
    const copied = navigator.clipboard?.writeText(text);
    if (copied?.then) {
      copied.then(() => setGameMessage("JSON kopierad."))
        .catch(() => setGameMessage("JSON visas i rutan. Markera och kopiera därifrån."));
    } else {
      setGameMessage("JSON visas i rutan. Markera och kopiera därifrån.");
    }
  }

  function loadCalibration() {
    if (localStorage.getItem(CALIBRATION_DISABLED_STORAGE_KEY) === "true") return null;
    try {
      const parsed = JSON.parse(localStorage.getItem(CALIBRATION_STORAGE_KEY) || "null");
      if (!parsed?.points || typeof parsed.points !== "object") return cloneDefaultCalibration();
      const points = {};
      for (const point of CALIBRATION_POINTS) {
        const vector = vectorFromArray(parsed.points[point.id]);
        if (vector) points[point.id] = vectorToArray(vector);
      }
      const hasRequired = CALIBRATION_POINTS
        .filter((point) => point.required)
        .every((point) => Boolean(points[point.id]));
      return hasRequired ? { points, createdAt: parsed.createdAt || Date.now() } : cloneDefaultCalibration();
    } catch {
      return cloneDefaultCalibration();
    }
  }

  function cloneDefaultCalibration() {
    return {
      points: Object.fromEntries(
        Object.entries(SAVED_CALIBRATION_DEFAULT.points).map(([key, value]) => [key, [...value]]),
      ),
      createdAt: SAVED_CALIBRATION_DEFAULT.createdAt,
    };
  }

  function saveCalibration(calibration) {
    localStorage.removeItem(CALIBRATION_DISABLED_STORAGE_KEY);
    localStorage.setItem(CALIBRATION_STORAGE_KEY, JSON.stringify(calibration));
  }

  function clearCalibration() {
    localStorage.setItem(CALIBRATION_DISABLED_STORAGE_KEY, "true");
    localStorage.removeItem(CALIBRATION_STORAGE_KEY);
    game.calibration = null;
    clearCalibrationMarkers();
    if (scene && camera) setupGame();
  }

  function setupCalibrationPanel() {
    if (!calibrationPanel) return;
    calibrationPanel.classList.toggle("is-visible", CALIBRATION_VISIBLE);
    if (!CALIBRATION_VISIBLE) return;
    if (!game.calibrationSession) {
      game.calibrationSession = {
        activeIndex: 0,
        autoAdvance: loadCalibrationOptions().autoAdvance,
        observations: {},
        estimates: {},
        message: game.calibration
          ? "Kalibrering laddad. Du kan mäta om punkter eller rensa allt."
          : "Klicka aktuell punkt från minst två olika vinklar.",
      };
    }
    if (calibrationPanel.dataset.bound !== "true") {
      calibrationPanel.dataset.bound = "true";
      calibrationPanel.addEventListener("click", (event) => {
        const action = event.target.closest("[data-calibration-action]")?.dataset.calibrationAction;
        if (!action) return;
        handleCalibrationAction(action);
      });
    }
    hydrateCalibrationSessionFromSaved();
    renderCalibrationPanel();
    renderCalibrationMarkers();
  }

  function hydrateCalibrationSessionFromSaved() {
    if (!game.calibration?.points || game.calibrationSession.hydrated) return;
    for (const [id, value] of Object.entries(game.calibration.points)) {
      game.calibrationSession.estimates[id] = value;
    }
    game.calibrationSession.hydrated = true;
  }

  function handleCalibrationAction(action) {
    if (!game.calibrationSession) return;
    if (action.startsWith("point-")) {
      const index = Number(action.replace("point-", ""));
      if (Number.isFinite(index)) {
        game.calibrationSession.activeIndex = Math.min(CALIBRATION_POINTS.length - 1, Math.max(0, index));
      }
    }
    if (action === "prev") {
      game.calibrationSession.activeIndex = Math.max(0, game.calibrationSession.activeIndex - 1);
    }
    if (action === "next") {
      game.calibrationSession.activeIndex = Math.min(CALIBRATION_POINTS.length - 1, game.calibrationSession.activeIndex + 1);
    }
    if (action === "toggleMode") {
      setCalibrationInputMode(game.inputMode !== "calibration");
      return;
    }
    if (action === "toggleAutoAdvance") {
      game.calibrationSession.autoAdvance = !game.calibrationSession.autoAdvance;
      saveCalibrationOptions({ autoAdvance: game.calibrationSession.autoAdvance });
    }
    if (action === "openHitboxes") {
      const params = new URLSearchParams(window.location.search);
      params.set("calibrate", "1");
      params.set("hitboxes", "1");
      window.location.search = params.toString();
      return;
    }
    if (action === "undo") {
      const id = activeCalibrationPoint()?.id;
      const observations = game.calibrationSession.observations[id] || [];
      observations.pop();
      if (observations.length < 2) delete game.calibrationSession.estimates[id];
      else updateCalibrationEstimate(id);
    }
    if (action === "apply") {
      applyCalibrationSession();
      return;
    }
    if (action === "clear") {
      game.calibrationSession = null;
      clearCalibration();
      return;
    }
    renderCalibrationPanel();
    renderCalibrationMarkers();
  }

  function setCalibrationInputMode(enabled) {
    if (!CALIBRATION_VISIBLE) return;
    game.inputMode = enabled ? "calibration" : "game";
    overlayCanvas?.classList.toggle("is-calibration-pass-through", enabled);
    if (enabled) {
      pauseDefense("Kalibrering aktiv. Scenklick mäter punkter.");
    } else {
      setGameMessage("");
    }
    renderCalibrationPanel();
  }

  function activeCalibrationPoint() {
    return CALIBRATION_POINTS[game.calibrationSession?.activeIndex || 0];
  }

  function recordCalibrationClick(x, y) {
    if (!CALIBRATION_VISIBLE || game.inputMode !== "calibration") return false;
    if (!game.calibrationSession || !scene || !camera) return true;
    const point = activeCalibrationPoint();
    if (!point) return false;
    const observation = createCalibrationObservation(x, y);
    if (!observation) return true;
    const observations = game.calibrationSession.observations[point.id] || [];
    observations.push(observation);
    game.calibrationSession.observations[point.id] = observations.slice(-4);
    updateCalibrationEstimate(point.id);
    const count = game.calibrationSession.observations[point.id].length;
    game.calibrationSession.message = `${point.label}: ${count} klick sparade.`;
    if (game.calibrationSession.autoAdvance) {
      advanceCalibrationPoint();
    }
    renderCalibrationPanel();
    renderCalibrationMarkers();
    return true;
  }

  function advanceCalibrationPoint() {
    if (!game.calibrationSession) return;
    const current = game.calibrationSession.activeIndex;
    if (current >= CALIBRATION_POINTS.length - 1) {
      game.calibrationSession.activeIndex = 0;
      game.calibrationSession.message = "Runda klar. Rotera scenen lite och börja om med punkt 1.";
      return;
    }
    game.calibrationSession.activeIndex = current + 1;
  }

  function loadCalibrationOptions() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CALIBRATION_OPTIONS_STORAGE_KEY) || "null");
      return { autoAdvance: parsed?.autoAdvance !== false };
    } catch {
      return { autoAdvance: true };
    }
  }

  function saveCalibrationOptions(options) {
    localStorage.setItem(CALIBRATION_OPTIONS_STORAGE_KEY, JSON.stringify({
      autoAdvance: options.autoAdvance !== false,
    }));
  }

  function createCalibrationObservation(x, y) {
    const ray = scene.createPickingRay(x, y, BABYLON.Matrix.Identity(), camera);
    if (!ray?.origin || !ray?.direction) return null;
    const direction = ray.direction.normalize();
    return {
      origin: vectorToArray(ray.origin),
      direction: vectorToArray(direction),
      alpha: round(camera.alpha),
      beta: round(camera.beta),
      radius: round(camera.radius),
    };
  }

  function updateCalibrationEstimate(pointId) {
    const observations = game.calibrationSession.observations[pointId] || [];
    const estimate = estimatePointFromObservations(observations);
    if (!estimate) return;
    game.calibrationSession.estimates[pointId] = vectorToArray(estimate);
  }

  function estimatePointFromObservations(observations) {
    if (!observations || observations.length < 2) return null;
    const matrix = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    const vector = [0, 0, 0];
    for (const observation of observations) {
      const origin = vectorFromArray(observation.origin);
      const direction = vectorFromArray(observation.direction)?.normalize();
      if (!origin || !direction) continue;
      const d = [direction.x, direction.y, direction.z];
      const o = [origin.x, origin.y, origin.z];
      for (let row = 0; row < 3; row += 1) {
        for (let col = 0; col < 3; col += 1) {
          matrix[row][col] += (row === col ? 1 : 0) - d[row] * d[col];
        }
        vector[row] += matrixContribution(row, d, o);
      }
    }
    const solved = solve3x3(matrix, vector);
    return solved ? new BABYLON.Vector3(solved[0], solved[1], solved[2]) : null;
  }

  function matrixContribution(row, direction, origin) {
    const dot = direction[0] * origin[0] + direction[1] * origin[1] + direction[2] * origin[2];
    return origin[row] - direction[row] * dot;
  }

  function solve3x3(matrix, vector) {
    const a = matrix.map((row, index) => [...row, vector[index]]);
    for (let col = 0; col < 3; col += 1) {
      let pivot = col;
      for (let row = col + 1; row < 3; row += 1) {
        if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
      }
      if (Math.abs(a[pivot][col]) < 1e-6) return null;
      if (pivot !== col) [a[pivot], a[col]] = [a[col], a[pivot]];
      const divisor = a[col][col];
      for (let item = col; item < 4; item += 1) a[col][item] /= divisor;
      for (let row = 0; row < 3; row += 1) {
        if (row === col) continue;
        const factor = a[row][col];
        for (let item = col; item < 4; item += 1) a[row][item] -= factor * a[col][item];
      }
    }
    return [a[0][3], a[1][3], a[2][3]].every(Number.isFinite) ? [a[0][3], a[1][3], a[2][3]] : null;
  }

  function applyCalibrationSession() {
    const estimates = game.calibrationSession?.estimates || {};
    const hasRequired = CALIBRATION_POINTS
      .filter((point) => point.required)
      .every((point) => Boolean(estimates[point.id]));
    if (!hasRequired) {
      game.calibrationSession.message = "Minst de fyra skärmhörnen behöver två klick var.";
      renderCalibrationPanel();
      return;
    }
    const calibration = {
      points: { ...estimates },
      createdAt: Date.now(),
    };
    saveCalibration(calibration);
    localStorage.removeItem(HITBOX_STORAGE_KEY);
    game.calibrationSession.message = "Kalibrering sparad.";
    game.calibration = calibration;
    setupGame();
  }

  function clearCalibrationMarkers() {
    for (const marker of game.calibrationMarkers) {
      marker.mesh?.dispose?.();
      marker.material?.dispose?.();
    }
    game.calibrationMarkers = [];
  }

  function renderCalibrationMarkers() {
    if (!scene || !CALIBRATION_VISIBLE) return;
    clearCalibrationMarkers();
    const estimates = game.calibrationSession?.estimates || {};
    for (const [index, point] of CALIBRATION_POINTS.entries()) {
      const position = vectorFromArray(estimates[point.id]);
      if (!position) continue;
      const active = index === game.calibrationSession.activeIndex;
      const material = new BABYLON.StandardMaterial(`calibrationMarkerMaterial${point.id}`, scene);
      material.diffuseColor = active ? new BABYLON.Color3(0.25, 0.85, 1) : new BABYLON.Color3(0.85, 1, 0.25);
      material.emissiveColor = material.diffuseColor.scale(0.8);
      material.disableLighting = true;
      const mesh = BABYLON.MeshBuilder.CreateSphere(`calibrationMarker${point.id}`, {
        diameter: active ? 0.026 : 0.018,
        segments: 12,
      }, scene);
      mesh.position.copyFrom(position);
      mesh.material = material;
      mesh.renderingGroupId = 3;
      mesh.alwaysSelectAsActiveMesh = true;
      game.calibrationMarkers.push({ mesh, material });
    }
  }

  function renderCalibrationPanel() {
    if (!calibrationPanel || !game.calibrationSession) return;
    const active = activeCalibrationPoint();
    const estimates = game.calibrationSession.estimates;
    const requiredDone = CALIBRATION_POINTS
      .filter((point) => point.required)
      .filter((point) => Boolean(estimates[point.id])).length;
    const allDone = CALIBRATION_POINTS
      .filter((point) => Boolean(estimates[point.id])).length;
    calibrationPanel.innerHTML = `
      <h2>3D-kalibrering</h2>
      <p>Klicka punkt 1-8 i ordning. När punkt 8 är klar: rotera scenen lite och börja om på punkt 1.</p>
      <div class="calibration-active">
        <span>${active.required ? "Måste" : "Valfri"}</span>
        <strong>${active.label}</strong>
        <small>${observationCount(active.id)} klick</small>
      </div>
      <div class="calibration-progress">
        ${CALIBRATION_POINTS.map((point, index) => `
          <button
            type="button"
            class="${index === game.calibrationSession.activeIndex ? "is-active" : ""} ${estimates[point.id] ? "is-done" : ""}"
            data-calibration-action="point-${index}"
            aria-label="${point.label}"
          >${index + 1}</button>
        `).join("")}
      </div>
      <p class="calibration-message">${game.calibrationSession.message || ""}</p>
      <div class="calibration-actions">
        <button type="button" data-calibration-action="toggleMode">${game.inputMode === "calibration" ? "Gå till spel" : "Gå till kalibrering"}</button>
        <button type="button" data-calibration-action="toggleAutoAdvance">Auto nästa: ${game.calibrationSession.autoAdvance ? "på" : "av"}</button>
        <button type="button" data-calibration-action="prev">Föregående</button>
        <button type="button" data-calibration-action="next">Nästa</button>
        <button type="button" data-calibration-action="undo">Ångra klick</button>
        <button type="button" data-calibration-action="apply">Använd (${requiredDone}/4, ${allDone}/8)</button>
        <button type="button" data-calibration-action="openHitboxes">Visa gränser</button>
        <button type="button" data-calibration-action="clear">Rensa</button>
      </div>
    `;
  }

  function observationCount(pointId) {
    return game.calibrationSession?.observations[pointId]?.length || (game.calibrationSession?.estimates[pointId] ? 2 : 0);
  }

  function setupPlaySpace() {
    if (game.calibration && game.root) {
      const matrix = game.root.getWorldMatrix();
      const right = BABYLON.Vector3.TransformNormal(BABYLON.Axis.X, matrix).normalize();
      const up = BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, matrix).normalize();
      const forward = BABYLON.Vector3.TransformNormal(BABYLON.Axis.Z, matrix).normalize();
      const inverse = matrix.clone().invert();
      const cameraLocal = BABYLON.Vector3.TransformCoordinates(camera.position, inverse);
      const frontSign = Math.sign(cameraLocal.z - 0.006) || 1;
      const center = game.root.position
        .add(up.scale(-game.screenHeight * 0.14))
        .add(forward.scale(frontSign * game.screenWidth * 0.12));
      game.playSpace = { center, forward, right, up, frontSign };
      return;
    }
    const forward = camera.target.subtract(camera.position).normalize();
    const right = BABYLON.Vector3.Cross(camera.upVector, forward).normalize();
    const up = BABYLON.Vector3.Cross(forward, right).normalize();
    const center = camera.target.add(up.scale(0.06)).add(forward.scale(0.08));
    const mirrorX = game.anchorConfig?.mirrorX !== false;
    game.playSpace = { center, forward, right: mirrorX ? right.scale(-1) : right, up, frontSign: 1 };
  }

  function startLevel(level) {
    if (!game.playSpace) return;
    game.level = Math.max(1, level);
    game.waveId += 1;
    game.shots = [];
    stopBuzzLoop();
    if (game.running) {
      game.deadlineAt = performance.now() + LEVEL_CONFIG.levelDuration;
    }
    spawnTargets();
    if (game.running) startBuzzLoop();
    updateHud();
  }

  function levelTargetCount(level) {
    return LEVEL_CONFIG.firstTargetCount + (level - 1) * LEVEL_CONFIG.targetIncrease;
  }

  function levelSpeed(level) {
    return Math.min(2.05, 0.82 + (level - 1) * 0.1);
  }

  function spawnTargets() {
    if (!game.playSpace) return;
    for (const target of game.targets) disposeTargetMesh(target);
    game.targets = [];
    const targetCount = levelTargetCount(game.level);
    for (let index = 0; index < targetCount; index += 1) {
      const text = TARGET_WORDS[(index + (game.level - 1) * 5) % TARGET_WORDS.length];
      const base = game.playSpace.center.clone();
      game.targets.push(createTarget(index, targetCount, text, base, game.level));
    }
  }

  function createTarget(index, targetCount, text, base, level) {
    const seed = index + level * 31.7 + performance.now() * 0.001;
    const speed = levelSpeed(level);
    const startOffset = targetStartOffset(index, targetCount, seed);
    const homeOffset = targetHomeOffset(startOffset, seed);
    const flight = targetFlightConfig(index, targetCount, seed, speed);
    const target = {
      id: `target-${level}-${index}-${performance.now()}`,
      level,
      waveId: game.waveId,
      index,
      side: startOffset.side,
      text,
      base,
      position: base.clone(),
      phase: index * 1.137 + level * 0.53,
      speedX: (0.54 + pseudoRandom(seed + 1) * 0.34) * speed,
      speedY: (0.48 + pseudoRandom(seed + 3) * 0.32) * speed,
      speedZ: (0.22 + pseudoRandom(seed + 8) * 0.2) * speed,
      offsetX: homeOffset.x,
      offsetY: homeOffset.y,
      offsetZ: homeOffset.z,
      radiusX: 0.16 + pseudoRandom(seed + 23) * 0.18 + Math.min(0.07, level * 0.006),
      radiusY: 0.1 + pseudoRandom(seed + 29) * 0.14 + Math.min(0.055, level * 0.004),
      radiusZ: 0.05 + pseudoRandom(seed + 31) * 0.08,
      startOffsetX: startOffset.x,
      startOffsetY: startOffset.y,
      startOffsetZ: startOffset.z,
      startScreenX: flight.homeX,
      startScreenY: flight.homeY,
      startDepth: flight.depthHome,
      screenHomeX: flight.homeX,
      screenHomeY: flight.homeY,
      screenRadiusX: flight.radiusX,
      screenRadiusY: flight.radiusY,
      screenWobbleX: flight.wobbleX,
      screenWobbleY: flight.wobbleY,
      screenSpeedX: flight.speedX,
      screenSpeedY: flight.speedY,
      screenSpeedMix: flight.speedMix,
      depthHome: flight.depthHome,
      depthRadius: flight.depthRadius,
      depthWobble: flight.depthWobble,
      flightPhaseA: flight.phaseA,
      flightPhaseB: flight.phaseB,
      flightPhaseC: flight.phaseC,
      buzzSrc: SOUND_FILES.buzz[(index + level - 1) % SOUND_FILES.buzz.length],
      buzzRate: 0.92 + pseudoRandom(seed + 59) * 0.2,
      spawnedAt: performance.now(),
      alive: true,
      hitAt: 0,
      screen: null,
      offscreenSince: 0,
      mesh: null,
      previousPosition: null,
    };
    target.position.copyFrom(targetWorldFromScreen(target.startScreenX, target.startScreenY, target.startDepth));
    target.previousPosition = target.position.clone();
    target.mesh = createTargetMesh(target);
    updateTargetMesh(target);
    return target;
  }

  function createTargetMesh(target) {
    const mesh = createLabelMesh(`targetLabel${target.id}`, target.text, TARGET_LABEL_WIDTH, "#0a0c09", "#e7ff62");
    mesh.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    mesh.position.copyFrom(target.position);
    mesh.renderingGroupId = 1;
    mesh.isPickable = true;
    mesh.metadata = { targetId: target.id };
    return mesh;
  }

  function disposeTargetMesh(target) {
    if (!target?.mesh) return;
    target.mesh.material?.diffuseTexture?.dispose?.();
    target.mesh.material?.dispose?.();
    target.mesh.dispose?.();
    target.mesh = null;
  }

  function updateTargetMesh(target) {
    if (!target.mesh) return;
    target.mesh.position.copyFrom(target.position);
    const screenDepth = targetScreenDepthState(target);
    target.mesh.isVisible = Boolean(target.alive && !TARGET_RENDER_OVERLAY);
    target.mesh.renderingGroupId = 1;
    target.mesh.alphaIndex = 20;
    target.mesh.metadata = {
      ...(target.mesh.metadata || {}),
      screenDepth: screenDepth.state,
      screenSignedDistance: screenDepth.signedDistance,
    };
    const pulse = 1 + Math.sin(performance.now() * 0.004 + target.phase) * 0.035;
    const distance = camera ? BABYLON.Vector3.Distance(camera.position, target.position) : fallbackShotDistance();
    const depthScale = clamp(distance / Math.max(0.001, fallbackShotDistance()), 0.72, 1.32);
    const readableScale = pulse * (0.76 + depthScale * 0.34);
    target.mesh.scaling.set(readableScale, -readableScale, readableScale);
  }

  function targetScreenDepthState(target) {
    if (!target?.position || !game.root || !camera) {
      return { state: "front", signedDistance: 0 };
    }
    const projected = projectWorld(target.position);
    const ray = scene.createPickingRay(projected.x, projected.y, BABYLON.Matrix.Identity(), camera);
    const screenDistance = screenPlaneRayDistance(ray);
    if (!screenDistance) return { state: "front", signedDistance: 0 };
    const targetDistance = BABYLON.Vector3.Distance(ray.origin, target.position);
    const signedDistance = screenDistance - targetDistance;
    return {
      state: signedDistance >= -TARGET_SCREEN_LAYER_CLEARANCE ? "front" : "behind",
      signedDistance,
    };
  }

  function targetStartOffset(index, targetCount, seed) {
    const slot = targetSideSlot(index, targetCount, seed);
    const range = TARGET_SIDE_RANGES[slot.side] || TARGET_SIDE_RANGES.left;
    const rowT = slot.count <= 1
      ? 0.5
      : clamp((slot.index + (pseudoRandom(seed + 39) - 0.5) * 0.34) / Math.max(1, slot.count - 1), 0, 1);
    const xT = clamp(0.5 + (pseudoRandom(seed + 41) - 0.5) * 0.92, 0, 1);
    const y = TARGET_Y_MIN + rowT * (TARGET_Y_MAX - TARGET_Y_MIN);
    return {
      side: slot.side,
      x: range.xMin + xT * (range.xMax - range.xMin),
      y: y + (pseudoRandom(seed + 43) - 0.5) * 0.035,
      z: targetDepthOffset(seed + 49, slot.side),
      screenX: range.screenXMin + xT * (range.screenXMax - range.screenXMin),
      screenY: TARGET_SCREEN_Y_MIN + rowT * (TARGET_SCREEN_Y_MAX - TARGET_SCREEN_Y_MIN) + (pseudoRandom(seed + 47) - 0.5) * 0.03,
      depth: clamp(0.28 + pseudoRandom(seed + 51) * 0.64, 0, 1),
    };
  }

  function targetFlightConfig(index, targetCount, seed, speed) {
    const anchor = targetFlightAnchor(index, targetCount, seed);
    return {
      homeX: anchor.x,
      homeY: anchor.y,
      radiusX: 0.18 + pseudoRandom(seed + 101) * 0.19,
      radiusY: 0.13 + pseudoRandom(seed + 103) * 0.17,
      wobbleX: 0.05 + pseudoRandom(seed + 107) * 0.09,
      wobbleY: 0.04 + pseudoRandom(seed + 109) * 0.08,
      speedX: (0.24 + pseudoRandom(seed + 113) * 0.34) * speed,
      speedY: (0.22 + pseudoRandom(seed + 127) * 0.32) * speed,
      speedMix: (0.13 + pseudoRandom(seed + 131) * 0.2) * speed,
      depthHome: 0.34 + pseudoRandom(seed + 137) * 0.42,
      depthRadius: 0.24 + pseudoRandom(seed + 139) * 0.22,
      depthWobble: 0.08 + pseudoRandom(seed + 149) * 0.12,
      phaseA: pseudoRandom(seed + 151) * Math.PI * 2,
      phaseB: pseudoRandom(seed + 157) * Math.PI * 2,
      phaseC: pseudoRandom(seed + 163) * Math.PI * 2,
    };
  }

  function targetFlightAnchor(index, targetCount, seed) {
    const columns = Math.max(2, Math.ceil(Math.sqrt(targetCount * 1.35)));
    const rows = Math.max(2, Math.ceil(targetCount / columns));
    const column = (index * 2 + Math.floor(index / Math.max(1, rows))) % columns;
    const row = Math.floor(index / columns) % rows;
    const jitterX = (pseudoRandom(seed + 167) - 0.5) * 0.52;
    const jitterY = (pseudoRandom(seed + 173) - 0.5) * 0.52;
    const xT = clamp((column + 0.5 + jitterX) / columns, 0, 1);
    const yT = clamp((row + 0.5 + jitterY) / rows, 0, 1);
    return {
      x: TARGET_FLIGHT_X_MIN + xT * (TARGET_FLIGHT_X_MAX - TARGET_FLIGHT_X_MIN),
      y: TARGET_FLIGHT_Y_MIN + yT * (TARGET_FLIGHT_Y_MAX - TARGET_FLIGHT_Y_MIN),
    };
  }

  function targetSideSlot(index, targetCount, seed) {
    const centerCount = Math.min(targetCount, Math.max(1, Math.round(targetCount * TARGET_CENTER_FRACTION)));
    const remaining = Math.max(0, targetCount - centerCount);
    const leftCount = Math.ceil(remaining * 0.52);
    const rightCount = remaining - leftCount;
    if (index < centerCount) return { side: "center", index, count: centerCount };
    const restIndex = index - centerCount;
    if (restIndex < leftCount) return { side: "left", index: restIndex, count: leftCount };
    const rightIndex = Math.max(0, restIndex - leftCount);
    if (rightCount > 0) return { side: "right", index: rightIndex, count: rightCount };
    return pseudoRandom(seed + 91) > 0.5
      ? { side: "left", index: 0, count: 1 }
      : { side: "right", index: 0, count: 1 };
  }

  function targetHomeOffset(startOffset, seed) {
    const range = TARGET_SIDE_RANGES[startOffset.side] || TARGET_SIDE_RANGES.left;
    const looseX = startOffset.x * 0.58 + (pseudoRandom(seed + 61) - 0.5) * 0.2;
    const frontSign = game.playSpace?.frontSign || 1;
    const keepBehind = startOffset.z * frontSign < 0 && pseudoRandom(seed + 73) < 0.35;
    return {
      x: clamp(looseX, range.xMin - 0.1, range.xMax + 0.1),
      y: clamp(startOffset.y * 0.48 - 0.1 + (pseudoRandom(seed + 67) - 0.5) * 0.16, TARGET_Y_MIN - 0.04, TARGET_Y_MAX + 0.04),
      z: targetDepthOffset(seed + 71, startOffset.side, keepBehind),
    };
  }

  function targetDepthOffset(seed, side = "left", forceBehind = false) {
    const frontSign = game.playSpace?.frontSign || 1;
    const behindChance = side === "center" ? 0.015 : 0.035;
    const behind = forceBehind || pseudoRandom(seed + 53) < behindChance;
    const direction = behind ? -frontSign : frontSign;
    const depth = behind
      ? 0.1 + pseudoRandom(seed + 57) * 0.2
      : 0.16 + pseudoRandom(seed + 57) * 0.32;
    return direction * depth;
  }

  function updateTargets() {
    if (!game.playSpace) return;
    if (!game.running) return;
    const now = performance.now();
    for (const target of game.targets) {
      if (target.level !== game.level || target.waveId !== game.waveId) continue;
      if (!target.alive && now - target.hitAt > LEVEL_CONFIG.respawnDelay) {
        respawnTarget(target);
      }
      if (!target.alive) continue;
      target.previousPosition = target.position.clone();
      target.position.copyFrom(computeTargetWorldPosition(target, now));
      updateTargetMesh(target);
    }
  }

  function computeTargetWorldPosition(target, now = performance.now()) {
    if (!game.playSpace || !target?.base) return target?.position?.clone?.() || BABYLON.Vector3.Zero();
    const time = now / 1000;
    const screen = targetScreenFlightPosition(target, time);
    const intro = Math.min(1, (now - target.spawnedAt) / LEVEL_CONFIG.introDuration);
    const ease = intro * intro * (3 - 2 * intro);
    const x = target.startScreenX * (1 - ease) + screen.x * ease;
    const y = target.startScreenY * (1 - ease) + screen.y * ease;
    const depth = target.startDepth * (1 - ease) + screen.depth * ease;
    const position = targetWorldFromScreen(x, y, depth);
    return constrainedTargetPosition(target, position);
  }

  function targetScreenFlightPosition(target, time) {
    const x = target.screenHomeX
      + Math.sin(time * target.screenSpeedX + target.flightPhaseA) * target.screenRadiusX
      + Math.sin(time * target.screenSpeedMix + target.flightPhaseB * 1.7) * target.screenWobbleX
      + Math.cos(time * target.screenSpeedY * 0.43 + target.flightPhaseC) * 0.035;
    const y = target.screenHomeY
      + Math.cos(time * target.screenSpeedY + target.flightPhaseB) * target.screenRadiusY
      + Math.sin(time * target.screenSpeedMix * 1.31 + target.flightPhaseA * 0.7) * target.screenWobbleY
      + Math.cos(time * target.screenSpeedX * 0.37 + target.flightPhaseC * 1.3) * 0.028;
    const depth = target.depthHome
      + Math.sin(time * target.speedZ * 0.72 + target.flightPhaseC) * target.depthRadius
      + Math.cos(time * target.screenSpeedMix * 0.58 + target.flightPhaseA) * target.depthWobble;
    return {
      x: clamp(x, TARGET_FLIGHT_X_MIN, TARGET_FLIGHT_X_MAX),
      y: clamp(y, TARGET_FLIGHT_Y_MIN, TARGET_FLIGHT_Y_MAX),
      depth: clamp(depth, 0, 1),
    };
  }

  function targetWorldFromScreen(xRatio, yRatio, depthRatio) {
    if (!scene || !camera) return game.playSpace?.center?.clone?.() || BABYLON.Vector3.Zero();
    const width = Math.max(1, overlayCanvas?.clientWidth || canvas.clientWidth);
    const height = Math.max(1, overlayCanvas?.clientHeight || canvas.clientHeight);
    const x = clamp(xRatio, 0, 1) * width;
    const y = clamp(yRatio, 0, 1) * height;
    const ray = scene.createPickingRay(x, y, BABYLON.Matrix.Identity(), camera);
    const reference = fallbackShotDistance();
    const screenDistance = screenPlaneRayDistance(ray) || reference;
    const frontRange = Math.max(0.22, reference * TARGET_FLIGHT_FRONT_DEPTH);
    const backRange = Math.max(0.32, reference * TARGET_FLIGHT_BACK_DEPTH);
    const near = Math.max(0.18, screenDistance - frontRange);
    const far = Math.max(near + 0.45, screenDistance + backRange);
    const depth = near + smoothStep(depthRatio) * (far - near);
    return ray.origin.add(ray.direction.scale(depth));
  }

  function screenPlaneRayDistance(ray) {
    if (!ray || !game.root) return null;
    game.root.computeWorldMatrix(true);
    const inverse = game.root.getWorldMatrix().clone().invert();
    const origin = BABYLON.Vector3.TransformCoordinates(ray.origin, inverse);
    const direction = BABYLON.Vector3.TransformNormal(ray.direction, inverse);
    if (Math.abs(direction.z) < 0.000001) return null;
    const screenZ = game.crackPlane?.position?.z ?? 0.012;
    const localDistance = (screenZ - origin.z) / direction.z;
    if (localDistance <= 0 || !Number.isFinite(localDistance)) return null;
    const localPoint = origin.add(direction.scale(localDistance));
    const worldPoint = BABYLON.Vector3.TransformCoordinates(localPoint, game.root.getWorldMatrix());
    return BABYLON.Vector3.Distance(ray.origin, worldPoint);
  }

  function constrainedTargetPosition(target, position) {
    const desired = position.clone();
    const probe = {
      phase: target?.phase || 0,
      position: position.clone(),
    };
    applyComputerRepulsion(probe);
    applyScreenVisibilityReturn(probe);
    return smoothTargetCorrection(target, desired, probe.position);
  }

  function horizontalCameraAxis() {
    const forward = camera.target.subtract(camera.position).normalize();
    return BABYLON.Vector3.Cross(camera.upVector, forward).normalize();
  }

  function moveTargetTowardScreenCoordinate(probe, axisName, desired, screenSize, axis) {
    if (!axis || axis.lengthSquared() < 0.000001) return;
    const projected = projectWorld(probe.position);
    const delta = desired - projected[axisName];
    if (Math.abs(delta) < 1) return;
    const sample = projectWorld(probe.position.add(axis.scale(0.02)));
    const sampleDelta = sample[axisName] - projected[axisName];
    if (Math.abs(sampleDelta) < 0.001) return;
    const direction = sampleDelta * delta >= 0 ? axis : axis.scale(-1);
    const amount = clamp((Math.abs(delta) / screenSize) * camera.radius * 0.62, 0, 0.14);
    probe.position.addInPlace(direction.scale(amount));
  }

  function applyComputerRepulsion(target) {
    if (!target?.position || !game.hitboxes.length) return;
    for (const item of game.hitboxes) {
      const mesh = item.mesh;
      if (!mesh) continue;
      mesh.computeWorldMatrix(true);
      const worldMatrix = mesh.getWorldMatrix();
      const inverse = worldMatrix.clone().invert();
      const local = BABYLON.Vector3.TransformCoordinates(target.position, inverse);
      const bounds = expandedHitboxBounds(mesh);
      const nearest = new BABYLON.Vector3(
        clamp(local.x, -bounds.x, bounds.x),
        clamp(local.y, -bounds.y, bounds.y),
        clamp(local.z, -bounds.z, bounds.z),
      );
      let away = local.subtract(nearest);
      let distance = away.length();
      if (distance < 0.0001) {
        const escapes = [
          { axis: "x", value: bounds.x - Math.abs(local.x), sign: Math.sign(local.x || 1) },
          { axis: "y", value: bounds.y - Math.abs(local.y), sign: Math.sign(local.y || 1) },
          { axis: "z", value: bounds.z - Math.abs(local.z), sign: Math.sign(local.z || 1) },
        ].sort((a, b) => a.value - b.value);
        away = new BABYLON.Vector3(0, 0, 0);
        away[escapes[0].axis] = escapes[0].sign;
        distance = 0;
      } else {
        away.normalize();
      }
      const range = TARGET_LABEL_WIDTH * 1.3;
      if (distance >= range) continue;
      const strength = smoothStep(1 - distance / range);
      local.addInPlace(away.scale((range - distance) * strength * 0.42));
      target.position.copyFrom(BABYLON.Vector3.TransformCoordinates(local, worldMatrix));
    }
  }

  function applyScreenVisibilityReturn(target) {
    if (!target?.position || !camera) return;
    const width = Math.max(1, overlayCanvas?.clientWidth || canvas.clientWidth);
    const height = Math.max(1, overlayCanvas?.clientHeight || canvas.clientHeight);
    let projected = projectWorld(target.position);
    if (projected.z < 0 || projected.z > 1.35) {
      const forward = camera.target.subtract(camera.position).normalize();
      const viewDepth = BABYLON.Vector3.Dot(target.position.subtract(camera.position), forward);
      const targetDepth = clamp(viewDepth, Math.max(0.4, camera.radius * 0.42), Math.max(0.9, camera.radius * 1.7));
      target.position.addInPlace(forward.scale((targetDepth - viewDepth) * 0.08));
      projected = projectWorld(target.position);
    }

    const minX = width * TARGET_SCREEN_RETURN_X_MIN;
    const maxX = width * TARGET_SCREEN_RETURN_X_MAX;
    const minY = height * TARGET_SCREEN_RETURN_Y_MIN;
    const maxY = height * TARGET_SCREEN_RETURN_Y_MAX;
    if (projected.x < minX) {
      moveTargetTowardScreenCoordinate(target, "x", minX, width, horizontalCameraAxis());
    } else if (projected.x > maxX) {
      moveTargetTowardScreenCoordinate(target, "x", maxX, width, horizontalCameraAxis());
    }
    if (projected.y < minY) {
      moveTargetTowardScreenCoordinate(target, "y", minY, height, camera.upVector.clone().normalize());
    } else if (projected.y > maxY) {
      moveTargetTowardScreenCoordinate(target, "y", maxY, height, camera.upVector.clone().normalize());
    }
  }

  function smoothTargetCorrection(target, desired, corrected) {
    if (!target?.previousPosition) return corrected;
    const desiredStep = BABYLON.Vector3.Distance(target.previousPosition, desired);
    const correctedStep = BABYLON.Vector3.Distance(target.previousPosition, corrected);
    const maxStep = Math.max(0.06, desiredStep + 0.07);
    if (correctedStep <= maxStep) return corrected;
    return BABYLON.Vector3.Lerp(target.previousPosition, corrected, maxStep / correctedStep);
  }

  function playOffsetFromWorld(target, position) {
    const delta = position.subtract(target.base);
    return {
      x: BABYLON.Vector3.Dot(delta, game.playSpace.right),
      y: BABYLON.Vector3.Dot(delta, game.playSpace.up),
      z: BABYLON.Vector3.Dot(delta, game.playSpace.forward),
    };
  }

  function keepTargetWithinCameraDepth(target) {
    if (!target?.position || !camera) return;
    const forward = camera.target.subtract(camera.position).normalize();
    const viewDepth = BABYLON.Vector3.Dot(target.position.subtract(camera.position), forward);
    const minDepth = Math.max(0.48, camera.radius * 0.48);
    const maxDepth = Math.max(minDepth + 0.4, camera.radius * 1.85);
    if (viewDepth < minDepth) {
      target.position.addInPlace(forward.scale(minDepth - viewDepth));
    } else if (viewDepth > maxDepth) {
      target.position.addInPlace(forward.scale(maxDepth - viewDepth));
    }
  }

  function keepTargetAboveKeyboardPlane(target) {
    if (!target?.position || !camera) return;
    const keyboard = keyboardHitbox();
    const mesh = keyboard?.mesh;
    if (!mesh) return;
    mesh.computeWorldMatrix(true);
    const inverse = mesh.getWorldMatrix().clone().invert();
    const local = BABYLON.Vector3.TransformCoordinates(target.position, inverse);
    const playCenterLocal = BABYLON.Vector3.TransformCoordinates(game.playSpace?.center || camera.position, inverse);
    const aboveSign = Math.sign(playCenterLocal.z || 1);
    const surfaceClearance = TARGET_LABEL_HEIGHT * 0.18;
    const minimum = 0.5 + surfaceClearance / Math.max(0.001, Math.abs(mesh.scaling.z));
    if (local.z * aboveSign >= minimum) return;
    local.z = minimum * aboveSign;
    target.position.copyFrom(BABYLON.Vector3.TransformCoordinates(local, mesh.getWorldMatrix()));
  }

  function keyboardHitbox() {
    return game.hitboxes.find((item) => item.config?.name?.toLowerCase?.().includes("tangent"))
      || game.hitboxes[1]
      || null;
  }

  function keepTargetOutsideComputer(target) {
    if (!target?.position || !game.hitboxes.length) return;
    for (const item of game.hitboxes) {
      const mesh = item.mesh;
      if (!mesh) continue;
      mesh.computeWorldMatrix(true);
      const inverse = mesh.getWorldMatrix().clone().invert();
      const local = BABYLON.Vector3.TransformCoordinates(target.position, inverse);
      const bounds = expandedHitboxBounds(mesh);
      const inside = Math.abs(local.x) < bounds.x && Math.abs(local.y) < bounds.y && Math.abs(local.z) < bounds.z;
      if (!inside) continue;
      const distances = [
        { axis: "x", value: bounds.x - Math.abs(local.x), sign: Math.sign(local.x || 1) },
        { axis: "y", value: bounds.y - Math.abs(local.y), sign: Math.sign(local.y || 1) },
        { axis: "z", value: bounds.z - Math.abs(local.z), sign: Math.sign(local.z || 1) },
      ].sort((a, b) => a.value - b.value);
      const escape = distances[0];
      local[escape.axis] += escape.value * escape.sign;
      target.position.copyFrom(BABYLON.Vector3.TransformCoordinates(local, mesh.getWorldMatrix()));
    }
  }

  function keepTargetOutsideScreenMargin(target) {
    if (!target?.position || !game.root) return;
    game.root.computeWorldMatrix(true);
    const worldMatrix = game.root.getWorldMatrix();
    const inverse = worldMatrix.clone().invert();
    const local = BABYLON.Vector3.TransformCoordinates(target.position, inverse);
    const screenZ = 0.006;
    const dz = local.z - screenZ;
    const depthClearance = TARGET_LABEL_WIDTH * 1.08;
    const depthApproachBand = TARGET_LABEL_WIDTH * 0.82;
    if (Math.abs(dz) > depthClearance + depthApproachBand) return;

    const halfWidth = game.screenWidth * 0.5;
    const halfHeight = game.screenHeight * 0.5;
    const hardX = halfWidth + TARGET_SCREEN_CLEARANCE;
    const hardY = halfHeight + TARGET_SCREEN_CLEARANCE;
    const softX = hardX + TARGET_SCREEN_APPROACH_BAND;
    const softY = hardY + TARGET_SCREEN_APPROACH_BAND;
    const absX = Math.abs(local.x);
    const absY = Math.abs(local.y);

    if (absX < hardX && absY < hardY) {
      const edge = pointOnRectEdge(local.x, local.y, hardX, hardY, target.phase || 0);
      local.x = edge.x;
      local.y = edge.y;
      target.position.copyFrom(BABYLON.Vector3.TransformCoordinates(local, worldMatrix));
      return;
    }

    if (absX >= softX || absY >= softY) return;
    const clampedX = Math.max(-hardX, Math.min(hardX, local.x));
    const clampedY = Math.max(-hardY, Math.min(hardY, local.y));
    const dx = local.x - clampedX;
    const dy = local.y - clampedY;
    const distance = Math.hypot(dx, dy);
    if (distance <= 0 || distance >= TARGET_SCREEN_APPROACH_BAND) return;

    const strength = smoothStep(1 - distance / TARGET_SCREEN_APPROACH_BAND) * 0.42;
    const push = (TARGET_SCREEN_APPROACH_BAND - distance) * strength;
    local.x += (dx / distance) * push;
    local.y += (dy / distance) * push;
    if (Math.abs(dz) < depthClearance * 0.7) {
      local.z = screenZ + Math.sign(dz || 1) * depthClearance * 0.7;
    }
    target.position.copyFrom(BABYLON.Vector3.TransformCoordinates(local, worldMatrix));
  }

  function pointOnRectEdge(x, y, halfWidth, halfHeight, phase = 0) {
    let dx = x / Math.max(0.001, halfWidth);
    let dy = y / Math.max(0.001, halfHeight);
    const length = Math.hypot(dx, dy);
    if (length < 0.001) {
      dx = Math.cos(phase || 0);
      dy = Math.sin(phase || 0);
    } else {
      dx /= length;
      dy /= length;
    }
    const scaleX = Math.abs(dx) > 0.001 ? halfWidth / Math.abs(dx) : Number.POSITIVE_INFINITY;
    const scaleY = Math.abs(dy) > 0.001 ? halfHeight / Math.abs(dy) : Number.POSITIVE_INFINITY;
    const scale = Math.min(scaleX, scaleY);
    return { x: dx * scale, y: dy * scale };
  }

  function smoothStep(value) {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  }

  function expandedHitboxBounds(mesh) {
    return {
      x: 0.5 + TARGET_COMPUTER_CLEARANCE / Math.max(0.001, Math.abs(mesh.scaling.x)),
      y: 0.5 + TARGET_COMPUTER_CLEARANCE / Math.max(0.001, Math.abs(mesh.scaling.y)),
      z: 0.5 + TARGET_COMPUTER_CLEARANCE / Math.max(0.001, Math.abs(mesh.scaling.z)),
    };
  }

  function respawnTarget(target) {
    const wordIndex = Math.floor(pseudoRandom(performance.now() + target.phase) * TARGET_WORDS.length);
    target.text = TARGET_WORDS[wordIndex];
    disposeTargetMesh(target);
    target.alive = true;
    target.hitAt = 0;
    target.phase += 2.4 + pseudoRandom(performance.now()) * 4.8;
    const speed = levelSpeed(game.level);
    target.speedX = (0.54 + pseudoRandom(performance.now() + 1) * 0.34) * speed;
    target.speedY = (0.48 + pseudoRandom(performance.now() + 2) * 0.32) * speed;
    target.speedZ = (0.22 + pseudoRandom(performance.now() + 3) * 0.2) * speed;
    target.radiusX = 0.16 + pseudoRandom(performance.now() + 4) * 0.18 + Math.min(0.07, game.level * 0.006);
    target.radiusY = 0.1 + pseudoRandom(performance.now() + 5) * 0.14 + Math.min(0.055, game.level * 0.004);
    target.radiusZ = 0.05 + pseudoRandom(performance.now() + 6) * 0.08;
    const startOffset = targetStartOffset(target.index || 0, levelTargetCount(game.level), performance.now() + 9);
    const flight = targetFlightConfig(target.index || 0, levelTargetCount(game.level), performance.now() + 11, speed);
    target.side = startOffset.side;
    target.startOffsetX = startOffset.x;
    target.startOffsetY = startOffset.y;
    target.startOffsetZ = startOffset.z;
    const homeOffset = targetHomeOffset(startOffset, performance.now() + 15);
    target.offsetX = homeOffset.x;
    target.offsetY = homeOffset.y;
    target.offsetZ = homeOffset.z;
    target.startScreenX = flight.homeX;
    target.startScreenY = flight.homeY;
    target.startDepth = flight.depthHome;
    target.screenHomeX = flight.homeX;
    target.screenHomeY = flight.homeY;
    target.screenRadiusX = flight.radiusX;
    target.screenRadiusY = flight.radiusY;
    target.screenWobbleX = flight.wobbleX;
    target.screenWobbleY = flight.wobbleY;
    target.screenSpeedX = flight.speedX;
    target.screenSpeedY = flight.speedY;
    target.screenSpeedMix = flight.speedMix;
    target.depthHome = flight.depthHome;
    target.depthRadius = flight.depthRadius;
    target.depthWobble = flight.depthWobble;
    target.flightPhaseA = flight.phaseA;
    target.flightPhaseB = flight.phaseB;
    target.flightPhaseC = flight.phaseC;
    const buzzIndex = Math.floor(pseudoRandom(performance.now() + 13) * SOUND_FILES.buzz.length);
    target.buzzSrc = SOUND_FILES.buzz[buzzIndex];
    target.buzzRate = 0.92 + pseudoRandom(performance.now() + 14) * 0.2;
    target.spawnedAt = performance.now();
    target.offscreenSince = 0;
    target.mesh = createTargetMesh(target);
    target.previousPosition = target.position.clone();
    updateTargetMesh(target);
    if (game.running) startTargetBuzz(target);
  }

  function launchHit() {
    if (!game.root && scene && camera) setupGame();
    shootAt(game.aim.x || (overlayCanvas?.clientWidth || 1) / 2, game.aim.y || (overlayCanvas?.clientHeight || 1) / 2);
  }

  function shootAt(x, y) {
    if (!game.playSpace && scene && camera) setupGame();
    if (!camera || !game.playSpace) return;
    if (game.gameOver) return;
    if (!game.running) startDefense();
    playEffect("shoot");
    const shot = createShot(x, y);
    if (!shot) return;
    if (game.shots.length > 10) game.shots.splice(0, game.shots.length - 10);
    game.shots.push({
      ...shot,
      level: game.level,
      waveId: game.waveId,
      born: shot.born || performance.now(),
      duration: shot.duration || SHOT_DURATION,
      lastT: 0,
    });
  }

  function setDefenseDebug(event, payload = {}) {
    let element = document.querySelector("#defenseDebugState");
    if (!element) {
      element = document.createElement("script");
      element.type = "application/json";
      element.id = "defenseDebugState";
      document.body.appendChild(element);
    }
    element.textContent = JSON.stringify({
      event,
      at: Math.round(performance.now()),
      payload,
    });
  }

  function debugVector(vector) {
    if (!vector) return null;
    return {
      x: Number(vector.x.toFixed(4)),
      y: Number(vector.y.toFixed(4)),
      z: Number(vector.z.toFixed(4)),
    };
  }

  function debugProjected(point) {
    if (!point) return null;
    const projected = projectWorld(point);
    return {
      x: Number(projected.x.toFixed(1)),
      y: Number(projected.y.toFixed(1)),
      z: Number(projected.z.toFixed(4)),
    };
  }

  function debugHit(hit) {
    if (!hit) return null;
    return {
      type: hit.type || null,
      distance: Number((hit.distance || 0).toFixed(4)),
      target: hit.target?.text || null,
      hitbox: hit.hitbox?.config?.name || null,
      point: debugVector(hit.point),
      projected: debugProjected(hit.point),
      screenLocal: hit.screenLocal
        ? { x: Number(hit.screenLocal.x.toFixed(4)), y: Number(hit.screenLocal.y.toFixed(4)) }
        : null,
    };
  }

  function debugScreenProbe(ray) {
    if (!ray || !game.root) return null;
    game.root.computeWorldMatrix(true);
    const worldMatrix = game.root.getWorldMatrix();
    const inverse = worldMatrix.clone().invert();
    const origin = BABYLON.Vector3.TransformCoordinates(ray.origin, inverse);
    const direction = BABYLON.Vector3.TransformNormal(ray.direction, inverse);
    if (Math.abs(direction.z) < 0.000001) {
      return { parallel: true };
    }
    const t = (0.006 - origin.z) / direction.z;
    if (t < 0) {
      return { behind: true, t: Number(t.toFixed(4)) };
    }
    const local = origin.add(direction.scale(t));
    return {
      x: Number(local.x.toFixed(4)),
      y: Number(local.y.toFixed(4)),
      z: Number(local.z.toFixed(4)),
      halfWidth: Number((game.screenWidth * 0.5).toFixed(4)),
      halfHeight: Number((game.screenHeight * 0.5).toFixed(4)),
      projectedCenter: debugProjected(BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0, 0, 0.006), worldMatrix)),
      projectedCorners: [
        [-0.5, -0.5],
        [0.5, -0.5],
        [0.5, 0.5],
        [-0.5, 0.5],
      ].map(([sx, sy]) => debugProjected(BABYLON.Vector3.TransformCoordinates(
        new BABYLON.Vector3(game.screenWidth * sx, game.screenHeight * sy, 0.006),
        worldMatrix,
      ))),
      accepts: Boolean(screenHitLocalPoint(local)),
    };
  }

  function createShot(x, y) {
    if (!scene || !camera) return null;
    const born = performance.now();
    const width = Math.max(1, overlayCanvas?.clientWidth || canvas.clientWidth);
    const height = Math.max(1, overlayCanvas?.clientHeight || canvas.clientHeight);
    const startScreen = { x: width / 2, y: height + 48 };
    const aimRay = scene.createPickingRay(x, y, BABYLON.Matrix.Identity(), camera);
    const aimHit = findAimRayHit(aimRay, x, y);
    const aimDistance = aimHit?.distance || fallbackShotDistance();
    const startRay = scene.createPickingRay(startScreen.x, startScreen.y, BABYLON.Matrix.Identity(), camera);
    const startDistance = Math.max(0.18, fallbackShotDistance() * SHOT_GUN_DEPTH_SCALE);
    const startWorld = startRay.origin.add(startRay.direction.scale(startDistance));
    const endWorld = predictedShotEndWorld(aimHit, aimRay, aimDistance);
    const distance = BABYLON.Vector3.Distance(startWorld, endWorld);
    const duration = clamp((distance / SHOT_WORLD_SPEED) * 1000, SHOT_MIN_DURATION, SHOT_MAX_DURATION);
    const arcHeight = Math.max(0.035, Math.min(0.18, distance * SHOT_ARC_SCALE));
    setDefenseDebug("shot-created", {
      aim: { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) },
      aimHit: debugHit(aimHit),
      startWorld: debugVector(startWorld),
      endWorld: debugVector(endWorld),
      startProjected: debugProjected(startWorld),
      endProjected: debugProjected(endWorld),
      distance: Number(distance.toFixed(4)),
      duration: Math.round(duration),
      arcHeight: Number(arcHeight.toFixed(4)),
      screenProbe: debugScreenProbe(aimRay),
    });
    return {
      startScreen,
      endScreen: { x, y },
      startWorld,
      endWorld,
      arcHeight,
      duration,
      born,
      debug: {
        aim: { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) },
        aimHit: debugHit(aimHit),
        screenProbe: debugScreenProbe(aimRay),
        startProjected: debugProjected(startWorld),
        endProjected: debugProjected(endWorld),
        duration: Math.round(duration),
      },
    };
  }

  function predictedShotEndWorld(aimHit, aimRay, aimDistance) {
    return aimHit?.point || aimRay.origin.add(aimRay.direction.scale(aimDistance));
  }

  function fallbackShotDistance() {
    if (!camera) return 1;
    const reference = game.playSpace?.center || game.root?.position || camera.target;
    return Math.max(0.45, BABYLON.Vector3.Distance(camera.position, reference));
  }

  function findAimRayHit(ray, x = null, y = null) {
    const screenTargetHit = findTargetScreenHit(x, y, ray);
    if (screenTargetHit) return screenTargetHit;
    let best = findComputerRayHit(ray);
    const targetHit = findTargetRayHit(ray);
    if (targetHit && (!best || targetHit.distance < best.distance)) best = targetHit;
    return best;
  }

  function screenPointToWorld(x, y, distance) {
    const width = Math.max(1, overlayCanvas?.clientWidth || canvas.clientWidth);
    const height = Math.max(1, overlayCanvas?.clientHeight || canvas.clientHeight);
    const ray = scene.createPickingRay(x, y, BABYLON.Matrix.Identity(), camera);
    return ray.origin.add(ray.direction.scale(distance || camera.radius * 0.8));
  }

  function projectWorld(point) {
    const width = Math.max(1, overlayCanvas?.clientWidth || canvas.clientWidth);
    const height = Math.max(1, overlayCanvas?.clientHeight || canvas.clientHeight);
    const viewport = new BABYLON.Viewport(0, 0, width, height);
    const projected = BABYLON.Vector3.Project(
      point,
      BABYLON.Matrix.Identity(),
      scene.getTransformMatrix(),
      viewport,
    );
    return { x: projected.x, y: projected.y, z: projected.z };
  }

  function triggerImpact(hit) {
    game.lastImpactAt = performance.now();
    game.impactFlash = 1;
    game.cracks.push({ ...hit, seed: game.lastImpactAt * 0.013 });
    if (game.cracks.length > 6) game.cracks.shift();
    spawnFragments(hit);
    redrawDamageTexture();
    camera.alpha += (pseudoRandom(game.lastImpactAt) - 0.5) * 0.018;
    camera.beta += (pseudoRandom(game.lastImpactAt + 2) - 0.5) * 0.012;
  }

  function spawnFragments(hit) {
    if (!game.root) return;
    const mat = new BABYLON.StandardMaterial(`glassShardMaterial${performance.now()}`, scene);
    mat.diffuseColor = new BABYLON.Color3(0.84, 0.98, 0.86);
    mat.emissiveColor = new BABYLON.Color3(0.32, 0.55, 0.18);
    mat.specularColor = new BABYLON.Color3(1, 1, 1);
    mat.alpha = 0.82;
    mat.backFaceCulling = false;

    for (let i = 0; i < 34; i += 1) {
      const angle = i * 0.62 + pseudoRandom(i + game.lastImpactAt) * 0.8;
      const speed = 0.18 + pseudoRandom(i * 4.1 + game.lastImpactAt) * 0.32;
      const radius = 0.008 + pseudoRandom(i * 2.4) * 0.018;
      const mesh = BABYLON.MeshBuilder.CreateDisc(`glassShard${i}`, { radius, tessellation: 3 }, scene);
      mesh.parent = game.root;
      mesh.position.set(hit.x, hit.y, 0.04);
      mesh.rotation.z = angle;
      mesh.material = mat.clone(`glassShardMaterial${i}`);
      markDefenseMesh(mesh);
      game.fragments.push({
        mesh,
        velocity: new BABYLON.Vector3(Math.cos(angle) * speed, Math.sin(angle) * speed, 0.18 + pseudoRandom(i) * 0.24),
        spin: -8 + pseudoRandom(i + 3) * 16,
        born: performance.now(),
        life: 720 + pseudoRandom(i + 8) * 580,
      });
    }
  }

  function markDefenseMesh(mesh) {
    if (!mesh) return;
    mesh.renderingGroupId = 2;
    mesh.alwaysSelectAsActiveMesh = true;
    if (mesh.material) {
      mesh.material.disableDepthWrite = true;
      mesh.material.backFaceCulling = false;
    }
  }

  function resizeDefenseOverlay() {
    if (!overlayCanvas) return;
    const rect = overlayCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    overlayCanvas.width = Math.max(1, Math.floor(rect.width * dpr));
    overlayCanvas.height = Math.max(1, Math.floor(rect.height * dpr));
    overlayContext?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function clearDefenseOverlay() {
    if (!overlayContext || !overlayCanvas) return;
    overlayContext.clearRect(0, 0, overlayCanvas.clientWidth, overlayCanvas.clientHeight);
  }

  function drawDefenseOverlay() {
    if (!overlayContext || !overlayCanvas) return;
    const width = overlayCanvas.clientWidth;
    const height = overlayCanvas.clientHeight;
    overlayContext.clearRect(0, 0, width, height);
    updateTargets();
    drawTargets();
    updateShots();
    updateOverlayFragments();
    drawComputerImpacts();
    drawCrosshair();
  }

  function drawTargets() {
    const time = performance.now() / 1000;
    const canvasWidth = overlayCanvas.clientWidth || canvas.clientWidth || 1;
    const canvasHeight = overlayCanvas.clientHeight || canvas.clientHeight || 1;
    for (const target of game.targets) {
      if (!target.alive) {
        target.screen = null;
        continue;
      }
      const projected = projectWorld(target.position);
      if (!game.running) {
        const width = 142;
        const height = width * (TARGET_LABEL_HEIGHT / TARGET_LABEL_WIDTH);
        const display = { x: projected.x, y: projected.y, rotation: 0 };
        const displayX = display.x;
        const displayY = display.y;
        target.screen = { x: displayX, y: displayY, width, height };
        updateTargetMesh(target);
        if (TARGET_RENDER_OVERLAY) {
          drawTargetLabel(target, target.text, displayX, displayY, width, height, display.rotation, false);
        }
        continue;
      }
      const intro = Math.min(1, (performance.now() - target.spawnedAt) / LEVEL_CONFIG.introDuration);
      const ease = intro * intro * (3 - 2 * intro);
      const isDepthVisible = projected.z >= 0 && projected.z <= 1.25;
      if (!isDepthVisible && intro >= 1) {
        trackTargetVisibility(target, false);
        if (target.screen && target.offscreenSince && performance.now() - target.offscreenSince < 320) {
          updateTargetMesh(target);
          continue;
        }
        target.screen = null;
        continue;
      }
      const distance = Math.max(0.35, BABYLON.Vector3.Distance(camera.position, target.position));
      const width = clamp(210 / distance, 108, 176);
      const height = clamp(width * 0.34, 36, 58);
      const display = {
        x: (target.startScreenX * canvasWidth) * (1 - ease) + projected.x * ease,
        y: (target.startScreenY * canvasHeight) * (1 - ease) + projected.y * ease,
        rotation: 0,
      };
      const displayX = display.x;
      const displayY = display.y;
      const isVisible = displayX > -width
        && displayX < canvasWidth + width
        && displayY > -height
        && displayY < canvasHeight + height;
      trackTargetVisibility(target, isVisible);
      target.screen = isVisible
        ? { x: displayX, y: displayY, width, height }
        : null;
      updateTargetMesh(target);
      if (TARGET_RENDER_OVERLAY && target.screen) {
        drawTargetLabel(target, target.text, displayX, displayY, width, height, display.rotation, false);
      }
    }
    updateTargetDebugState();
  }

  function targetScreenDisplay(target, projected, canvasWidth, canvasHeight, width, height, ease, time) {
    const lane = TARGET_SIDE_RANGES[target.side] || TARGET_SIDE_RANGES.left;
    const laneMinX = lane.screenXMin * canvasWidth;
    const laneMaxX = lane.screenXMax * canvasWidth;
    const flyMinX = TARGET_SCREEN_X_MIN * canvasWidth;
    const flyMaxX = TARGET_SCREEN_X_MAX * canvasWidth;
    const flyMinY = TARGET_SCREEN_Y_MIN * canvasHeight;
    const flyMaxY = TARGET_SCREEN_Y_MAX * canvasHeight;
    const laneBaseX = clamp((target.startScreenX || (lane.screenXMin + lane.screenXMax) * 0.5) * canvasWidth, laneMinX, laneMaxX);
    const laneBaseY = clamp((target.startScreenY || 0.54) * canvasHeight, flyMinY, flyMaxY);
    const flyTime = time * (0.5 + Math.min(0.18, game.level * 0.01));
    const phase = target.phase;
    const buzzX =
      Math.sin(flyTime * target.speedX * 1.72 + phase) * canvasWidth * 0.17
      + Math.sin(flyTime * target.speedY * 2.34 + phase * 2.1) * canvasWidth * 0.11
      + Math.cos(flyTime * 2.15 + phase * 0.6) * canvasWidth * 0.045;
    const buzzY =
      Math.cos(flyTime * target.speedY * 1.86 + phase * 0.8) * canvasHeight * 0.13
      + Math.sin(flyTime * target.speedX * 2.58 + phase) * canvasHeight * 0.085
      + Math.cos(flyTime * 2.35 + phase * 1.7) * canvasHeight * 0.035;
    const laneX = clamp(laneBaseX + buzzX, flyMinX, flyMaxX);
    const laneY = clamp(laneBaseY + buzzY, flyMinY, flyMaxY);
    const projectedVisible = projected.z >= 0 && projected.z <= 1.25;
    const projectedX = projectedVisible ? clamp(projected.x, flyMinX, flyMaxX) : laneX;
    const projectedY = projectedVisible ? clamp(projected.y, flyMinY, flyMaxY) : laneY;
    const targetX = projectedX * 0.05 + laneX * 0.95;
    const targetY = projectedY * 0.05 + laneY * 0.95;
    const x = (target.startScreenX * canvasWidth) * (1 - ease) + targetX * ease;
    const y = (target.startScreenY * canvasHeight) * (1 - ease) + targetY * ease;
    return {
      x: clamp(x, flyMinX, flyMaxX),
      y: clamp(y, flyMinY, flyMaxY),
      rotation: Math.sin(flyTime * 1.25 + target.phase) * 0.16,
    };
  }

  function trackTargetVisibility(target, isVisible) {
    if (isVisible) {
      target.offscreenSince = 0;
      return;
    }
    const now = performance.now();
    if (!target.offscreenSince) {
      target.offscreenSince = now;
      return;
    }
    if (now - target.offscreenSince > 2800) {
      redirectTargetIntoPlayArea(target, now);
    }
  }

  function redirectTargetIntoPlayArea(target, now = performance.now()) {
    const offset = targetPlayOffset(target);
    const side = target.side === "left" || target.side === "right" ? target.side : "center";
    const range = TARGET_SIDE_RANGES[side] || TARGET_SIDE_RANGES.center;
    const safeStart = {
      side,
      x: clamp(offset.x * 0.45, range.xMin, range.xMax),
      y: clamp(offset.y * 0.42 - 0.04, TARGET_Y_MIN, TARGET_Y_MAX),
      z: targetDepthOffset(now + target.phase + 19, side),
    };
    const homeOffset = targetHomeOffset(safeStart, now + target.phase + 23);
    target.side = side;
    target.startOffsetX = safeStart.x;
    target.startOffsetY = safeStart.y;
    target.startOffsetZ = safeStart.z;
    target.offsetX = homeOffset.x;
    target.offsetY = homeOffset.y;
    target.offsetZ = homeOffset.z;
    target.phase += 3.1 + pseudoRandom(now + target.phase) * 2.6;
    target.spawnedAt = now;
    target.offscreenSince = 0;
  }

  function targetPlayOffset(target) {
    if (!game.playSpace || !target?.position) return { x: 0, y: 0, z: 0 };
    const delta = target.position.subtract(target.base);
    return {
      x: BABYLON.Vector3.Dot(delta, game.playSpace.right),
      y: BABYLON.Vector3.Dot(delta, game.playSpace.up),
      z: BABYLON.Vector3.Dot(delta, game.playSpace.forward),
    };
  }

  function updateTargetDebugState() {
    const now = performance.now();
    if (now - game.lastTargetDebugAt < 250) return;
    game.lastTargetDebugAt = now;
    const frontSign = game.playSpace?.frontSign || 1;
    const targets = game.targets.map((target) => {
      const offset = targetPlayOffset(target);
      const screenDepth = targetScreenDepthState(target);
      return {
        text: target.text,
        alive: target.alive,
        visible: Boolean(target.screen),
        screen: target.screen
          ? { x: Math.round(target.screen.x), y: Math.round(target.screen.y) }
          : null,
        offset: {
          x: Number(offset.x.toFixed(3)),
          y: Number(offset.y.toFixed(3)),
          z: Number(offset.z.toFixed(3)),
        },
        side: offset.x < 0 ? "left" : "right",
        depth: screenDepth.state,
        screenSignedDistance: Number(screenDepth.signedDistance.toFixed(4)),
        offscreen: Boolean(target.offscreenSince),
      };
    });
    setDefenseDebug("targets", {
      frontSign,
      visible: targets.filter((target) => target.visible).length,
      left: targets.filter((target) => target.side === "left").length,
      right: targets.filter((target) => target.side === "right").length,
      front: targets.filter((target) => target.depth === "front").length,
      behind: targets.filter((target) => target.depth === "behind").length,
      targets,
    });
  }

  function drawTargetLabel(target, text, x, y, width, height, rotation = 0, occlude = true) {
    drawOverlayLabel(text, x, y, width, height, rotation);
    if (occlude) eraseLabelOcclusion(target, x, y, width, height, rotation);
  }

  function drawOverlayLabel(text, x, y, width, height, rotation = 0) {
    overlayContext.save();
    overlayContext.translate(x, y);
    overlayContext.rotate(rotation);
    overlayContext.fillStyle = "rgba(7, 9, 6, 0.9)";
    overlayContext.strokeStyle = "rgba(231, 255, 98, 0.95)";
    overlayContext.lineWidth = 2;
    overlayContext.beginPath();
    overlayContext.rect(-width / 2, -height / 2, width, height);
    overlayContext.fill();
    overlayContext.stroke();
    overlayContext.fillStyle = "#e7ff62";
    overlayContext.font = "900 16px ui-sans-serif, system-ui, sans-serif";
    overlayContext.textAlign = "center";
    overlayContext.textBaseline = "middle";
    overlayContext.fillText(text, 0, 1, width - 16);
    overlayContext.restore();
  }

  function eraseLabelOcclusion(target, x, y, width, height, rotation) {
    const polygons = targetOcclusionPolygons(target);
    if (!polygons.length) return;
    const cos = Math.cos(-rotation);
    const sin = Math.sin(-rotation);
    overlayContext.save();
    overlayContext.translate(x, y);
    overlayContext.rotate(rotation);
    overlayContext.beginPath();
    overlayContext.rect(-width / 2, -height / 2, width, height);
    overlayContext.clip();
    overlayContext.globalCompositeOperation = "destination-out";
    overlayContext.fillStyle = "rgba(0,0,0,1)";
    for (const polygon of polygons) {
      if (polygon.length < 3) continue;
      overlayContext.beginPath();
      for (let i = 0; i < polygon.length; i += 1) {
        const local = screenToLabelLocal(polygon[i], x, y, cos, sin);
        if (i === 0) overlayContext.moveTo(local.x, local.y);
        else overlayContext.lineTo(local.x, local.y);
      }
      overlayContext.closePath();
      overlayContext.fill();
    }
    overlayContext.restore();
  }

  function screenToLabelLocal(point, x, y, cos, sin) {
    const dx = point.x - x;
    const dy = point.y - y;
    return {
      x: dx * cos - dy * sin,
      y: dx * sin + dy * cos,
    };
  }

  function targetOcclusionPolygons(target) {
    if (!target?.position || !camera || !game.hitboxes.length) return [];
    const targetDistance = BABYLON.Vector3.Distance(camera.position, target.position);
    const polygons = [];
    for (const item of game.hitboxes) {
      const mesh = item.mesh;
      if (!mesh) continue;
      mesh.computeWorldMatrix(true);
      const box = mesh.getBoundingInfo()?.boundingBox;
      if (!box) continue;
      const occluderDistance = BABYLON.Vector3.Distance(camera.position, box.centerWorld);
      if (occluderDistance > targetDistance - 0.006) continue;
      const points = box.vectorsWorld
        .map((point) => projectWorld(point))
        .filter((point) => point.z >= 0 && point.z <= 1.25);
      if (points.length < 3) continue;
      polygons.push(convexHull(points));
    }
    return polygons;
  }

  function convexHull(points) {
    const sorted = [...points].sort((a, b) => a.x === b.x ? a.y - b.y : a.x - b.x);
    if (sorted.length <= 3) return sorted;
    const lower = [];
    for (const point of sorted) {
      while (lower.length >= 2 && hullCross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
        lower.pop();
      }
      lower.push(point);
    }
    const upper = [];
    for (let i = sorted.length - 1; i >= 0; i -= 1) {
      const point = sorted[i];
      while (upper.length >= 2 && hullCross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
        upper.pop();
      }
      upper.push(point);
    }
    lower.pop();
    upper.pop();
    return lower.concat(upper);
  }

  function hullCross(origin, a, b) {
    return (a.x - origin.x) * (b.y - origin.y) - (a.y - origin.y) * (b.x - origin.x);
  }

  function updateShots() {
    const now = performance.now();
    overlayContext.save();
    overlayContext.globalCompositeOperation = "lighter";
    for (let i = game.shots.length - 1; i >= 0; i -= 1) {
      const shot = game.shots[i];
      const previousT = shot.lastT || 0;
      const t = Math.min(1, (now - shot.born) / shot.duration);
      shot.lastT = t;
      const projected = shotScreenPoint(shot, t);

      const tailT = Math.max(0, t - SHOT_TAIL_T);
      const tail = shotScreenPoint(shot, tailT);
      overlayContext.strokeStyle = "rgba(231,255,98,0.48)";
      overlayContext.lineWidth = 4;
      overlayContext.shadowColor = "rgba(231,255,98,0.55)";
      overlayContext.shadowBlur = 12;
      overlayContext.beginPath();
      overlayContext.moveTo(tail.x, tail.y);
      overlayContext.lineTo(projected.x, projected.y);
      overlayContext.stroke();
      overlayContext.shadowBlur = 0;

      for (let j = 6; j >= 1; j -= 1) {
        const ghostT = Math.max(0, t - j * 0.028);
        const ghost = shotScreenPoint(shot, ghostT);
        overlayContext.fillStyle = `rgba(231,255,98,${0.065 * (7 - j)})`;
        overlayContext.beginPath();
        overlayContext.arc(ghost.x, ghost.y, 2 + (7 - j) * 0.8, 0, Math.PI * 2);
        overlayContext.fill();
      }

      overlayContext.fillStyle = "rgba(250,255,210,0.96)";
      overlayContext.shadowColor = "rgba(231,255,98,0.95)";
      overlayContext.shadowBlur = 18;
      overlayContext.beginPath();
      overlayContext.arc(projected.x, projected.y, 6 + Math.sin(t * Math.PI) * 3, 0, Math.PI * 2);
      overlayContext.fill();
      overlayContext.shadowBlur = 0;

      const collision = findShotCollision(shot, Math.min(previousT, tailT), t);
      if (collision) {
        game.shots.splice(i, 1);
        resolveShotCollision(collision);
        continue;
      }

      if (t >= 1) {
        game.shots.splice(i, 1);
        resolveShotImpact(shot);
      }
    }
    overlayContext.restore();
  }

  function shotScreenPoint(shot, t) {
    const ease = 1 - Math.pow(1 - t, 2.25);
    return {
      x: shot.startScreen.x + (shot.endScreen.x - shot.startScreen.x) * ease,
      y: shot.startScreen.y + (shot.endScreen.y - shot.startScreen.y) * ease - Math.sin(t * Math.PI) * SHOT_ARC_PIXELS,
    };
  }

  function shotWorldPoint(shot, t) {
    const horizontal = BABYLON.Vector3.Lerp(shot.startWorld, shot.endWorld, t);
    const arc = Math.sin(t * Math.PI) * shot.arcHeight;
    return horizontal.add((game.playSpace?.up || BABYLON.Axis.Y).scale(arc));
  }

  function resolveShotImpact(shot) {
    if (shot.level !== game.level || shot.waveId !== game.waveId) return;
    const ray = scene.createPickingRay(shot.endScreen.x, shot.endScreen.y, BABYLON.Matrix.Identity(), camera);
    const screenTargetHit = findTargetScreenHit(shot.endScreen.x, shot.endScreen.y, ray);
    if (screenTargetHit) {
      damageTarget(screenTargetHit.target, shot.endScreen.x, shot.endScreen.y);
      return;
    }
    const computerHit = findComputerRayHit(ray);
    if (computerHit) {
      damageComputer(shot.endScreen.x, shot.endScreen.y, computerHit);
      return;
    }
    setDefenseDebug("shot-missed", {
      shot: shot.debug || null,
      endWorld: debugVector(shot.endWorld),
      endProjected: debugProjected(shot.endWorld),
    });
    playEffect("miss");
  }

  function findShotCollision(shot, fromT, toT) {
    if (shot.level !== game.level || shot.waveId !== game.waveId) return;
    if (toT <= fromT) return null;
    const steps = Math.max(1, Math.ceil((toT - fromT) / SHOT_COLLISION_STEP));
    let previousPoint = shotWorldPoint(shot, fromT);
    for (let step = 1; step <= steps; step += 1) {
      const t = fromT + ((toT - fromT) * step) / steps;
      const point = shotWorldPoint(shot, t);
      const collision = findProjectileSegmentCollision(previousPoint, point, 1);
      if (collision) return collision;
      previousPoint = point;
    }
    return null;
  }

  function findProjectileSegmentCollision(from, to, frameAlpha) {
    const delta = to.subtract(from);
    const length = delta.length();
    if (length <= 0.000001) return null;
    const ray = new BABYLON.Ray(from, delta.scale(1 / length), length);
    const targetHit = findTargetSegmentHit(ray, length, frameAlpha);
    const best = targetHit || findComputerRayHit(ray, length);
    if (!best) return null;
    const screen = projectWorld(best.point || to);
    setDefenseDebug("shot-collision", {
      hit: debugHit(best),
      from: debugVector(from),
      to: debugVector(to),
    });
    return {
      ...best,
      x: screen.x,
      y: screen.y,
    };
  }

  function resolveShotCollision(collision) {
    if (collision.type === "target") {
      damageTarget(collision.target, collision.x, collision.y);
    } else if (collision.type === "computer") {
      damageComputer(collision.x, collision.y, collision);
    }
  }

  function damageTarget(target, x, y) {
    playEffect("hit");
    triggerOverlayImpact(x, y);
    stopTargetBuzz(target.id);
    target.alive = false;
    target.hitAt = performance.now();
    updateTargetMesh(target);
    updateScore(game.score + 1);
    if (game.targets.length > 0 && game.targets.every((item) => !item.alive)) {
      advanceLevel();
    }
  }

  function advanceLevel() {
    startLevel(game.level + 1);
    setGameMessage(`Level ${game.level}. ${Math.ceil(LEVEL_CONFIG.levelDuration / 1000)} sekunder.`);
    window.setTimeout(() => playEffect("level"), 120);
  }

  function findTargetRayHit(ray, maxDistance = Infinity) {
    if (!ray) return null;
    let best = null;
    for (const target of game.targets) {
      const hit = targetRayHit(target, ray, maxDistance, 1);
      if (hit && (!best || hit.distance < best.distance)) best = hit;
    }
    return best;
  }

  function findTargetScreenHit(x, y, ray, maxDistance = Infinity) {
    if (!Number.isFinite(x) || !Number.isFinite(y) || !ray) return null;
    let best = null;
    for (const target of game.targets) {
      if (!target?.alive || target.level !== game.level || target.waveId !== game.waveId || !target.screen) continue;
      const rect = target.screen;
      const halfWidth = rect.width * 0.5;
      const halfHeight = rect.height * 0.5;
      if (Math.abs(x - rect.x) > halfWidth + TARGET_HIT_PADDING || Math.abs(y - rect.y) > halfHeight + TARGET_HIT_PADDING) continue;
      const localPoint = new BABYLON.Vector3(
        ((x - rect.x) / Math.max(1, rect.width)) * TARGET_LABEL_WIDTH,
        -((y - rect.y) / Math.max(1, rect.height)) * TARGET_LABEL_HEIGHT,
        0,
      );
      const point = targetMeshWorldPointAt(target, target.position, localPoint) || target.position;
      const distance = BABYLON.Vector3.Distance(ray.origin, point);
      if (distance > maxDistance + SHOT_COLLISION_EPSILON) continue;
      const hit = {
        type: "target",
        target,
        distance,
        point,
        localPoint,
      };
      if (!best || hit.distance < best.distance) best = hit;
    }
    return best;
  }

  function findTargetSegmentHit(ray, maxDistance, frameAlpha) {
    if (!ray) return null;
    let best = null;
    for (const target of game.targets) {
      const hit = targetRayHit(target, ray, maxDistance, frameAlpha);
      if (hit && (!best || hit.distance < best.distance)) best = hit;
    }
    return best;
  }

  function targetRayHit(target, ray, maxDistance, frameAlpha) {
    if (!target?.alive || !target.mesh || target.level !== game.level || target.waveId !== game.waveId) return null;
    const pick = targetMeshRayHit(target, ray, maxDistance, frameAlpha);
    if (!pick) return null;
    return {
      type: "target",
      target,
      distance: pick.distance,
      point: pick.point,
      localPoint: pick.localPoint,
    };
  }

  function targetMeshRayHit(target, ray, maxDistance, frameAlpha) {
    const mesh = target?.mesh;
    if (!mesh || !ray || !camera) return null;
    const center = targetInterpolatedPosition(target, frameAlpha);
    const rayLength = Number.isFinite(maxDistance)
      ? maxDistance
      : Math.max(0.5, BABYLON.Vector3.Distance(ray.origin, center) + TARGET_LABEL_WIDTH * 2);
    const facing = center.subtract(camera.position).normalize();
    const right = BABYLON.Vector3.Cross(camera.upVector, facing).normalize();
    const up = BABYLON.Vector3.Cross(facing, right).normalize();
    const localStart = pointToTargetBillboardLocal(ray.origin, center, right, up, facing);
    const localEnd = pointToTargetBillboardLocal(ray.origin.add(ray.direction.scale(rayLength)), center, right, up, facing);
    const scaleX = Math.max(0.1, Math.abs(mesh.scaling?.x || 1));
    const scaleY = Math.max(0.1, Math.abs(mesh.scaling?.y || 1));
    const half = {
      x: TARGET_LABEL_WIDTH * scaleX * 0.5 * TARGET_RAY_HIT_SCALE + SHOT_HIT_RADIUS,
      y: TARGET_LABEL_HEIGHT * scaleY * 0.5 * TARGET_RAY_HIT_SCALE + SHOT_HIT_RADIUS,
      z: TARGET_HIT_DEPTH * 0.5 + SHOT_HIT_RADIUS,
    };
    const tHit = segmentBoxIntersection(localStart, localEnd, half);
    const localPoint = tHit === null ? null : BABYLON.Vector3.Lerp(localStart, localEnd, tHit);
    const point = localPoint ? targetBillboardLocalToWorld(localPoint, center, right, up, facing) : null;
    const distance = point ? BABYLON.Vector3.Distance(ray.origin, point) : Infinity;
    if (!point || distance > maxDistance + SHOT_COLLISION_EPSILON) return null;
    return {
      distance,
      point,
      localPoint,
    };
  }

  function pointToTargetBillboardLocal(point, center, right, up, facing) {
    const delta = point.subtract(center);
    return new BABYLON.Vector3(
      BABYLON.Vector3.Dot(delta, right),
      BABYLON.Vector3.Dot(delta, up),
      BABYLON.Vector3.Dot(delta, facing),
    );
  }

  function targetBillboardLocalToWorld(local, center, right, up, facing) {
    return center
      .add(right.scale(local.x))
      .addInPlace(up.scale(local.y))
      .addInPlace(facing.scale(local.z));
  }

  function segmentBoxIntersection(start, end, half) {
    const delta = end.subtract(start);
    let tMin = 0;
    let tMax = 1;
    for (const axis of ["x", "y", "z"]) {
      const d = delta[axis];
      const s = start[axis];
      const bound = half[axis];
      if (Math.abs(d) < 0.000001) {
        if (s < -bound || s > bound) return null;
        continue;
      }
      let t1 = (-bound - s) / d;
      let t2 = (bound - s) / d;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tMin = Math.max(tMin, t1);
      tMax = Math.min(tMax, t2);
      if (tMin > tMax) return null;
    }
    return clamp(tMin >= 0 ? tMin : tMax, 0, 1);
  }

  function targetMeshWorldPointAt(target, center, localPoint) {
    const mesh = target?.mesh;
    if (!mesh || !center || !localPoint) return null;
    const original = mesh.position.clone();
    mesh.position.copyFrom(center);
    mesh.computeWorldMatrix(true);
    const point = BABYLON.Vector3.TransformCoordinates(localPoint, mesh.getWorldMatrix());
    mesh.position.copyFrom(original);
    mesh.computeWorldMatrix(true);
    return point;
  }

  function targetInterpolatedPosition(target, frameAlpha) {
    if (!target?.previousPosition) return target.position;
    return BABYLON.Vector3.Lerp(target.previousPosition, target.position, Math.max(0, Math.min(1, frameAlpha)));
  }

  function findComputerRayHit(ray, maxDistance = Infinity) {
    if (!ray || !game.hitboxes.length) return null;
    let best = null;
    for (const item of game.hitboxes) {
      const pick = hitboxRayHit(item, ray, maxDistance);
      if (!pick) continue;
      if (!best || pick.distance < best.distance) {
        const isScreen = item?.config?.name?.toLowerCase?.().includes("skärm");
        best = {
          type: "computer",
          distance: pick.distance,
          hitbox: item,
          point: pick.point,
          screenLocal: isScreen ? screenLocalFromWorldPoint(pick.point) : null,
        };
      }
    }
    return best;
  }

  function screenPlaneHit(ray, maxDistance = Infinity) {
    if (!ray || !game.root) return null;
    game.root.computeWorldMatrix(true);
    const worldMatrix = game.root.getWorldMatrix();
    const inverse = worldMatrix.clone().invert();
    const origin = BABYLON.Vector3.TransformCoordinates(ray.origin, inverse);
    const direction = BABYLON.Vector3.TransformNormal(ray.direction, inverse);
    if (Math.abs(direction.z) < 0.000001) return null;
    const t = (0.006 - origin.z) / direction.z;
    if (t < 0) return null;
    const local = origin.add(direction.scale(t));
    const screenLocal = screenHitLocalPoint(local);
    if (!screenLocal) return null;
    const point = BABYLON.Vector3.TransformCoordinates(local, worldMatrix);
    const distance = BABYLON.Vector3.Distance(ray.origin, point);
    if (distance > maxDistance + SHOT_COLLISION_EPSILON) return null;
    return {
      type: "computer",
      distance,
      hitbox: null,
      point,
      screenLocal,
    };
  }

  function screenHitLocalPoint(point) {
    if (!point) return null;
    const halfWidth = game.screenWidth * 0.5;
    const halfHeight = game.screenHeight * 0.5;
    if (Math.abs(point.x) > halfWidth) return null;
    if (Math.abs(point.y) > halfHeight) return null;
    return {
      x: clamp(point.x, -halfWidth + 0.01, halfWidth - 0.01),
      y: clamp(point.y, -halfHeight + 0.01, halfHeight - 0.01),
    };
  }

  function screenLocalFromWorldPoint(point) {
    if (!point || !game.root) return null;
    game.root.computeWorldMatrix(true);
    const inverse = game.root.getWorldMatrix().clone().invert();
    const local = BABYLON.Vector3.TransformCoordinates(point, inverse);
    return screenHitLocalPoint(local);
  }

  function hitboxRayHit(item, ray, maxDistance = Infinity) {
    const mesh = item?.mesh;
    if (!mesh || !ray) return null;
    mesh.computeWorldMatrix(true);
    const inverse = mesh.getWorldMatrix().clone().invert();
    const origin = BABYLON.Vector3.TransformCoordinates(ray.origin, inverse);
    const direction = BABYLON.Vector3.TransformNormal(ray.direction, inverse);
    const bounds = hitboxPickBounds(item);
    let near = -Infinity;
    let far = Infinity;
    for (const axis of ["x", "y", "z"]) {
      const o = origin[axis];
      const d = direction[axis];
      const bound = bounds[axis];
      if (Math.abs(d) < 0.000001) {
        if (o < -bound || o > bound) return null;
        continue;
      }
      let a = (-bound - o) / d;
      let b = (bound - o) / d;
      if (a > b) [a, b] = [b, a];
      near = Math.max(near, a);
      far = Math.min(far, b);
      if (near > far) return null;
    }
    const localDistance = near >= 0 ? near : far;
    if (localDistance < 0 || !Number.isFinite(localDistance)) return null;
    const localPoint = origin.add(direction.scale(localDistance));
    const point = BABYLON.Vector3.TransformCoordinates(localPoint, mesh.getWorldMatrix());
    const distance = BABYLON.Vector3.Distance(ray.origin, point);
    if (distance > maxDistance + SHOT_COLLISION_EPSILON) return null;
    return {
      distance,
      point,
      localPoint,
    };
  }

  function hitboxPickBounds(item) {
    return {
      x: 0.5,
      y: 0.5,
      z: 0.5,
    };
  }

  function damageComputer(x, y, hit = null) {
    playEffect("computer");
    if (hit?.screenLocal) {
      triggerImpact(hit.screenLocal);
    }
    if (hit?.point) {
      createComputerCrackMesh(hit);
    }
    game.computerImpacts.push({
      x,
      y,
      born: performance.now(),
      radius: 54 + pseudoRandom(performance.now()) * 22,
    });
    if (game.computerImpacts.length > 6) game.computerImpacts.shift();
    if (camera) {
      camera.alpha += (pseudoRandom(performance.now()) - 0.5) * 0.04;
      camera.beta += (pseudoRandom(performance.now() + 5) - 0.5) * 0.026;
    }
    game.lives = Math.max(0, game.lives - 1);
    setGameMessage(game.lives > 0 ? `Datorträff. ${game.lives} liv kvar.` : "Datorn är rökt.");
    updateHud();
    if (game.lives <= 0) endGame("Datorn gick sönder");
  }

  function createComputerCrackMesh(hit) {
    const parent = hit.hitbox?.mesh;
    if (!parent || !hit.point) return;
    parent.computeWorldMatrix(true);
    const inverse = parent.getWorldMatrix().clone().invert();
    const local = BABYLON.Vector3.TransformCoordinates(hit.point, inverse);
    const isScreen = hit.hitbox?.config?.name === "Skärm";
    const planeSize = isScreen ? 0.38 : 0.42;
    const crackPlane = computerCrackPlaneFromHit(local, planeSize);
    const surfaceZ = local.z >= 0 ? 0.506 : -0.506;

    const texture = new BABYLON.DynamicTexture(`computerCrackTexture${performance.now()}`, {
      width: 384,
      height: 384,
    }, scene, true);
    const context = texture.getContext();
    drawComputerCrackTexture(context, texture.getSize(), performance.now() * 0.013, isScreen);
    texture.hasAlpha = true;
    texture.update(false);

    const material = new BABYLON.StandardMaterial(`computerCrackMaterial${performance.now()}`, scene);
    material.diffuseTexture = texture;
    material.emissiveTexture = texture;
    material.opacityTexture = texture;
    material.alpha = 0.98;
    material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
    material.useAlphaFromDiffuseTexture = true;
    material.disableLighting = true;
    material.backFaceCulling = false;

    const mesh = createComputerCrackQuad(`computerCrack${performance.now()}`, crackPlane, scene);
    mesh.parent = parent;
    mesh.position.z = surfaceZ;
    mesh.material = material;
    mesh.renderingGroupId = 1;
    mesh.alphaIndex = 0;
    mesh.alwaysSelectAsActiveMesh = true;
    game.computerDamageMeshes.push({ mesh, material, texture });
    if (game.computerDamageMeshes.length > 14) {
      const old = game.computerDamageMeshes.shift();
      old.mesh?.dispose?.();
      old.material?.dispose?.();
      old.texture?.dispose?.();
    }
  }

  function computerCrackPlaneFromHit(local, preferredSize) {
    const hitX = clamp(local.x, -0.5, 0.5);
    const hitY = clamp(local.y, -0.5, 0.5);
    const halfSize = preferredSize * 0.5;
    const fullMinX = hitX - halfSize;
    const fullMinY = hitY - halfSize;
    const minX = Math.max(-0.5, hitX - halfSize);
    const maxX = Math.min(0.5, hitX + halfSize);
    const minY = Math.max(-0.5, hitY - halfSize);
    const maxY = Math.min(0.5, hitY + halfSize);
    return {
      minX,
      maxX,
      minY,
      maxY,
      uMin: clamp((minX - fullMinX) / preferredSize, 0, 1),
      uMax: clamp((maxX - fullMinX) / preferredSize, 0, 1),
      vMin: clamp((minY - fullMinY) / preferredSize, 0, 1),
      vMax: clamp((maxY - fullMinY) / preferredSize, 0, 1),
    };
  }

  function createComputerCrackQuad(name, plane, sceneRef) {
    const mesh = new BABYLON.Mesh(name, sceneRef);
    const vertexData = new BABYLON.VertexData();
    vertexData.positions = [
      plane.minX, plane.minY, 0,
      plane.maxX, plane.minY, 0,
      plane.maxX, plane.maxY, 0,
      plane.minX, plane.maxY, 0,
    ];
    vertexData.indices = [0, 1, 2, 0, 2, 3];
    vertexData.uvs = [
      plane.uMin, plane.vMin,
      plane.uMax, plane.vMin,
      plane.uMax, plane.vMax,
      plane.uMin, plane.vMax,
    ];
    vertexData.applyToMesh(mesh);
    return mesh;
  }

  function drawComputerCrackTexture(context, size, seed, isScreen) {
    const cx = size.width * 0.5;
    const cy = size.height * 0.5;
    const nominalSize = 384;
    const radius = nominalSize * (isScreen ? 0.105 : 0.09);
    context.clearRect(0, 0, size.width, size.height);
    context.lineCap = "round";
    context.lineJoin = "round";

    context.save();
    context.translate(cx, cy);
    context.fillStyle = isScreen ? "rgba(6,7,5,0.76)" : "rgba(5,8,10,0.72)";
    context.strokeStyle = isScreen ? "rgba(244,255,205,0.94)" : "rgba(185,240,255,0.92)";
    context.shadowColor = isScreen ? "rgba(231,255,98,0.58)" : "rgba(125,225,255,0.54)";
    context.shadowBlur = 14;
    context.lineWidth = 5.5;
    context.beginPath();
    for (let i = 0; i < 13; i += 1) {
      const angle = seed + i * Math.PI * 0.49 + Math.sin(seed + i * 1.7) * 0.28;
      const r = radius * (0.62 + pseudoRandom(seed + i * 4.1) * 0.5);
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r * (0.76 + pseudoRandom(seed + i * 2.7) * 0.34);
      if (i === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.closePath();
    context.fill();
    context.stroke();
    context.restore();

    for (let i = 0; i < 15; i += 1) {
      const angle = seed + i * Math.PI * 0.41 + Math.sin(seed * 0.7 + i) * 0.38;
      const start = radius * (0.38 + pseudoRandom(seed + i * 6.1) * 0.24);
      const length = nominalSize * (0.16 + pseudoRandom(seed + i * 8.7) * 0.25);
      const steps = 3 + Math.floor(pseudoRandom(seed + i * 11.3) * 3);
      context.strokeStyle = i % 3 === 0
        ? "rgba(5,6,5,0.96)"
        : (isScreen ? "rgba(248,255,215,0.9)" : "rgba(195,242,255,0.88)");
      context.lineWidth = i % 3 === 0 ? 6.2 : 3.4;
      context.shadowColor = isScreen ? "rgba(231,255,98,0.46)" : "rgba(110,215,255,0.44)";
      context.shadowBlur = i % 3 === 0 ? 5 : 8;
      context.beginPath();
      context.moveTo(cx + Math.cos(angle) * start, cy + Math.sin(angle) * start);
      for (let step = 1; step <= steps; step += 1) {
        const t = step / steps;
        const bend = (pseudoRandom(seed + i * 13.7 + step) - 0.5) * 0.55;
        const segmentAngle = angle + bend * t;
        const distance = start + length * t;
        context.lineTo(cx + Math.cos(segmentAngle) * distance, cy + Math.sin(segmentAngle) * distance);
      }
      context.stroke();

      if (i % 2 === 0) {
        const branchAt = 0.44 + pseudoRandom(seed + i * 17.9) * 0.26;
        const branchAngle = angle + (pseudoRandom(seed + i * 19.1) > 0.5 ? 1 : -1) * (0.48 + pseudoRandom(seed + i * 23.5) * 0.5);
        const branchStart = start + length * branchAt;
        const branchLength = length * (0.22 + pseudoRandom(seed + i * 29.4) * 0.24);
        context.lineWidth = 2.7;
        context.beginPath();
        context.moveTo(cx + Math.cos(angle) * branchStart, cy + Math.sin(angle) * branchStart);
        context.lineTo(
          cx + Math.cos(angle) * branchStart + Math.cos(branchAngle) * branchLength,
          cy + Math.sin(angle) * branchStart + Math.sin(branchAngle) * branchLength,
        );
        context.stroke();
      }
    }

    context.shadowBlur = 0;
    context.fillStyle = "rgba(255,255,235,0.34)";
    context.beginPath();
    context.arc(cx - radius * 0.18, cy - radius * 0.22, radius * 0.16, 0, Math.PI * 2);
    context.fill();
  }

  function endGame(reason) {
    if (game.gameOver) return;
    game.gameOver = true;
    game.running = false;
    game.shots = [];
    stopBuzzLoop();
    setMotion(false);
    playEffect("gameOver");
    setGameMessage(`${reason}. Poäng ${game.score}.`);
    setGameOverVisible(true, `${reason} / SCORE ${game.score}`);
    if (defenseGameStartButton) defenseGameStartButton.textContent = "Starta om";
    updateHud();
  }

  function setGameOverVisible(visible, summary = "Keynote Defense") {
    if (!gameOverScreen) return;
    gameOverScreen.classList.toggle("is-visible", Boolean(visible));
    if (gameOverSummary) gameOverSummary.textContent = summary;
  }

  function drawCrosshair() {
    const x = game.aim.x || (overlayCanvas.clientWidth / 2);
    const y = game.aim.y || (overlayCanvas.clientHeight / 2);
    overlayContext.save();
    overlayContext.strokeStyle = "rgba(231,255,98,0.86)";
    overlayContext.lineWidth = 2;
    overlayContext.beginPath();
    overlayContext.arc(x, y, 16, 0, Math.PI * 2);
    overlayContext.moveTo(x - 28, y);
    overlayContext.lineTo(x - 10, y);
    overlayContext.moveTo(x + 10, y);
    overlayContext.lineTo(x + 28, y);
    overlayContext.moveTo(x, y - 28);
    overlayContext.lineTo(x, y - 10);
    overlayContext.moveTo(x, y + 10);
    overlayContext.lineTo(x, y + 28);
    overlayContext.stroke();
    overlayContext.restore();
  }

  function triggerOverlayImpact(x, y) {
    const now = performance.now();
    if (game.overlayFragments.length > 260) game.overlayFragments.splice(0, game.overlayFragments.length - 220);
    for (let i = 0; i < 46; i += 1) {
      const angle = i * 0.55 + pseudoRandom(now + i) * 0.7;
      const speed = 90 + pseudoRandom(i + now) * 220;
      game.overlayFragments.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        size: 7 + pseudoRandom(i * 3.4) * 15,
        spin: -5 + pseudoRandom(i + 2.2) * 10,
        rotation: angle,
        born: now,
        life: 900 + pseudoRandom(i + 9.1) * 700,
      });
    }
    if (game.overlayFragments.length > 260) game.overlayFragments.splice(0, game.overlayFragments.length - 260);
    if (camera) {
      camera.alpha += (pseudoRandom(now) - 0.5) * 0.022;
      camera.beta += (pseudoRandom(now + 3) - 0.5) * 0.014;
    }
  }

  function updateOverlayFragments() {
    const now = performance.now();
    overlayContext.save();
    overlayContext.globalCompositeOperation = "screen";
    for (let i = game.overlayFragments.length - 1; i >= 0; i -= 1) {
      const item = game.overlayFragments[i];
      const age = now - item.born;
      const t = age / item.life;
      if (t >= 1) {
        game.overlayFragments.splice(i, 1);
        continue;
      }
      const seconds = age / 1000;
      const x = item.x + item.vx * seconds;
      const y = item.y + item.vy * seconds + 120 * seconds * seconds;
      const alpha = (1 - t) * 0.72;
      overlayContext.save();
      overlayContext.translate(x, y);
      overlayContext.rotate(item.rotation + item.spin * seconds);
      overlayContext.fillStyle = `rgba(245, 255, 235, ${alpha})`;
      overlayContext.beginPath();
      overlayContext.moveTo(0, -item.size);
      overlayContext.lineTo(item.size * 0.72, item.size * 0.8);
      overlayContext.lineTo(-item.size * 0.85, item.size * 0.55);
      overlayContext.closePath();
      overlayContext.fill();
      overlayContext.restore();
    }
    overlayContext.restore();
  }

  function drawComputerImpacts() {
    if (!overlayContext || !game.computerImpacts.length) return;
    const now = performance.now();
    overlayContext.save();
    overlayContext.globalCompositeOperation = "screen";
    for (let i = game.computerImpacts.length - 1; i >= 0; i -= 1) {
      const item = game.computerImpacts[i];
      const age = now - item.born;
      const t = age / 520;
      if (t >= 1) {
        game.computerImpacts.splice(i, 1);
        continue;
      }
      const radius = item.radius * (0.5 + t * 1.1);
      const alpha = 1 - t;
      const gradient = overlayContext.createRadialGradient(item.x, item.y, 0, item.x, item.y, radius);
      gradient.addColorStop(0, `rgba(20,0,0,${0.52 * alpha})`);
      gradient.addColorStop(0.45, `rgba(255,60,25,${0.28 * alpha})`);
      gradient.addColorStop(1, "rgba(255,60,25,0)");
      overlayContext.fillStyle = gradient;
      overlayContext.beginPath();
      overlayContext.arc(item.x, item.y, radius, 0, Math.PI * 2);
      overlayContext.fill();

      overlayContext.strokeStyle = `rgba(255,80,35,${0.62 * alpha})`;
      overlayContext.lineWidth = 2;
      overlayContext.beginPath();
      overlayContext.arc(item.x, item.y, radius * 0.45, 0, Math.PI * 2);
      overlayContext.stroke();
    }
    overlayContext.restore();
  }

  function drawComputerDamageMarks() {
    if (!overlayContext || !game.computerDamageMarks.length) return;
    overlayContext.save();
    overlayContext.globalCompositeOperation = "screen";
    for (const mark of game.computerDamageMarks) {
      const point = vectorFromArray(mark.point);
      if (!point) continue;
      const projected = projectWorld(point);
      if (projected.z < 0 || projected.z > 1.25) continue;
      drawDamageCrack(projected.x, projected.y, mark.seed, mark.label);
    }
    overlayContext.restore();
  }

  function drawDamageCrack(x, y, seed, label) {
    const radius = label === "Skärm" ? 18 : 14;
    overlayContext.save();
    overlayContext.translate(x, y);
    overlayContext.strokeStyle = label === "Skärm"
      ? "rgba(235,255,190,0.9)"
      : "rgba(160,225,255,0.86)";
    overlayContext.fillStyle = "rgba(8,10,8,0.48)";
    overlayContext.lineWidth = 1.7;
    overlayContext.shadowColor = "rgba(231,255,98,0.55)";
    overlayContext.shadowBlur = 8;
    overlayContext.beginPath();
    overlayContext.arc(0, 0, radius * 0.34, 0, Math.PI * 2);
    overlayContext.fill();
    for (let i = 0; i < 8; i += 1) {
      const angle = seed + i * Math.PI * 0.25 + Math.sin(seed + i) * 0.22;
      const length = radius * (0.45 + pseudoRandom(seed + i * 2.3) * 0.75);
      overlayContext.beginPath();
      overlayContext.moveTo(Math.cos(angle) * 3, Math.sin(angle) * 3);
      overlayContext.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
      overlayContext.stroke();
    }
    overlayContext.shadowBlur = 0;
    overlayContext.restore();
  }

  function startDefense() {
    if (scene && camera && !game.playSpace) setupGame();
    if (CALIBRATION_VISIBLE && game.inputMode === "calibration") {
      setCalibrationInputMode(false);
    }
    if (game.gameOver) {
      game.score = 0;
      game.lives = LEVEL_CONFIG.maxLives;
      game.computerImpacts = [];
      game.computerDamageMarks = [];
      clearComputerDamageMeshes();
      game.overlayFragments = [];
      game.gameOver = false;
      game.running = false;
      game.pausedRemaining = 0;
      setGameOverVisible(false);
      startLevel(1);
    }
    game.running = true;
    const now = performance.now();
    game.deadlineAt = now + (game.pausedRemaining || LEVEL_CONFIG.levelDuration);
    game.pausedRemaining = 0;
    for (const target of game.targets) {
      target.spawnedAt = now;
      target.offscreenSince = 0;
    }
    setGameMessage("");
    if (defenseGameStartButton) defenseGameStartButton.textContent = "Paus";
    startMusic();
    startBuzzLoop();
    setMotion(true);
    updateHud();
  }

  function toggleDefense() {
    if (game.running) {
      pauseDefense();
      return;
    }
    startDefense();
  }

  function pauseDefense(reason = "Pausat.") {
    if (game.running && !game.gameOver) {
      game.pausedRemaining = remainingLevelTime();
      game.running = false;
      game.shots = [];
      stopBuzzLoop();
      setMotion(false);
      if (defenseGameStartButton) defenseGameStartButton.textContent = "Fortsätt";
      updateHud();
    }
    setGameMessage(reason);
  }

  function setMotion(enabled) {
    game.motion = Boolean(enabled);
    if (game.motion && camera) {
      game.motionBase = {
        alpha: camera.alpha,
        beta: camera.beta,
        radius: camera.radius,
        startedAt: performance.now(),
      };
    }
    setButtonActive("#defenseMotionButton", game.motion);
  }

  function setButtonActive(selector, active) {
    document.querySelector(selector)?.classList.toggle("is-active", Boolean(active));
  }

  function registerGameButtons() {
    bindButton("#defenseStartButton", startDefense);
    bindButton("#defenseGameStartButton", toggleDefense);
    bindButton("#defenseHitButton", launchHit);
    bindButton("#musicToggleButton", () => setMusicEnabled(!game.musicEnabled));
    bindButton("#effectsToggleButton", () => setEffectsEnabled(!game.effectsEnabled));
    bindButton("#defenseResetButton", () => {
      game.cracks = [];
      game.impactFlash = 0;
      game.overlayFragments = [];
      for (const item of game.fragments) item.mesh?.dispose?.();
      for (const item of game.projectiles) item.mesh?.dispose?.();
      game.fragments = [];
      game.projectiles = [];
      game.computerImpacts = [];
      game.computerDamageMarks = [];
      clearComputerDamageMeshes();
      game.lives = LEVEL_CONFIG.maxLives;
      game.deadlineAt = 0;
      game.pausedRemaining = 0;
      game.gameOver = false;
      game.running = false;
      stopBuzzLoop();
      setGameMessage("");
      setGameOverVisible(false);
      if (defenseGameStartButton) defenseGameStartButton.textContent = "Starta";
      clearCrackTexture();
      clearDefenseOverlay();
      updateScore(0);
      startLevel(1);
    });
    bindButton("#defenseMotionButton", () => setMotion(!game.motion));
  }

  function bindButton(selector, handler) {
    const button = document.querySelector(selector);
    if (!button || button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    button.addEventListener("click", handler);
  }

  function registerGameInput() {
    if (canvas && canvas.dataset.calibrationBound !== "true") {
      canvas.dataset.calibrationBound = "true";
      canvas.addEventListener("pointerdown", (event) => {
        if (!CALIBRATION_VISIBLE || game.inputMode !== "calibration") return;
        calibrationPointer = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          moved: false,
        };
      });
      canvas.addEventListener("pointermove", (event) => {
        if (!calibrationPointer || calibrationPointer.id !== event.pointerId) return;
        const distance = Math.hypot(event.clientX - calibrationPointer.x, event.clientY - calibrationPointer.y);
        if (distance > 7) calibrationPointer.moved = true;
      });
      canvas.addEventListener("pointerup", (event) => {
        if (!calibrationPointer || calibrationPointer.id !== event.pointerId) return;
        const pointer = calibrationPointer;
        calibrationPointer = null;
        if (pointer.moved || !CALIBRATION_VISIBLE || game.inputMode !== "calibration") return;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        game.aim.x = x;
        game.aim.y = y;
        recordCalibrationClick(x, y);
      });
      canvas.addEventListener("pointercancel", (event) => {
        if (calibrationPointer?.id === event.pointerId) calibrationPointer = null;
      });
    }
    if (overlayCanvas && overlayCanvas.dataset.bound !== "true") {
      overlayCanvas.dataset.bound = "true";
      overlayCanvas.addEventListener("pointermove", (event) => {
        const rect = overlayCanvas.getBoundingClientRect();
        game.aim.x = event.clientX - rect.left;
        game.aim.y = event.clientY - rect.top;
      });
      overlayCanvas.addEventListener("pointerdown", (event) => {
        const rect = overlayCanvas.getBoundingClientRect();
        game.aim.x = event.clientX - rect.left;
        game.aim.y = event.clientY - rect.top;
        if (recordCalibrationClick(game.aim.x, game.aim.y)) {
          event.preventDefault();
          return;
        }
        shootAt(game.aim.x, game.aim.y);
      });
    }
    window.addEventListener("keydown", (event) => {
      if (event.code === "Space") {
        event.preventDefault();
        launchHit();
      }
      if (event.key?.toLowerCase() === "m") setMotion(!game.motion);
    });
  }

  function updateScore(score) {
    game.score = score;
    updateHud();
  }

  function updateHud() {
    if (defenseScore) defenseScore.textContent = String(game.score);
    if (defenseLevel) defenseLevel.textContent = `LEVEL ${game.level}`;
    if (defenseLives) defenseLives.textContent = `LIV ${game.lives}`;
    if (defenseTimer) defenseTimer.textContent = `TID ${formatTime(remainingLevelTime())}`;
  }

  function remainingLevelTime() {
    if (game.gameOver) return 0;
    if (!game.running && game.pausedRemaining) return game.pausedRemaining;
    if (!game.running || !game.deadlineAt) return LEVEL_CONFIG.levelDuration;
    return Math.max(0, game.deadlineAt - performance.now());
  }

  function formatTime(milliseconds) {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  function setGameMessage(message) {
    if (!defenseMessage) return;
    defenseMessage.textContent = message;
    defenseMessage.classList.toggle("is-visible", Boolean(message));
  }

  function updateGameTimer() {
    if (!game.running || game.gameOver) return;
    if (performance.now() >= game.deadlineAt) {
      endGame("Tiden tog slut");
      return;
    }
    updateHud();
  }

  function registerGameTick() {
    if (gameTickRegistered || !scene) return;
    gameTickRegistered = true;
    scene.onBeforeRenderObservable.add(() => {
      const delta = Math.min(engine.getDeltaTime(), 34);
      updateGameTimer();
      updateCameraMotion();
      drawDefenseOverlay();
      updateBuzzwords(delta);
      updateBuzzLoop();
      updateProjectiles();
      updateFragments(delta);
      if (game.impactFlash > 0.01) {
        game.impactFlash *= 0.86;
        redrawDamageTexture();
      }
    });
  }

  function updateCameraMotion() {
    if (!game.motion || !game.motionBase || !camera) return;
    const elapsed = (performance.now() - game.motionBase.startedAt) / 1000;
    camera.alpha = game.motionBase.alpha + Math.sin(elapsed * 0.68) * 0.105;
    camera.beta = game.motionBase.beta + Math.sin(elapsed * 0.52 + 0.7) * 0.036;
    camera.radius = game.motionBase.radius + Math.sin(elapsed * 0.44) * 0.018;
  }

  function updateBuzzwords(delta) {
    const time = performance.now() / 1000;
    for (const item of game.buzzwords) {
      const meta = item.mesh.metadata;
      item.mesh.position.x = meta.baseX + Math.sin(time * 1.2 + meta.phase) * 0.018;
      item.mesh.position.y = meta.baseY + Math.cos(time * 1.05 + meta.phase) * 0.014;
      item.mesh.rotation.z = Math.sin(time * 1.5 + meta.phase) * 0.07;
      item.mesh.position.z = 0.25 + Math.sin(time * 1.1 + meta.phase) * 0.035;
    }
  }

  function updateProjectiles() {
    const now = performance.now();
    for (let i = game.projectiles.length - 1; i >= 0; i -= 1) {
      const item = game.projectiles[i];
      const t = Math.min(1, (now - item.born) / item.duration);
      const ease = 1 - Math.pow(1 - t, 3);
      const arc = Math.sin(t * Math.PI) * 0.17;
      item.mesh.position.x = item.start.x + (item.hit.x - item.start.x) * ease;
      item.mesh.position.y = item.start.y + (item.hit.y - item.start.y) * ease;
      item.mesh.position.z = item.start.z * (1 - ease) + 0.045 * ease + arc;
      item.mesh.rotation.z = Math.sin(t * Math.PI * 2 + item.seed) * 0.5;
      item.mesh.scaling.setAll(1 + Math.sin(t * Math.PI) * 0.25);
      if (t >= 1) {
        item.mesh.dispose();
        game.projectiles.splice(i, 1);
        triggerImpact(item.hit);
      }
    }
  }

  function updateFragments(delta) {
    const now = performance.now();
    for (let i = game.fragments.length - 1; i >= 0; i -= 1) {
      const item = game.fragments[i];
      const age = now - item.born;
      const factor = delta / 1000;
      item.mesh.position.addInPlace(item.velocity.scale(factor));
      item.velocity.y -= 0.16 * factor;
      item.mesh.rotation.z += item.spin * factor;
      item.mesh.rotation.x += item.spin * 0.35 * factor;
      const fade = Math.max(0, 1 - age / item.life);
      item.mesh.material.alpha = fade * 0.82;
      item.mesh.scaling.setAll(0.6 + fade * 0.8);
      if (age > item.life) {
        item.mesh.dispose();
        game.fragments.splice(i, 1);
      }
    }
  }

  window.KeynoteDefense = {
    start: startDefense,
    hit: launchHit,
    motion: setMotion,
    reset: resetGame,
    hitboxes: () => game.hitboxConfigs,
  };

  window.addEventListener("quality-splat-selected", (event) => {
    load(event.detail.file).catch((error) => {
      console.error(error);
      setStatus("Babylonfel", error?.message || String(error));
      clear();
      formatStatus.textContent = "Fallback";
    });
  });

  window.addEventListener("quality-renderer-reset", clear);

  window.addEventListener("quality-view", (event) => {
    applyViewPreset(event.detail.view);
  });

  window.addEventListener("quality-zoom", (event) => {
    if (!camera || !window.__qualityCameraBase) return;
    const radius = window.__qualityCameraBase.radius;
    camera.radius = radius * Math.max(0.08, 0.82 - event.detail.zoom * 0.58);
    updateEditorState();
  });

  window.addEventListener("quality-camera", (event) => {
    if (!camera) return;
    camera.alpha = event.detail.alpha;
    camera.beta = event.detail.beta;
    updateEditorState();
  });

  window.addEventListener("quality-focus", (event) => {
    if (!camera || !window.__qualityCameraBase) return;
    const center = BABYLON.Vector3.FromArray(window.__qualityCameraBase.center);
    focusOffset = new BABYLON.Vector3(event.detail.x, event.detail.y, event.detail.z);
    camera.target.copyFrom(center.add(focusOffset));
    updateEditorState();
  });
})();
