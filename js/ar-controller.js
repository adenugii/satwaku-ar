/**
 * SatwaKu AR – Controller Utama (3-Kolom Studio Interaktif & SFX Anak)
 */

// Mapping Emoji Satwa
const satwaEmojiMap = {
  animal_01: "🐘",
  animal_02: "🦏",
  animal_03: "🦁",
  animal_04: "🐯",
  animal_05: "🦓",
  animal_06: "🐪",
  animal_07: "🐢",
  animal_08: "🦎",
  animal_09: "🐍",
  animal_10: "🐦",
  animal_11: "🐟",
  animal_12: "🐬"
};

// State Controller
const ARState = {
  activeAnimalId: "animal_01", // Default preview awal
  discoveredSet: new Set(),
  isScanning: false,
  isSpeaking: false,
  detectionTimer: null,
  videoObserver: null,
  // Three.js Preview Studio State
  previewScene: null,
  previewCamera: null,
  previewRenderer: null,
  previewModel: null,
  previewAnimId: null,
  previewAngle: { x: 0.1, y: 0 },
  previewScale: 1,
  previewMaxDim: 1,
  previewInteract: null
};

// ── Inisialisasi saat DOM Siap ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  setupVideoObserver();
  buildDockAnimalList();
  // Set default view satwa pertama (Gajah)
  selectAnimal("animal_01", false);
});

// ── Bangun Dock Navigasi Satwa di Bagian Bawah Layar ────────────────────────
function buildDockAnimalList() {
  const dock = document.getElementById("dock-animal-list");
  if (!dock || typeof satwaData === "undefined") return;

  dock.innerHTML = "";
  Object.values(satwaData).forEach(animal => {
    const card = document.createElement("div");
    card.className = "dock-animal-card";
    card.id = `dock-item-${animal.id}`;
    card.innerHTML = `
      <span class="dock-emoji">${satwaEmojiMap[animal.id] || "🐾"}</span>
      <span class="dock-name">${animal.name}</span>
    `;
    card.addEventListener("click", () => {
      soundMgr.playPop();
      selectAnimal(animal.id, false);
    });
    dock.appendChild(card);
  });
}

