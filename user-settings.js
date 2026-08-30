"use strict";

const USER_SETTINGS_SUPABASE_URL =
    "https://bssjncbsxnynsriqunrf.supabase.co";
const USER_SETTINGS_SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_bNNHzk3Af3ME696lO3Qz9g_ANYWLmOO";
const USER_SETTINGS_AVATAR_BUCKET = "user-avatars";
const USER_SETTINGS_ALLOWED_IMAGE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp"
]);
const USER_SETTINGS_MAX_ORIGINAL_SIZE = 5 * 1024 * 1024;
const USER_SETTINGS_MAX_OUTPUT_SIZE = 2 * 1024 * 1024;
const USER_SETTINGS_AVATAR_DIMENSION = 512;

const userSettingsSupabase = supabase.createClient(
    USER_SETTINGS_SUPABASE_URL,
    USER_SETTINGS_SUPABASE_PUBLISHABLE_KEY
);

const userSettingsMain = document.getElementById("userSettingsMain");
const userSettingsAuthState = document.getElementById("userSettingsAuthState");
const userSettingsAuthTitle = document.getElementById("userSettingsAuthTitle");
const userSettingsAuthMessage = document.getElementById("userSettingsAuthMessage");
const userSettingsSignInLink = document.getElementById("userSettingsSignInLink");
const userSettingsSignOut = document.getElementById("userSettingsSignOut");
const avatarImages = document.querySelectorAll("[data-user-avatar]");
const avatarInitials = document.querySelectorAll("[data-user-initials]");
const userNameLabels = document.querySelectorAll("[data-user-name]");
const userEmailLabels = document.querySelectorAll("[data-user-email]");
const userEmailStatus = document.getElementById("userEmailStatus");
const avatarDropzone = document.getElementById("avatarDropzone");
const avatarDropzoneTitle = document.getElementById("avatarDropzoneTitle");
const avatarFileInput = document.getElementById("avatarFileInput");
const chooseAvatarButton = document.getElementById("chooseAvatarButton");
const chooseAvatarButtonText = document.getElementById("chooseAvatarButtonText");
const saveAvatarButton = document.getElementById("saveAvatarButton");
const cancelAvatarSelection = document.getElementById("cancelAvatarSelection");
const removeAvatarButton = document.getElementById("removeAvatarButton");
const avatarStatus = document.getElementById("avatarStatus");
const removeAvatarDialog = document.getElementById("removeAvatarDialog");
const userSettingsSyncState = document.getElementById("userSettingsSyncState");

let currentUser = null;
let currentAvatarUrl = "";
let selectedAvatarBlob = null;
let selectedAvatarObjectUrl = "";
let profileActionBusy = false;
let userMetadataQueue = Promise.resolve();

function setAccountSyncState(message = "Account Synced", state = "success") {
    if (!userSettingsSyncState) return;

    const label = userSettingsSyncState.querySelector("span");
    if (label) label.textContent = message;

    userSettingsSyncState.dataset.state = state;
    userSettingsSyncState.classList.toggle("is-working", state === "working");
    userSettingsSyncState.classList.toggle("is-error", state === "error");
}

function announceUserUpdate(user) {
    window.dispatchEvent(new CustomEvent("ma:user-settings-user-updated", {
        detail: { user }
    }));
}

function updateUserMetadataPatch(patchOrFactory) {
    const operation = userMetadataQueue.then(async () => {
        setAccountSyncState("Saving Changes…", "working");

        const { data: latestData, error: latestError } =
            await userSettingsSupabase.auth.getUser();

        if (latestError || !latestData?.user) {
            throw latestError || new Error("Your login session has expired.");
        }

        const patch = typeof patchOrFactory === "function"
            ? patchOrFactory(latestData.user)
            : patchOrFactory;

        const { data, error } = await userSettingsSupabase.auth.updateUser({
            data: patch
        });

        if (error || !data?.user) {
            throw error || new Error("Unable to save your account changes.");
        }

        currentUser = data.user;
        updateAccountLabels(currentUser);
        setAccountSyncState("Account Synced", "success");
        announceUserUpdate(currentUser);
        return currentUser;
    });

    userMetadataQueue = operation.then(
        () => undefined,
        () => {
            setAccountSyncState("Sync Error", "error");
        }
    );
    return operation;
}

function getUserDisplayName(user) {
    const metadata = user?.user_metadata || {};

    return (
        metadata.full_name ||
        metadata.name ||
        metadata.display_name ||
        user?.email?.split("@")[0] ||
        "MA IT User"
    );
}

