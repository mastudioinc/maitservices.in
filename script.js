/* =========================================
   LOAD SAVED WEBSITE SETTINGS
========================================= */

const WEBSITE_PREFERENCE_DEFAULTS = Object.freeze({
    maThemeMode: "dark",
    maAccentStyle: "purple",
    maAccentColor: "#7c5cff",
    maCompactInterface: "false",
    maGlassEffect: "true",
    maSmoothScrolling: "true",
    maDefaultStartSection: "home",
    maWebsiteLanguage: "en",
    maVisualEffectsEnabled: "true",
    maVisualEffectIntensity: "balanced",
    maVisualEffectSelections:
        window.MA_VISUAL_EFFECTS?.defaultSelectionsJSON || "{}",
    maA11yTextSize: "100",
    maA11yHighContrast: "false",
    maA11yReduceMotion: "false",
    maA11yFocusHighlight: "false",
    maA11yReadableFont: "false",
    maA11yTextSpacing: "false",
    maA11yUnderlineLinks: "false",
    maA11yLargeCursor: "false",
    maA11yReadingGuide: "false",
    maA11yColorVision: "standard"
});

const WEBSITE_PREFERENCE_KEYS =
    Object.keys(WEBSITE_PREFERENCE_DEFAULTS);

const VALID_START_SECTIONS = [
    "home",
    "services",
    "products",
    "highlights"
];

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

function normalizeStartSection(sectionName) {
    return VALID_START_SECTIONS.includes(sectionName)
        ? sectionName
        : WEBSITE_PREFERENCE_DEFAULTS.maDefaultStartSection;
}

function openDefaultStartSection() {
    const sectionName = normalizeStartSection(
        readWebsitePreference("maDefaultStartSection")
    );
    const targetSection = document.getElementById(sectionName);

    if (!targetSection) return;

    const behavior =
        readWebsitePreference("maSmoothScrolling") === "true" &&
        !window.MA_ACCESSIBILITY?.isMotionReduced()
            ? "smooth"
            : "auto";

    window.requestAnimationFrame(() => {
        targetSection.scrollIntoView({
            behavior,
            block: "start"
        });
    });
}

function syncSavedWebsiteSettings() {
    const savedWebsiteTheme =
        readWebsitePreference("maThemeMode");

    const savedWebsiteAccent =
        readWebsitePreference("maAccentStyle");

    const savedWebsiteAccentColor =
        readWebsitePreference("maAccentColor");

    const savedCompactInterface =
        readWebsitePreference("maCompactInterface") === "true";

    const savedGlassEffectValue =
        readWebsitePreference("maGlassEffect");

    const savedGlassEffect =
        savedGlassEffectValue === "true";

    const savedSmoothScrolling =
        readWebsitePreference("maSmoothScrolling") === "true";

    const savedDefaultStartSection = normalizeStartSection(
        readWebsitePreference("maDefaultStartSection")
    );

    document.documentElement.setAttribute(
        "data-theme",
        savedWebsiteTheme
    );

    if (window.MA_APPEARANCE) {
        window.MA_APPEARANCE.apply(
            savedWebsiteAccent,
            savedWebsiteAccentColor,
            { persist: false, announce: false }
        );
    } else {
        document.documentElement.setAttribute(
            "data-accent",
            savedWebsiteAccent
        );
    }

    document.documentElement.setAttribute(
        "data-compact",
        savedCompactInterface ? "true" : "false"
    );

    document.documentElement.setAttribute(
        "data-glass",
        savedGlassEffect ? "true" : "false"
    );

    document.documentElement.setAttribute(
        "data-smooth-scroll",
        savedSmoothScrolling ? "true" : "false"
    );

    document.documentElement.setAttribute(
        "data-start-section",
        savedDefaultStartSection
    );

    document.documentElement.setAttribute(
        "data-remember-preferences",
        shouldRememberWebsitePreferences() ? "true" : "false"
    );

    window.MA_VISUAL_EFFECTS?.sync();
    window.MA_ACCESSIBILITY?.sync();
}

syncSavedWebsiteSettings();

/* Re-apply settings when returning from Settings page */
window.addEventListener("pageshow", () => {
    syncSavedWebsiteSettings();
});

window.addEventListener("focus", () => {
    syncSavedWebsiteSettings();
});