// ── Pilih Satwa (Update Studio Kiri, Info Kanan, & Highlight Dock) ──────────
function selectAnimal(animalId, isFromMarker = false) {
  const data = satwaData[animalId];
  if (!data) return;

  ARState.activeAnimalId = animalId;

  // Efek suara jika ditemukan lewat marker AR
  if (isFromMarker) {
    if (!ARState.discoveredSet.has(animalId)) {
      ARState.discoveredSet.add(animalId);
      soundMgr.playDiscoveryFanfare();
      updateDiscoveryBadge();
    } else {
      soundMgr.playPop();
    }
  }

  // Update Highlight Dock Bawah
  document.querySelectorAll(".dock-animal-card").forEach(el => {
    el.classList.toggle("active", el.id === `dock-item-${animalId}`);
  });
  const activeDockItem = document.getElementById(`dock-item-${animalId}`);
  if (activeDockItem) {
    activeDockItem.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  // 1. Update Kolom Kiri (Studio 3D)
  const studioBadge = document.getElementById("studio-animal-badge");
  if (studioBadge) studioBadge.innerText = data.category || "3D Studio";
  updatePreviewModel(data.model);

  // 2. Update Kolom Kanan (Kartu Pengetahuan)
  const avatar = document.getElementById("info-avatar");
  if (avatar) avatar.innerText = satwaEmojiMap[animalId] || "🐾";

  const nameEl = document.getElementById("info-animal-name");
  if (nameEl) nameEl.innerText = data.name;

  const nicknameEl = document.getElementById("info-animal-nickname");
  if (nicknameEl) nicknameEl.innerText = data.nickname || data.name;

  const latinEl = document.getElementById("info-animal-latin");
  if (latinEl) latinEl.innerText = data.latinName;

  const badgeStatus = document.getElementById("info-badge-status");
  if (badgeStatus) badgeStatus.innerText = data.badge;

  const habitatEl = document.getElementById("info-habitat");
  if (habitatEl) habitatEl.innerText = `${data.region} (${data.habitat})`;

  const foodEl = document.getElementById("info-food");
  if (foodEl) foodEl.innerText = `${data.food} [${data.dietType || "Herbivora"}]`;

  const sizeEl = document.getElementById("info-size");
  if (sizeEl) sizeEl.innerText = data.bodySize || "-";

  const superpowerEl = document.getElementById("info-superpower");
  if (superpowerEl) superpowerEl.innerText = data.superpower || data.fact;

  const triviaEl = document.getElementById("info-trivia");
  if (triviaEl) triviaEl.innerText = data.fact;

  // Reset Tombol Narasi Suara
  resetAudioNarrationButton();
}

function updateDiscoveryBadge() {
  const badge = document.getElementById("ar-discovered-count");
  if (badge) {
    badge.innerText = `${ARState.discoveredSet.size} / 12 Satwa`;
  }
}

// ── Putar Suara Khas Hewan ────────────────────────────────────────────────
function playCurrentAnimalSound() {
  soundMgr.playPop();
  if (!ARState.activeAnimalId) return;
  soundMgr.playAnimalRoar(ARState.activeAnimalId);
}

// ── Narasi Suara Anak (Kids Tuned TTS) ─────────────────────────────────────
function toggleAudioNarration() {
  if (ARState.isSpeaking) {
    soundMgr.stopSpeech();
    resetAudioNarrationButton();
    ARState.isSpeaking = false;
  } else {
    const data = satwaData[ARState.activeAnimalId];
    if (!data) return;

    ARState.isSpeaking = true;
    const btn = document.getElementById("btn-audio-narration");
    if (btn) {
      btn.classList.add("speaking");
      btn.innerHTML = `<span>⏹ Berhenti Mendengarkan</span>`;
    }

    soundMgr.speakForKids(data.narration, () => {
      resetAudioNarrationButton();
      ARState.isSpeaking = false;
    });
  }
}

function resetAudioNarrationButton() {
  const btn = document.getElementById("btn-audio-narration");
  if (btn) {
    btn.classList.remove("speaking");
    btn.innerHTML = `<span>📢 Ceritakan Kisah Hewan Ini!</span>`;
  }
}

// ── Inisialisasi & Logika Sesi AR (AR-04 s.d AR-08) ───────────────────────
async function startAR() {
  soundMgr.initContext();
  document.getElementById("landing-screen").classList.add("hidden");
  document.getElementById("error-screen").classList.add("hidden");

  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("getUserMedia tidak didukung browser ini.");
    }

    // Minta izin kamera
    const testStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });
    testStream.getTracks().forEach(t => t.stop());

    // Tampilkan Layar AR 3-Kolom
    document.getElementById("ar-screen").classList.remove("hidden");

    // Injeksi Scene AR.js ke Kolom Tengah
    const container = document.getElementById("ar-scene-container");
    const template = document.getElementById("ar-scene-template");
    container.innerHTML = "";
    container.appendChild(template.content.cloneNode(true));

    ARState.isScanning = true;
    startScanTimer();

    // Pastikan preview canvas aktif
    setTimeout(() => {
      selectAnimal(ARState.activeAnimalId || "animal_01", false);
    }, 200);

    const scene = container.querySelector("a-scene");
    if (scene) {
      const onLoaded = () => {
        registerMarkerEvents();
        fixCameraVideoElements();
      };
      scene.hasLoaded ? onLoaded() : scene.addEventListener("loaded", onLoaded);
    }

    // Monitoring video element
    let attempts = 0;
    const iv = setInterval(() => {
      fixCameraVideoElements();
      if (++attempts > 12) clearInterval(iv);
    }, 400);

  } catch (err) {
    console.error("Gagal start AR:", err);
    showCameraError(err.name || "CameraError");
  }
}