function getUserInitials(user) {
    const displayName = getUserDisplayName(user).trim();
    const words = displayName.split(/\s+/).filter(Boolean);

    if (words.length === 0) return "U";

    return words
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();
}

function setAvatarStatus(message, state = "") {
    avatarStatus.textContent = message;
    avatarStatus.classList.remove("is-success", "is-error", "is-working");

    if (state) {
        avatarStatus.classList.add(`is-${state}`);
    }
}

function setProfileBusy(busy) {
    profileActionBusy = busy;
    document.body.classList.toggle("is-profile-busy", busy);
    avatarFileInput.disabled = busy;
    chooseAvatarButton.disabled = busy;
    userSettingsSignOut.disabled = busy;
    syncAvatarActions();
}

function syncAvatarActions() {
    const hasSelection = Boolean(selectedAvatarBlob);
    const hasSavedAvatar = Boolean(currentUser?.user_metadata?.avatar_path);

    saveAvatarButton.hidden = !hasSelection;
    saveAvatarButton.disabled = profileActionBusy || !hasSelection;
    cancelAvatarSelection.hidden = !hasSelection;
    cancelAvatarSelection.disabled = profileActionBusy || !hasSelection;
    removeAvatarButton.disabled =
        profileActionBusy || hasSelection || !hasSavedAvatar;

    chooseAvatarButtonText.textContent = hasSavedAvatar
        ? "Change Photo"
        : "Select Photo";
    avatarDropzoneTitle.textContent = hasSavedAvatar
        ? "Change your profile photo"
        : "Choose a profile photo";
}

function displayAvatar(sourceUrl = "") {
    avatarImages.forEach((image) => {
        if (sourceUrl) {
            image.src = sourceUrl;
            image.hidden = false;
        } else {
            image.removeAttribute("src");
            image.hidden = true;
        }
    });

    avatarInitials.forEach((initials) => {
        initials.hidden = Boolean(sourceUrl);
    });
}

function updateAccountLabels(user) {
    const displayName = getUserDisplayName(user);
    const email = user?.email || "Email unavailable";
    const initials = getUserInitials(user);

    userNameLabels.forEach((label) => {
        label.textContent = displayName;
    });

    userEmailLabels.forEach((label) => {
        label.textContent = email;
        label.title = email;
    });

    avatarInitials.forEach((label) => {
        label.textContent = initials;
    });

    if (userEmailStatus) {
        const verified = Boolean(user?.email_confirmed_at);
        userEmailStatus.innerHTML = verified
            ? '<i class="fas fa-circle-check" aria-hidden="true"></i> Verified'
            : '<i class="fas fa-clock" aria-hidden="true"></i> Verification pending';
        userEmailStatus.classList.toggle("is-pending", !verified);
    }
}

function showSignedOutState(message = "Please sign in to manage your profile picture.") {
    currentUser = null;
    setAccountSyncState("Signed Out", "error");
    displayAvatar("");
    userSettingsMain.hidden = true;
    userSettingsAuthState.hidden = false;
    userSettingsAuthTitle.textContent = "Sign in required";
    userSettingsAuthMessage.textContent = message;
    userSettingsSignInLink.hidden = false;
}

function showAuthenticatedState(user) {
    currentUser = user;
    updateAccountLabels(user);
    setAccountSyncState("Account Synced", "success");
    userSettingsAuthState.hidden = true;
    userSettingsMain.hidden = false;
    userSettingsSignInLink.hidden = true;
    syncAvatarActions();
    announceUserUpdate(user);
}

function friendlyProfileError(error) {
    const message = String(error?.message || error || "").toLowerCase();

    if (
        message.includes("bucket not found") ||
        message.includes("row-level security") ||
        message.includes("unauthorized")
    ) {
        return "Permanent profile storage needs its one-time Supabase setup before photos can be saved.";
    }

    if (message.includes("jwt") || message.includes("session")) {
        return "Your login session has expired. Please sign in again.";
    }

    if (message.includes("payload") || message.includes("too large")) {
        return "The optimized photo is still too large. Please choose a smaller image.";
    }

    return error?.message || "Unable to update the profile picture right now.";
}

function releaseSelectedAvatar() {
    if (selectedAvatarObjectUrl) {
        URL.revokeObjectURL(selectedAvatarObjectUrl);
    }

    selectedAvatarBlob = null;
    selectedAvatarObjectUrl = "";
    avatarFileInput.value = "";
}

