/* =========================================
   MA IT SERVICES - COMPLETE USER SETTINGS
========================================= */

(function initializeCompleteUserSettings() {
    "use strict";

    const profileApi = window.MA_USER_PROFILE;
    if (!profileApi) return;

    const authClient = profileApi.getClient();
    const DEVICE_PREFERENCE_KEY = "maUserDevicePreferencesV1";
    const WEBSITE_PREFERENCE_KEYS = Object.freeze([
        "maThemeMode",
        "maAccentStyle",
        "maAccentColor",
        "maCompactInterface",
        "maGlassEffect",
        "maSmoothScrolling",
        "maDefaultStartSection",
        "maWebsiteLanguage",
        "maVisualEffectsEnabled",
        "maVisualEffectIntensity",
        "maVisualEffectSelections",
        "maVisualEffectsProfileV1",
        "maA11yTextSize",
        "maA11yHighContrast",
        "maA11yReduceMotion",
        "maA11yFocusHighlight",
        "maA11yReadableFont",
        "maA11yTextSpacing",
        "maA11yUnderlineLinks",
        "maA11yLargeCursor",
        "maA11yReadingGuide",
        "maA11yColorVision"
    ]);
    const SECTION_CONTENT = Object.freeze({
        profile: {
            eyebrow: "Personal Account",
            title: "My Profile",
            description: "Manage the profile information connected permanently to your account."
        },
        security: {
            eyebrow: "Account Protection",
            title: "Login & Security",
            description: "Protect your password and control active account sessions."
        },
        notifications: {
            eyebrow: "Communication Controls",
            title: "Notifications",
            description: "Manage account communication choices and this device's browser notifications."
        },
        privacy: {
            eyebrow: "Private by Design",
            title: "Privacy & Data",
            description: "Control profile display, local preferences and data available to this website."
        }
    });

    const tabs = Array.from(document.querySelectorAll("[data-user-settings-tab]"));
    const panels = Array.from(document.querySelectorAll("[data-user-settings-panel]"));
    const pageEyebrow = document.getElementById("userSettingsEyebrow");
    const pageTitle = document.getElementById("userSettingsTitle");
    const pageDescription = document.getElementById("userSettingsDescription");

    const profileDetailsForm = document.getElementById("profileDetailsForm");
    const profileFullName = document.getElementById("profileFullName");
    const profilePhone = document.getElementById("profilePhone");
    const profileLocation = document.getElementById("profileLocation");
    const profileDetailsStatus = document.getElementById("profileDetailsStatus");

    const securityEmailValue = document.getElementById("securityEmailValue");
    const securityEmailStatus = document.getElementById("securityEmailStatus");
    const securityLastSignIn = document.getElementById("securityLastSignIn");
    const changePasswordForm = document.getElementById("changePasswordForm");
    const currentPassword = document.getElementById("currentPassword");
    const newPassword = document.getElementById("newPassword");
    const confirmNewPassword = document.getElementById("confirmNewPassword");
    const passwordReauthCodeField = document.getElementById("passwordReauthCodeField");
    const passwordReauthCode = document.getElementById("passwordReauthCode");
    const changePasswordButton = document.getElementById("changePasswordButton");
    const sendPasswordRecoveryButton = document.getElementById("sendPasswordRecoveryButton");
    const changePasswordStatus = document.getElementById("changePasswordStatus");
    const passwordRuleItems = Array.from(document.querySelectorAll("[data-password-rule]"));
    const signOutOtherSessionsButton = document.getElementById("signOutOtherSessionsButton");
    const signOutAllSessionsButton = document.getElementById("signOutAllSessionsButton");
    const sessionActionStatus = document.getElementById("sessionActionStatus");
    const sessionActionDialog = document.getElementById("sessionActionDialog");
    const sessionActionDialogTitle = document.getElementById("sessionActionDialogTitle");
    const sessionActionDialogDescription = document.getElementById("sessionActionDialogDescription");

    const notificationPreferencesForm = document.getElementById("notificationPreferencesForm");
    const notificationServiceUpdates = document.getElementById("notificationServiceUpdates");
    const notificationProductNews = document.getElementById("notificationProductNews");
    const notificationPreferencesStatus = document.getElementById("notificationPreferencesStatus");
    const browserNotificationsEnabled = document.getElementById("browserNotificationsEnabled");
    const browserNotificationPermissionText = document.getElementById("browserNotificationPermissionText");
    const sendTestNotificationButton = document.getElementById("sendTestNotificationButton");
    const browserNotificationStatus = document.getElementById("browserNotificationStatus");

    const privacyPreferencesForm = document.getElementById("privacyPreferencesForm");
    const privacyShowAvatarInHeader = document.getElementById("privacyShowAvatarInHeader");
    const privacyRememberWebsitePreferences = document.getElementById("privacyRememberWebsitePreferences");
    const privacyPreferencesStatus = document.getElementById("privacyPreferencesStatus");
    const privacyAccountId = document.getElementById("privacyAccountId");
    const privacyAccountCreatedAt = document.getElementById("privacyAccountCreatedAt");
    const goToProfilePhotoButton = document.getElementById("goToProfilePhotoButton");
    const downloadAccountDataButton = document.getElementById("downloadAccountDataButton");
    const clearDevicePreferencesButton = document.getElementById("clearDevicePreferencesButton");
    const clearDevicePreferencesDialog = document.getElementById("clearDevicePreferencesDialog");
    const downloadAccountDataStatus = document.getElementById("downloadAccountDataStatus");

    let activeUser = null;
    let activeSection = "profile";
    let securityBusy = false;
    let profileDetailsBusy = false;
    let notificationPreferencesBusy = false;
    let privacyPreferencesBusy = false;
    let passwordNonceRequested = false;
    let pendingSessionScope = "";
    let profileDetailsDirty = false;
    let notificationPreferencesDirty = false;
    let privacyPreferencesDirty = false;

    function isPlainObject(value) {
        return Boolean(value && typeof value === "object" && !Array.isArray(value));
    }

    function normalizeAccountPreferences(value) {
        const source = isPlainObject(value) ? value : {};
        const notifications = isPlainObject(source.notifications)
            ? source.notifications
            : {};
        const privacy = isPlainObject(source.privacy) ? source.privacy : {};

        return {
            schema_version: 1,
            notifications: {
                service_updates_opt_in:
                    notifications.service_updates_opt_in === true,
                product_news_opt_in:
                    notifications.product_news_opt_in === true
            },
            privacy: {
                show_avatar_in_header:
                    privacy.show_avatar_in_header !== false
            },
            updated_at:
                typeof source.updated_at === "string"
                    ? source.updated_at
                    : null
        };
    }

    function getAccountPreferences(user = activeUser) {
        return normalizeAccountPreferences(
            user?.user_metadata?.ma_preferences
        );
    }

    function getErrorMessage(error, fallback) {
        const code = String(error?.code || "").toLowerCase();
        const message = String(error?.message || "").toLowerCase();

        if (code.includes("invalid_credentials") || message.includes("invalid login credentials")) {
            return "The current password is incorrect.";
        }
        if (code.includes("weak_password") || message.includes("weak password")) {
            return "Supabase rejected this password as too weak. Choose a stronger password.";
        }
        if (code.includes("same_password") || message.includes("different from the old password")) {
            return "The new password must be different from your current password.";
        }
        if (code.includes("over_email_send_rate_limit") || message.includes("rate limit")) {
            return "Too many email requests were made. Please wait before trying again.";
        }
        if (code.includes("reauthentication_not_valid") || message.includes("nonce")) {
            return "The verification code is incorrect or expired. Request a new recovery flow and try again.";
        }
        if (message.includes("session") || message.includes("jwt")) {
            return "Your secure session expired. Sign in again and retry.";
        }
        return error?.message || fallback;
    }

    function setStatus(element, message = "", state = "") {
        if (!element) return;
        element.textContent = message;
        element.classList.remove("is-success", "is-error", "is-working");
        if (state) element.classList.add(`is-${state}`);
    }

    function setContainerBusy(container, busy) {
        if (!container) return;
        container.setAttribute("aria-busy", String(busy));
        container.querySelectorAll("button, input, select, textarea").forEach((control) => {
            control.disabled = busy;
        });
    }

    function formatAccountDate(value, includeTime = true) {
        if (!value) return "Not available";
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return "Not available";

        return new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            ...(includeTime ? { timeStyle: "short" } : {})
        }).format(parsed);
    }

    function sectionFromHash() {
        const requested = window.location.hash.replace(/^#/, "");
        if (requested === "profilePicture") return "profile";
        return Object.hasOwn(SECTION_CONTENT, requested)
            ? requested
            : "profile";
    }

    function activateSection(section, { focus = false, updateHash = true } = {}) {
        if (!Object.hasOwn(SECTION_CONTENT, section)) section = "profile";
        activeSection = section;

        tabs.forEach((tab) => {
            const selected = tab.dataset.userSettingsTab === section;
            tab.classList.toggle("active", selected);
            tab.setAttribute("aria-selected", String(selected));
            tab.tabIndex = selected ? 0 : -1;
        });

        panels.forEach((panel) => {
            const selected = panel.dataset.userSettingsPanel === section;
            panel.hidden = !selected;
            panel.classList.toggle("active", selected);
        });

        const copy = SECTION_CONTENT[section];
        pageEyebrow.textContent = copy.eyebrow;
        pageTitle.textContent = copy.title;
        pageDescription.textContent = copy.description;

        if (updateHash && window.location.hash !== `#${section}`) {
            history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${section}`);
        }

        if (section === "notifications") syncBrowserNotificationControls();
        if (focus) pageTitle.focus({ preventScroll: true });
    }

    function handleTabKeydown(event) {
        const currentIndex = tabs.indexOf(event.currentTarget);
        if (currentIndex < 0) return;

        let nextIndex = currentIndex;
        if (["ArrowRight", "ArrowDown"].includes(event.key)) nextIndex = (currentIndex + 1) % tabs.length;
        if (["ArrowLeft", "ArrowUp"].includes(event.key)) nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabs.length - 1;
        if (nextIndex === currentIndex && !["Home", "End"].includes(event.key)) return;

        event.preventDefault();
        const nextTab = tabs[nextIndex];
        nextTab.focus();
        activateSection(nextTab.dataset.userSettingsTab);
    }

    async function patchAccountPreferences(section, patch) {
        const updatedUser = await profileApi.updateMetadata((latestUser) => {
            const current = normalizeAccountPreferences(
                latestUser.user_metadata?.ma_preferences
            );
            return {
                ma_preferences: {
                    ...current,
                    [section]: {
                        ...current[section],
                        ...patch
                    },
                    updated_at: new Date().toISOString()
                }
            };
        });

        activeUser = updatedUser;
        return getAccountPreferences(updatedUser);
    }

    function paintAccount(user, { force = false } = {}) {
        if (!user) return;
        activeUser = user;
        const metadata = user.user_metadata || {};
        const preferences = getAccountPreferences(user);

        if (!profileDetailsDirty || force) {
            profileFullName.value =
                metadata.full_name || metadata.name || metadata.display_name || "";
            profilePhone.value = metadata.profile_phone || "";
            profileLocation.value = metadata.profile_location || "";
        }

        securityEmailValue.textContent = user.email || "Email unavailable";
        securityEmailStatus.innerHTML = user.email_confirmed_at
            ? '<i class="fas fa-circle-check" aria-hidden="true"></i> Verified'
            : '<i class="fas fa-clock" aria-hidden="true"></i> Verification pending';
        securityLastSignIn.textContent = formatAccountDate(user.last_sign_in_at);
        privacyAccountId.textContent = user.id || "Not available";
        privacyAccountCreatedAt.textContent = formatAccountDate(user.created_at, false);

        if (!notificationPreferencesDirty || force) {
            notificationServiceUpdates.checked =
                preferences.notifications.service_updates_opt_in;
            notificationProductNews.checked =
                preferences.notifications.product_news_opt_in;
        }

        if (!privacyPreferencesDirty || force) {
            privacyShowAvatarInHeader.checked =
                preferences.privacy.show_avatar_in_header;
            privacyRememberWebsitePreferences.checked =
                localStorage.getItem("maRememberPreferences") !== "false";
        }
    }

    async function saveProfileDetails(event) {
        event.preventDefault();
        if (profileDetailsBusy) return;

        const fullName = profileFullName.value.trim().replace(/\s+/g, " ");
        const phone = profilePhone.value.trim();
        const location = profileLocation.value.trim().replace(/\s+/g, " ");

        if (fullName.length < 2) {
            setStatus(profileDetailsStatus, "Enter a full name with at least 2 characters.", "error");
            profileFullName.focus();
            return;
        }
        if (phone && !/^[+()\-\s0-9]{6,20}$/.test(phone)) {
            setStatus(profileDetailsStatus, "Enter a valid contact number using digits, spaces, +, - or parentheses.", "error");
            profilePhone.focus();
            return;
        }

        profileDetailsBusy = true;
        setContainerBusy(profileDetailsForm, true);
        setStatus(profileDetailsStatus, "Saving your personal details…", "working");

        try {
            activeUser = await profileApi.updateMetadata({
                full_name: fullName,
                profile_phone: phone || null,
                profile_location: location || null,
                profile_updated_at: new Date().toISOString()
            });
            profileDetailsDirty = false;
            paintAccount(activeUser, { force: true });
            setStatus(profileDetailsStatus, "Personal details saved permanently to your account.", "success");
        } catch (error) {
            setStatus(profileDetailsStatus, getErrorMessage(error, "Unable to save personal details."), "error");
        } finally {
            profileDetailsBusy = false;
            setContainerBusy(profileDetailsForm, false);
        }
    }

    function getPasswordRuleState(value) {
        return {
            length: value.length >= 10,
            lower: /[a-z]/.test(value),
            upper: /[A-Z]/.test(value),
            number: /[0-9]/.test(value),
            symbol: /[^A-Za-z0-9]/.test(value)
        };
    }

    function paintPasswordRules() {
        const rules = getPasswordRuleState(newPassword.value);
        passwordRuleItems.forEach((item) => {
            const met = rules[item.dataset.passwordRule] === true;
            item.classList.toggle("is-met", met);
            const icon = item.querySelector("i");
            if (icon) icon.className = met ? "fas fa-circle-check" : "fas fa-circle";
        });
        return Object.values(rules).every(Boolean);
    }

    function configurePasswordToggle(buttonId, input) {
        const button = document.getElementById(buttonId);
        button?.addEventListener("click", () => {
            const showing = input.type === "text";
            input.type = showing ? "password" : "text";
            button.setAttribute("aria-pressed", String(!showing));
            button.setAttribute("aria-label", `${showing ? "Show" : "Hide"} ${input === currentPassword ? "current password" : "password"}`);
            const icon = button.querySelector("i");
            if (icon) icon.className = showing ? "fas fa-eye" : "fas fa-eye-slash";
        });
    }

    function clearPasswordForm() {
        changePasswordForm.reset();
        [currentPassword, newPassword, confirmNewPassword].forEach((input) => {
            input.type = "password";
        });
        ["toggleCurrentPassword", "toggleNewPassword", "toggleConfirmNewPassword"].forEach((id) => {
            const button = document.getElementById(id);
            if (!button) return;
            button.setAttribute("aria-pressed", "false");
            const icon = button.querySelector("i");
            if (icon) icon.className = "fas fa-eye";
        });
        passwordNonceRequested = false;
        passwordReauthCodeField.hidden = true;
        passwordReauthCode.required = false;
        paintPasswordRules();
    }

    function needsPasswordNonce(error) {
        const code = String(error?.code || "").toLowerCase();
        const message = String(error?.message || "").toLowerCase();
        return code.includes("reauthentication_needed") ||
            message.includes("reauthentication") ||
            message.includes("nonce required");
    }

    async function changeAccountPassword(event) {
        event.preventDefault();
        if (securityBusy || !activeUser?.email) return;

        const currentValue = currentPassword.value;
        const nextValue = newPassword.value;
        const confirmation = confirmNewPassword.value;
        const nonce = passwordReauthCode.value.trim();

        if (!currentValue) {
            setStatus(changePasswordStatus, "Enter your current password.", "error");
            currentPassword.focus();
            return;
        }
        if (!paintPasswordRules()) {
            setStatus(changePasswordStatus, "The new password must meet every strength requirement.", "error");
            newPassword.focus();
            return;
        }
        if (nextValue !== confirmation) {
            setStatus(changePasswordStatus, "New password and confirmation do not match.", "error");
            confirmNewPassword.focus();
            return;
        }
        if (nextValue === currentValue) {
            setStatus(changePasswordStatus, "Choose a new password that is different from the current password.", "error");
            newPassword.focus();
            return;
        }
        if (passwordNonceRequested && !/^\d{6}$/.test(nonce)) {
            setStatus(changePasswordStatus, "Enter the 6-digit verification code sent to your email.", "error");
            passwordReauthCode.focus();
            return;
        }

        securityBusy = true;
        setContainerBusy(changePasswordForm, true);
        setStatus(changePasswordStatus, "Securely verifying and updating your password…", "working");

        try {
            if (!passwordNonceRequested) {
                const { data: verificationData, error: verificationError } =
                    await authClient.auth.signInWithPassword({
                        email: activeUser.email,
                        password: currentValue
                    });
                if (verificationError) throw verificationError;
                if (verificationData?.user) activeUser = verificationData.user;
            }

            const updateAttributes = {
                password: nextValue,
                current_password: currentValue
            };
            if (passwordNonceRequested) updateAttributes.nonce = nonce;

            const { data, error } = await authClient.auth.updateUser(updateAttributes);

            if (error && needsPasswordNonce(error) && !passwordNonceRequested) {
                const { error: reauthError } = await authClient.auth.reauthenticate();
                if (reauthError) throw reauthError;

                passwordNonceRequested = true;
                passwordReauthCodeField.hidden = false;
                passwordReauthCode.required = true;
                setStatus(changePasswordStatus, "A 6-digit verification code was sent to your email. Enter it above, then select Update Password again.", "success");
                window.setTimeout(() => passwordReauthCode.focus(), 0);
                return;
            }

            if (error || !data?.user) throw error || new Error("Password update failed.");

            activeUser = data.user;
            profileApi.acceptUser(activeUser);
            clearPasswordForm();
            setStatus(changePasswordStatus, "Password updated successfully. Your profile and saved settings are unchanged.", "success");
        } catch (error) {
            setStatus(changePasswordStatus, getErrorMessage(error, "Unable to update the password."), "error");
        } finally {
            securityBusy = false;
            setContainerBusy(changePasswordForm, false);
            if (passwordNonceRequested) {
                passwordReauthCodeField.hidden = false;
                passwordReauthCode.required = true;
            }
        }
    }

    function getResetPasswordUrl() {
        const resetUrl = new URL("reset-password.html", window.location.href);
        resetUrl.hash = "";
        resetUrl.search = "";
        return resetUrl.href;
    }

    async function sendRecoveryEmail() {
        if (securityBusy || !activeUser?.email) return;
        securityBusy = true;
        sendPasswordRecoveryButton.disabled = true;
        setStatus(changePasswordStatus, "Requesting a secure password-recovery email…", "working");

        try {
            const { error } = await authClient.auth.resetPasswordForEmail(
                activeUser.email,
                { redirectTo: getResetPasswordUrl() }
            );
            if (error) throw error;
            setStatus(changePasswordStatus, `Recovery email sent to ${activeUser.email}.`, "success");
        } catch (error) {
            setStatus(changePasswordStatus, getErrorMessage(error, "Unable to send the recovery email."), "error");
        } finally {
            securityBusy = false;
            sendPasswordRecoveryButton.disabled = false;
        }
    }

    function openSessionDialog(scope) {
        pendingSessionScope = scope;
        const everyDevice = scope === "global";
        sessionActionDialogTitle.textContent = everyDevice
            ? "Sign out every device?"
            : "Sign out other devices?";
        sessionActionDialogDescription.textContent = everyDevice
            ? "This browser and every other signed-in device will need to sign in again."
            : "Every other signed-in browser and device will need to sign in again. This browser stays signed in.";

        if (typeof sessionActionDialog.showModal === "function") {
            sessionActionDialog.returnValue = "";
            sessionActionDialog.showModal();
        } else if (window.confirm(sessionActionDialogDescription.textContent)) {
            runSessionAction(scope);
        }
    }

    async function runSessionAction(scope) {
        if (securityBusy || !["others", "global"].includes(scope)) return;
        securityBusy = true;
        signOutOtherSessionsButton.disabled = true;
        signOutAllSessionsButton.disabled = true;
        setStatus(sessionActionStatus, scope === "global" ? "Signing out every device…" : "Signing out other devices…", "working");

        try {
            const { error } = await authClient.auth.signOut({ scope });
            if (error) throw error;

            if (scope === "global") {
                window.location.replace("index.html");
                return;
            }

            setStatus(sessionActionStatus, "Other devices were signed out. This browser remains active.", "success");
        } catch (error) {
            setStatus(sessionActionStatus, getErrorMessage(error, "Unable to update account sessions."), "error");
        } finally {
            securityBusy = false;
            signOutOtherSessionsButton.disabled = false;
            signOutAllSessionsButton.disabled = false;
            pendingSessionScope = "";
        }
    }

    async function saveNotificationPreferences(event) {
        event.preventDefault();
        if (notificationPreferencesBusy) return;
        notificationPreferencesBusy = true;
        setContainerBusy(notificationPreferencesForm, true);
        setStatus(notificationPreferencesStatus, "Saving communication choices to your account…", "working");

        try {
            const preferences = await patchAccountPreferences("notifications", {
                service_updates_opt_in: notificationServiceUpdates.checked,
                product_news_opt_in: notificationProductNews.checked
            });
            notificationPreferencesDirty = false;
            notificationServiceUpdates.checked = preferences.notifications.service_updates_opt_in;
            notificationProductNews.checked = preferences.notifications.product_news_opt_in;
            setStatus(notificationPreferencesStatus, "Communication choices saved to your account. Automated email delivery is not connected yet.", "success");
        } catch (error) {
            paintAccount(activeUser, { force: true });
            setStatus(notificationPreferencesStatus, getErrorMessage(error, "Unable to save communication choices."), "error");
        } finally {
            notificationPreferencesBusy = false;
            setContainerBusy(notificationPreferencesForm, false);
        }
    }

    function readDevicePreferences() {
        try {
            const parsed = JSON.parse(localStorage.getItem(DEVICE_PREFERENCE_KEY) || "{}");
            return {
                version: 1,
                browser_notifications_enabled:
                    parsed.browser_notifications_enabled === true,
                updated_at: typeof parsed.updated_at === "string" ? parsed.updated_at : null
            };
        } catch (_error) {
            return { version: 1, browser_notifications_enabled: false, updated_at: null };
        }
    }

    function writeDeviceNotificationPreference(enabled) {
        localStorage.setItem(DEVICE_PREFERENCE_KEY, JSON.stringify({
            version: 1,
            browser_notifications_enabled: enabled === true,
            updated_at: new Date().toISOString()
        }));
    }

    function syncBrowserNotificationControls() {
        if (!("Notification" in window)) {
            browserNotificationsEnabled.checked = false;
            browserNotificationsEnabled.disabled = true;
            sendTestNotificationButton.disabled = true;
            browserNotificationPermissionText.textContent = "Not supported by this browser.";
            return;
        }

        const permission = Notification.permission;
        const deviceEnabled = readDevicePreferences().browser_notifications_enabled;
        const usable = permission === "granted" && deviceEnabled;
        browserNotificationsEnabled.disabled = permission === "denied";
        browserNotificationsEnabled.checked = usable;
        sendTestNotificationButton.disabled = !usable;
        browserNotificationPermissionText.textContent = permission === "granted"
            ? "Permission granted on this device."
            : permission === "denied"
                ? "Permission is blocked in browser settings."
                : "Permission will be requested when enabled.";
    }

    async function changeBrowserNotificationPreference() {
        if (!("Notification" in window)) {
            syncBrowserNotificationControls();
            setStatus(browserNotificationStatus, "Browser notifications are not supported here.", "error");
            return;
        }

        if (!browserNotificationsEnabled.checked) {
            writeDeviceNotificationPreference(false);
            syncBrowserNotificationControls();
            setStatus(browserNotificationStatus, "Browser notifications disabled for this device. Browser permission itself is managed in browser settings.", "success");
            return;
        }

        setStatus(browserNotificationStatus, "Requesting notification permission…", "working");
        try {
            const permission = Notification.permission === "granted"
                ? "granted"
                : await Notification.requestPermission();
            const enabled = permission === "granted";
            writeDeviceNotificationPreference(enabled);
            syncBrowserNotificationControls();
            setStatus(browserNotificationStatus, enabled
                ? "Browser notifications enabled on this device. Use the test button to verify them."
                : "Notification permission was not granted. You can change it in browser settings.", enabled ? "success" : "error");
        } catch (error) {
            writeDeviceNotificationPreference(false);
            syncBrowserNotificationControls();
            setStatus(browserNotificationStatus, error?.message || "Unable to request notification permission.", "error");
        }
    }

    function sendTestNotification() {
        if (!("Notification" in window) || Notification.permission !== "granted") {
            syncBrowserNotificationControls();
            setStatus(browserNotificationStatus, "Enable browser notifications before sending a test.", "error");
            return;
        }

        try {
            const notification = new Notification("MA IT SERVICES", {
                body: "Browser notifications are working on this device.",
                icon: "images/favicon.png",
                tag: "ma-it-services-notification-test"
            });
            window.setTimeout(() => notification.close(), 7000);
            setStatus(browserNotificationStatus, "Test notification sent successfully.", "success");
        } catch (_error) {
            setStatus(browserNotificationStatus, "This browser requires mobile push setup for notifications. Desktop browser testing is supported.", "error");
        }
    }

    function setRememberWebsitePreferences(enabled) {
        const source = localStorage.getItem("maRememberPreferences") === "false"
            ? sessionStorage
            : localStorage;
        const destination = enabled ? localStorage : sessionStorage;
        const inactive = enabled ? sessionStorage : localStorage;

        WEBSITE_PREFERENCE_KEYS.forEach((key) => {
            const value = source.getItem(key);
            if (value !== null) destination.setItem(key, value);
            inactive.removeItem(key);
        });

        localStorage.setItem("maRememberPreferences", enabled ? "true" : "false");
        window.MA_APPEARANCE?.sync({ announce: true });
        window.MA_VISUAL_EFFECTS?.sync();
        window.MA_ACCESSIBILITY?.sync({ announce: true });
        window.MA_LANGUAGE?.syncCookiePersistence();
    }

    async function savePrivacyPreferences(event) {
        event.preventDefault();
        if (privacyPreferencesBusy) return;
        privacyPreferencesBusy = true;
        setContainerBusy(privacyPreferencesForm, true);
        setStatus(privacyPreferencesStatus, "Saving privacy choices…", "working");

        try {
            const preferences = await patchAccountPreferences("privacy", {
                show_avatar_in_header: privacyShowAvatarInHeader.checked
            });
            setRememberWebsitePreferences(privacyRememberWebsitePreferences.checked);
            privacyPreferencesDirty = false;
            privacyShowAvatarInHeader.checked = preferences.privacy.show_avatar_in_header;
            setStatus(privacyPreferencesStatus, "Privacy choices saved. The main website will follow your photo-display setting immediately after it opens.", "success");
        } catch (error) {
            paintAccount(activeUser, { force: true });
            setStatus(privacyPreferencesStatus, getErrorMessage(error, "Unable to save privacy choices."), "error");
        } finally {
            privacyPreferencesBusy = false;
            setContainerBusy(privacyPreferencesForm, false);
        }
    }

    function collectWebsitePreferences() {
        const remember = localStorage.getItem("maRememberPreferences") !== "false";
        const storage = remember ? localStorage : sessionStorage;
        return WEBSITE_PREFERENCE_KEYS.reduce((result, key) => {
            const value = storage.getItem(key);
            if (value !== null) result[key] = value;
            return result;
        }, { maRememberPreferences: String(remember) });
    }

    async function downloadAccountData() {
        setStatus(downloadAccountDataStatus, "Preparing a safe website-data export…", "working");
        downloadAccountDataButton.disabled = true;

        try {
            const { data, error } = await authClient.auth.getUser();
            if (error || !data?.user) throw error || new Error("Sign in required.");

            const user = data.user;
            const metadata = user.user_metadata || {};
            const exportData = {
                export_format: "ma-it-services-browser-data",
                schema_version: 1,
                generated_at: new Date().toISOString(),
                scope: "Data available to this signed-in website session",
                account: {
                    id: user.id,
                    email: user.email || null,
                    email_verified: Boolean(user.email_confirmed_at),
                    created_at: user.created_at || null,
                    updated_at: user.updated_at || null,
                    last_sign_in_at: user.last_sign_in_at || null
                },
                profile: {
                    full_name: metadata.full_name || null,
                    contact_number: metadata.profile_phone || null,
                    location: metadata.profile_location || null,
                    avatar_saved: Boolean(metadata.avatar_path),
                    avatar_path: metadata.avatar_path || null,
                    avatar_updated_at: metadata.avatar_updated_at || null
                },
                account_preferences: getAccountPreferences(user),
                device_preferences: {
                    website: collectWebsitePreferences(),
                    browser_notifications: readDevicePreferences(),
                    browser_notification_permission:
                        "Notification" in window ? Notification.permission : "unsupported"
                },
                not_included: [
                    "Passwords, OTPs, access tokens and refresh tokens",
                    "Profile image binary and signed image URLs",
                    "Server logs, email-provider records and third-party records",
                    "Data unavailable to this browser session"
                ]
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: "application/json"
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `ma-it-services-data-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
            setStatus(downloadAccountDataStatus, "Your safe website-data JSON file was downloaded.", "success");
        } catch (error) {
            setStatus(downloadAccountDataStatus, getErrorMessage(error, "Unable to prepare the data download."), "error");
        } finally {
            downloadAccountDataButton.disabled = false;
        }
    }

    function resetDevicePreferences() {
        WEBSITE_PREFERENCE_KEYS.forEach((key) => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });
        localStorage.removeItem(DEVICE_PREFERENCE_KEY);
        localStorage.setItem("maRememberPreferences", "true");
        if (window.name.startsWith("MA_IT_SERVICES_VFX:")) window.name = "";
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        window.location.reload();
    }

    function openDeviceResetDialog() {
        if (typeof clearDevicePreferencesDialog.showModal === "function") {
            clearDevicePreferencesDialog.returnValue = "";
            clearDevicePreferencesDialog.showModal();
        } else if (window.confirm("Reset theme, language, effects and accessibility preferences on this device?")) {
            resetDevicePreferences();
        }
    }

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => activateSection(tab.dataset.userSettingsTab, { focus: true }));
        tab.addEventListener("keydown", handleTabKeydown);
    });
    window.addEventListener("hashchange", () => activateSection(sectionFromHash(), { updateHash: false }));

    profileDetailsForm.addEventListener("input", () => { profileDetailsDirty = true; });
    profileDetailsForm.addEventListener("submit", saveProfileDetails);

    configurePasswordToggle("toggleCurrentPassword", currentPassword);
    configurePasswordToggle("toggleNewPassword", newPassword);
    configurePasswordToggle("toggleConfirmNewPassword", confirmNewPassword);
    newPassword.addEventListener("input", paintPasswordRules);
    changePasswordForm.addEventListener("submit", changeAccountPassword);
    sendPasswordRecoveryButton.addEventListener("click", sendRecoveryEmail);
    signOutOtherSessionsButton.addEventListener("click", () => openSessionDialog("others"));
    signOutAllSessionsButton.addEventListener("click", () => openSessionDialog("global"));
    sessionActionDialog.addEventListener("close", () => {
        if (sessionActionDialog.returnValue === "confirm") runSessionAction(pendingSessionScope);
        else pendingSessionScope = "";
    });

    notificationPreferencesForm.addEventListener("change", () => { notificationPreferencesDirty = true; });
    notificationPreferencesForm.addEventListener("submit", saveNotificationPreferences);
    browserNotificationsEnabled.addEventListener("change", changeBrowserNotificationPreference);
    sendTestNotificationButton.addEventListener("click", sendTestNotification);

    privacyPreferencesForm.addEventListener("change", () => { privacyPreferencesDirty = true; });
    privacyPreferencesForm.addEventListener("submit", savePrivacyPreferences);
    goToProfilePhotoButton.addEventListener("click", () => {
        activateSection("profile", { focus: true });
        document.getElementById("profilePicture")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    downloadAccountDataButton.addEventListener("click", downloadAccountData);
    clearDevicePreferencesButton.addEventListener("click", openDeviceResetDialog);
    clearDevicePreferencesDialog.addEventListener("close", () => {
        if (clearDevicePreferencesDialog.returnValue === "confirm") resetDevicePreferences();
    });

    window.addEventListener("ma:user-settings-user-updated", (event) => {
        if (event.detail?.user) paintAccount(event.detail.user);
    });

    activateSection(sectionFromHash(), { updateHash: false });
    paintPasswordRules();
    syncBrowserNotificationControls();

    const initialUser = profileApi.getUser();
    if (initialUser) paintAccount(initialUser, { force: true });
})();
