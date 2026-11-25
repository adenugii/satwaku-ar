# Project Context: SatwaKu AR (WebAR Educational Flashcards)

## 1. Project Overview & Architecture

**Project Name:** SatwaKu AR  
**Goal:** Develop a web-based Augmented Reality educational flashcard application introducing 12 Indonesian wildlife species to elementary school children (ages 6–12).

**Platform:** Web application (no app installation required).

**Tech Stack:**
- HTML5
- CSS3
- JavaScript (ES6+)
- A-Frame
- AR.js (or MindAR for custom image tracking)
- GLB / glTF 3D models

**3D Asset Requirements:**
- All animal models must use `.glb` format.
- Prefer low-poly or optimized models suitable for mobile browsers.
- Models should maintain recognizable biological characteristics of their respective species.
- Prioritize authentic, species-specific models over generic animal models.
- AI-generated models are acceptable when authentic free models are unavailable.
- Model file locations must be managed separately in the project implementation. Do not hardcode or document individual 3D model file paths in this project context.
- Models should be optimized for mobile performance, loading speed, and WebAR rendering.

**Important Scope Rules:**
- This is an educational AR flashcard application.
- DO NOT include any quiz, examination, or scoring feature. Quizzes belong exclusively to the separate VR project.
- Focus on animal visualization, educational information, conservation awareness, and audio narration.

---

## 2. Target Animals (12 Registered Markers)

The application introduces 12 Indonesian wildlife species representing different regions of Indonesia.

Each animal must have:
- One registered AR marker.
- One corresponding `.glb` 3D model.
- One audio narration file (`.mp3`).
- Educational metadata.
- A unique educational fact.

### Sumatra

**1. Gajah Sumatera**
- Scientific Name: *Elephas maximus sumatranus*
- Region: Sumatra
- Marker ID: 0

**2. Badak Sumatera**
- Scientific Name: *Dicerorhinus sumatrensis*
- Region: Sumatra
- Marker ID: 1

**3. Orangutan Sumatera**
- Scientific Name: *Pongo abelii*
- Region: Sumatra
- Marker ID: 2

**4. Harimau Sumatera**
- Scientific Name: *Panthera tigris sumatrae*
- Region: Sumatra
- Marker ID: 3

### Java and Bali

**5. Badak Jawa**
- Scientific Name: *Rhinoceros sondaicus*
- Region: Java
- Marker ID: 4

**6. Macan Tutul Jawa**
- Scientific Name: *Panthera pardus melas*
- Region: Java
- Marker ID: 5

**7. Jalak Bali**
- Scientific Name: *Leucopsar rothschildi*
- Region: Bali
- Marker ID: 6

### Kalimantan

**8. Orangutan Kalimantan**
- Scientific Name: *Pongo pygmaeus*
- Region: Kalimantan
- Marker ID: 7

**9. Bekantan**
- Scientific Name: *Nasalis larvatus*
- Region: Kalimantan
- Marker ID: 8

### Sulawesi

**10. Anoa Dataran Rendah**
- Scientific Name: *Bubalus depressicornis*
- Region: Sulawesi
- Marker ID: 9

**11. Babirusa Sulawesi**
- Scientific Name: *Babyrousa celebensis*
- Region: Sulawesi
- Marker ID: 10

**12. Tarsius Sulawesi**
- Scientific Name: *Tarsius tarsier*
- Region: Sulawesi
- Marker ID: 11

**Note:** Conservation status must be verified using reliable and up-to-date sources, such as the IUCN Red List and relevant Indonesian conservation authorities. Do not assume every listed species has the same conservation status.

---

## 3. Core Functional Requirements (AR-01 to AR-17)

### Landing Screen (AR-01 to AR-03)

- AR-01: Display the application title "SatwaKu AR".
- AR-02: Display three simple instructions:
  1. Allow camera access.
  2. Point the camera at an animal card.
  3. Tap the audio button to hear information about the animal.
- AR-03: Provide a prominent "Mulai AR" button.

### Camera Initialization & Error Handling (AR-04 to AR-08)

- AR-04: Request camera permission when the user clicks "Mulai AR".
- AR-05: Handle camera permission denial with a clear and child-friendly error message.
- AR-06: Handle camera hardware or initialization failures.
- AR-07: Provide a "Coba Lagi" button when camera initialization fails.
- AR-08: Provide a "Kembali" button to return to the landing screen.

### Marker Detection & 3D Rendering (AR-09 to AR-11)

- AR-09: Detect all 12 registered animal markers.
- AR-10: Display the corresponding low-poly `.glb` 3D animal model above its detected card.
- AR-11: Ensure smooth positioning, appropriate scaling, and stable rendering of 3D models.

