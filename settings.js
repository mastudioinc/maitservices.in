const settingsNavItems = document.querySelectorAll(".settings-nav-item");
const settingsContent = document.querySelector(".settings-content");

const APPEARANCE_DEFAULTS = Object.freeze({
    theme: "dark",
    accent: "purple",
    accentColor: "#7c5cff",
    compact: false,
    glass: true
});

const GENERAL_DEFAULTS = Object.freeze({
    smoothScrolling: true,
    rememberPreferences: true,
    defaultStartSection: "home"
});

const VISUAL_EFFECT_DEFAULTS = Object.freeze({
    enabled: true,
    intensity: "balanced",
    selections:
        window.MA_VISUAL_EFFECTS?.defaultSelectionsJSON || "{}"
});

const ACCESSIBILITY_DEFAULTS = Object.freeze({
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

const WEBSITE_PREFERENCE_DEFAULTS = Object.freeze({
    maThemeMode: APPEARANCE_DEFAULTS.theme,
    maAccentStyle: APPEARANCE_DEFAULTS.accent,
    maAccentColor: APPEARANCE_DEFAULTS.accentColor,
    maCompactInterface: String(APPEARANCE_DEFAULTS.compact),
    maGlassEffect: String(APPEARANCE_DEFAULTS.glass),
    maSmoothScrolling: String(GENERAL_DEFAULTS.smoothScrolling),
    maDefaultStartSection: GENERAL_DEFAULTS.defaultStartSection,
    maWebsiteLanguage: "en",
    maVisualEffectsEnabled: String(VISUAL_EFFECT_DEFAULTS.enabled),
    maVisualEffectIntensity: VISUAL_EFFECT_DEFAULTS.intensity,
    maVisualEffectSelections: VISUAL_EFFECT_DEFAULTS.selections,
    maA11yTextSize: ACCESSIBILITY_DEFAULTS.textSize,
    maA11yHighContrast: String(ACCESSIBILITY_DEFAULTS.highContrast),
    maA11yReduceMotion: String(ACCESSIBILITY_DEFAULTS.reduceMotion),
    maA11yFocusHighlight: String(ACCESSIBILITY_DEFAULTS.focusHighlight),
    maA11yReadableFont: String(ACCESSIBILITY_DEFAULTS.readableFont),
    maA11yTextSpacing: String(ACCESSIBILITY_DEFAULTS.textSpacing),
    maA11yUnderlineLinks: String(ACCESSIBILITY_DEFAULTS.underlineLinks),
    maA11yLargeCursor: String(ACCESSIBILITY_DEFAULTS.largeCursor),
    maA11yReadingGuide: String(ACCESSIBILITY_DEFAULTS.readingGuide),
    maA11yColorVision: ACCESSIBILITY_DEFAULTS.colorVision
});

const WEBSITE_PREFERENCE_KEYS =
    Object.keys(WEBSITE_PREFERENCE_DEFAULTS);

const ACCESSIBILITY_CONTROL_BINDINGS = Object.freeze({
    a11yTextSize: "textSize",
    a11yHighContrast: "highContrast",
    a11yReduceMotion: "reduceMotion",
    a11yFocusHighlight: "focusHighlight",
    a11yReadableFont: "readableFont",
    a11yTextSpacing: "textSpacing",
    a11yUnderlineLinks: "underlineLinks",
    a11yLargeCursor: "largeCursor",
    a11yReadingGuide: "readingGuide",
    a11yColorVision: "colorVision"
});

function shouldRememberWebsitePreferences() {
    return localStorage.getItem("maRememberPreferences") !== "false";
}

function readWebsitePreference(key) {
    const storage = shouldRememberWebsitePreferences()
        ? localStorage
        : sessionStorage;
    const value = storage.getItem(key);

    return value === null
        ? WEBSITE_PREFERENCE_DEFAULTS[key]
        : value;
}

function writeWebsitePreference(key, value) {
    const stringValue = String(value);

    if (shouldRememberWebsitePreferences()) {
        localStorage.setItem(key, stringValue);
        sessionStorage.removeItem(key);
    } else {
        sessionStorage.setItem(key, stringValue);
        localStorage.removeItem(key);
    }
}

function setRememberWebsitePreferences(enabled) {
    const currentPreferences = {};

    WEBSITE_PREFERENCE_KEYS.forEach((key) => {
        currentPreferences[key] = readWebsitePreference(key);
    });

    if (enabled) {
        WEBSITE_PREFERENCE_KEYS.forEach((key) => {
            localStorage.setItem(key, currentPreferences[key]);
            sessionStorage.removeItem(key);
        });

        localStorage.setItem("maRememberPreferences", "true");
    } else {
        localStorage.setItem("maRememberPreferences", "false");

        WEBSITE_PREFERENCE_KEYS.forEach((key) => {
            sessionStorage.setItem(key, currentPreferences[key]);
            localStorage.removeItem(key);
        });
    }

    document.documentElement.setAttribute(
        "data-remember-preferences",
        enabled ? "true" : "false"
    );

    window.MA_LANGUAGE?.syncCookiePersistence();
    window.MA_ACCESSIBILITY?.sync({ announce: true });
}

const ACCENT_PRESETS = window.MA_APPEARANCE?.presets || [
    { id: "purple", name: "Purple", color: "#7c5cff" },
    { id: "blue", name: "Blue", color: "#3b82f6" },
    { id: "cyan", name: "Cyan", color: "#06b6d4" }
];

const ACCENT_PRESET_MARKUP = ACCENT_PRESETS.map((preset) => `
    <button
        type="button"
        class="accent-preset-button"
        data-accent-preset="${preset.id}"
        style="--swatch-color: ${preset.color}"
        aria-label="Use ${preset.name} accent"
        aria-pressed="false"
        title="${preset.name}"
    >
        <span class="accent-preset-dot" aria-hidden="true"></span>
        <span>${preset.name}</span>
        <i class="fas fa-check" aria-hidden="true"></i>
    </button>
`).join("");

const settingsSections = {
    general: {
    title: "General",
    description: "Manage your MA IT SERVICES website preferences.",

    content: `
        <div class="settings-options-list">

            <div class="settings-option-row">
                <div class="settings-option-info">
                    <h3>Smooth Scrolling</h3>
                    <p>Enable smooth scrolling throughout the website.</p>
                </div>

                <label class="settings-switch">
                    <input
                        type="checkbox"
                        id="smoothScrollingSetting"
                        aria-label="Enable smooth scrolling"
                        checked
                    >
                    <span class="settings-switch-slider"></span>
                </label>
            </div>

            <div class="settings-option-row">
                <div class="settings-option-info">
                    <h3>Remember Website Preferences</h3>
                    <p>Save your website settings on this device.</p>
                </div>

                <label class="settings-switch">
                    <input
                        type="checkbox"
                        id="rememberPreferencesSetting"
                        aria-label="Remember website preferences"
                        checked
                    >
                    <span class="settings-switch-slider"></span>
                </label>
            </div>

            <div class="settings-option-row">
                <div class="settings-option-info">
                    <h3>Default Start Section</h3>
                    <p>Choose which section should open first.</p>
                </div>

                <div class="settings-select-wrap">
                    <select
                        id="defaultStartSection"
                        class="settings-select"
                        aria-label="Default start section"
                    >
                        <option value="home">Home</option>
                        <option value="services">Services</option>
                        <option value="products">Products</option>
                        <option value="highlights">Highlights</option>
                    </select>
                    <i class="fas fa-chevron-down" aria-hidden="true"></i>
                </div>
            </div>

            <div class="settings-option-row settings-danger-row">
                <div class="settings-option-info">
                    <h3>Reset Website Settings</h3>
                    <p>Restore all website preferences to their defaults.</p>
                </div>

                <button type="button" id="resetWebsiteSettings" class="settings-reset-btn">
                    <i class="fas fa-rotate-left" aria-hidden="true"></i>
                    Reset Settings
                </button>
            </div>

        </div>
    `
},

  appearance: {
    title: "Appearance",
    description: "Customize how the MA IT SERVICES website looks.",

    content: `
        <div class="settings-options-list">

            <div class="settings-option-row">
                <div class="settings-option-info">
                    <h3>Theme Mode</h3>
                    <p>Choose the website appearance you prefer.</p>
                </div>

                <select id="themeModeSetting" class="settings-select">
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="system">System Default</option>
                </select>
            </div>

            <div class="settings-option-row accent-settings-row">
                <div class="settings-option-info">
                    <h3>Accent Colour Studio</h3>
                    <p>Choose a ready colour or create any custom RGB colour for the complete website.</p>
                </div>

                <div class="accent-picker-panel">
                    <div class="accent-picker-heading">
                        <span>Ready Colours</span>
                        <span>${ACCENT_PRESETS.length} presets</span>
                    </div>

                    <div
                        class="accent-preset-grid"
                        role="group"
                        aria-label="Ready accent colours"
                    >
                        ${ACCENT_PRESET_MARKUP}
                    </div>

                    <div class="accent-custom-control">
                        <div class="accent-custom-copy">
                            <strong>Unlimited Custom Colour</strong>
                            <span>Use the picker or enter an exact HEX colour.</span>
                        </div>

                        <div class="accent-custom-inputs">
                            <label class="accent-color-picker-wrap" for="accentColorPicker">
                                <input
                                    type="color"
                                    id="accentColorPicker"
                                    value="#7c5cff"
                                    aria-label="Choose any custom accent colour"
                                >
                                <span>
                                    <i class="fas fa-eye-dropper" aria-hidden="true"></i>
                                    Pick Colour
                                </span>
                            </label>

                            <label class="accent-hex-field" for="accentHexInput">
                                <span>HEX</span>
                                <input
                                    type="text"
                                    id="accentHexInput"
                                    value="#7c5cff"
                                    maxlength="7"
                                    spellcheck="false"
                                    autocomplete="off"
                                    inputmode="text"
                                    aria-label="Custom accent HEX colour"
                                >
                            </label>
                        </div>

                        <p class="accent-colour-capability">
                            <i class="fas fa-palette" aria-hidden="true"></i>
                            Full 24-bit RGB support: 16.7 million colours, saved across every page.
                        </p>
                    </div>

                    <div class="accent-current-value" aria-live="polite">
                        <span class="accent-current-dot" aria-hidden="true"></span>
                        <span>Active Colour</span>
                        <strong id="activeAccentValue">#7C5CFF</strong>
                    </div>
                </div>
            </div>

            <div class="settings-option-row">
                <div class="settings-option-info">
                    <h3>Compact Interface</h3>
                    <p>Reduce spacing and make website controls more compact.</p>
                </div>

                <label class="settings-switch">
                    <input type="checkbox" id="compactInterfaceSetting">
                    <span class="settings-switch-slider"></span>
                </label>
            </div>

            <div class="settings-option-row">
                <div class="settings-option-info">
                    <h3>Glass Effect</h3>
                    <p>Enable transparent glass-style panels and cards.</p>
                </div>

                <label class="settings-switch">
                    <input type="checkbox" id="glassEffectSetting" checked>
                    <span class="settings-switch-slider"></span>
                </label>
            </div>

            <div class="settings-option-row settings-danger-row">
                <div class="settings-option-info">
                    <h3>Reset Appearance</h3>
                    <p>Restore all appearance preferences to their defaults.</p>
                </div>

                <button
                    type="button"
                    id="resetAppearanceSettings"
                    class="settings-reset-btn"
                >
                    Reset Appearance
                </button>
            </div>

        </div>
    `
},
    language: {
        title: "Language",
        description: "Choose your preferred website language.",
        content: `
            <div class="language-settings-card">
                <div class="language-settings-intro">
                    <div class="language-settings-icon">
                        <i class="fas fa-language" aria-hidden="true"></i>
                    </div>

                    <div>
                        <h3>Website Language</h3>
                        <p>
                            Choose the language used across Settings, Login,
                            password pages and the complete MA IT SERVICES website.
                        </p>
                    </div>
                </div>

                <label class="language-field-label" for="languageSearchSetting">
                    Search Languages
                </label>

                <div class="language-search-wrap">
                    <i class="fas fa-magnifying-glass" aria-hidden="true"></i>
                    <input
                        type="search"
                        id="languageSearchSetting"
                        class="language-search-input"
                        placeholder="Search by language name or code..."
                        autocomplete="off"
                    >
                </div>

                <label class="language-field-label" for="websiteLanguageSetting">
                    Available Languages
                </label>

                <div class="settings-select-wrap language-select-wrap">
                    <select
                        id="websiteLanguageSetting"
                        class="settings-select"
                        aria-label="Website language"
                    ></select>
                    <i class="fas fa-chevron-down" aria-hidden="true"></i>
                </div>

                <div class="language-selection-status" aria-live="polite">
                    <span>
                        Current:
                        <strong id="selectedLanguageName">English (Original)</strong>
                    </span>
                    <span id="languageCount"></span>
                </div>

                <p class="language-translation-note" id="languageTranslationNote">
                    <i class="fas fa-globe" aria-hidden="true"></i>
                    Your selected language is applied across the complete website.
                    An internet connection is required when switching languages.
                </p>
            </div>
        `
    },

    effects: {
        title: "Visual Effects",
        description: "Explore 200 effects for motion, glow, depth and atmosphere.",
        content: `
            <div class="vfx-studio" id="visualEffectsStudio">
                <div class="vfx-studio-overview">
                    <div class="vfx-studio-title">
                        <div class="vfx-studio-title-icon">
                            <i class="fas fa-wand-magic-sparkles" aria-hidden="true"></i>
                        </div>

                        <div>
                            <h3>Visual Effects Studio</h3>
                            <p>
                                Choose one effect from each category. Every option
                                applies instantly across Settings, the Main Website
                                and all Login or password pages.
                            </p>
                        </div>
                    </div>

                    <div class="vfx-count-badge">
                        <strong id="visualEffectsTotal">200</strong>
                        <span>effect options</span>
                    </div>
                </div>

                <div class="vfx-control-panel">
                    <div class="vfx-control-box">
                        <div class="vfx-control-copy">
                            <h4>Enable Visual Effects</h4>
                            <p>Master switch for every selected effect.</p>
                        </div>

                        <label class="settings-switch">
                            <input
                                type="checkbox"
                                id="visualEffectsMasterSetting"
                                aria-label="Enable all visual effects"
                                checked
                            >
                            <span class="settings-switch-slider"></span>
                        </label>
                    </div>

                    <div class="vfx-control-box">
                        <div class="vfx-control-copy">
                            <h4>Effect Intensity</h4>
                            <p>Choose comfortable or stronger visuals.</p>
                        </div>

                        <div class="settings-select-wrap">
                            <select
                                id="visualEffectsIntensitySetting"
                                class="settings-select"
                                aria-label="Visual effect intensity"
                            >
                                <option value="gentle">Gentle</option>
                                <option value="balanced">Balanced</option>
                                <option value="cinematic">Cinematic</option>
                            </select>
                            <i class="fas fa-chevron-down" aria-hidden="true"></i>
                        </div>
                    </div>
                </div>

                <div class="vfx-search-wrap">
                    <i class="fas fa-magnifying-glass" aria-hidden="true"></i>
                    <input
                        type="search"
                        id="visualEffectsSearch"
                        class="vfx-search-input"
                        placeholder="Search all 200 effects by name or category..."
                        autocomplete="off"
                    >
                </div>

                <div
                    class="vfx-category-filters"
                    id="visualEffectsCategoryFilters"
                    aria-label="Visual effect categories"
                ></div>

                <div class="vfx-results-bar">
                    <span id="visualEffectsResultCount"></span>
                    <span><strong>10</strong> categories · one active effect per category</span>
                </div>

                <div
                    class="vfx-effects-grid"
                    id="visualEffectsGrid"
                    aria-live="polite"
                ></div>

                <div class="vfx-studio-footer">
                    <p>
                        Effects are performance-safe, theme-aware, preserved after
                        Logout and restored automatically on your next Login.
                    </p>

                    <button
                        type="button"
                        id="resetVisualEffects"
                        class="settings-reset-btn"
                    >
                        <i class="fas fa-rotate-left" aria-hidden="true"></i>
                        Reset Visual Effects
                    </button>
                </div>
            </div>
        `
    },

    accessibility: {
        title: "Accessibility",
        description: "Adjust the website for easier and more comfortable use.",
        content: `
            <div class="accessibility-studio" id="accessibilityStudio">
                <div class="accessibility-overview">
                    <div class="accessibility-overview-icon">
                        <i class="fas fa-universal-access" aria-hidden="true"></i>
                    </div>

                    <div>
                        <h3>Accessibility Centre</h3>
                        <p>
                            Personalise text, motion, focus, contrast and pointer
                            assistance. Changes apply instantly across the complete
                            website and remain available after Login or Logout.
                        </p>
                    </div>

                    <span
                        class="accessibility-status"
                        id="accessibilityActiveStatus"
                        role="status"
                        aria-live="polite"
                    >
                        Standard mode
                    </span>
                </div>

                <div class="accessibility-option-grid">
                    <div class="accessibility-option-card">
                        <div class="accessibility-option-icon">
                            <i class="fas fa-text-height" aria-hidden="true"></i>
                        </div>
                        <div class="accessibility-option-copy">
                            <h4>Text Size</h4>
                            <p>Increase website text and interface scale.</p>
                        </div>
                        <div class="accessibility-card-control settings-select-wrap">
                            <select id="a11yTextSize" class="settings-select accessibility-select" aria-label="Text size">
                                <option value="100">100% Standard</option>
                                <option value="115">115% Large</option>
                                <option value="130">130% Larger</option>
                                <option value="150">150% Extra Large</option>
                            </select>
                            <i class="fas fa-chevron-down" aria-hidden="true"></i>
                        </div>
                    </div>

                    <div class="accessibility-option-card">
                        <div class="accessibility-option-icon">
                            <i class="fas fa-circle-half-stroke" aria-hidden="true"></i>
                        </div>
                        <div class="accessibility-option-copy">
                            <h4>High Contrast</h4>
                            <p>Use stronger colours and clearer borders.</p>
                        </div>
                        <label class="settings-switch accessibility-card-control">
                            <input type="checkbox" id="a11yHighContrast" aria-label="Enable high contrast">
                            <span class="settings-switch-slider"></span>
                        </label>
                    </div>

                    <div class="accessibility-option-card">
                        <div class="accessibility-option-icon">
                            <i class="fas fa-person-walking-arrow-loop-left" aria-hidden="true"></i>
                        </div>
                        <div class="accessibility-option-copy">
                            <h4>Reduce Motion</h4>
                            <p>Minimise animations and moving effects.</p>
                        </div>
                        <label class="settings-switch accessibility-card-control">
                            <input type="checkbox" id="a11yReduceMotion" aria-label="Reduce motion">
                            <span class="settings-switch-slider"></span>
                        </label>
                    </div>

                    <div class="accessibility-option-card">
                        <div class="accessibility-option-icon">
                            <i class="fas fa-keyboard" aria-hidden="true"></i>
                        </div>
                        <div class="accessibility-option-copy">
                            <h4>Enhanced Keyboard Focus</h4>
                            <p>Show a clear outline while using Tab.</p>
                        </div>
                        <label class="settings-switch accessibility-card-control">
                            <input type="checkbox" id="a11yFocusHighlight" aria-label="Enhance keyboard focus">
                            <span class="settings-switch-slider"></span>
                        </label>
                    </div>

                    <div class="accessibility-option-card">
                        <div class="accessibility-option-icon">
                            <i class="fas fa-font" aria-hidden="true"></i>
                        </div>
                        <div class="accessibility-option-copy">
                            <h4>Readable Font</h4>
                            <p>Use a simple, easy-to-read system font.</p>
                        </div>
                        <label class="settings-switch accessibility-card-control">
                            <input type="checkbox" id="a11yReadableFont" aria-label="Use readable font">
                            <span class="settings-switch-slider"></span>
                        </label>
                    </div>

                    <div class="accessibility-option-card">
                        <div class="accessibility-option-icon">
                            <i class="fas fa-align-left" aria-hidden="true"></i>
                        </div>
                        <div class="accessibility-option-copy">
                            <h4>Letter &amp; Line Spacing</h4>
                            <p>Add breathing room between text and lines.</p>
                        </div>
                        <label class="settings-switch accessibility-card-control">
                            <input type="checkbox" id="a11yTextSpacing" aria-label="Increase text spacing">
                            <span class="settings-switch-slider"></span>
                        </label>
                    </div>

                    <div class="accessibility-option-card">
                        <div class="accessibility-option-icon">
                            <i class="fas fa-link" aria-hidden="true"></i>
                        </div>
                        <div class="accessibility-option-copy">
                            <h4>Underline Links</h4>
                            <p>Make text links easier to recognise.</p>
                        </div>
                        <label class="settings-switch accessibility-card-control">
                            <input type="checkbox" id="a11yUnderlineLinks" aria-label="Underline text links">
                            <span class="settings-switch-slider"></span>
                        </label>
                    </div>

                    <div class="accessibility-option-card">
                        <div class="accessibility-option-icon">
                            <i class="fas fa-arrow-pointer" aria-hidden="true"></i>
                        </div>
                        <div class="accessibility-option-copy">
                            <h4>Large Cursor</h4>
                            <p>Add a visible pointer halo for easier tracking.</p>
                        </div>
                        <label class="settings-switch accessibility-card-control">
                            <input type="checkbox" id="a11yLargeCursor" aria-label="Enable large cursor halo">
                            <span class="settings-switch-slider"></span>
                        </label>
                    </div>

                    <div class="accessibility-option-card">
                        <div class="accessibility-option-icon">
                            <i class="fas fa-ruler-horizontal" aria-hidden="true"></i>
                        </div>
                        <div class="accessibility-option-copy">
                            <h4>Reading Guide</h4>
                            <p>Follow the current line with a horizontal guide.</p>
                        </div>
                        <label class="settings-switch accessibility-card-control">
                            <input type="checkbox" id="a11yReadingGuide" aria-label="Enable reading guide">
                            <span class="settings-switch-slider"></span>
                        </label>
                    </div>

                    <div class="accessibility-option-card">
                        <div class="accessibility-option-icon">
                            <i class="fas fa-eye" aria-hidden="true"></i>
                        </div>
                        <div class="accessibility-option-copy">
                            <h4>Colour Vision Support</h4>
                            <p>Choose an accent palette with clearer separation.</p>
                        </div>
                        <div class="accessibility-card-control settings-select-wrap">
                            <select id="a11yColorVision" class="settings-select accessibility-select" aria-label="Colour vision support">
                                <option value="standard">Standard Colours</option>
                                <option value="protanopia">Protanopia Support</option>
                                <option value="deuteranopia">Deuteranopia Support</option>
                                <option value="tritanopia">Tritanopia Support</option>
                            </select>
                            <i class="fas fa-chevron-down" aria-hidden="true"></i>
                        </div>
                    </div>
                </div>

                <div class="accessibility-footer">
                    <p>
                        These preferences follow “Remember Website Preferences”
                        and work in both Dark and Light modes.
                    </p>
                    <button type="button" id="resetAccessibility" class="settings-reset-btn">
                        <i class="fas fa-rotate-left" aria-hidden="true"></i>
                        Reset Accessibility
                    </button>
                </div>
            </div>
        `
    },

    about: {
        title: "About",
        description: "MA IT SERVICES, our founding organisation and Founder & Owner.",
        content: `
            <div class="settings-about-studio settings-about-expanded">
                <div class="settings-about-hero">
                    <div class="settings-about-logo">
                        <img src="images/logo.png" alt="MA IT SERVICES logo">
                    </div>
                    <div class="settings-about-summary">
                        <span>Who We Are &middot; Empowering The IT Solutions</span>
                        <h3>About MA IT SERVICES</h3>
                        <p class="settings-about-lead">
                            MA IT SERVICES provides reliable and affordable computer
                            repair, hardware upgrades, software support, IT consultation
                            and AI-enabled technology solutions for individuals,
                            businesses and institutions across Jammu &amp; Kashmir.
                        </p>
                        <p>
                            MA IT SERVICES is a professional IT solutions provider
                            dedicated to delivering reliable, affordable and high-quality
                            technology products and services for individuals, businesses
                            and institutions.
                        </p>
                        <p>
                            We specialize in computer hardware, software installation,
                            troubleshooting, maintenance, system upgrades, AI-powered
                            solutions and complete technical support services.
                        </p>
                        <p>
                            Our mission is to become a trusted technology partner by
                            providing innovative, efficient and customer-focused IT
                            solutions.
                        </p>

                        <div class="settings-about-service-tags" aria-label="MA IT SERVICES capabilities">
                            <span>Computer Repair</span>
                            <span>Hardware Upgrades</span>
                            <span>Software Support</span>
                            <span>IT Consultation</span>
                            <span>AI Solutions</span>
                        </div>
                    </div>
                </div>

                <article
                    class="settings-about-card settings-about-profile settings-company-profile"
                    id="settingsCompanyProfile"
                    aria-labelledby="settingsCompanyTitle"
                >
                    <div class="settings-company-logo">
                        <img
                            src="images/ma-studio-corp-logo.jpg"
                            alt="MA Studio Corp Ltd logo"
                            loading="lazy"
                            decoding="async"
                        >
                    </div>

                    <div class="settings-profile-copy">
                        <span class="settings-profile-kicker">Founding Organisation</span>
                        <h4 id="settingsCompanyTitle">MA STUDIO CORP LTD.</h4>
                        <p class="settings-company-legal-name">
                            MA STUDIO CORPORATIONS LIMITED — MUZAMIL AHMAD STUDIOS
                            CORPORATIONS LIMITED.
                        </p>
                        <p class="settings-company-tagline">
                            <strong>Empowering The Business Solutions</strong>
                        </p>
                        <p>
                            MA STUDIO INC. is the founding organization behind
                            MA IT SERVICES, delivering innovative business, technology
                            and AI solutions.
                        </p>

                        <ul class="settings-profile-contact-list">
                            <li>
                                <i class="fas fa-envelope" aria-hidden="true"></i>
                                <a href="mailto:MAStudio@outlook.in">MAStudio@outlook.in</a>
                            </li>
                            <li>
                                <i class="fas fa-envelope" aria-hidden="true"></i>
                                <a href="mailto:mastudioin219@gmail.com">mastudioin219@gmail.com</a>
                            </li>
                            <li>
                                <i class="fas fa-location-dot" aria-hidden="true"></i>
                                <span>Brein Nishat, Srinagar, 191121, Jammu &amp; Kashmir</span>
                            </li>
                            <li>
                                <i class="fas fa-building" aria-hidden="true"></i>
                                <span><strong>Headquarters:</strong> MA Road, Srinagar, J&amp;K</span>
                            </li>
                        </ul>
                    </div>
                </article>

                <article
                    class="settings-about-card settings-about-profile settings-founder-profile"
                    id="settingsFounderProfile"
                    aria-labelledby="settingsFounderTitle"
                >
                    <div class="settings-founder-portrait">
                        <img
                            src="images/founder.jpg"
                            alt="Mr Muzamil Ahmad Teli"
                            loading="lazy"
                            decoding="async"
                        >
                    </div>

                    <div class="settings-profile-copy settings-founder-copy">
                        <span class="settings-profile-kicker">Founder &amp; Owner</span>
                        <h4 id="settingsFounderTitle">MR MUZAMIL AHMAD TELI</h4>

                        <div class="settings-founder-details">
                            <section class="settings-founder-detail-block settings-founder-detail-wide">
                                <h5>
                                    <i class="fas fa-user-gear" aria-hidden="true"></i>
                                    Professional Expertise
                                </h5>
                                <ul class="settings-founder-role-tags">
                                    <li>IT – Information Technology Specialist</li>
                                    <li>BMS – Business Management Services Expert</li>
                                    <li>Artificial Intelligence</li>
                                    <li>Information Technology Services</li>
                                    <li>Android Developer</li>
                                    <li>Website Developer</li>
                                    <li>Front-End &amp; Back-End Developer</li>
                                    <li>IT Infrastructure Developer</li>
                                    <li>Leadership</li>
                                    <li>Customized Security &amp; Policy Solutions Developer</li>
                                    <li>Web AI Codex Developer</li>
                                </ul>
                            </section>

                            <section class="settings-founder-detail-block">
                                <h5>
                                    <i class="fas fa-briefcase" aria-hidden="true"></i>
                                    Leadership &amp; Career
                                </h5>
                                <p>
                                    <strong>CEO / Founder &amp; Business Administration Manager</strong>
                                    at MA Studio Inc Corporation Limited. Experienced in
                                    information technology, application development,
                                    website development, artificial intelligence, IT
                                    infrastructure, customized security solutions and
                                    business management services.
                                </p>
                            </section>

                            <section class="settings-founder-detail-block">
                                <h5>
                                    <i class="fas fa-laptop-code" aria-hidden="true"></i>
                                    Professional Experience
                                </h5>
                                <p>
                                    Worked with <strong>MIT App Inventor from 2023 to 2025</strong>
                                    as an Application Developer and worked with
                                    <strong>International Dynacons Systems and Solutions Limited</strong>
                                    as an IT Specialist.
                                </p>
                            </section>

                            <section class="settings-founder-detail-block">
                                <h5>
                                    <i class="fas fa-award" aria-hidden="true"></i>
                                    Certifications &amp; Recognition
                                </h5>
                                <p>
                                    BE 10X Workshop and recognition as a young and
                                    experienced Application Developer at MIT App Inventor.
                                </p>
                            </section>

                            <section class="settings-founder-detail-block settings-founder-detail-wide">
                                <h5>
                                    <i class="fas fa-lightbulb" aria-hidden="true"></i>
                                    Vision
                                </h5>
                                <p>
                                    A technology and business professional focused on
                                    developing reliable, affordable and future-ready
                                    digital solutions for individuals, businesses and
                                    institutions. His vision is to empower organizations
                                    through modern IT infrastructure, artificial
                                    intelligence, business management and professional
                                    technology services.
                                </p>
                            </section>
                        </div>

                        <a href="mailto:MUZAMIL.BUSINESS@OUTLOOK.IN" class="btn settings-founder-email">
                            <i class="fas fa-envelope" aria-hidden="true"></i>
                            Email The Founder
                        </a>
                    </div>
                </article>

            </div>
        `
    }
};
/* =========================================
   MOBILE SETTINGS - OPTIONS FIRST
========================================= */

const settingsSidebar = document.querySelector(".settings-sidebar");

function isMobileSettings() {
    return window.matchMedia("(max-width: 820px)").matches;
}

function showMobileSettingsOptions() {
    if (!isMobileSettings()) return;

    if (settingsSidebar) {
        settingsSidebar.classList.remove("mobile-section-open");
    }

    if (settingsContent) {
        settingsContent.classList.remove("mobile-section-open");
    }

    settingsNavItems.forEach((item) => {
        item.classList.remove("active");
    });
}
settingsNavItems.forEach((item) => {
    item.addEventListener("click", () => {
if (isMobileSettings()) {
    settingsSidebar?.classList.add("mobile-section-open");
    settingsContent?.classList.add("mobile-section-open");
}
        const sectionName = item.dataset.section;
        const section = settingsSections[sectionName];

        if (!section) return;

        settingsNavItems.forEach((button) => {
            button.classList.remove("active");
        });

        item.classList.add("active");

        if (window.history?.replaceState) {
            window.history.replaceState(null, "", `#${sectionName}`);
        }

        const sectionBody = section.content ?? `
    <div class="settings-placeholder-card">
        <i class="${section.icon}"></i>
        <h3>${section.heading}</h3>
        <p>${section.text}</p>
    </div>
`;

settingsContent.innerHTML = `
<button
    type="button"
    class="mobile-settings-back"
    id="mobileSettingsBack"
>
    <i class="fas fa-arrow-left"></i>
    Settings
</button>
    <div class="settings-content-header">
        <h2>${section.title}</h2>
        <p>${section.description}</p>
    </div>

    ${sectionBody}
`;
const mobileSettingsBack =
    document.getElementById("mobileSettingsBack");

if (mobileSettingsBack) {
    mobileSettingsBack.addEventListener("click", () => {
        showMobileSettingsOptions();
    });
}
syncGeneralControls();
syncAppearanceControls();
syncLanguageControls();
syncVisualEffectsControls();
syncAccessibilityControls();
    });
});
/* =========================================
   GENERAL SETTINGS
========================================= */

const VALID_START_SECTIONS = [
    "home",
    "services",
    "products",
    "highlights"
];

function normalizeStartSection(sectionName) {
    return VALID_START_SECTIONS.includes(sectionName)
        ? sectionName
        : GENERAL_DEFAULTS.defaultStartSection;
}

function applySmoothScrolling(enabled) {
    document.documentElement.setAttribute(
        "data-smooth-scroll",
        enabled ? "true" : "false"
    );

    writeWebsitePreference("maSmoothScrolling", enabled);
}

function applyDefaultStartSection(sectionName) {
    const normalizedSection = normalizeStartSection(sectionName);

    document.documentElement.setAttribute(
        "data-start-section",
        normalizedSection
    );

    writeWebsitePreference(
        "maDefaultStartSection",
        normalizedSection
    );
}

function syncGeneralControls() {
    const smoothScrollingSetting =
        document.getElementById("smoothScrollingSetting");
    const rememberPreferencesSetting =
        document.getElementById("rememberPreferencesSetting");
    const defaultStartSection =
        document.getElementById("defaultStartSection");

    if (smoothScrollingSetting) {
        smoothScrollingSetting.checked =
            readWebsitePreference("maSmoothScrolling") === "true";
    }

    if (rememberPreferencesSetting) {
        rememberPreferencesSetting.checked =
            shouldRememberWebsitePreferences();
    }

    if (defaultStartSection) {
        defaultStartSection.value = normalizeStartSection(
            readWebsitePreference("maDefaultStartSection")
        );
    }
}

document.addEventListener("change", (event) => {
    if (event.target.id === "smoothScrollingSetting") {
        applySmoothScrolling(event.target.checked);
    }

    if (event.target.id === "rememberPreferencesSetting") {
        setRememberWebsitePreferences(event.target.checked);
        syncGeneralControls();
    }

    if (event.target.id === "defaultStartSection") {
        applyDefaultStartSection(event.target.value);
    }

    if (event.target.id === "websiteLanguageSetting") {
        window.MA_LANGUAGE?.changeLanguage(event.target.value);
    }

    if (event.target.id === "visualEffectsMasterSetting") {
        window.MA_VISUAL_EFFECTS?.setEnabled(event.target.checked);
    }

    if (event.target.id === "visualEffectsIntensitySetting") {
        window.MA_VISUAL_EFFECTS?.setIntensity(event.target.value);
    }

    const accessibilityPreference =
        ACCESSIBILITY_CONTROL_BINDINGS[event.target.id];

    if (accessibilityPreference) {
        const value = event.target.matches("select")
            ? event.target.value
            : event.target.checked;

        window.MA_ACCESSIBILITY?.setPreference(
            accessibilityPreference,
            value
        );
    }
});

document.addEventListener("input", (event) => {
    if (event.target.id !== "languageSearchSetting") return;

    const languageSelect =
        document.getElementById("websiteLanguageSetting");

    window.MA_LANGUAGE?.populateSelect(
        languageSelect,
        event.target.value
    );
});

const savedSmoothScrolling =
    readWebsitePreference("maSmoothScrolling") === "true";
const savedDefaultStartSection =
    readWebsitePreference("maDefaultStartSection");

document.documentElement.setAttribute(
    "data-remember-preferences",
    shouldRememberWebsitePreferences() ? "true" : "false"
);
applySmoothScrolling(savedSmoothScrolling);
applyDefaultStartSection(savedDefaultStartSection);

/* =========================================
   APPEARANCE SETTINGS
========================================= */

function applyThemeMode(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    writeWebsitePreference("maThemeMode", theme);
}

document.addEventListener("change", (event) => {
    if (event.target.id === "themeModeSetting") {
        applyThemeMode(event.target.value);
    }
});

const savedThemeMode =
    readWebsitePreference("maThemeMode");

applyThemeMode(savedThemeMode);
function applyAccentStyle(accent, customColor) {
    if (window.MA_APPEARANCE) {
        return window.MA_APPEARANCE.apply(accent, customColor);
    }

    const fallbackColor = customColor || APPEARANCE_DEFAULTS.accentColor;
    document.documentElement.setAttribute("data-accent", accent);
    document.documentElement.setAttribute("data-accent-color", fallbackColor);
    writeWebsitePreference("maAccentStyle", accent);
    writeWebsitePreference("maAccentColor", fallbackColor);

    return { style: accent, color: fallbackColor };
}

function applyCustomAccentFromInput(value) {
    const normalizedColor = window.MA_APPEARANCE
        ? window.MA_APPEARANCE.normalizeHex(value, null)
        : /^#[0-9a-f]{6}$/i.test(value)
            ? value.toLowerCase()
            : null;

    if (!normalizedColor) return false;

    applyAccentStyle("custom", normalizedColor);

    if (!window.MA_APPEARANCE) {
        syncAppearanceControls();
    }

    return true;
}

document.addEventListener("click", (event) => {
    const presetButton = event.target.closest?.(".accent-preset-button");
    if (!presetButton) return;

    applyAccentStyle(presetButton.dataset.accentPreset);

    if (!window.MA_APPEARANCE) {
        syncAppearanceControls();
    }
});

document.addEventListener("input", (event) => {
    if (event.target.id === "accentColorPicker") {
        applyCustomAccentFromInput(event.target.value);
        return;
    }

    if (event.target.id === "accentHexInput") {
        event.target.classList.toggle(
            "is-invalid",
            !applyCustomAccentFromInput(event.target.value)
        );
    }
});

document.addEventListener("change", (event) => {
    if (
        event.target.id !== "accentHexInput" &&
        event.target.id !== "accentColorPicker"
    ) {
        return;
    }

    if (!applyCustomAccentFromInput(event.target.value)) {
        syncAppearanceControls();
    }
});

const savedAccentStyle =
    readWebsitePreference("maAccentStyle");
const savedAccentColor =
    readWebsitePreference("maAccentColor");

applyAccentStyle(savedAccentStyle, savedAccentColor);
function applyCompactInterface(enabled) {
    document.documentElement.setAttribute(
        "data-compact",
        enabled ? "true" : "false"
    );

    writeWebsitePreference(
        "maCompactInterface",
        enabled ? "true" : "false"
    );
}

document.addEventListener("change", (event) => {
    if (event.target.id === "compactInterfaceSetting") {
        applyCompactInterface(event.target.checked);
    }
});

const savedCompactInterface =
    readWebsitePreference("maCompactInterface") === "true";

applyCompactInterface(savedCompactInterface);

function applyGlassEffect(enabled) {
    document.documentElement.setAttribute(
        "data-glass",
        enabled ? "true" : "false"
    );

    writeWebsitePreference(
        "maGlassEffect",
        enabled ? "true" : "false"
    );
}

document.addEventListener("change", (event) => {
    if (event.target.id === "glassEffectSetting") {
        applyGlassEffect(event.target.checked);
    }
});

const savedGlassEffectValue =
    readWebsitePreference("maGlassEffect");

const savedGlassEffect =
    savedGlassEffectValue === "true";

applyGlassEffect(savedGlassEffect);

document.addEventListener("click", (event) => {
    const resetWebsiteButton =
        event.target.closest?.("#resetWebsiteSettings");
    const resetAppearanceButton =
        event.target.closest?.("#resetAppearanceSettings");
    const resetVisualEffectsButton =
        event.target.closest?.("#resetVisualEffects");
    const resetAccessibilityButton =
        event.target.closest?.("#resetAccessibility");

    if (resetWebsiteButton) {
        const languageNeedsReset =
            window.MA_LANGUAGE?.getSavedLanguage() !== "en";

        WEBSITE_PREFERENCE_KEYS.forEach((key) => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });

        localStorage.setItem("maRememberPreferences", "true");
        document.documentElement.setAttribute(
            "data-remember-preferences",
            "true"
        );

        applySmoothScrolling(GENERAL_DEFAULTS.smoothScrolling);
        applyDefaultStartSection(GENERAL_DEFAULTS.defaultStartSection);
        applyThemeMode(APPEARANCE_DEFAULTS.theme);
        applyAccentStyle(
            APPEARANCE_DEFAULTS.accent,
            APPEARANCE_DEFAULTS.accentColor
        );
        applyCompactInterface(APPEARANCE_DEFAULTS.compact);
        applyGlassEffect(APPEARANCE_DEFAULTS.glass);
        writeWebsitePreference("maWebsiteLanguage", "en");
        window.MA_VISUAL_EFFECTS?.reset();
        window.MA_ACCESSIBILITY?.reset();
        syncGeneralControls();
        syncAppearanceControls();
        syncLanguageControls();
        syncAccessibilityControls();

        if (languageNeedsReset) {
            window.MA_LANGUAGE?.changeLanguage("en");
        }
        return;
    }

    if (resetVisualEffectsButton) {
        window.MA_VISUAL_EFFECTS?.reset();
        return;
    }

    if (resetAccessibilityButton) {
        window.MA_ACCESSIBILITY?.reset();
        syncAccessibilityControls();
        return;
    }

    if (!resetAppearanceButton) return;

    applyThemeMode(APPEARANCE_DEFAULTS.theme);
    applyAccentStyle(
        APPEARANCE_DEFAULTS.accent,
        APPEARANCE_DEFAULTS.accentColor
    );
    applyCompactInterface(APPEARANCE_DEFAULTS.compact);
    applyGlassEffect(APPEARANCE_DEFAULTS.glass);
    syncAppearanceControls();
});

function syncAppearanceControls() {
    const themeModeSetting =
        document.getElementById("themeModeSetting");

    const accentColorPicker =
        document.getElementById("accentColorPicker");

    const accentHexInput =
        document.getElementById("accentHexInput");

    const activeAccentValue =
        document.getElementById("activeAccentValue");

    const activeAccent = window.MA_APPEARANCE?.getActiveAccent() || {
        style: readWebsitePreference("maAccentStyle"),
        color: readWebsitePreference("maAccentColor")
    };

    const compactInterfaceSetting =
        document.getElementById("compactInterfaceSetting");

    const glassEffectSetting =
        document.getElementById("glassEffectSetting");

    if (themeModeSetting) {
        themeModeSetting.value =
            readWebsitePreference("maThemeMode");
    }

    document.querySelectorAll(".accent-preset-button").forEach((button) => {
        const isActive = button.dataset.accentPreset === activeAccent.style;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    if (accentColorPicker) {
        accentColorPicker.value = activeAccent.color;
    }

    if (accentHexInput) {
        accentHexInput.value = activeAccent.color.toUpperCase();
        accentHexInput.classList.remove("is-invalid");
    }

    if (activeAccentValue) {
        activeAccentValue.textContent = activeAccent.color.toUpperCase();
    }

    if (compactInterfaceSetting) {
        compactInterfaceSetting.checked =
            readWebsitePreference("maCompactInterface") === "true";
    }

    if (glassEffectSetting) {
        glassEffectSetting.checked =
            readWebsitePreference("maGlassEffect") === "true";
    }
}

window.addEventListener("ma:accentchange", () => {
    syncAppearanceControls();
});

function syncAccessibilityControls() {
    const studio = document.getElementById("accessibilityStudio");
    if (!studio) return;

    const state = window.MA_ACCESSIBILITY?.getState() || {
        ...ACCESSIBILITY_DEFAULTS
    };

    Object.entries(ACCESSIBILITY_CONTROL_BINDINGS).forEach(
        ([controlId, preferenceName]) => {
            const control = document.getElementById(controlId);
            if (!control) return;

            if (control.matches("select")) {
                control.value = String(state[preferenceName]);
            } else {
                control.checked = Boolean(state[preferenceName]);
            }
        }
    );

    const activeStatus = document.getElementById(
        "accessibilityActiveStatus"
    );
    const activeCount = Object.keys(ACCESSIBILITY_DEFAULTS).filter(
        (key) => state[key] !== ACCESSIBILITY_DEFAULTS[key]
    ).length;

    studio.dataset.active = activeCount > 0 ? "true" : "false";

    if (activeStatus) {
        activeStatus.textContent = activeCount > 0
            ? `${activeCount} option${activeCount === 1 ? "" : "s"} active`
            : "Standard mode";
    }
}

let accessibilitySyncFrame = null;

window.addEventListener("ma:accessibilitychange", () => {
    if (!document.getElementById("accessibilityStudio")) return;
    if (accessibilitySyncFrame !== null) return;

    accessibilitySyncFrame = window.requestAnimationFrame(() => {
        accessibilitySyncFrame = null;
        syncAccessibilityControls();
    });
});

function syncLanguageControls() {
    const languageSelect =
        document.getElementById("websiteLanguageSetting");
    const selectedLanguageName =
        document.getElementById("selectedLanguageName");
    const languageCount =
        document.getElementById("languageCount");

    if (!languageSelect || !window.MA_LANGUAGE) return;

    window.MA_LANGUAGE.populateSelect(languageSelect);

    const savedLanguage =
        window.MA_LANGUAGE.getSavedLanguage();

    languageSelect.value = savedLanguage;

    if (selectedLanguageName) {
        selectedLanguageName.textContent =
            window.MA_LANGUAGE.getLanguageName(savedLanguage);
    }

    if (languageCount) {
        languageCount.textContent =
            `${window.MA_LANGUAGE.languages.length} languages available`;
    }
}

document.addEventListener("ma:language-ready", syncLanguageControls);

document.addEventListener("ma:language-unavailable", () => {
    const translationNote =
        document.getElementById("languageTranslationNote");

    if (translationNote) {
        translationNote.textContent =
            "Language list is available, but automatic translation could not connect. Check your internet connection and refresh.";
    }
});

/* =========================================
   VISUAL EFFECTS STUDIO
========================================= */

let activeVisualEffectsCategory = "all";
let visualEffectsSearchText = "";

function escapeVisualEffectsText(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renderVisualEffectsCategoryFilters() {
    const filters = document.getElementById(
        "visualEffectsCategoryFilters"
    );
    const effectsApi = window.MA_VISUAL_EFFECTS;

    if (!filters || !effectsApi) return;

    const filterButtons = [
        {
            id: "all",
            label: "All Effects",
            icon: "fas fa-border-all",
            count: effectsApi.totalEffects
        },
        ...effectsApi.categories.map((category) => ({
            id: category.id,
            label: category.shortLabel,
            icon: category.icon,
            count: category.names.length
        }))
    ];

    filters.innerHTML = filterButtons
        .map((filter) => {
            const activeClass =
                filter.id === activeVisualEffectsCategory
                    ? " active"
                    : "";

            return `
                <button
                    type="button"
                    class="vfx-filter-btn${activeClass}"
                    data-vfx-filter="${escapeVisualEffectsText(filter.id)}"
                >
                    <i class="${escapeVisualEffectsText(filter.icon)}" aria-hidden="true"></i>
                    ${escapeVisualEffectsText(filter.label)}
                    <span>${filter.count}</span>
                </button>
            `;
        })
        .join("");
}

function renderVisualEffectsCatalog() {
    const grid = document.getElementById("visualEffectsGrid");
    const resultCount = document.getElementById(
        "visualEffectsResultCount"
    );
    const effectsApi = window.MA_VISUAL_EFFECTS;

    if (!grid || !effectsApi) return;

    const state = effectsApi.getState();
    const searchValue = visualEffectsSearchText
        .trim()
        .toLocaleLowerCase();

    const visibleEffects = effectsApi.effects.filter((effect) => {
        const matchesCategory =
            activeVisualEffectsCategory === "all" ||
            effect.category === activeVisualEffectsCategory;
        const searchableText = [
            effect.name,
            effect.categoryLabel,
            effect.description,
            effect.id
        ]
            .join(" ")
            .toLocaleLowerCase();

        return (
            matchesCategory &&
            (!searchValue || searchableText.includes(searchValue))
        );
    });

    if (resultCount) {
        resultCount.innerHTML = `Showing <strong>${visibleEffects.length}</strong> of <strong>${effectsApi.totalEffects}</strong> effects`;
    }

    if (visibleEffects.length === 0) {
        grid.innerHTML = `
            <div class="vfx-empty-state">
                <i class="fas fa-magnifying-glass" aria-hidden="true"></i>
                <p>No visual effect matches this search.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = visibleEffects
        .map((effect) => {
            const isActive =
                state.selections[effect.category] === effect.id;
            const activeClass = isActive ? " active" : "";
            const statusText = isActive
                ? state.enabled
                    ? "Applied"
                    : "Selected"
                : "Apply Effect";
            const statusIcon = isActive
                ? "fa-solid fa-circle-check"
                : "fa-solid fa-wand-magic-sparkles";

            return `
                <button
                    type="button"
                    class="vfx-effect-card${activeClass}"
                    data-vfx-effect-id="${escapeVisualEffectsText(effect.id)}"
                    aria-pressed="${isActive ? "true" : "false"}"
                    style="--vfx-preview-mode:${effect.mode};--vfx-preview-strength:${effect.strength};"
                >
                    <span class="vfx-card-preview" aria-hidden="true">
                        <i class="${escapeVisualEffectsText(effect.icon)} vfx-preview-icon"></i>
                    </span>

                    <span class="vfx-card-body">
                        <span class="vfx-card-category">
                            ${escapeVisualEffectsText(effect.categoryLabel)}
                        </span>
                        <h4>${escapeVisualEffectsText(effect.name)}</h4>
                        <p>${escapeVisualEffectsText(effect.description)}</p>
                        <span class="vfx-card-status">
                            <span>Option ${effect.variant} / 20</span>
                            <span>
                                <i class="${statusIcon}" aria-hidden="true"></i>
                                ${statusText}
                            </span>
                        </span>
                    </span>
                </button>
            `;
        })
        .join("");
}

function syncVisualEffectsControls() {
    const effectsApi = window.MA_VISUAL_EFFECTS;
    const studio = document.getElementById("visualEffectsStudio");
    const masterSetting = document.getElementById(
        "visualEffectsMasterSetting"
    );
    const intensitySetting = document.getElementById(
        "visualEffectsIntensitySetting"
    );
    const totalLabel = document.getElementById("visualEffectsTotal");

    if (!effectsApi || !studio) return;

    const state = effectsApi.getState();

    studio.dataset.enabled = state.enabled ? "true" : "false";

    if (masterSetting) {
        masterSetting.checked = state.enabled;
    }

    if (intensitySetting) {
        intensitySetting.value = state.intensity;
    }

    if (totalLabel) {
        totalLabel.textContent = String(effectsApi.totalEffects);
    }

    renderVisualEffectsCategoryFilters();
    renderVisualEffectsCatalog();
}

let visualEffectsSearchTimer = null;

document.addEventListener("input", (event) => {
    if (event.target.id !== "visualEffectsSearch") return;

    visualEffectsSearchText = event.target.value;
    window.clearTimeout(visualEffectsSearchTimer);
    visualEffectsSearchTimer = window.setTimeout(() => {
        renderVisualEffectsCatalog();
    }, 120);
});

document.addEventListener("click", (event) => {
    const filterButton = event.target.closest?.("[data-vfx-filter]");
    const effectButton = event.target.closest?.("[data-vfx-effect-id]");

    if (filterButton) {
        const requestedCategory = filterButton.dataset.vfxFilter;
        const categoryExists =
            requestedCategory === "all" ||
            window.MA_VISUAL_EFFECTS?.categories.some(
                (category) => category.id === requestedCategory
            );

        if (!categoryExists) return;

        activeVisualEffectsCategory = requestedCategory;
        renderVisualEffectsCategoryFilters();
        renderVisualEffectsCatalog();
        return;
    }

    if (!effectButton || !window.MA_VISUAL_EFFECTS) return;

    if (!window.MA_VISUAL_EFFECTS.getState().enabled) {
        window.MA_VISUAL_EFFECTS.setEnabled(true);
    }

    window.MA_VISUAL_EFFECTS.selectEffect(
        effectButton.dataset.vfxEffectId
    );
});

let visualEffectsSyncFrame = null;

document.addEventListener("ma:vfx-change", () => {
    if (!document.getElementById("visualEffectsStudio")) return;
    if (visualEffectsSyncFrame !== null) return;

    visualEffectsSyncFrame = window.requestAnimationFrame(() => {
        visualEffectsSyncFrame = null;
        syncVisualEffectsControls();
    });
});

const requestedSettingsSection =
    window.location.hash.replace("#", "");
const safeRequestedSettingsSection =
    Object.prototype.hasOwnProperty.call(
        settingsSections,
        requestedSettingsSection
    )
        ? requestedSettingsSection
        : "general";
const initialSettingsButton =
    document.querySelector(
        `.settings-nav-item[data-section="${safeRequestedSettingsSection}"]`
    ) || document.querySelector(".settings-nav-item.active");

initialSettingsButton?.click();