window.addEventListener("storage", (event) => {
    if (
        WEBSITE_PREFERENCE_KEYS.includes(event.key) ||
        event.key === "maRememberPreferences"
    ) {
        syncSavedWebsiteSettings();
    }
});
const SUPABASE_URL = "https://bssjncbsxnynsriqunrf.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_bNNHzk3Af3ME696lO3Qz9g_ANYWLmOO";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

const USER_AVATAR_BUCKET = "user-avatars";

supabaseClient.auth.onAuthStateChange((event, session) => {
    window.MA_APPEARANCE?.sync();
    window.MA_VISUAL_EFFECTS?.sync();
    window.MA_ACCESSIBILITY?.sync();

    window.setTimeout(() => {
        if (
            session?.user &&
            ["INITIAL_SESSION", "SIGNED_IN", "USER_UPDATED", "TOKEN_REFRESHED"].includes(event)
        ) {
            showAuthenticatedWebsite(session.user);
            return;
        }

        if (event === "SIGNED_OUT") {
            showSignedOutWebsite();
        }
    }, 0);
});

console.log("MA IT SERVICES: Supabase client connected");
const authScreen = document.getElementById("auth-screen");
const loginForm = document.getElementById("login-form");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const loginPasswordToggle = document.getElementById("loginPasswordToggle");
const authThemeToggle = document.getElementById("authThemeToggle");
const loginMessage = document.getElementById("login-message");
const forgotPasswordBtn = document.getElementById("forgot-password-btn");
const createAccountBtn = document.getElementById("create-account-btn");
const signupSection = document.getElementById("signup-section");
const signupForm = document.getElementById("signup-form");
const signupFullName = document.getElementById("signup-full-name");
const signupEmail = document.getElementById("signup-email");
const signupPassword = document.getElementById("signup-password");
const signupConfirmPassword = document.getElementById("signup-confirm-password");
const signupMessage = document.getElementById("signup-message");
const backToLoginBtn = document.getElementById("back-to-login-btn");
const signupOtpSection = document.getElementById("signup-otp-section");
const signupOtpInput = document.getElementById("signup-otp");
const verifySignupOtpBtn = document.getElementById("verify-signup-otp-btn");
const resendSignupOtpBtn = document.getElementById("resend-signup-otp-btn");
const signupOtpMessage = document.getElementById("signup-otp-message");
const headerUserAvatarImage = document.getElementById("headerUserAvatarImage");
const headerUserAvatarFallback = document.getElementById("headerUserAvatarFallback");
const userProfileButton = document.getElementById("userProfileBtn");
const loginTitle = document.querySelector(".auth-box > h2");
const loginSubtitle = document.querySelector(".auth-box > p");
let pendingSignupEmail = "";
let pendingSignupFullName = "";
let pendingSignupPassword = "";

function getAccountDisplayName(user) {
    const metadata = user?.user_metadata || {};

    return (
        metadata.full_name ||
        metadata.name ||
        metadata.display_name ||
        user?.email?.split("@")[0] ||
        "User"
    );
}

function clearHeaderUserProfile() {
    if (headerUserAvatarImage) {
        headerUserAvatarImage.removeAttribute("src");
        headerUserAvatarImage.hidden = true;
    }

    if (headerUserAvatarFallback) {
        headerUserAvatarFallback.hidden = false;
    }

    userProfileButton?.classList.remove("has-user-avatar");
    userProfileButton?.setAttribute("aria-label", "Open User Settings");
}

async function syncHeaderUserProfile(user) {
    clearHeaderUserProfile();

    if (!user) return;

    const displayName = getAccountDisplayName(user);
    const avatarPath = user.user_metadata?.avatar_path;
    const showAvatarInHeader =
        user.user_metadata?.ma_preferences?.privacy
            ?.show_avatar_in_header !== false;

    userProfileButton?.setAttribute(
        "aria-label",
        `Open User Settings for ${displayName}`
    );

    if (
        !showAvatarInHeader ||
        !avatarPath ||
        !headerUserAvatarImage ||
        !headerUserAvatarFallback
    ) {
        return;
    }

    const { data, error } = await supabaseClient.storage
        .from(USER_AVATAR_BUCKET)
        .createSignedUrl(avatarPath, 3600);

    if (error || !data?.signedUrl) return;

    const version = encodeURIComponent(
        user.user_metadata?.avatar_updated_at || "current"
    );

    headerUserAvatarImage.src = `${data.signedUrl}&v=${version}`;
    headerUserAvatarImage.hidden = false;
    headerUserAvatarFallback.hidden = true;
    userProfileButton?.classList.add("has-user-avatar");
}

