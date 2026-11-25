/**
 * SatwaKu AR – Controller Utama (Revisi UI Zoo Theme)
 * Memenuhi AR-01 hingga AR-17 | Split-screen layout | Preview 3D Interaktif
 */

// ── Emoji & data tambahan untuk gallery/preview ───────────────────────────
const satwaEmoji = {
  gajah_sumatera:       "🐘",
  badak_sumatera:       "🦏",
  orangutan_sumatera:   "🦧",
  harimau_sumatera:     "🐯",
  badak_jawa:           "🦏",
  macan_tutul_jawa:     "🐆",
  jalak_bali:           "🦜",
  orangutan_kalimantan: "🦧",
  bekantan:             "🐒",
  anoa:                 "🐃",
  babirusa:             "🐗",
  tarsius:              "🐺"
};

const satwaRegion = {
  gajah_sumatera:       "Sumatra",
  badak_sumatera:       "Sumatra",
  orangutan_sumatera:   "Sumatra",
  harimau_sumatera:     "Sumatra",
  badak_jawa:           "Jawa",
  macan_tutul_jawa:     "Jawa",
  jalak_bali:           "Bali",
  orangutan_kalimantan: "Kalimantan",
  bekantan:             "Kalimantan",
  anoa:                 "Sulawesi",
  babirusa:             "Sulawesi",
  tarsius:              "Sulawesi"
};

// ── State Controller ───────────────────────────────────────────────────────
const ARState = {
  activeAnimalId:   null,
  isScanning:       false,
  isAudioPlaying:   false,
  audioElement:     null,
  detectionTimer:   null,
  speechSynth:      window.speechSynthesis || null,
  currentUtterance: null,
  videoObserver:    null,
  previewScene:     null,
  previewCamera:    null,
  previewRenderer:  null,
  previewModel:     null,
  previewAnimId:    null
};

// ── Init ──────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  setupVideoObserver();
  buildAnimalGallery();
});

// ── Animal Gallery (panel idle) ───────────────────────────────────────────
function buildAnimalGallery() {
  const gallery = document.getElementById("animal-gallery");
  if (!gallery || !satwaData) return;

  Object.values(satwaData).forEach(animal => {
    const btn = document.createElement("button");
    btn.className = "gallery-btn";
    btn.dataset.id = animal.id;
    btn.innerHTML = `
      <span class="gb-emoji">${satwaEmoji[animal.id] || "🐾"}</span>
      <span class="gb-name">${animal.name}</span>
    `;
    btn.addEventListener("click", () => previewAnimal(animal.id));
    gallery.appendChild(btn);
  });
}

/** Tampilkan preview 3D satwa di panel idle (tanpa scan marker) */
function previewAnimal(animalId) {
  const data = satwaData[animalId];
  if (!data) return;

  // Aktifkan tampilan sidebar-active
  showSidebarActive(animalId);

  // Update preview model 3D
  updatePreviewModel(data.model, data.scale);

  // Tandai gallery button aktif
  document.querySelectorAll(".gallery-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.id === animalId);
  });
}

// ── Video Observer & Camera Fix ───────────────────────────────────────────
function setupVideoObserver() {
  if (ARState.videoObserver) return;
  ARState.videoObserver = new MutationObserver(fixCameraVideoElements);
  ARState.videoObserver.observe(document.body, { childList: true, subtree: true });
}

function fixCameraVideoElements() {
  const viewport = document.getElementById("ar-viewport");
  document.querySelectorAll("video").forEach(video => {
    if (!video.hasAttribute("playsinline")) {
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.setAttribute("autoplay", "");
      video.muted = true;
    }
    // Jika video berada di body, pindahkan ke ar-viewport agar tepat berada di belakang AR canvas
    if (viewport && video.parentElement !== viewport && video.id !== "preview-video") {
      viewport.appendChild(video);
    }
  });
}

function setupOrientationHandler() {
  window.addEventListener("orientationchange", () => {
    setTimeout(() => window.dispatchEvent(new Event("resize")), 300);
  });
}