function cancelSelectedAvatar({ announce = true } = {}) {
    releaseSelectedAvatar();
    displayAvatar(currentAvatarUrl);
    syncAvatarActions();

    if (announce) {
        setAvatarStatus(
            currentUser?.user_metadata?.avatar_path
                ? "Photo selection cancelled. Your saved picture is unchanged."
                : "Photo selection cancelled."
        );
    }
}

async function decodeImageFile(file) {
    if ("createImageBitmap" in window) {
        let bitmap;

        try {
            bitmap = await createImageBitmap(file, {
                imageOrientation: "from-image"
            });
        } catch (_error) {
            bitmap = await createImageBitmap(file);
        }

        return {
            source: bitmap,
            width: bitmap.width,
            height: bitmap.height,
            cleanup: () => bitmap.close()
        };
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    try {
        await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = () => reject(new Error("The selected file is not a valid image."));
            image.src = objectUrl;
        });

        return {
            source: image,
            width: image.naturalWidth,
            height: image.naturalHeight,
            cleanup: () => URL.revokeObjectURL(objectUrl)
        };
    } catch (error) {
        URL.revokeObjectURL(objectUrl);
        throw error;
    }
}

function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve) => {
        canvas.toBlob(resolve, type, quality);
    });
}

async function createOptimizedAvatar(file) {
    if (!USER_SETTINGS_ALLOWED_IMAGE_TYPES.has(file.type)) {
        throw new Error("Choose a JPG, PNG or WebP image.");
    }

    if (!file.size || file.size > USER_SETTINGS_MAX_ORIGINAL_SIZE) {
        throw new Error("Choose an image smaller than 5 MB.");
    }

    const decoded = await decodeImageFile(file);

    try {
        if (
            !decoded.width ||
            !decoded.height ||
            decoded.width > 8192 ||
            decoded.height > 8192
        ) {
            throw new Error("Choose a valid image with dimensions below 8192 × 8192 pixels.");
        }

        const canvas = document.createElement("canvas");
        canvas.width = USER_SETTINGS_AVATAR_DIMENSION;
        canvas.height = USER_SETTINGS_AVATAR_DIMENSION;

        const context = canvas.getContext("2d", { alpha: true });

        if (!context) {
            throw new Error("This browser cannot prepare the profile picture.");
        }

        const sourceSide = Math.min(decoded.width, decoded.height);
        const sourceX = (decoded.width - sourceSide) / 2;
        const sourceY = (decoded.height - sourceSide) / 2;

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(
            decoded.source,
            sourceX,
            sourceY,
            sourceSide,
            sourceSide,
            0,
            0,
            USER_SETTINGS_AVATAR_DIMENSION,
            USER_SETTINGS_AVATAR_DIMENSION
        );

        let optimized = await canvasToBlob(canvas, "image/webp", .86);

        if (!optimized) {
            optimized = await canvasToBlob(canvas, "image/jpeg", .86);
        }

        if (!optimized || optimized.size > USER_SETTINGS_MAX_OUTPUT_SIZE) {
            throw new Error("The optimized image is too large. Please choose another photo.");
        }

        return optimized;
    } finally {
        decoded.cleanup();
    }
}

async function selectAvatarFile(file) {
    if (!file || profileActionBusy) return;

    setProfileBusy(true);
    setAvatarStatus("Preparing and checking your photo…", "working");

    try {
        const optimizedAvatar = await createOptimizedAvatar(file);
        releaseSelectedAvatar();
        selectedAvatarBlob = optimizedAvatar;
        selectedAvatarObjectUrl = URL.createObjectURL(optimizedAvatar);
        displayAvatar(selectedAvatarObjectUrl);
        setAvatarStatus("Photo is ready. Select “Save Photo” to store it permanently.");
    } catch (error) {
        cancelSelectedAvatar({ announce: false });
        setAvatarStatus(friendlyProfileError(error), "error");
    } finally {
        setProfileBusy(false);
        syncAvatarActions();
    }
}

async function createAvatarSignedUrl(user) {
    const avatarPath = user?.user_metadata?.avatar_path;

    if (!avatarPath) return "";

    const { data, error } = await userSettingsSupabase.storage
        .from(USER_SETTINGS_AVATAR_BUCKET)
        .createSignedUrl(avatarPath, 3600);

    if (error) throw error;
    if (!data?.signedUrl) throw new Error("Unable to load the saved profile picture.");

    const version = encodeURIComponent(
        user.user_metadata?.avatar_updated_at || "current"
    );

    return `${data.signedUrl}&v=${version}`;
}