function showAuthenticatedWebsite(user) {
    if (authScreen) {
        authScreen.style.display = "none";
    }

    document.body.classList.remove("auth-locked");
    document.body.classList.remove("ma-vfx-auth-page");
    window.MA_VISUAL_EFFECTS?.sync();
    syncHeaderUserProfile(user);
}

function showSignedOutWebsite() {
    if (authScreen) {
        authScreen.style.display = "";
    }

    document.body.classList.add("auth-locked");
    clearHeaderUserProfile();
}

async function initializeWebsiteAuthentication() {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data?.user) {
        clearHeaderUserProfile();
        return;
    }

    showAuthenticatedWebsite(data.user);
}

initializeWebsiteAuthentication();
if (signupOtpInput) {
    signupOtpInput.addEventListener("input", () => {
        signupOtpInput.value = signupOtpInput.value
            .replace(/\D/g, "")
            .slice(0, 6);
    });
}
 if (loginPasswordToggle && loginPassword) {
    loginPasswordToggle.addEventListener("click", () => {

        const isHidden = loginPassword.type === "password";

        loginPassword.type = isHidden ? "text" : "password";

        const icon = loginPasswordToggle.querySelector("i");

        if (isHidden) {
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");
            loginPasswordToggle.setAttribute("aria-label", "Hide password");
        } else {
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
            loginPasswordToggle.setAttribute("aria-label", "Show password");
        }
    });
}
function updateAuthThemeIcon() {
    if (!authThemeToggle) return;

    const icon = authThemeToggle.querySelector("i");

    let currentTheme =
        document.documentElement.getAttribute("data-theme");

    if (currentTheme === "system") {
        currentTheme =
            window.matchMedia("(prefers-color-scheme: light)").matches
                ? "light"
                : "dark";
    }

    if (currentTheme === "light") {
        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");
        authThemeToggle.title = "Switch to Dark Mode";
    } else {
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
        authThemeToggle.title = "Switch to Light Mode";
    }
}

if (authThemeToggle) {
    authThemeToggle.addEventListener("click", () => {

        let currentTheme =
            document.documentElement.getAttribute("data-theme");

        if (currentTheme === "system") {
            currentTheme =
                window.matchMedia("(prefers-color-scheme: light)").matches
                    ? "light"
                    : "dark";
        }

        const newTheme =
            currentTheme === "light" ? "dark" : "light";

        document.documentElement.setAttribute(
            "data-theme",
            newTheme
        );

        writeWebsitePreference(
            "maThemeMode",
            newTheme
        );

        updateAuthThemeIcon();
    });
}

updateAuthThemeIcon();
if (createAccountBtn) {
    createAccountBtn.addEventListener("click", () => {
        loginTitle.style.display = "none";
        loginSubtitle.style.display = "none";

        loginForm.style.display = "none";
        forgotPasswordBtn.style.display = "none";
        createAccountBtn.style.display = "none";
        loginMessage.style.display = "none";

        signupSection.hidden = false;
    });
}
if (backToLoginBtn) {
    backToLoginBtn.addEventListener("click", () => {

        signupSection.hidden = true;
signupOtpSection.hidden = true;
signupForm.style.display = "";

signupOtpInput.value = "";
signupOtpMessage.textContent = "";

pendingSignupEmail = "";
pendingSignupFullName = "";
pendingSignupPassword = "";

if (resendOtpTimer) {
    clearInterval(resendOtpTimer);
    resendOtpTimer = null;
}

resendSignupOtpBtn.disabled = false;
resendSignupOtpBtn.textContent = "Resend Code";
        loginTitle.style.display = "";
        loginSubtitle.style.display = "";

        loginForm.style.display = "";
        forgotPasswordBtn.style.display = "";
        createAccountBtn.style.display = "";
        loginMessage.style.display = "";

        signupForm.reset();
        signupMessage.textContent = "";
    });
}
if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener("click", () => {
        window.location.href = "forgot-password.html";
    });
}
if (signupForm) {
    signupForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const fullName = signupFullName.value.trim();
        const email = signupEmail.value.trim();
        const password = signupPassword.value;
        const confirmPassword = signupConfirmPassword.value;

        signupMessage.textContent = "";

        if (password !== confirmPassword) {
            signupMessage.textContent = "Passwords do not match.";
            return;
        }

        signupMessage.textContent = "Sending verification code...";

const response = await fetch(
    `${SUPABASE_URL}/functions/v1/send-signup-otp`,
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_PUBLISHABLE_KEY
        },
        body: JSON.stringify({
            email: email,
            fullName: fullName
        })
    }
);

