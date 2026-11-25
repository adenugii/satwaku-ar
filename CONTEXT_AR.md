# Project Context: SatwaKu AR (WebAR Educational Flashcards)

## 1. Project Overview & Architecture

**Project Name:** SatwaKu AR

**Goal:** Develop a web-based Augmented Reality educational flashcard application that introduces 12 animals to elementary school children (ages 6–12).

The application organizes animals into three categories:
1. Hewan Peliharaan (Pets).
2. Hewan Ternak (Farm Animals).
3. Hewan Liar (Wild Animals).

**Platform:** Web application (no app installation required).

**Tech Stack:**
- HTML5
- CSS3
- JavaScript (ES6+)
- A-Frame
- AR.js (or MindAR for custom image tracking)
- GLB / glTF 3D models
- Browser-based Text-to-Speech integration

**3D Asset Requirements:**
- All animal models must use `.glb` format.
- Prefer low-poly or optimized models suitable for mobile browsers.
- Models should maintain recognizable biological characteristics of their respective animals.
- Prioritize authentic, animal-specific models over generic animal models.
- AI-generated models are acceptable when suitable free models are unavailable.
- Model file locations must be managed separately in the project implementation. Do not hardcode or document individual 3D model file paths in this project context.
- Models should be optimized for mobile performance, loading speed, and WebAR rendering.
- Each animal may require an individually configured model scale.

**Important Scope Rules:**
- This is an educational AR flashcard application.
- DO NOT include any quiz, examination, or scoring feature. Quizzes belong exclusively to the separate VR project.
- Focus on animal visualization, educational information, conservation awareness, and interactive audio narration.
- The application must remain lightweight and accessible through mobile browsers.

---

## 2. Animal Categories & Registered Animals (12 Animals)

The application introduces 12 animals organized into three categories.

### Category A: Hewan Peliharaan (Pets)

**Total: 3 Animals**

1. **Kucing** — `animal_01`
2. **Anjing** — `animal_02`
3. **Kelinci** — `animal_03`

### Category B: Hewan Ternak (Farm Animals)

**Total: 4 Animals**

4. **Sapi** — `animal_04`
5. **Ayam** — `animal_05`
6. **Kambing** — `animal_06`
7. **Bebek** — `animal_07`

### Category C: Hewan Liar (Wild Animals)

**Total: 5 Animals**

8. **Gajah** — `animal_08`
9. **Singa** — `animal_09`
10. **Jerapah** — `animal_10`
11. **Harimau** — `animal_11`
12. **Monyet** — `animal_12`

**Animal Registration Requirements:**
- Each animal must have one registered AR marker.
- Each animal must have one corresponding `.glb` 3D model.
- Each animal must have one corresponding educational narration generated through the integrated TTS system.
- Each animal must have educational metadata.
- Each animal must have a unique educational fact.
- All 12 animals must be centrally managed through `js/satwa-data.js`.

**Marker Configuration:**
- The application requires 12 registered markers.
- Marker IDs must use barcode IDs 0–11.
- Marker IDs must remain consistent with the corresponding animal profiles.
- The previous animal-to-marker mapping is superseded by the updated animal list.
- New marker assignments must follow the updated animal ordering and be verified during implementation.

**Important:** The category overview UI should display the three categories separately, following the supplied "Meet the Animals" design reference.

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
- Category (Pets, Farm Animals, or Wild Animals).
- Region / Distribution.
- Habitat.
- Food / Diet.
- Conservation Status.
- Unique Fact (Fakta Unik).

Information must be accurate, concise, and understandable for children aged 6–12.

For domestic and farm animals, conservation status should be handled appropriately. Do not assign an IUCN conservation classification to a domestic animal without a valid basis.

### Audio Narration / Text-to-Speech (AR-13)

**AR-13: Implement integrated Text-to-Speech directly in the web application.**

The TTS implementation must follow these requirements:

**Primary Requirements:**
- Use direct TTS integration instead of generating all animal narration as MP3 files beforehand.
- TTS must generate spoken narration from the educational text associated with each animal.
- The primary language is Indonesian (`id-ID`).
- Prioritize natural, fluent, expressive female voices.
- The voice should sound friendly, warm, cheerful, and suitable for children aged 6–12.
- Narration should use a storytelling style, similar to a friendly female teacher or older sister explaining animals to children.
- Avoid robotic, monotonous, or excessively fast speech.
- Support appropriate speaking speed, pitch, and natural pauses when available.
- Prefer completely free technologies without paid API subscriptions or mandatory usage fees.

**Technology Selection:**
- The current implementation uses the browser's Web Speech API (`window.speechSynthesis`).
- Alternative TTS technologies may be evaluated if they provide better naturalness and Indonesian female voices.
- Candidate technologies must be evaluated for:
  - Indonesian language support.
  - Female neural voice availability.
  - Naturalness and storytelling quality.
  - Free usage conditions.
  - Browser compatibility.
  - Mobile compatibility, especially Android Chrome and iOS Safari.
  - API restrictions, licensing, and long-term availability.