// ── Mulai Sesi AR (AR-04 s.d AR-08) ─────────────────────────────────────
async function startAR() {
  document.getElementById("landing-screen").classList.add("hidden");
  document.getElementById("error-screen").classList.add("hidden");

  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("getUserMedia tidak didukung. Gunakan HTTPS atau localhost.");
    }

    // Minta izin kamera
    const testStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });
    testStream.getTracks().forEach(t => t.stop());

    // Tampilkan ar-screen (split view)
    document.getElementById("ar-screen").classList.remove("hidden");

    // Injeksi AR scene ke viewport
    const container = document.getElementById("ar-scene-container");
    const template  = document.getElementById("ar-scene-template");
    container.innerHTML = "";
    container.appendChild(template.content.cloneNode(true));

    ARState.isScanning = true;
    startDetectionTimeout();

    // Daftarkan event marker setelah scene loaded
    const scene = container.querySelector("a-scene");
    if (scene) {
      const onLoaded = () => {
        configureRendererQuality(scene);
        registerMarkerEvents();
        setupOrientationHandler();
        fixCameraVideoElements();
      };
      scene.hasLoaded ? onLoaded() : scene.addEventListener("loaded", onLoaded);
    }

    // Polling video fix saat init AR.js
    let attempts = 0;
    const iv = setInterval(() => {
      fixCameraVideoElements();
      if (++attempts > 12) clearInterval(iv);
    }, 400);

  } catch (err) {
    console.error("Gagal memulai AR:", err);
    showCameraError(err.name || "CameraError");
  }
}

// ── Error Kamera (AR-06, AR-08) ───────────────────────────────────────────
function showCameraError(errorType) {
  let msg = "Izin kamera ditolak atau kamera tidak tersedia.";
  if (errorType === "NotAllowedError" || errorType === "PermissionDeniedError") {
    msg = "Akses kamera ditolak. Ubah izin Kamera menjadi 'Izinkan' di pengaturan browser.";
  } else if (errorType === "NotFoundError") {
    msg = "Perangkat kamera tidak ditemukan.";
  } else if (location.protocol !== "https:" && location.hostname !== "localhost") {
    msg = "Akses kamera memerlukan HTTPS atau localhost.";
  }
  document.getElementById("error-msg").innerText = msg;
  document.getElementById("landing-screen").classList.add("hidden");
  document.getElementById("error-screen").classList.remove("hidden");
}

// ── Timeout deteksi 10 detik (AR-15) ─────────────────────────────────────
function startDetectionTimeout() {
  clearDetectionTimeout();
  const hint = document.getElementById("scan-hint");
  if (hint) hint.innerText = "🔍 Arahkan kamera ke kartu satwa...";

  ARState.detectionTimer = setTimeout(() => {
    if (ARState.isScanning && !ARState.activeAnimalId) {
      const h = document.getElementById("scan-hint");
      if (h) h.innerText = "💡 Belum terdeteksi. Cek posisi, jarak (20–30 cm), & pencahayaan kartu.";
    }
  }, 10000);
}

function clearDetectionTimeout() {
  if (ARState.detectionTimer) {
    clearTimeout(ARState.detectionTimer);
    ARState.detectionTimer = null;
  }
}

// ── Kualitas Renderer ─────────────────────────────────────────────────────
function configureRendererQuality(scene) {
  if (!scene || !scene.renderer) return;
  const r = scene.renderer;
  if (typeof THREE !== "undefined") {
    if (THREE.sRGBEncoding)        r.outputEncoding     = THREE.sRGBEncoding;
    if (THREE.ACESFilmicToneMapping) {
      r.toneMapping         = THREE.ACESFilmicToneMapping;
      r.toneMappingExposure = 1.15;
    }
  }
}

// ── Material Enhancer ─────────────────────────────────────────────────────
function enhanceModelVisuals(modelEntity, animalId) {
  if (!modelEntity) return;
  const apply = () => {
    const mesh = modelEntity.getObject3D("mesh");
    if (!mesh) return;
    mesh.traverse(node => {
      if (node.isMesh && node.material) {
        const mats = Array.isArray(node.material) ? node.material : [node.material];
        mats.forEach(mat => {
          if (mat.map && typeof THREE !== "undefined") {
            mat.map.encoding = THREE.sRGBEncoding;
            mat.map.needsUpdate = true;
          }
          if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
            mat.metalness = 0.0;
            mat.roughness = 0.55;
            mat.needsUpdate = true;
          }
        });
      }
    });
  };
  if (modelEntity.getObject3D("mesh")) apply();
  modelEntity.addEventListener("model-loaded", apply);
  modelEntity.addEventListener("model-error", e => console.error("❌ Model error:", animalId, e.detail));
}