const result = await response.json();

if (!response.ok) {
    signupMessage.textContent =
        result.error || "Unable to send verification code.";
    return;
}

pendingSignupEmail = email;
pendingSignupFullName = fullName;
pendingSignupPassword = password;

signupMessage.textContent = "";

signupForm.style.display = "none";
signupOtpSection.hidden = false;

signupOtpInput.value = "";

signupOtpMessage.textContent =
    result.message || "Verification code sent. Check your email.";
    startResendOtpCountdown(60);
    });
}if (verifySignupOtpBtn) {
    verifySignupOtpBtn.addEventListener("click", async () => {

        const otp = signupOtpInput.value.trim();

        signupOtpMessage.textContent = "";

        if (!/^\d{6}$/.test(otp)) {
            signupOtpMessage.textContent =
                "Please enter the 6-digit verification code.";
            return;
        }

        if (
            !pendingSignupEmail ||
            !pendingSignupPassword
        ) {
            signupOtpMessage.textContent =
                "Signup session expired. Please create your account again.";
            return;
        }

        signupOtpMessage.textContent =
            "Verifying your email...";
verifySignupOtpBtn.disabled = true;
verifySignupOtpBtn.textContent = "Verifying...";
        const response = await fetch(
            `${SUPABASE_URL}/functions/v1/verify-signup-otp`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_PUBLISHABLE_KEY
                },
                body: JSON.stringify({
                    email: pendingSignupEmail,
                    otp: otp,
                    password: pendingSignupPassword
                })
            }
        );

        const result = await response.json();
verifySignupOtpBtn.disabled = false;
verifySignupOtpBtn.textContent = "Verify & Create Account";
        if (!response.ok) {
            signupOtpMessage.textContent =
                result.error || "Unable to verify the code.";
            return;
        }

        signupOtpMessage.textContent =
            "Email verified. Account created successfully - WELCOME TO MUZAMIL AHMAD TELI'S DATABASE";

        pendingSignupEmail = "";
        pendingSignupFullName = "";
        pendingSignupPassword = "";
if (resendOtpTimer) {
    clearInterval(resendOtpTimer);
    resendOtpTimer = null;
}

resendSignupOtpBtn.disabled = false;
resendSignupOtpBtn.textContent = "Resend Code";
        signupForm.reset();
        signupOtpInput.value = "";

        setTimeout(() => {
            signupOtpSection.hidden = true;
            signupSection.hidden = true;

            loginTitle.style.display = "";
            loginSubtitle.style.display = "";
            loginForm.style.display = "";
            forgotPasswordBtn.style.display = "";
            createAccountBtn.style.display = "";
            loginMessage.style.display = "";

            loginMessage.textContent =
                "Account created successfully. Please sign in.";
        }, 1500);
    });
}
let resendOtpTimer = null;