- Do not assume that Edge TTS, ArboTTS, or any other candidate has been selected as the final technology.
- Do not require pre-generated MP3 files as the primary narration architecture.
- Avoid paid TTS services unless explicitly approved.

**Audio Interaction Requirements:**
- Provide a manual audio button with the labels:
  - "Putar Suara"
  - "Hentikan Suara"
- Never autoplay narration.
- Audio must only play following explicit user interaction.
- Stop the previous narration when another animal marker is detected.
- Stop narration when the current marker is lost.
- Handle TTS errors and unsupported browser environments gracefully.
- Ensure the audio button reflects the current playback state.

**Important:** Browser TTS voices may differ between devices and operating systems. The implementation must select the best available Indonesian female voice when possible and provide a graceful fallback if that voice is unavailable.

### Marker Lost Handling (AR-14)

When the `markerLost` event occurs:

- Hide the corresponding 3D model.
- Hide the animal information panel.
- Stop currently playing narration.
- Display the prompt: "Arahkan kamera kembali ke kartu".

### Scanning Timeout & Guidance (AR-15)

If no registered marker is detected within 10 seconds of scanning, display helpful guidance.

Suggested message:

"Belum menemukan kartu satwa. Coba atur posisi kartu, jarak kamera, atau pencahayaan."

### Marker Switching (AR-16)

When a different registered animal card is detected:

- Immediately switch to its corresponding 3D model.
- Update the educational information card.
- Stop the previous animal's narration.
- Play no audio automatically.

### End AR Session (AR-17)

Provide a "Kembali" or "Akhiri Sesi" button.

When the user ends the AR session:

- Stop all currently playing narration.
- Cancel pending TTS speech where supported.
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
- Category.
- Region / distribution.
- Habitat.
- Diet.
- Conservation status.
- Unique educational fact.
- 3D model asset reference.
- Model scale configuration.
- Marker configuration.
- Narration text for TTS.

**Important:**
- Keep animal data separate from AR rendering logic.
- Do not duplicate animal metadata across different JavaScript files.
- Keep model asset references configurable and managed independently.
- Do not hardcode individual model paths throughout the application.
- Ensure marker IDs remain consistent with the animal profiles.
- Use a consistent data structure for all 12 animals.
- Keep narration text separate from the TTS playback implementation.
- Do not store unnecessary generated MP3 files when using direct TTS integration.

**Suggested Data Structure:**

```javascript
{
  id: "animal_01",
  name: "Kucing",
  scientificName: "Felis catus",
  category: "peliharaan",

  region: "...",
  habitat: "...",
  diet: "...",
  conservationStatus: "...",
  uniqueFact: "...",

  narration: "...",

  model: {
    src: "...",
    scale: "..."
  },

  marker: {
    type: "barcode",
    value: 0
  }
}
```

The example above is illustrative. Scientific information, model references, and marker configuration must be verified and completed during implementation.

**Coding Conventions:**
- Use modular and maintainable JavaScript.
- Use descriptive variable and function names.
- Avoid unnecessary dependencies.
- Implement proper error handling.
- Optimize 3D model loading and memory management.
- Ensure responsive layouts for mobile devices.
- Use large, high-contrast, child-friendly UI buttons.
- Separate TTS logic into a dedicated module when appropriate.
- Prevent multiple overlapping TTS instances.
- Clean up speech synthesis resources when switching animals or ending an AR session.

---

## 5. Browser Compatibility & Performance

**Target Browsers:**
- Android Chrome.
- iOS Safari.

**Requirements:**
- Use `playsinline` for the underlying camera video element.
- Use appropriate `autoplay` and `muted` attributes for camera video initialization.
- Ensure camera access works through HTTPS or localhost.
- Never autoplay animal narration.
- Optimize GLB models and textures for mobile devices.
- Avoid unnecessary rendering and resource consumption.
- Ensure the application remains responsive on mid-range smartphones.
- Check browser-specific Web Speech API support.
- Handle differences in available TTS voices between devices.
- Use `speechSynthesis.getVoices()` to retrieve available voices where supported.
- Handle asynchronous voice loading using `voiceschanged` where necessary.
- Provide a fallback message if TTS is unavailable.
- Ensure camera rendering and audio narration can work together without blocking the AR experience.

---

## 6. Educational Content Guidelines

The primary audience is elementary school children aged 6–12.

All educational information must:

- Use simple and understandable Indonesian.
- Avoid excessively technical explanations.
- Provide interesting and memorable facts.
- Explain why each animal is important to its ecosystem or human life.
- Encourage animal welfare, wildlife protection, and conservation awareness.
- Use reliable sources for scientific names, habitats, diets, and conservation status.
- Avoid inventing scientific facts, population numbers, or conservation classifications.

