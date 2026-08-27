(function () {
    "use strict";

    const EFFECTS_ENABLED_KEY = "maVisualEffectsEnabled";
    const EFFECTS_INTENSITY_KEY = "maVisualEffectIntensity";
    const EFFECTS_SELECTIONS_KEY = "maVisualEffectSelections";
    const EFFECTS_PROFILE_KEY = "maVisualEffectsProfileV1";
    const WINDOW_PROFILE_PREFIX = "MA_IT_SERVICES_VFX:";
    const VALID_INTENSITIES = new Set(["gentle", "balanced", "cinematic"]);

    function namesFromLines(value) {
        return value
            .trim()
            .split("\n")
            .map((name) => name.trim())
            .filter(Boolean);
    }

    const CATEGORY_DEFINITIONS = Object.freeze([
        {
            id: "background",
            label: "Background Atmosphere",
            shortLabel: "Backgrounds",
            icon: "fa-solid fa-cloud",
            description: "Animated colour and light across the page background.",
            names: namesFromLines(`
                Aurora Drift
                Nebula Flow
                Cyber Mesh
                Violet Horizon
                Blue Pulse
                Cyan Bloom
                Midnight Waves
                Prism Fog
                Cosmic Veil
                Digital Dawn
                Electric Clouds
                Sapphire Tide
                Lavender Orbit
                Neon Dusk
                Arctic Glow
                Indigo Storm
                Pixel Sky
                Gradient Halo
                Quantum Haze
                Starlight Wash
            `)
        },
        {
            id: "particles",
            label: "Ambient Particles",
            shortLabel: "Particles",
            icon: "fa-solid fa-wand-sparkles",
            description: "Lightweight floating details behind the website content.",
            names: namesFromLines(`
                Floating Dots
                Rising Sparks
                Soft Bubbles
                Digital Dust
                Star Drift
                Neon Orbs
                Fireflies
                Snow Pixels
                Circuit Specks
                Comet Trails
                Pulse Beads
                Matrix Rain
                Cosmic Seeds
                Tech Fire
                Micro Lights
                Orbit Points
                Aurora Dust
                Energy Drops
                Data Stream
                Galaxy Flecks
            `)
        },
        {
            id: "cards",
            label: "Cards & Panels",
            shortLabel: "Cards",
            icon: "fa-regular fa-rectangle-list",
            description: "Hover motion, depth, borders and shine for content cards.",
            names: namesFromLines(`
                Lift
                Tilt
                Magnetic Rise
                Soft Zoom
                Neon Outline
                Glass Shine
                Shadow Bloom
                Border Sweep
                Pulse Lift
                Gentle Float
                Hologram Tilt
                Cyan Edge
                Purple Edge
                Blue Edge
                3D Press
                Corner Glow
                Gradient Slide
                Elastic Hover
                Spotlight
                Tech Scan
            `)
        },
        {
            id: "buttons",
            label: "Buttons & Actions",
            shortLabel: "Buttons",
            icon: "fa-solid fa-toggle-on",
            description: "Interactive motion and highlights for buttons and calls to action.",
            names: namesFromLines(`
                Glow Lift
                Shine Sweep
                Pulse Ring
                Magnetic Pop
                Gradient Shift
                Neon Border
                Soft Bounce
                Ripple Glow
                Laser Sweep
                Shadow Drop
                Scale Snap
                Light Trail
                Border Draw
                Inner Glow
                Prism Flash
                Electric Pulse
                Glass Pop
                Arrow Nudge
                Fill Slide
                Tech Flicker
            `)
        },
        {
            id: "text",
            label: "Headings & Text",
            shortLabel: "Text",
            icon: "fa-solid fa-font",
            description: "Gradient, glow and motion treatments for important headings.",
            names: namesFromLines(`
                Gradient Flow
                Neon Glow
                Soft Shadow
                Letter Bloom
                Cyber Flicker
                Shimmer Wave
                Aurora Text
                Purple Pulse
                Blue Pulse
                Cyan Pulse
                Focus Expand
                Hologram
                Underline Sweep
                Edge Light
                Type Glow
                Spectrum Shift
                Crisp Emboss
                Floating Title
                Digital Scan
                Starlight
            `)
        },
        {
            id: "images",
            label: "Images & Products",
            shortLabel: "Images",
            icon: "fa-regular fa-image",
            description: "Polished hover movement, colour and framing for website images.",
            names: namesFromLines(`
                Soft Zoom
                Ken Burns
                Tilt Right
                Tilt Left
                Neon Frame
                Colour Boost
                Cool Tone
                Warm Tone
                Monochrome Reveal
                Sharp Focus
                Glow Bloom
                Float
                Perspective
                Border Pulse
                Hologram
                Scanline
                Spotlight
                Saturation Pop
                Glass Frame
                Deep Shadow
            `)
        },
        {
            id: "sections",
            label: "Section Reveals",
            shortLabel: "Reveals",
            icon: "fa-solid fa-layer-group",
            description: "Entrance animation used when a website section reaches the screen.",
            names: namesFromLines(`
                Fade Up
                Fade Down
                Fade Left
                Fade Right
                Zoom In
                Zoom Out
                Blur In
                Rotate In
                Flip Up
                Flip Left
                Slide Spring
                Soft Rise
                Dramatic Rise
                Scale Fade
                Skew Reveal
                Perspective Rise
                Bounce In
                Glide In
                Glow Reveal
                Curtain Reveal
            `)
        },
        {
            id: "navigation",
            label: "Navigation Motion",
            shortLabel: "Navigation",
            icon: "fa-solid fa-bars-staggered",
            description: "Hover and active-state treatments for menus and Settings navigation.",
            names: namesFromLines(`
                Underline Sweep
                Glow Link
                Pill Hover
                Neon Bar
                Dot Tracker
                Soft Lift
                Letter Space
                Gradient Text
                Border Bottom
                Halo Hover
                Slide Fill
                Corner Marker
                Tech Bracket
                Pulse Link
                Blur Focus
                Electric Line
                Floating Tab
                Glass Tab
                Cyan Beam
                Active Beacon
            `)
        },
        {
            id: "cursor",
            label: "Cursor Aura",
            shortLabel: "Cursor",
            icon: "fa-solid fa-arrow-pointer",
            description: "A desktop pointer-following light that never blocks clicks.",
            names: namesFromLines(`
                Soft Aura
                Purple Halo
                Blue Halo
                Cyan Halo
                Large Bloom
                Compact Beam
                Neon Ring
                Prism Aura
                Comet Tail
                Spotlight
                Soft Dot
                Electric Core
                Aurora Halo
                Galaxy Aura
                Tech Lens
                Dual Ring
                Pulse Lens
                Crystal Glow
                Midnight Aura
                Bright Focus
            `)
        },
        {
            id: "accents",
            label: "Interface Accents",
            shortLabel: "Accents",
            icon: "fa-solid fa-bolt",
            description: "Progress, focus, scrollbar and utility-control highlights.",
            names: namesFromLines(`
                Scrollline Glow
                Progress Pulse
                Gradient Tracker
                Neon Focus
                Soft Focus
                Border Spark
                Icon Glow
                Form Halo
                Top Button Pulse
                Loader Beam
                Selection Tint
                Divider Glow
                Badge Pulse
                Contact Glow
                Footer Aurora
                Lightbox Frame
                Active Section Glow
                Focus Ring
                Scrollbar Shine
                Universal Halo
            `)
        }
    ]);

    function createVariables(categoryId, index) {
        const mode = (index % 5) + 1;
        const strength = Math.floor(index / 5) + 1;
        const duration = (0.18 + mode * 0.055 + strength * 0.035).toFixed(2);

        switch (categoryId) {
            case "background":
                return {
                    "--vfx-background-duration": `${16 + index * 1.35}s`,
                    "--vfx-background-opacity": (0.12 + strength * 0.035).toFixed(2),
                    "--vfx-background-size": `${130 + mode * 24 + strength * 12}%`,
                    "--vfx-background-blur": `${18 + strength * 8}px`,
                    "--vfx-background-angle": `${index * 19}deg`
                };
            case "particles":
                return {
                    "--vfx-particle-size": `${2 + mode + strength * 0.7}px`,
                    "--vfx-particle-duration": `${12 + index * 0.9}s`,
                    "--vfx-particle-opacity": (0.22 + strength * 0.1).toFixed(2),
                    "--vfx-particle-blur": `${Math.max(0, mode - 2)}px`,
                    "--vfx-particle-drift": `${24 + mode * 12 + strength * 8}px`
                };
            case "cards":
                return {
                    "--vfx-card-lift": `${3 + strength * 2 + mode}px`,
                    "--vfx-card-scale": (1 + strength * 0.006 + mode * 0.002).toFixed(3),
                    "--vfx-card-rotate": `${(mode - 3) * strength * 0.35}deg`,
                    "--vfx-card-duration": `${duration}s`,
                    "--vfx-card-glow": `${10 + strength * 7 + mode * 2}px`
                };
            case "buttons":
                return {
                    "--vfx-button-lift": `${1 + strength + mode * 0.45}px`,
                    "--vfx-button-scale": (1 + strength * 0.009 + mode * 0.003).toFixed(3),
                    "--vfx-button-duration": `${duration}s`,
                    "--vfx-button-glow": `${8 + strength * 6 + mode * 2}px`,
                    "--vfx-button-shift": `${80 + index * 5}%`
                };
            case "text":
                return {
                    "--vfx-text-duration": `${2.4 + mode * 0.75 + strength * 0.4}s`,
                    "--vfx-text-glow": `${3 + strength * 2 + mode}px`,
                    "--vfx-text-spacing": `${(strength * 0.012 + mode * 0.004).toFixed(3)}em`,
                    "--vfx-text-rise": `${1 + strength * 0.8}px`,
                    "--vfx-text-angle": `${70 + index * 7}deg`
                };
            case "images": {
                const filters = [
                    "saturate(1.08) contrast(1.03)",
                    "saturate(1.18) brightness(1.04)",
                    "hue-rotate(8deg) saturate(1.12)",
                    "hue-rotate(-8deg) contrast(1.08)",
                    "saturate(1.28) contrast(1.07)"
                ];

                return {
                    "--vfx-image-scale": (1 + strength * 0.012 + mode * 0.004).toFixed(3),
                    "--vfx-image-rotate": `${(mode - 3) * strength * 0.3}deg`,
                    "--vfx-image-lift": `${strength + mode * 0.6}px`,
                    "--vfx-image-duration": `${duration}s`,
                    "--vfx-image-filter": filters[mode - 1],
                    "--vfx-image-glow": `${8 + strength * 7}px`
                };
            }
            case "sections": {
                const movement = 18 + strength * 10 + mode * 4;
                const xValues = [0, 0, -movement, movement, 0];
                const yValues = [movement, -movement, 0, 0, movement * 0.55];

                return {
                    "--vfx-section-x": `${xValues[mode - 1]}px`,
                    "--vfx-section-y": `${yValues[mode - 1]}px`,
                    "--vfx-section-scale": (0.96 - strength * 0.006 + mode * 0.003).toFixed(3),
                    "--vfx-section-rotate": `${(mode - 3) * strength * 0.45}deg`,
                    "--vfx-section-blur": `${Math.max(0, strength * 1.5 + mode - 2)}px`,
                    "--vfx-section-duration": `${0.55 + strength * 0.13 + mode * 0.04}s`
                };
            }
            case "navigation":
                return {
                    "--vfx-nav-lift": `${1 + strength * 0.65}px`,
                    "--vfx-nav-spacing": `${(strength * 0.008 + mode * 0.003).toFixed(3)}em`,
                    "--vfx-nav-duration": `${duration}s`,
                    "--vfx-nav-glow": `${4 + strength * 3 + mode}px`,
                    "--vfx-nav-radius": `${7 + mode * 3}px`
                };
            case "cursor":
                return {
                    "--vfx-cursor-size": `${90 + mode * 24 + strength * 34}px`,
                    "--vfx-cursor-opacity": (0.1 + strength * 0.045 + mode * 0.012).toFixed(2),
                    "--vfx-cursor-blur": `${8 + mode * 4 + strength * 3}px`,
                    "--vfx-cursor-border": `${mode % 2 === 0 ? 1 : 0}px`,
                    "--vfx-cursor-duration": `${0.05 + mode * 0.018}s`
                };
            case "accents":
                return {
                    "--vfx-accent-progress-height": `${2 + ((mode + strength) % 4)}px`,
                    "--vfx-accent-focus-width": `${1 + (strength % 3)}px`,
                    "--vfx-accent-glow": `${5 + strength * 4 + mode}px`,
                    "--vfx-accent-radius": `${5 + mode * 4}px`,
                    "--vfx-accent-duration": `${0.9 + mode * 0.32 + strength * 0.18}s`
                };
            default:
                return {};
        }
    }

    const EFFECT_CATALOG = Object.freeze(
        CATEGORY_DEFINITIONS.flatMap((category) => {
            return category.names.map((name, index) => {
                const variant = index + 1;

                return Object.freeze({
                    id: `${category.id}-${String(variant).padStart(2, "0")}`,
                    category: category.id,
                    categoryLabel: category.label,
                    icon: category.icon,
                    name,
                    variant,
                    mode: (index % 5) + 1,
                    strength: Math.floor(index / 5) + 1,
                    description: category.description,
                    variables: Object.freeze(createVariables(category.id, index))
                });
            });
        })
    );

    const EFFECTS_BY_ID = new Map(
        EFFECT_CATALOG.map((effect) => [effect.id, effect])
    );

    const DEFAULT_SELECTIONS = Object.freeze({
        background: "background-01",
        particles: "particles-04",
        cards: "cards-01",
        buttons: "buttons-01",
        text: "text-02",
        images: "images-01",
        sections: "sections-01",
        navigation: "navigation-01",
        cursor: "cursor-01",
        accents: "accents-01"
    });

    const DEFAULT_SELECTIONS_JSON = JSON.stringify(DEFAULT_SELECTIONS);
    let lastAppliedStateSignature = "";

    function shouldRememberPreferences() {
        return localStorage.getItem("maRememberPreferences") !== "false";
    }

    function readPreference(key, fallbackValue) {
        const storage = shouldRememberPreferences()
            ? localStorage
            : sessionStorage;
        const value = storage.getItem(key);

        return value === null ? fallbackValue : value;
    }

    function writePreference(key, value) {
        const stringValue = String(value);

        if (shouldRememberPreferences()) {
            localStorage.setItem(key, stringValue);
            sessionStorage.removeItem(key);
        } else {
            sessionStorage.setItem(key, stringValue);
            localStorage.removeItem(key);
        }
    }

    function normalizeSelections(value) {
        let candidate = value;

        if (typeof candidate === "string") {
            try {
                candidate = JSON.parse(candidate);
            } catch (_error) {
                candidate = {};
            }
        }

        const normalized = {};

        CATEGORY_DEFINITIONS.forEach((category) => {
            const selectedId = candidate?.[category.id];
            const selectedEffect = EFFECTS_BY_ID.get(selectedId);

            normalized[category.id] =
                selectedEffect?.category === category.id
                    ? selectedEffect.id
                    : DEFAULT_SELECTIONS[category.id];
        });

        return normalized;
    }

    function normalizeState(value) {
        const intensityValue = value?.intensity;

        return {
            enabled: value?.enabled !== false,
            intensity: VALID_INTENSITIES.has(intensityValue)
                ? intensityValue
                : "balanced",
            selections: normalizeSelections(value?.selections)
        };
    }

    function parseProfileEnvelope(serializedProfile) {
        if (!serializedProfile) return null;

        try {
            const parsedProfile = JSON.parse(serializedProfile);

            if (
                parsedProfile?.version !== 1 ||
                !parsedProfile.state
            ) {
                return null;
            }

            return {
                version: 1,
                updatedAt: Number(parsedProfile.updatedAt) || 0,
                state: normalizeState(parsedProfile.state)
            };
        } catch (_error) {
            return null;
        }
    }

    function readStorageProfile() {
        try {
            return parseProfileEnvelope(
                localStorage.getItem(EFFECTS_PROFILE_KEY)
            );
        } catch (_error) {
            return null;
        }
    }

    function readWindowProfile() {
        const windowName =
            typeof window.name === "string" ? window.name : "";

        if (!windowName.startsWith(WINDOW_PROFILE_PREFIX)) {
            return null;
        }

        return parseProfileEnvelope(
            windowName.slice(WINDOW_PROFILE_PREFIX.length)
        );
    }

    function readLatestProfile() {
        const storageProfile = readStorageProfile();
        const windowProfile = readWindowProfile();

        if (!storageProfile) return windowProfile;
        if (!windowProfile) return storageProfile;

        return windowProfile.updatedAt > storageProfile.updatedAt
            ? windowProfile
            : storageProfile;
    }

    function persistProfileEnvelope(profile) {
        const serializedProfile = JSON.stringify(profile);

        try {
            localStorage.setItem(EFFECTS_PROFILE_KEY, serializedProfile);
        } catch (_error) {
            // window.name remains available as a same-tab local-file fallback.
        }

        try {
            window.name = `${WINDOW_PROFILE_PREFIX}${serializedProfile}`;
        } catch (_error) {
            // The normal localStorage profile is still sufficient on a hosted site.
        }

        return profile;
    }

    function persistProfile(state) {
        return persistProfileEnvelope({
            version: 1,
            updatedAt: Date.now(),
            state: normalizeState(state)
        });
    }

    function readLegacyState() {
        const intensityValue = readPreference(
            EFFECTS_INTENSITY_KEY,
            "balanced"
        );

        return {
            enabled:
                readPreference(EFFECTS_ENABLED_KEY, "true") !== "false",
            intensity: VALID_INTENSITIES.has(intensityValue)
                ? intensityValue
                : "balanced",
            selections: normalizeSelections(
                readPreference(
                    EFFECTS_SELECTIONS_KEY,
                    DEFAULT_SELECTIONS_JSON
                )
            )
        };
    }

    function getState() {
        const profile = readLatestProfile();
        const state = profile?.state || readLegacyState();

        return {
            enabled: state.enabled,
            intensity: state.intensity,
            selections: { ...state.selections }
        };
    }

    function applyState(state = getState()) {
        const root = document.documentElement;
        const stateSignature = JSON.stringify([
            state.enabled,
            state.intensity,
            state.selections
        ]);

        if (stateSignature === lastAppliedStateSignature) {
            return state;
        }

        lastAppliedStateSignature = stateSignature;

        root.setAttribute(
            "data-vfx-enabled",
            state.enabled ? "true" : "false"
        );
        root.setAttribute("data-vfx-intensity", state.intensity);

        CATEGORY_DEFINITIONS.forEach((category) => {
            const effect = EFFECTS_BY_ID.get(
                state.selections[category.id]
            );

            if (!effect) return;

            root.setAttribute(
                `data-vfx-${category.id}`,
                String(effect.variant)
            );
            root.setAttribute(
                `data-vfx-${category.id}-mode`,
                String(effect.mode)
            );
            root.setAttribute(
                `data-vfx-${category.id}-strength`,
                String(effect.strength)
            );

            Object.entries(effect.variables).forEach(([property, value]) => {
                root.style.setProperty(property, value);
            });
        });

        document.dispatchEvent(
            new CustomEvent("ma:vfx-change", {
                detail: {
                    enabled: state.enabled,
                    intensity: state.intensity,
                    selections: { ...state.selections }
                }
            })
        );

        return state;
    }

    function saveAndApply(state) {
        const normalizedState = {
            enabled: Boolean(state.enabled),
            intensity: VALID_INTENSITIES.has(state.intensity)
                ? state.intensity
                : "balanced",
            selections: normalizeSelections(state.selections)
        };

        writePreference(
            EFFECTS_ENABLED_KEY,
            normalizedState.enabled ? "true" : "false"
        );
        writePreference(EFFECTS_INTENSITY_KEY, normalizedState.intensity);
        writePreference(
            EFFECTS_SELECTIONS_KEY,
            JSON.stringify(normalizedState.selections)
        );
        persistProfile(normalizedState);

        return applyState(normalizedState);
    }

    function setEnabled(enabled) {
        return saveAndApply({ ...getState(), enabled });
    }

    function setIntensity(intensity) {
        return saveAndApply({ ...getState(), intensity });
    }

    function selectEffect(effectId) {
        const effect = EFFECTS_BY_ID.get(effectId);

        if (!effect) return getState();

        const state = getState();
        state.selections[effect.category] = effect.id;

        return saveAndApply(state);
    }

    function reset() {
        return saveAndApply({
            enabled: true,
            intensity: "balanced",
            selections: { ...DEFAULT_SELECTIONS }
        });
    }

    function sync() {
        const latestProfile = readLatestProfile();

        if (latestProfile) {
            persistProfileEnvelope(latestProfile);
            return applyState(latestProfile.state);
        }

        const legacyState = readLegacyState();
        persistProfile(legacyState);

        return applyState(legacyState);
    }

    function ensureAmbientLayers() {
        if (!document.body) return;

        let particleLayer = document.getElementById("ma-vfx-particles");

        if (!particleLayer) {
            particleLayer = document.createElement("div");
            particleLayer.id = "ma-vfx-particles";
            particleLayer.className = "notranslate";
            particleLayer.setAttribute("translate", "no");
            particleLayer.setAttribute("aria-hidden", "true");

            for (let index = 0; index < 24; index += 1) {
                const particle = document.createElement("span");
                particle.style.setProperty("--vfx-i", String(index + 1));
                particle.style.setProperty(
                    "--vfx-left",
                    `${(index * 37 + 11) % 100}%`
                );
                particle.style.setProperty(
                    "--vfx-delay",
                    `${-((index * 1.73) % 17).toFixed(2)}s`
                );
                particle.style.setProperty(
                    "--vfx-sway",
                    `${((index % 7) - 3) * 14}px`
                );
                particleLayer.appendChild(particle);
            }

            document.body.appendChild(particleLayer);
        }

        let cursor = document.getElementById("ma-vfx-cursor");

        if (!cursor) {
            cursor = document.createElement("div");
            cursor.id = "ma-vfx-cursor";
            cursor.className = "notranslate";
            cursor.setAttribute("translate", "no");
            cursor.setAttribute("aria-hidden", "true");
            document.body.appendChild(cursor);
        }
    }

    let pointerFrame = null;
    let pointerX = -500;
    let pointerY = -500;

    function updateCursorPosition() {
        pointerFrame = null;
        const cursor = document.getElementById("ma-vfx-cursor");

        if (!cursor) return;

        cursor.style.setProperty("--vfx-cursor-x", `${pointerX}px`);
        cursor.style.setProperty("--vfx-cursor-y", `${pointerY}px`);
    }

    function handlePointerMove(event) {
        if (
            event.pointerType === "touch" ||
            document.documentElement.getAttribute("data-vfx-enabled") !== "true" ||
            window.MA_ACCESSIBILITY?.isMotionReduced() ||
            window.MA_ACCESSIBILITY?.getState().largeCursor
        ) {
            return;
        }

        pointerX = event.clientX;
        pointerY = event.clientY;

        if (pointerFrame !== null) return;

        pointerFrame = (
            window.requestAnimationFrame ||
            ((callback) => window.setTimeout(callback, 16))
        )(updateCursorPosition);
    }

    function initializeBodyEffects() {
        document.body?.classList?.toggle(
            "ma-vfx-auth-page",
            Boolean(document.getElementById("auth-screen"))
        );
        ensureAmbientLayers();
        updateCursorPosition();
    }

    window.MA_VISUAL_EFFECTS = Object.freeze({
        categories: CATEGORY_DEFINITIONS,
        effects: EFFECT_CATALOG,
        totalEffects: EFFECT_CATALOG.length,
        defaultSelections: DEFAULT_SELECTIONS,
        defaultSelectionsJSON: DEFAULT_SELECTIONS_JSON,
        profileKey: EFFECTS_PROFILE_KEY,
        preferenceKeys: Object.freeze([
            EFFECTS_ENABLED_KEY,
            EFFECTS_INTENSITY_KEY,
            EFFECTS_SELECTIONS_KEY
        ]),
        getState,
        setEnabled,
        setIntensity,
        selectEffect,
        reset,
        sync
    });

    sync();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeBodyEffects, {
            once: true
        });
    } else {
        initializeBodyEffects();
    }

    document.addEventListener("pointermove", handlePointerMove, {
        passive: true
    });

    function syncPageVisibility() {
        document.documentElement.setAttribute(
            "data-page-visible",
            document.hidden ? "false" : "true"
        );
    }

    document.addEventListener("visibilitychange", syncPageVisibility);
    syncPageVisibility();

    window.addEventListener("pageshow", sync);
    window.addEventListener("focus", sync);
    window.addEventListener("storage", (event) => {
        if (
            event.key === EFFECTS_ENABLED_KEY ||
            event.key === EFFECTS_INTENSITY_KEY ||
            event.key === EFFECTS_SELECTIONS_KEY ||
            event.key === EFFECTS_PROFILE_KEY ||
            event.key === "maRememberPreferences"
        ) {
            sync();
        }
    });
})();