function startResendOtpCountdown(seconds = 60) {
    if (!resendSignupOtpBtn) return;

    if (resendOtpTimer) {
        clearInterval(resendOtpTimer);
    }

    let remaining = seconds;

    resendSignupOtpBtn.disabled = true;
    resendSignupOtpBtn.textContent = `Resend Code (${remaining}s)`;

    resendOtpTimer = setInterval(() => {
        remaining--;

        if (remaining <= 0) {
            clearInterval(resendOtpTimer);
            resendOtpTimer = null;

            resendSignupOtpBtn.disabled = false;
            resendSignupOtpBtn.textContent = "Resend Code";
            return;
        }

        resendSignupOtpBtn.textContent =
            `Resend Code (${remaining}s)`;

    }, 1000);
}
if (resendSignupOtpBtn) {
    resendSignupOtpBtn.addEventListener("click", async () => {

        signupOtpMessage.textContent = "";

        if (
            !pendingSignupEmail ||
            !pendingSignupFullName
        ) {
            signupOtpMessage.textContent =
                "Signup session expired. Please create your account again.";
            return;
        }

        resendSignupOtpBtn.disabled = true;

        signupOtpMessage.textContent =
            "Sending a new verification code...";

        try {
            const response = await fetch(
                `${SUPABASE_URL}/functions/v1/send-signup-otp`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "apikey": SUPABASE_PUBLISHABLE_KEY
                    },
                    body: JSON.stringify({
                        email: pendingSignupEmail,
                        fullName: pendingSignupFullName
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                signupOtpMessage.textContent =
                    result.error || "Unable to resend verification code.";
                return;
            }

            signupOtpInput.value = "";

            signupOtpMessage.textContent =
                result.message ||
                "A new verification code has been sent.";
startResendOtpCountdown(60);
        } catch (error) {
            console.error("Resend OTP failed:", error);

            signupOtpMessage.textContent =
                "Unable to resend verification code right now.";
       } finally {
    if (!resendOtpTimer) {
        resendSignupOtpBtn.disabled = false;
        resendSignupOtpBtn.textContent = "Resend Code";
    }
}
    });
}
if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = loginEmail.value.trim();
        const password = loginPassword.value;

        loginMessage.textContent = "Signing in...";

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            loginMessage.textContent = error.message;
            console.error("Login failed:", error);
            return;
        }

        loginMessage.textContent = "Login successful";
        showAuthenticatedWebsite(data.user);
        openDefaultStartSection();
    });
}
const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");
const topBtn = document.getElementById("topBtn");

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const closeLightbox = document.querySelector(".close-lightbox");

/* MOBILE MENU */

function setMobileMenu(open) {
    if (!menuBtn || !navMenu) return;

    navMenu.classList.toggle("active", open);
    document.body.classList.toggle("mobile-menu-open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute(
        "aria-label",
        open ? "Close navigation menu" : "Open navigation menu"
    );

    const icon = menuBtn.querySelector("i");
    icon?.classList.toggle("fa-bars", !open);
    icon?.classList.toggle("fa-xmark", open);
}

if (menuBtn) {
    menuBtn.addEventListener("click", () => {
        setMobileMenu(!navMenu?.classList.contains("active"));
    });
}

document.querySelectorAll(".navbar a").forEach(link => {
    link.addEventListener("click", () => {
        setMobileMenu(false);
    });
});

/* SCROLL REVEAL */

const reveals = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
        });
    }, {
        rootMargin: "0px 0px -110px 0px",
        threshold: 0.01
    });

    reveals.forEach((section) => revealObserver.observe(section));
} else {
    reveals.forEach((section) => section.classList.add("active"));
}

/* BACK TO TOP */

if (topBtn) {
    topBtn.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior:
                readWebsitePreference("maSmoothScrolling") === "true" &&
                !window.MA_ACCESSIBILITY?.isMotionReduced()
                    ? "smooth"
                    : "auto"
        });

    });
}

/* IMAGE LIGHTBOX */

function openImage(src) {
    lightbox.style.display = "flex";
    lightboxImg.src = src;
}

if (closeLightbox) {
    closeLightbox.addEventListener("click", () => {
        lightbox.style.display = "none";
    });
}

if (lightbox) {

    lightbox.addEventListener("click", (e) => {

        if (e.target === lightbox) {
            lightbox.style.display = "none";
        }

    });

}

/* ESC KEY SUPPORT */

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        if (lightbox) {
            lightbox.style.display = "none";
        }

        if (navMenu) {
            setMobileMenu(false);
        }

    }

});

/* ACTIVE NAV LINKS */

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".navbar a");
const header = document.querySelector(".header");
const progressBar = document.getElementById("progress-bar");
let sectionOffsets = [];
let activeNavigationId = "";
let scrollUpdateFrame = null;

function refreshSectionOffsets() {
    sectionOffsets = Array.from(sections)
        .filter((section) => section.id)
        .map((section) => ({
            id: section.id,
            top: section.offsetTop - 150
        }));
}

function updateActiveNavigation(scrollPosition) {
    let currentId = "";

    sectionOffsets.forEach((section) => {
        if (scrollPosition >= section.top) {
            currentId = section.id;
        }
    });

    if (currentId === activeNavigationId) return;
    activeNavigationId = currentId;

    navLinks.forEach((link) => {
        link.classList.toggle(
            "active-link",
            link.getAttribute("href") === `#${currentId}`
        );
    });
}