function showCameraError(errorType) {
  let msg = "Izin kamera tidak aktif. Pastikan izin kamera telah disetujui di browser.";
  if (errorType === "NotAllowedError" || errorType === "PermissionDeniedError") {
    msg = "Izin akses kamera ditolak. Tolong izinkan kamera di setelan browser ya!";
  } else if (errorType === "NotFoundError") {
    msg = "Kamera tidak ditemukan di perangkat ini.";
  }
  document.getElementById("error-msg").innerText = msg;
  document.getElementById("landing-screen").classList.add("hidden");
  document.getElementById("error-screen").classList.remove("hidden");
}

function endSession() {
  soundMgr.stopSpeech();
  ARState.isScanning = false;

  // Matikan track kamera
  document.querySelectorAll("video").forEach(v => {
    if (v.srcObject) {
      v.srcObject.getTracks().forEach(t => t.stop());
      v.srcObject = null;
    }
    v.remove();
  });

  const container = document.getElementById("ar-scene-container");
  if (container) container.innerHTML = "";

  document.getElementById("ar-screen").classList.add("hidden");
  document.getElementById("landing-screen").classList.remove("hidden");
}

// ── Pendaftaran Event Marker AR ──────────────────────────────────────────
function registerMarkerEvents() {
  const container = document.getElementById("ar-scene-container");
  if (!container) return;

  container.querySelectorAll("a-marker").forEach(marker => {
    const animalId = marker.getAttribute("data-satwa-id");
    if (!animalId) return;

    marker.addEventListener("markerFound", () => {
      updateScanStatus(`✨ Kartu ${satwaData[animalId]?.name || "Satwa"} Terdeteksi!`, "🎉");
      selectAnimal(animalId, true);
    });

    marker.addEventListener("markerLost", () => {
      updateScanStatus("Arahkan kamera ke kartu satwa...", "🔍");
    });
  });
}

function updateScanStatus(text, icon = "🔍") {
  const textEl = document.getElementById("scan-status-text");
  const iconEl = document.getElementById("scan-status-icon");
  if (textEl) textEl.innerText = text;
  if (iconEl) iconEl.innerText = icon;
}

function startScanTimer() {
  if (ARState.detectionTimer) clearTimeout(ARState.detectionTimer);
  ARState.detectionTimer = setTimeout(() => {
    if (ARState.isScanning && ARState.discoveredSet.size === 0) {
      updateScanStatus("Belum terdeteksi? Pastikan pencahayaan cukup ya!", "💡");
    }
  }, 10000);
}

// ── Penyesuaian Elemen Video Kamera di Kolom Tengah ───────────────────────
function setupVideoObserver() {
  if (ARState.videoObserver) return;
  ARState.videoObserver = new MutationObserver(fixCameraVideoElements);
  ARState.videoObserver.observe(document.body, { childList: true, subtree: true });
}

function fixCameraVideoElements() {
  const colCamera = document.getElementById("col-camera-ar");
  document.querySelectorAll("video").forEach(video => {
    if (!video.hasAttribute("playsinline")) {
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.setAttribute("autoplay", "");
      video.muted = true;
    }
    // Hapus inline width/height/margin/top/left yang sering diinjeksi AR.js secara otomatis
    video.style.marginLeft = "0px";
    video.style.marginTop = "0px";
    video.style.top = "50%";
    video.style.left = "50%";
    video.style.transform = "translate(-50%, -50%)";
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "cover";

    if (colCamera && video.parentElement !== colCamera) {
      colCamera.appendChild(video);
    }
  });

  // Pastikan canvas a-scene juga mengikuti ukuran container col-camera-ar
  if (colCamera) {
    const canvas = colCamera.querySelector(".a-canvas");
    if (canvas) {
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.top = "0px";
      canvas.style.left = "0px";
    }
  }
}

