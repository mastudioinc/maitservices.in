/* =========================================
   MA IT SERVICES - GLOBAL ACCESSIBILITY ENGINE
========================================= */

(function initializeAccessibilityEngine() {
    "use strict";

    const DEFAULTS = Object.freeze({
        textSize: "100",
        highContrast: false,
        reduceMotion: false,
        focusHighlight: false,
        readableFont: false,
        textSpacing: false,
        underlineLinks: false,
        largeCursor: false,
        readingGuide: false,
        colorVision: "standard"
    });

    const PREFERENCE_KEYS = Object.freeze({
        textSize: "maA11yTextSize",
        highContrast: "maA11yHighContrast",
        reduceMotion: "maA11yReduceMotion",
        focusHighlight: "maA11yFocusHighlight",
        readableFont: "maA11yReadableFont",
        textSpacing: "maA11yTextSpacing",
        underlineLinks: "maA11yUnderlineLinks",
        largeCursor: "maA11yLargeCursor",
        readingGuide: "maA11yReadingGuide",
        colorVision: "maA11yColorVision"
    });

    const VALID_TEXT_SIZES = new Set(["100", "115", "130", "150"]);
    const VALID_COLOR_VISION_MODES = new Set([
        "standard",
        "protanopia",
        "deuteranopia",
        "tritanopia"
    ]);

    let activeState = { ...DEFAULTS };
    let pointerFrame = null;
    let pointerX = -500;
    let pointerY = -500;
    const reducedMotionMedia = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)"
    ) || null;

    function shouldRememberPreferences() {
        return localStorage.getItem("maRememberPreferences") !== "false";
    }

    function activeStorage() {
        return shouldRememberPreferences() ? localStorage : sessionStorage;
    }

    function inactiveStorage() {
        return shouldRememberPreferences() ? sessionStorage : localStorage;
    }

    function normalizeBoolean(value, fallbackValue = false) {
        if (value === true || value === "true") return true;
        if (value === false || value === "false") return false;
        return fallbackValue;
    }

    function normalizeState(candidate = {}) {
        return {
            textSize: VALID_TEXT_SIZES.has(String(candidate.textSize))
                ? String(candidate.textSize)
                : DEFAULTS.textSize,
            highContrast: normalizeBoolean(
                candidate.highContrast,
                DEFAULTS.highContrast
            ),
            reduceMotion: normalizeBoolean(
                candidate.reduceMotion,
                DEFAULTS.reduceMotion
            ),
            focusHighlight: normalizeBoolean(
                candidate.focusHighlight,
                DEFAULTS.focusHighlight
            ),
            readableFont: normalizeBoolean(
                candidate.readableFont,
                DEFAULTS.readableFont
            ),
            textSpacing: normalizeBoolean(
                candidate.textSpacing,
                DEFAULTS.textSpacing
            ),
            underlineLinks: normalizeBoolean(
                candidate.underlineLinks,
                DEFAULTS.underlineLinks
            ),
            largeCursor: normalizeBoolean(
                candidate.largeCursor,
                DEFAULTS.largeCursor
            ),
            readingGuide: normalizeBoolean(
                candidate.readingGuide,
                DEFAULTS.readingGuide
            ),
            colorVision: VALID_COLOR_VISION_MODES.has(
                String(candidate.colorVision)
            )
                ? String(candidate.colorVision)
                : DEFAULTS.colorVision
        };
    }

    function readState() {
        const storage = activeStorage();

        return normalizeState({
            textSize:
                storage.getItem(PREFERENCE_KEYS.textSize) ??
                DEFAULTS.textSize,
            highContrast:
                storage.getItem(PREFERENCE_KEYS.highContrast) ??
                DEFAULTS.highContrast,
            reduceMotion:
                storage.getItem(PREFERENCE_KEYS.reduceMotion) ??
                DEFAULTS.reduceMotion,
            focusHighlight:
                storage.getItem(PREFERENCE_KEYS.focusHighlight) ??
                DEFAULTS.focusHighlight,
            readableFont:
                storage.getItem(PREFERENCE_KEYS.readableFont) ??
                DEFAULTS.readableFont,
            textSpacing:
                storage.getItem(PREFERENCE_KEYS.textSpacing) ??
                DEFAULTS.textSpacing,
            underlineLinks:
                storage.getItem(PREFERENCE_KEYS.underlineLinks) ??
                DEFAULTS.underlineLinks,
            largeCursor:
                storage.getItem(PREFERENCE_KEYS.largeCursor) ??
                DEFAULTS.largeCursor,
            readingGuide:
                storage.getItem(PREFERENCE_KEYS.readingGuide) ??
                DEFAULTS.readingGuide,
            colorVision:
                storage.getItem(PREFERENCE_KEYS.colorVision) ??
                DEFAULTS.colorVision
        });
    }

    function writePreference(name, value) {
        const key = PREFERENCE_KEYS[name];
        if (!key) return;

        activeStorage().setItem(key, String(value));
        inactiveStorage().removeItem(key);
    }

    function ensureAssistiveLayers() {
        if (!document.body) return;

        if (!document.getElementById("ma-a11y-reading-guide")) {
            const readingGuide = document.createElement("div");
            readingGuide.id = "ma-a11y-reading-guide";
            readingGuide.className = "notranslate";
            readingGuide.setAttribute("translate", "no");
            readingGuide.setAttribute("aria-hidden", "true");
            document.body.appendChild(readingGuide);
        }

        if (!document.getElementById("ma-a11y-cursor")) {
            const cursor = document.createElement("div");
            cursor.id = "ma-a11y-cursor";
            cursor.className = "notranslate";
            cursor.setAttribute("translate", "no");
            cursor.setAttribute("aria-hidden", "true");
            document.body.appendChild(cursor);
        }
    }

    function updateAssistiveLayers() {
        pointerFrame = null;

        if (!activeState.largeCursor && !activeState.readingGuide) return;

        const cursor = document.getElementById("ma-a11y-cursor");
        const guide = document.getElementById("ma-a11y-reading-guide");

        if (activeState.largeCursor && cursor) {
            cursor.style.transform =
                `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
        }

        if (activeState.readingGuide && guide) {
            guide.style.transform =
                `translate3d(0, ${pointerY}px, 0) translateY(-50%)`;
        }
    }

    function requestAssistiveLayerUpdate() {
        if (pointerFrame !== null) return;

        pointerFrame = (
            window.requestAnimationFrame ||
            ((callback) => window.setTimeout(callback, 16))
        )(updateAssistiveLayers);
    }

    function handlePointerMove(event) {
        if (
            event.pointerType === "touch" ||
            isMotionReduced() ||
            (!activeState.largeCursor && !activeState.readingGuide)
        ) {
            return;
        }

        pointerX = event.clientX;
        pointerY = event.clientY;
        requestAssistiveLayerUpdate();
    }

    function handleFocusedElement(event) {
        if (!activeState.readingGuide) return;
        const rectangle = event.target?.getBoundingClientRect?.();
        if (!rectangle) return;

        pointerY = rectangle.top + rectangle.height / 2;
        requestAssistiveLayerUpdate();
    }

    function applyState(candidateState, options = {}) {
        const state = normalizeState(candidateState);
        const root = document.documentElement;

        activeState = state;

        root.setAttribute("data-a11y-text-size", state.textSize);
        root.setAttribute(
            "data-a11y-high-contrast",
            state.highContrast ? "true" : "false"
        );
        root.setAttribute(
            "data-a11y-reduce-motion",
            state.reduceMotion ? "true" : "false"
        );
        root.setAttribute(
            "data-a11y-motion-reduced",
            state.reduceMotion || reducedMotionMedia?.matches
                ? "true"
                : "false"
        );
        root.setAttribute(
            "data-a11y-focus-highlight",
            state.focusHighlight ? "true" : "false"
        );
        root.setAttribute(
            "data-a11y-readable-font",
            state.readableFont ? "true" : "false"
        );
        root.setAttribute(
            "data-a11y-text-spacing",
            state.textSpacing ? "true" : "false"
        );
        root.setAttribute(
            "data-a11y-underline-links",
            state.underlineLinks ? "true" : "false"
        );
        root.setAttribute(
            "data-a11y-large-cursor",
            state.largeCursor ? "true" : "false"
        );
        root.setAttribute(
            "data-a11y-reading-guide",
            state.readingGuide ? "true" : "false"
        );
        root.setAttribute("data-a11y-color-vision", state.colorVision);
        root.style.setProperty("--a11y-root-font-size", `${state.textSize}%`);

        const isActive = Object.keys(DEFAULTS).some(
            (key) => state[key] !== DEFAULTS[key]
        );
        root.setAttribute("data-a11y-active", isActive ? "true" : "false");

        ensureAssistiveLayers();
        requestAssistiveLayerUpdate();

        if (options.announce !== false) {
            window.dispatchEvent(new CustomEvent("ma:accessibilitychange", {
                detail: { ...state }
            }));
        }

        return { ...state };
    }

    function setPreference(name, value) {
        if (!Object.prototype.hasOwnProperty.call(PREFERENCE_KEYS, name)) {
            return { ...activeState };
        }

        const nextState = normalizeState({
            ...readState(),
            [name]: value
        });

        writePreference(name, nextState[name]);
        return applyState(nextState);
    }

    function reset() {
        Object.entries(DEFAULTS).forEach(([name, value]) => {
            writePreference(name, value);
        });

        return applyState(DEFAULTS);
    }

    function sync(options = {}) {
        return applyState(readState(), {
            announce: options.announce === true
        });
    }

    function getState() {
        return { ...activeState };
    }

    function isMotionReduced() {
        return document.documentElement.getAttribute(
            "data-a11y-motion-reduced"
        ) === "true";
    }

    window.MA_ACCESSIBILITY = Object.freeze({
        defaults: DEFAULTS,
        preferenceKeys: PREFERENCE_KEYS,
        setPreference,
        getState,
        reset,
        sync,
        isMotionReduced
    });

    document.addEventListener("pointermove", handlePointerMove, {
        passive: true
    });
    document.addEventListener("focusin", handleFocusedElement);
    document.addEventListener("pointerdown", handleFocusedElement, {
        passive: true
    });

    const handleReducedMotionChange = () => {
        applyState(activeState);
    };

    if (reducedMotionMedia?.addEventListener) {
        reducedMotionMedia.addEventListener(
            "change",
            handleReducedMotionChange
        );
    } else if (reducedMotionMedia?.addListener) {
        reducedMotionMedia.addListener(handleReducedMotionChange);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            ensureAssistiveLayers();
            requestAssistiveLayerUpdate();
        }, { once: true });
    } else {
        ensureAssistiveLayers();
    }

    window.addEventListener("pageshow", () => sync());
    window.addEventListener("focus", () => sync());
    window.addEventListener("storage", (event) => {
        if (
            Object.values(PREFERENCE_KEYS).includes(event.key) ||
            event.key === "maRememberPreferences"
        ) {
            sync({ announce: true });
        }
    });

    sync();
})();
