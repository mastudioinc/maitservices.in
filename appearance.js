/* =========================================
   MA IT SERVICES - GLOBAL ACCENT ENGINE
   Supports every 24-bit RGB colour (16,777,216 colours).
========================================= */

(function initializeAppearanceEngine() {
    "use strict";

    const DEFAULT_STYLE = "purple";
    const DEFAULT_COLOR = "#7c5cff";

    const PRESETS = Object.freeze([
        { id: "purple", name: "Purple", color: "#7c5cff" },
        { id: "violet", name: "Violet", color: "#8b5cf6" },
        { id: "indigo", name: "Indigo", color: "#6366f1" },
        { id: "blue", name: "Blue", color: "#3b82f6" },
        { id: "navy", name: "Navy", color: "#1d4ed8" },
        { id: "sky", name: "Sky", color: "#0ea5e9" },
        { id: "cyan", name: "Cyan", color: "#06b6d4" },
        { id: "aqua", name: "Aqua", color: "#22d3ee" },
        { id: "teal", name: "Teal", color: "#14b8a6" },
        { id: "mint", name: "Mint", color: "#34d399" },
        { id: "emerald", name: "Emerald", color: "#10b981" },
        { id: "green", name: "Green", color: "#22c55e" },
        { id: "lime", name: "Lime", color: "#84cc16" },
        { id: "yellow", name: "Yellow", color: "#eab308" },
        { id: "amber", name: "Amber", color: "#f59e0b" },
        { id: "gold", name: "Gold", color: "#d4af37" },
        { id: "orange", name: "Orange", color: "#f97316" },
        { id: "copper", name: "Copper", color: "#b45309" },
        { id: "brown", name: "Brown", color: "#92400e" },
        { id: "coral", name: "Coral", color: "#ff6b6b" },
        { id: "red", name: "Red", color: "#ef4444" },
        { id: "rose", name: "Rose", color: "#f43f5e" },
        { id: "pink", name: "Pink", color: "#ec4899" },
        { id: "fuchsia", name: "Fuchsia", color: "#d946ef" },
        { id: "magenta", name: "Magenta", color: "#e600ff" },
        { id: "plum", name: "Plum", color: "#a855f7" },
        { id: "lavender", name: "Lavender", color: "#a78bfa" },
        { id: "silver", name: "Silver", color: "#94a3b8" },
        { id: "slate", name: "Slate", color: "#64748b" },
        { id: "graphite", name: "Graphite", color: "#334155" }
    ]);

    const PRESET_MAP = new Map(
        PRESETS.map((preset) => [preset.id, preset])
    );

    function shouldRememberPreferences() {
        return localStorage.getItem("maRememberPreferences") !== "false";
    }

    function preferenceStorage() {
        return shouldRememberPreferences() ? localStorage : sessionStorage;
    }

    function readPreference(key, fallbackValue) {
        const value = preferenceStorage().getItem(key);
        return value === null ? fallbackValue : value;
    }

    function writePreference(key, value) {
        const activeStorage = preferenceStorage();
        const inactiveStorage = shouldRememberPreferences()
            ? sessionStorage
            : localStorage;

        activeStorage.setItem(key, String(value));
        inactiveStorage.removeItem(key);
    }

    function normalizeHex(value, fallbackValue = null) {
        if (typeof value !== "string") return fallbackValue;

        let hex = value.trim().replace(/^#/, "");

        if (/^[0-9a-f]{3}$/i.test(hex)) {
            hex = hex
                .split("")
                .map((character) => character + character)
                .join("");
        }

        if (!/^[0-9a-f]{6}$/i.test(hex)) return fallbackValue;
        return `#${hex.toLowerCase()}`;
    }

    function hexToRgb(hexColor) {
        const hex = normalizeHex(hexColor, DEFAULT_COLOR).slice(1);
        return {
            r: parseInt(hex.slice(0, 2), 16),
            g: parseInt(hex.slice(2, 4), 16),
            b: parseInt(hex.slice(4, 6), 16)
        };
    }

    function rgbToHex({ r, g, b }) {
        return `#${[r, g, b]
            .map((channel) => Math.round(channel)
                .toString(16)
                .padStart(2, "0"))
            .join("")}`;
    }

    function mixRgb(source, target, amount) {
        return {
            r: source.r + (target.r - source.r) * amount,
            g: source.g + (target.g - source.g) * amount,
            b: source.b + (target.b - source.b) * amount
        };
    }

    function relativeLuminance({ r, g, b }) {
        const channels = [r, g, b].map((channel) => {
            const value = channel / 255;
            return value <= 0.03928
                ? value / 12.92
                : Math.pow((value + 0.055) / 1.055, 2.4);
        });

        return (
            channels[0] * 0.2126 +
            channels[1] * 0.7152 +
            channels[2] * 0.0722
        );
    }

    function setAccentVariables(color) {
        const rootStyle = document.documentElement.style;
        const rgb = hexToRgb(color);
        const luminance = relativeLuminance(rgb);
        const white = { r: 255, g: 255, b: 255 };
        const black = { r: 12, g: 16, b: 38 };
        const readableRgb = luminance < 0.38
            ? mixRgb(rgb, white, 0.38)
            : mixRgb(rgb, black, luminance > 0.72 ? 0.28 : 0.16);
        const borderRgb = luminance < 0.12
            ? mixRgb(rgb, white, 0.28)
            : luminance > 0.86
                ? mixRgb(rgb, black, 0.22)
                : rgb;
        const readableColor = rgbToHex(readableRgb);
        const borderChannels = `${Math.round(borderRgb.r)}, ${Math.round(borderRgb.g)}, ${Math.round(borderRgb.b)}`;
        const channels = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
        const contrastColor = luminance > 0.48 ? "#101225" : "#ffffff";

        const variables = {
            "--primary": color,
            "--secondary": readableColor,
            "--accent-rgb": channels,
            "--accent-contrast": contrastColor,
            "--accent-contrast-text": contrastColor,
            "--settings-accent": color,
            "--settings-accent-light": readableColor,
            "--settings-accent-soft": `rgba(${channels}, 0.14)`,
            "--settings-accent-border": `rgba(${borderChannels}, 0.52)`,
            "--settings-accent-shadow": `rgba(${channels}, 0.30)`,
            "--website-accent": color,
            "--website-accent-light": readableColor,
            "--website-accent-soft": `rgba(${channels}, 0.14)`,
            "--website-accent-border": `rgba(${borderChannels}, 0.52)`,
            "--website-accent-shadow": `rgba(${channels}, 0.30)`
        };

        Object.entries(variables).forEach(([name, value]) => {
            rootStyle.setProperty(name, value);
        });
    }

    function resolveAccent(style, requestedColor) {
        if (PRESET_MAP.has(style)) {
            return {
                style,
                color: PRESET_MAP.get(style).color
            };
        }

        return {
            style: "custom",
            color: normalizeHex(
                requestedColor,
                normalizeHex(
                    readPreference("maAccentColor", DEFAULT_COLOR),
                    DEFAULT_COLOR
                )
            )
        };
    }

    function apply(style = DEFAULT_STYLE, requestedColor, options = {}) {
        const accent = resolveAccent(style, requestedColor);
        const root = document.documentElement;

        root.setAttribute("data-accent", accent.style);
        root.setAttribute("data-accent-color", accent.color);
        setAccentVariables(accent.color);

        if (options.persist !== false) {
            writePreference("maAccentStyle", accent.style);
            writePreference("maAccentColor", accent.color);
        }

        if (options.announce !== false) {
            window.dispatchEvent(new CustomEvent("ma:accentchange", {
                detail: { ...accent }
            }));
        }

        return accent;
    }

    function sync(options = {}) {
        const savedStyle = readPreference("maAccentStyle", DEFAULT_STYLE);
        const savedColor = readPreference("maAccentColor", DEFAULT_COLOR);
        return apply(savedStyle, savedColor, {
            persist: false,
            announce: options.announce === true
        });
    }

    function getActiveAccent() {
        return {
            style: document.documentElement.getAttribute("data-accent") || DEFAULT_STYLE,
            color: normalizeHex(
                document.documentElement.getAttribute("data-accent-color"),
                DEFAULT_COLOR
            )
        };
    }

    window.MA_APPEARANCE = Object.freeze({
        defaultStyle: DEFAULT_STYLE,
        defaultColor: DEFAULT_COLOR,
        presets: PRESETS,
        normalizeHex,
        apply,
        sync,
        getActiveAccent
    });

    window.addEventListener("pageshow", () => sync());
    window.addEventListener("focus", () => sync());
    window.addEventListener("storage", (event) => {
        if (
            event.key === "maAccentStyle" ||
            event.key === "maAccentColor" ||
            event.key === "maRememberPreferences"
        ) {
            sync({ announce: true });
        }
    });

    sync();
})();