// ── Mini Studio 3D Interaktif (Three.js Engine) ───────────────────────────
function initPreview3D() {
  const canvas = document.getElementById("preview-3d-canvas");
  if (!canvas || ARState.previewRenderer || typeof THREE === "undefined") return;

  const wrapper = document.getElementById("preview-canvas-wrapper");
  const width = wrapper ? wrapper.clientWidth : 300;
  const height = wrapper ? wrapper.clientHeight : 220;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  // Kamera diarahkan agak rendah dan memandang ke atas objek agar model berada di tengah atas
  camera.position.set(0, 0.8, 2.7);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  // Tata Cahaya Lembut & Cerah
  const ambient = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambient);
  const dir1 = new THREE.DirectionalLight(0xfffdf5, 1.4);
  dir1.position.set(2, 4, 2);
  scene.add(dir1);
  const dir2 = new THREE.DirectionalLight(0xe0f2fe, 0.7);
  dir2.position.set(-2, 2, -1);
  scene.add(dir2);

  ARState.previewScene = scene;
  ARState.previewCamera = camera;
  ARState.previewRenderer = renderer;

  // Loop Render & Rotasi Otomatis yang Lebih Lambat dan Tenang (Kecepatan dikurangi dari 0.012 menjadi 0.0035)
  function animate() {
    ARState.previewAnimId = requestAnimationFrame(animate);
    if (ARState.previewModel && !(ARState.previewInteract && ARState.previewInteract.dragging)) {
      ARState.previewModel.rotation.y += 0.0035;
    }
    renderer.render(scene, camera);
  }
  animate();

  attachPreviewInteraction();

  // Resize listener
  window.addEventListener("resize", () => {
    if (!ARState.previewRenderer || !wrapper) return;
    const w = wrapper.clientWidth;
    const h = wrapper.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  });
}

function updatePreviewModel(modelSrc) {
  if (!modelSrc) return;
  initPreview3D();
  if (!ARState.previewScene || typeof THREE === "undefined") return;

  if (ARState.previewModel) {
    ARState.previewScene.remove(ARState.previewModel);
    ARState.previewModel = null;
  }

  const loader = new THREE.GLTFLoader();
  loader.load(
    modelSrc,
    gltf => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      // Pusatkan objek di X dan Z
      model.position.x = -center.x;
      model.position.y = -center.y; // Centered vertical pivot
      model.position.z = -center.z;

      const group = new THREE.Group();
      group.add(model);

      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      ARState.previewMaxDim = maxDim;
      const baseScale = 1.3 / maxDim;
      group.scale.setScalar(baseScale * (ARState.previewScale || 1));
      
      // Naikkan posisi model lebih tinggi ke atas lagi (Y = 0.50)
      group.position.set(0, 0.90, 0);

      // Tingkatkan kecerahan material
      model.traverse(node => {
        if (node.isMesh && node.material) {
          const mats = Array.isArray(node.material) ? node.material : [node.material];
          mats.forEach(m => {
            if (m.isMeshStandardMaterial || m.isMeshPhysicalMaterial) {
              m.roughness = 0.5;
              m.metalness = 0.0;
            }
          });
        }
      });

      ARState.previewModel = group;
      ARState.previewScene.add(group);
      applyModelRotation();
    },
    undefined,
    err => console.warn("Model preview load error:", err)
  );
}

// ── Interaksi Drag & Touch pada Model 3D Studio ────────────────────────────
function attachPreviewInteraction() {
  const canvas = document.getElementById("preview-3d-canvas");
  if (!canvas || ARState.previewInteract) return;

  const s = { dragging: false, lastX: 0, lastY: 0 };
  ARState.previewInteract = s;

  canvas.addEventListener("pointerdown", e => {
    s.dragging = true;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
  });

  window.addEventListener("pointermove", e => {
    if (!s.dragging || !ARState.previewModel) return;
    const dx = e.clientX - s.lastX;
    const dy = e.clientY - s.lastY;
    ARState.previewAngle.y += dx * 0.008;
    ARState.previewAngle.x += dy * 0.008;
    applyModelRotation();
    s.lastX = e.clientX;
    s.lastY = e.clientY;
  });

  window.addEventListener("pointerup", () => {
    s.dragging = false;
  });
}

function applyModelRotation() {
  if (!ARState.previewModel) return;
  ARState.previewModel.rotation.set(ARState.previewAngle.x, ARState.previewAngle.y, 0);
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