async function loadSavedAvatar(user, { announce = false } = {}) {
    currentAvatarUrl = "";

    if (!user?.user_metadata?.avatar_path) {
        displayAvatar("");
        syncAvatarActions();

        if (announce) {
            setAvatarStatus("No profile picture is saved yet. Choose a photo to begin.");
        }

        return;
    }

    try {
        currentAvatarUrl = await createAvatarSignedUrl(user);
        displayAvatar(currentAvatarUrl);

        if (announce) {
            setAvatarStatus("Your permanent profile picture is synced.", "success");
        }
    } catch (error) {
        displayAvatar("");
        setAvatarStatus(friendlyProfileError(error), "error");
    } finally {
        syncAvatarActions();
    }
}

function buildAvatarPath(userId, avatarBlob) {
    const uniqueId = crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const extension = avatarBlob?.type === "image/webp" ? "webp" : "jpg";

    return `${userId}/${uniqueId}.${extension}`;
}

function getPendingAvatarCleanupPaths(user) {
    const value = user?.user_metadata?.avatar_cleanup_paths;

    return Array.isArray(value)
        ? value.filter((path) => typeof path === "string" && path)
        : [];
}

async function cleanupStoredAvatars(user) {
    const cleanupPaths = getPendingAvatarCleanupPaths(user);

    if (cleanupPaths.length === 0) return user;

    const { error: cleanupError } = await userSettingsSupabase.storage
        .from(USER_SETTINGS_AVATAR_BUCKET)
        .remove(cleanupPaths);

    if (cleanupError) return user;

    try {
        return await updateUserMetadataPatch({
            avatar_cleanup_paths: []
        });
    } catch (_error) {
        return user;
    }
}

async function saveSelectedAvatar() {
    if (!currentUser || !selectedAvatarBlob || profileActionBusy) return;

    setProfileBusy(true);
    setAvatarStatus("Saving your profile picture permanently…", "working");

    const newAvatarPath = buildAvatarPath(currentUser.id, selectedAvatarBlob);

    try {
        const { error: uploadError } = await userSettingsSupabase.storage
            .from(USER_SETTINGS_AVATAR_BUCKET)
            .upload(newAvatarPath, selectedAvatarBlob, {
                cacheControl: "3600",
                contentType: selectedAvatarBlob.type || "image/webp",
                upsert: false
            });

        if (uploadError) throw uploadError;

        try {
            currentUser = await updateUserMetadataPatch((latestUser) => {
                const latestOldAvatarPath =
                    latestUser.user_metadata?.avatar_path || "";
                const pendingCleanup = Array.from(new Set([
                    ...getPendingAvatarCleanupPaths(latestUser),
                    latestOldAvatarPath
                ].filter((path) => path && path !== newAvatarPath))).slice(-6);

                return {
                    avatar_path: newAvatarPath,
                    avatar_updated_at: new Date().toISOString(),
                    avatar_cleanup_paths: pendingCleanup
                };
            });
        } catch (metadataError) {
            await userSettingsSupabase.storage
                .from(USER_SETTINGS_AVATAR_BUCKET)
                .remove([newAvatarPath]);
            throw metadataError || new Error("Unable to connect the photo to your account.");
        }

        updateAccountLabels(currentUser);
        releaseSelectedAvatar();
        await loadSavedAvatar(currentUser);
        currentUser = await cleanupStoredAvatars(currentUser);
        updateAccountLabels(currentUser);
        setAvatarStatus(
            "Profile picture saved permanently and synced to your account.",
            "success"
        );
    } catch (error) {
        displayAvatar(currentAvatarUrl);
        setAvatarStatus(friendlyProfileError(error), "error");
    } finally {
        setProfileBusy(false);
        syncAvatarActions();
    }
}

async function removeSavedAvatar() {
    if (!currentUser?.user_metadata?.avatar_path || profileActionBusy) return;

    setProfileBusy(true);
    setAvatarStatus("Removing the saved profile picture…", "working");

    try {
        currentUser = await updateUserMetadataPatch((latestUser) => {
            const latestAvatarPath =
                latestUser.user_metadata?.avatar_path || "";
            const pendingCleanup = Array.from(new Set([
                ...getPendingAvatarCleanupPaths(latestUser),
                latestAvatarPath
            ].filter(Boolean))).slice(-6);

            return {
                avatar_path: null,
                avatar_updated_at: new Date().toISOString(),
                avatar_cleanup_paths: pendingCleanup
            };
        });
        currentAvatarUrl = "";
        releaseSelectedAvatar();
        displayAvatar("");
        currentUser = await cleanupStoredAvatars(currentUser);
        updateAccountLabels(currentUser);
        setAvatarStatus(
            "Profile picture permanently removed from your account.",
            "success"
        );
    } catch (error) {
        displayAvatar(currentAvatarUrl);
        setAvatarStatus(friendlyProfileError(error), "error");
    } finally {
        setProfileBusy(false);
        syncAvatarActions();
    }
}