if (typeof AFRAME !== "undefined" && !AFRAME.components["satwa-model-enhancer"]) {
  AFRAME.registerComponent("satwa-model-enhancer", {
    init() {
      const parentMarker = this.el.closest("a-marker");
      const animalId     = parentMarker ? parentMarker.getAttribute("data-satwa-id") : "satwa";
      enhanceModelVisuals(this.el, animalId);
    }
  });
}

// ── Daftar Event Marker ───────────────────────────────────────────────────
function registerMarkerEvents() {
  const container = document.getElementById("ar-scene-container");
  if (!container) return;

  container.querySelectorAll("a-marker").forEach(marker => {
    const animalId = marker.getAttribute("data-satwa-id");
    if (!animalId) return;
    marker.addEventListener("markerFound", () => onMarkerFound(animalId));
    marker.addEventListener("markerLost",  () => onMarkerLost(animalId));

    const model = marker.querySelector("[gltf-model]");
    if (model) enhanceModelVisuals(model, animalId);
  });
}

// ── Marker Ditemukan (AR-09, AR-11, AR-12, AR-16) ────────────────────────
function onMarkerFound(animalId) {
  const data = satwaData[animalId];
  if (!data) return;

  if (ARState.activeAnimalId && ARState.activeAnimalId !== animalId) stopAudio();

  ARState.activeAnimalId = animalId;
  clearDetectionTimeout();

  const hint = document.getElementById("scan-hint");
  if (hint) hint.innerText = `✨ ${data.name} terdeteksi!`;

  // Tampilkan panel aktif
  showSidebarActive(animalId);

  // Update preview model 3D ke model yang di-scan
  updatePreviewModel(data.model, data.scale);
}

// ── Marker Hilang (AR-14) ─────────────────────────────────────────────────
function onMarkerLost(animalId) {
  if (ARState.activeAnimalId !== animalId) return;

  ARState.activeAnimalId = null;
  stopAudio();

  const hint = document.getElementById("scan-hint");
  if (hint) hint.innerText = "🎯 Arahkan kembali ke kartu satwa.";

  // Kembali ke idle
  document.getElementById("sidebar-idle").classList.remove("hidden");
  document.getElementById("sidebar-active").classList.add("hidden");

  startDetectionTimeout();
}

// ── Tampilkan Panel Aktif ─────────────────────────────────────────────────
function showSidebarActive(animalId) {
  const data = satwaData[animalId];
  if (!data) return;

  document.getElementById("sidebar-idle").classList.add("hidden");
  document.getElementById("sidebar-active").classList.remove("hidden");

  // Isi data
  document.getElementById("satwa-emoji").innerText = satwaEmoji[animalId] || "🐾";
  document.getElementById("satwa-name").innerText   = data.name;
  document.getElementById("satwa-latin").innerText  = data.latinName;

  const badge = document.getElementById("satwa-badge");
  badge.innerText   = data.badge;
  badge.className   = `status-badge ${data.statusType === "critical" ? "badge-critical" : "badge-endangered"}`;

  const regionTag = document.getElementById("satwa-region-tag");
  if (regionTag) regionTag.innerText = `📍 ${satwaRegion[animalId] || data.region || "Indonesia"}`;

  document.getElementById("satwa-habitat").innerText = data.habitat;
  document.getElementById("satwa-food").innerText    = data.food;
  document.getElementById("satwa-status").innerText  = data.status;
  document.getElementById("satwa-fact").innerText    = data.fact;

  resetAudioButton();
}

// ── Preview 3D (panel kanan menggunakan Three.js murni) ────────────────────
function initPreview3D() {
  const canvas = document.getElementById("preview-3d-canvas");
  if (!canvas || ARState.previewRenderer || typeof THREE === "undefined") return;

  const width = canvas.clientWidth || 300;
  const height = canvas.clientHeight || 180;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 1, 2.5);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambient);
  const dir1 = new THREE.DirectionalLight(0xfffdf5, 1.2);
  dir1.position.set(2, 4, 2);
  scene.add(dir1);
  const dir2 = new THREE.DirectionalLight(0xd0f0ff, 0.6);
  dir2.position.set(-2, 2, -1);
  scene.add(dir2);

  ARState.previewScene = scene;
  ARState.previewCamera = camera;
  ARState.previewRenderer = renderer;

  // Animation loop
  function animate() {
    ARState.previewAnimId = requestAnimationFrame(animate);
    if (ARState.previewModel) {
      ARState.previewModel.rotation.y += 0.015;
    }
    renderer.render(scene, camera);
  }
  animate();
}