**Narration Guidelines:**

The narration should sound like a friendly storyteller speaking directly to children.

Recommended characteristics:
- Warm and cheerful female voice.
- Natural Indonesian pronunciation.
- Moderate speaking speed.
- Short and easy-to-understand sentences.
- Appropriate pauses between sentences.
- Interesting expressions such as "Tahukah kalian?", "Wah, menarik sekali!", and "Hebat, ya!".
- Avoid overly formal or textbook-like language.
- Avoid excessive exclamation marks and unnatural pitch adjustments.

**Suggested Narration Structure:**

1. Friendly greeting and animal introduction.
2. Brief explanation of physical characteristics.
3. Habitat and food.
4. One interesting educational fact.
5. Short message about animal protection or conservation.

Narration must remain concise and suitable for children aged 6–12.

**Suggested References:**
- IUCN Red List.
- WWF Indonesia.
- Indonesian Ministry of Forestry / relevant conservation authorities.
- Reputable zoological and biodiversity publications.

---

## 7. UI/UX Design Guidelines

The application must use a child-friendly and accessible visual design.

**Category Overview Section:**

The application introduces three animal categories:

1. Hewan Peliharaan.
2. Hewan Ternak.
3. Hewan Liar.

The category overview should follow the supplied "Meet the Animals" visual reference.

**Design Characteristics:**
- Friendly and playful visual appearance.
- Soft pastel colors.
- Clear typography.
- Large animal images.
- Rounded visual elements.
- Simple navigation.
- Responsive layout for mobile and desktop.
- Easy-to-understand labels and instructions.

**Important:**
- Each category must display its corresponding animal list.
- Animal names must match the centrally managed animal data.
- Avoid unnecessary UI complexity.
- Prioritize accessibility and usability for elementary school children.

---

## 8. Project Scope & Development Priorities

Development should be performed incrementally.

### Priority 1: Core Application

- Landing screen.
- Category overview for three animal categories.
- Camera initialization.
- Basic marker detection.
- One working 3D animal model.
- Basic educational information overlay.

### Priority 2: Complete Animal Registration

- Register all 12 animal markers.
- Integrate all 12 GLB models.
- Configure individual model scales.
- Complete all animal metadata.
- Implement category-based animal organization.

### Priority 3: Audio Narration & AR Interaction

- Integrate direct Text-to-Speech into the web application.
- Evaluate and select the best free Indonesian female voice.
- Implement storytelling-style narration.
- Implement manual play and stop controls.
- Implement marker switching.
- Implement marker lost handling.
- Implement scanning timeout guidance.
- Handle TTS errors and unsupported browsers.

### Priority 4: Mobile Compatibility & Optimization

- Test Android Chrome.
- Test iOS Safari.
- Verify camera permissions and initialization.
- Test TTS voice availability across devices.
- Optimize 3D model loading and rendering.
- Optimize memory consumption.
- Refine UI/UX.
- Perform full application testing.

---

## 9. Important Development Constraints

1. Do not introduce quiz, examination, or scoring features.
2. Do not change the three animal categories or the 12 registered animal names without explicit approval.
3. Do not reuse the previous animal list.
4. Do not assume the old marker mapping remains valid.
5. Keep all animal profiles centrally managed in `js/satwa-data.js`.
6. Do not duplicate animal metadata.
7. Do not hardcode individual model paths in unrelated modules.
8. Do not autoplay audio.
9. Do not make pre-generated MP3 files the primary TTS architecture.
10. Prioritize free, natural Indonesian female TTS solutions.
11. Do not introduce paid APIs without approval.
12. Preserve existing functional requirements when modifying the implementation.
13. Avoid unnecessary dependencies and architectural complexity.
14. Verify scientific information rather than inventing missing data.
15. Ensure the application remains compatible with mobile browsers.

---

## 10. Final Objective

Deliver a lightweight, accessible, and interactive WebAR educational application that allows elementary school children to explore 12 animals organized into three categories:

- Hewan Peliharaan.
- Hewan Ternak.
- Hewan Liar.

Children can scan printed animal cards and explore corresponding 3D animal models, discover educational information, learn interesting animal facts, and listen to natural Indonesian female storytelling narration through an integrated Text-to-Speech system.

The application must:

- Work directly in a mobile browser without requiring users to install a dedicated application.
- Support Android Chrome and iOS Safari.
- Provide an engaging and child-friendly learning experience.
- Use optimized GLB models.
- Maintain accurate educational information.
- Provide manually activated audio narration.
- Prefer completely free TTS technology.
- Promote animal awareness, welfare, and conservation.

**The final application should feel like an interactive animal exploration experience accompanied by a friendly storyteller, rather than a conventional digital encyclopedia.**