function updateScrollInterface() {
    scrollUpdateFrame = null;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
    );

    header?.classList.toggle("scrolled", scrollTop > 56);
    topBtn?.classList.toggle("is-visible", scrollTop > 400);

    if (progressBar) {
        const progress = Math.min(1, Math.max(0, scrollTop / scrollHeight));
        progressBar.style.transform = `scaleX(${progress})`;
    }

    updateActiveNavigation(scrollTop);
}

function requestScrollInterfaceUpdate() {
    if (scrollUpdateFrame !== null) return;
    scrollUpdateFrame = window.requestAnimationFrame(updateScrollInterface);
}

function refreshResponsiveMeasurements() {
    if (window.innerWidth > 900 && navMenu?.classList.contains("active")) {
        setMobileMenu(false);
    }

    refreshSectionOffsets();
    requestScrollInterfaceUpdate();
}

window.addEventListener("scroll", requestScrollInterfaceUpdate, {
    passive: true
});
window.addEventListener("resize", refreshResponsiveMeasurements, {
    passive: true
});
window.addEventListener("load", refreshResponsiveMeasurements);
window.addEventListener("pageshow", refreshResponsiveMeasurements);

if (document.fonts?.ready) {
    document.fonts.ready.then(refreshResponsiveMeasurements);
}

refreshResponsiveMeasurements();

// TYPING EFFECT

const words = [
    "Computer Hardware Experts",
    "Professional IT Solutions",
    "Desktop Support Specialists",
    "AI & Business Technology"
];

let wordIndex = 0;
let charIndex = 0;
let deleting = false;

const typed = document.getElementById("typed");
let typingTimer = null;
let typingMotionPaused = false;

function typeEffect(){

    typingTimer = null;
    if(!typed) return;

    if (window.MA_ACCESSIBILITY?.isMotionReduced()) {
        typed.textContent = words[1];
        typingMotionPaused = true;
        return;
    }

    if (document.hidden) {
        typingTimer = window.setTimeout(typeEffect, 600);
        return;
    }

    const current = words[wordIndex];

    if(!deleting){
        typed.textContent = current.substring(0, charIndex++);
    }else{
        typed.textContent = current.substring(0, charIndex--);
    }

    let speed = deleting ? 50 : 100;

    if(charIndex === current.length + 1){
        deleting = true;
        speed = 1500;
    }

    if(charIndex === 0 && deleting){
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
    }

    typingTimer = window.setTimeout(typeEffect, speed);
}

function syncTypingMotionPreference() {
    if (!typed) return;

    if (typingTimer !== null) {
        window.clearTimeout(typingTimer);
        typingTimer = null;
    }

    if (window.MA_ACCESSIBILITY?.isMotionReduced()) {
        typed.textContent = words[1];
        typingMotionPaused = true;
        return;
    }

    if (typingMotionPaused) {
        wordIndex = 1;
        charIndex = 0;
        deleting = false;
        typingMotionPaused = false;
    }

    typeEffect();
}

window.addEventListener(
    "ma:accessibilitychange",
    syncTypingMotionPreference
);

syncTypingMotionPreference();
// =========================
// CURSOR GLOW EFFECT
// =========================

const cursorGlow = document.querySelector(".cursor-glow");

if (
    cursorGlow &&
    !window.MA_VISUAL_EFFECTS &&
    window.matchMedia("(pointer: fine)").matches
) {
    let legacyCursorFrame = null;
    let legacyCursorX = -500;
    let legacyCursorY = -500;

    document.addEventListener("pointermove", (event) => {
        legacyCursorX = event.clientX;
        legacyCursorY = event.clientY;

        if (legacyCursorFrame !== null) return;
        legacyCursorFrame = window.requestAnimationFrame(() => {
            legacyCursorFrame = null;
            cursorGlow.style.transform =
                `translate3d(${legacyCursorX}px, ${legacyCursorY}px, 0) translate(-50%, -50%)`;
        });
    }, { passive: true });
}

// =========================
// LOADER
// =========================

window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    if (!loader) return;

    setTimeout(() => {
        loader.classList.add("hide");
    }, 300);

});