function updatePreviewModel(modelSrc, scaleStr) {
  if (!modelSrc) return;
  initPreview3D();
  if (!ARState.previewScene || typeof THREE === "undefined") return;

  // Hapus model sebelumnya
  if (ARState.previewModel) {
    ARState.previewScene.remove(ARState.previewModel);
    ARState.previewModel = null;
  }

  const loader = new THREE.GLTFLoader();
  loader.load(
    modelSrc,
    gltf => {
      const model = gltf.scene;

      // Hitung bounding box untuk auto-center dan scaling
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      // Center model
      model.position.x = -center.x;
      model.position.y = -box.min.y;
      model.position.z = -center.z;

      const wrapper = new THREE.Group();
      wrapper.add(model);

      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const targetScale = 1.3 / maxDim;
      wrapper.scale.set(targetScale, targetScale, targetScale);
      wrapper.position.set(0, -0.4, 0);

      // Tingkatkan material visual
      model.traverse(node => {
        if (node.isMesh && node.material) {
          const mats = Array.isArray(node.material) ? node.material : [node.material];
          mats.forEach(mat => {
            if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
              mat.metalness = 0.0;
              mat.roughness = 0.55;
            }
          });
        }
      });

      ARState.previewModel = wrapper;
      ARState.previewScene.add(wrapper);
    },
    undefined,
    err => {
      console.warn("Gagal memuat preview model 3D:", err);
    }
  );
}

// ── Audio (AR-13) ─────────────────────────────────────────────────────────
function toggleAudio() {
  ARState.isAudioPlaying ? stopAudio() : playCurrentAnimalAudio();
}

function playCurrentAnimalAudio() {
  if (!ARState.activeAnimalId) return;
  const data = satwaData[ARState.activeAnimalId];
  if (!data) return;

  ARState.isAudioPlaying = true;
  updateAudioButtonState(true);

  if (data.audio) {
    if (!ARState.audioElement) ARState.audioElement = new Audio();
    ARState.audioElement.src = data.audio;
    ARState.audioElement.play()
      .then(() => { ARState.audioElement.onended = stopAudio; })
      .catch(() => playSpeechNarration(data.narration));
  } else {
    playSpeechNarration(data.narration);
  }
}

function playSpeechNarration(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang  = "id-ID";
  utt.rate  = 0.95;
  utt.pitch = 1.05;
  utt.onend = utt.onerror = stopAudio;
  ARState.currentUtterance = utt;
  window.speechSynthesis.speak(utt);
}

function stopAudio() {
  ARState.isAudioPlaying = false;
  if (ARState.audioElement) {
    ARState.audioElement.pause();
    ARState.audioElement.currentTime = 0;
  }
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  updateAudioButtonState(false);
}

function updateAudioButtonState(playing) {
  const btn = document.getElementById("btn-audio");
  if (!btn) return;
  btn.innerHTML = playing ? "⏸ Hentikan Suara" : "🔊 Putar Penjelasan Suara";
  btn.classList.toggle("playing", playing);
}

function resetAudioButton() { updateAudioButtonState(false); }

// ── Akhiri Sesi (AR-17) ───────────────────────────────────────────────────
function endSession() {
  clearDetectionTimeout();
  stopAudio();

  ARState.isScanning     = false;
  ARState.activeAnimalId = null;

  // Hentikan semua track kamera
  document.querySelectorAll("video").forEach(v => {
    if (v.srcObject) {
      v.srcObject.getTracks().forEach(t => t.stop());
      v.srcObject = null;
    }
    v.remove();
  });

  // Kosongkan scene AR
  const container = document.getElementById("ar-scene-container");
  if (container) container.innerHTML = "";

  // Kembali ke landing
  document.getElementById("ar-screen").classList.add("hidden");
  document.getElementById("sidebar-idle").classList.remove("hidden");
  document.getElementById("sidebar-active").classList.add("hidden");
  document.getElementById("error-screen").classList.add("hidden");
  document.getElementById("landing-screen").classList.remove("hidden");
}

// ── Modal Kartu Marker ────────────────────────────────────────────────────
function openMarkerCardsModal() {
  const m = document.getElementById("marker-modal");
  if (m) m.classList.remove("hidden");
}

function closeMarkerCardsModal() {
  const m = document.getElementById("marker-modal");
  if (m) m.classList.add("hidden");
}