### Educational Information Overlay (AR-12)

Display a clean, child-friendly information card containing:

- Animal Name (Indonesian).
- Scientific Name.
- Region / Distribution.
- Habitat.
- Food / Diet.
- Conservation Status.
- Unique Fact (Fakta Unik).

Information must be accurate, concise, and understandable for children aged 6–12.

### Audio Narration (AR-13)

- AR-13: Provide a manual audio button with the labels "Putar Suara" and "Hentikan Suara".
- Never autoplay audio.
- Audio must only play following explicit user interaction.
- Stop the previous narration when another animal marker is detected.

### Marker Lost Handling (AR-14)

- AR-14: When the `markerLost` event occurs:
  - Hide the corresponding 3D model.
  - Hide the animal information panel.
  - Stop currently playing audio.
  - Display the prompt: "Arahkan kamera kembali ke kartu".

### Scanning Timeout & Guidance (AR-15)

- AR-15: If no registered marker is detected within 10 seconds of scanning, display helpful guidance.

Suggested message:

"Belum menemukan kartu satwa. Coba atur posisi kartu, jarak kamera, atau pencahayaan."

### Marker Switching (AR-16)

- AR-16: When a different registered animal card is detected:
  - Immediately switch to its corresponding 3D model.
  - Update the educational information card.
  - Stop the previous animal's audio narration.
  - Play no audio automatically.

### End AR Session (AR-17)

- AR-17: Provide a "Kembali" or "Akhiri Sesi" button.
- Stop all currently playing audio.
- Stop camera tracks and release the camera stream when supported.
- Remove or clean up AR resources where necessary.
- Return to the landing screen.

---

## 4. Data Management & Coding Conventions

All 12 animal profiles must be centrally managed through:

`js/satwa-data.js`

Each animal profile should contain:

- Unique ID.
- Indonesian name.
- Scientific name.
- Region / distribution.
- Habitat.
- Diet.
- Conservation status.
- Unique educational fact.
- 3D model asset reference.
- Audio asset reference.
- Model scale configuration.
- Marker configuration.

**Important:**
- Keep animal data separate from AR rendering logic.
- Do not duplicate animal metadata across different JavaScript files.
- Keep model asset references configurable and managed independently from this project context.
- Do not assume all animal models have identical dimensions or scaling requirements.
- Ensure marker IDs remain consistent with the animal profiles.

### Coding Conventions

- Use modular and maintainable JavaScript.
- Use descriptive variable and function names.
- Avoid unnecessary dependencies.
- Implement proper error handling.
- Optimize 3D model loading and memory management.
- Ensure responsive layouts for mobile devices.
- Use large, high-contrast, child-friendly UI buttons.

---

## 5. Browser Compatibility & Performance

Target browsers:
- Android Chrome.
- iOS Safari.

Requirements:
- Use `playsinline` for the underlying camera video element.
- Use appropriate `autoplay` and `muted` attributes for camera video initialization.
- Ensure camera access works through HTTPS or localhost.
- Never autoplay animal narration.
- Optimize GLB models and textures for mobile devices.
- Avoid unnecessary rendering and resource consumption.
- Ensure the application remains responsive on mid-range smartphones.

---

## 6. Educational Content Guidelines

The primary audience is elementary school children aged 6–12.

All educational information must:
- Use simple and understandable Indonesian.
- Avoid excessively technical explanations.
- Provide interesting and memorable facts.
- Explain why each animal is important to its ecosystem.
- Encourage wildlife protection and conservation awareness.
- Use reliable sources for scientific names, habitats, diets, and conservation status.

Suggested references:
- IUCN Red List.
- WWF Indonesia.
- Indonesian Ministry of Forestry / relevant conservation authorities.
- Reputable zoological and biodiversity publications.

Do not invent scientific facts, population numbers, or conservation classifications.

---

## 7. Project Scope & Development Priorities

Development should be performed incrementally.

**Priority 1:**
- Landing screen.
- Camera initialization.
- Basic marker detection.
- One working 3D animal model.

**Priority 2:**
- Register all 12 animal markers.
- Integrate all 12 GLB models.
- Implement educational information overlays.

**Priority 3:**
- Audio narration.
- Marker switching.
- Marker lost handling.
- Scanning timeout guidance.

**Priority 4:**
- Mobile compatibility testing.
- Performance optimization.
- UI/UX refinement.
- Full application testing.

**Final Objective:**

Deliver a lightweight, accessible, and interactive WebAR educational application that allows children to scan printed animal cards and explore 12 Indonesian wildlife species through 3D visualization, educational information, and manually activated audio narration.

The application must work directly in a mobile browser without requiring users to install a dedicated application.