async function initializeUserSettings() {
    const { data, error } = await userSettingsSupabase.auth.getUser();

    if (error || !data?.user) {
        showSignedOutState();
        return;
    }

    showAuthenticatedState(data.user);
    setAvatarStatus("Loading your permanent profile picture…", "working");
    await loadSavedAvatar(data.user, { announce: true });

    const cleanedUser = await cleanupStoredAvatars(currentUser);
    if (cleanedUser) {
        currentUser = cleanedUser;
        updateAccountLabels(currentUser);
    }
}

function openAvatarPicker() {
    if (!profileActionBusy) {
        avatarFileInput.click();
    }
}

avatarDropzone.addEventListener("click", openAvatarPicker);
chooseAvatarButton.addEventListener("click", openAvatarPicker);

avatarFileInput.addEventListener("change", () => {
    selectAvatarFile(avatarFileInput.files?.[0]);
});

["dragenter", "dragover"].forEach((eventName) => {
    avatarDropzone.addEventListener(eventName, (event) => {
        event.preventDefault();
        if (!profileActionBusy) {
            avatarDropzone.classList.add("is-dragging");
        }
    });
});

["dragleave", "drop"].forEach((eventName) => {
    avatarDropzone.addEventListener(eventName, (event) => {
        event.preventDefault();
        avatarDropzone.classList.remove("is-dragging");
    });
});

avatarDropzone.addEventListener("drop", (event) => {
    selectAvatarFile(event.dataTransfer?.files?.[0]);
});

saveAvatarButton.addEventListener("click", saveSelectedAvatar);
cancelAvatarSelection.addEventListener("click", () => cancelSelectedAvatar());

removeAvatarButton.addEventListener("click", () => {
    if (typeof removeAvatarDialog.showModal === "function") {
        removeAvatarDialog.returnValue = "";
        removeAvatarDialog.showModal();
        return;
    }

    if (window.confirm("Permanently remove your saved profile picture?")) {
        removeSavedAvatar();
    }
});

removeAvatarDialog.addEventListener("close", () => {
    if (removeAvatarDialog.returnValue === "confirm") {
        removeSavedAvatar();
    }
});

userSettingsSignOut.addEventListener("click", async () => {
    if (profileActionBusy) return;

    setProfileBusy(true);
    setAvatarStatus("Signing out safely…", "working");
    const { error } = await userSettingsSupabase.auth.signOut({
        scope: "local"
    });

    if (error) {
        setProfileBusy(false);
        setAvatarStatus(error.message, "error");
        return;
    }

    window.location.replace("index.html");
});

userSettingsSupabase.auth.onAuthStateChange((event, session) => {
    window.MA_APPEARANCE?.sync();
    window.MA_VISUAL_EFFECTS?.sync();
    window.MA_ACCESSIBILITY?.sync();

    window.setTimeout(() => {
        if (event === "SIGNED_OUT") {
            showSignedOutState("You have been signed out. Sign in again to manage your profile.");
            return;
        }

        if (
            session?.user &&
            ["INITIAL_SESSION", "SIGNED_IN", "USER_UPDATED"].includes(event) &&
            !profileActionBusy
        ) {
            currentUser = session.user;
            updateAccountLabels(currentUser);
            announceUserUpdate(currentUser);
        }
    }, 0);
});

window.addEventListener("beforeunload", () => {
    if (selectedAvatarObjectUrl) {
        URL.revokeObjectURL(selectedAvatarObjectUrl);
    }
});

window.MA_USER_PROFILE = Object.freeze({
    getUser: () => currentUser,
    getClient: () => userSettingsSupabase,
    updateMetadata: updateUserMetadataPatch,
    acceptUser(user) {
        if (!user) return;
        currentUser = user;
        updateAccountLabels(currentUser);
        setAccountSyncState("Account Synced", "success");
        announceUserUpdate(currentUser);
    },
    setSyncState: setAccountSyncState
});

initializeUserSettings();
