(function () {
    "use strict";

    const DEFAULT_LANGUAGE = "en";
    const TRANSLATOR_HOST_ID = "ma-google-translate-host";
    const TRANSLATOR_SCRIPT_ID = "ma-google-translate-script";
    const GOOGLE_TRANSLATION_CHROME_SELECTORS = [
        "iframe.goog-te-banner-frame",
        "iframe.skiptranslate",
        "body > .skiptranslate",
        ".VIpgJd-ZVi9od-ORHb",
        ".VIpgJd-ZVi9od-ORHb-OEVmcd",
        "#goog-gt-tt",
        ".goog-te-balloon-frame",
        ".goog-te-spinner-pos",
        ".goog-tooltip"
    ].join(",");

    let translationChromeObserver = null;
    let translationChromeGuardTimer = null;

    const LANGUAGE_DATA = `
en|English (Original)
ab|Abkhaz
ace|Acehnese
ach|Acholi
af|Afrikaans
sq|Albanian
alz|Alur
am|Amharic
ar|Arabic
hy|Armenian
as|Assamese
awa|Awadhi
ay|Aymara
az|Azerbaijani
ban|Balinese
bm|Bambara
ba|Bashkir
eu|Basque
btx|Batak Karo
bts|Batak Simalungun
bbc|Batak Toba
be|Belarusian
bem|Bemba
bn|Bengali
bew|Betawi
bho|Bhojpuri
bik|Bikol
bs|Bosnian
br|Breton
bg|Bulgarian
bua|Buryat
yue|Cantonese
ca|Catalan
ceb|Cebuano
ny|Chichewa (Nyanja)
zh-CN|Chinese (Simplified)
zh-TW|Chinese (Traditional)
cv|Chuvash
co|Corsican
crh|Crimean Tatar
hr|Croatian
cs|Czech
da|Danish
din|Dinka
dv|Divehi
doi|Dogri
dov|Dombe
nl|Dutch
dz|Dzongkha
eo|Esperanto
et|Estonian
ee|Ewe
fj|Fijian
fil|Filipino (Tagalog)
fi|Finnish
fr|French
fr-CA|French (Canadian)
fy|Frisian
ff|Fulfulde
gaa|Ga
gl|Galician
lg|Ganda (Luganda)
ka|Georgian
de|German
el|Greek
gn|Guarani
gu|Gujarati
ht|Haitian Creole
cnh|Hakha Chin
ha|Hausa
haw|Hawaiian
iw|Hebrew
hil|Hiligaynon
hi|Hindi
hmn|Hmong
hu|Hungarian
hrx|Hunsrik
is|Icelandic
ig|Igbo
ilo|Iloko
id|Indonesian
ga|Irish
it|Italian
ja|Japanese
jw|Javanese
kn|Kannada
pam|Kapampangan
kk|Kazakh
km|Khmer
cgg|Kiga
rw|Kinyarwanda
ktu|Kituba
gom|Konkani
ko|Korean
kri|Krio
ku|Kurdish (Kurmanji)
ckb|Kurdish (Sorani)
ky|Kyrgyz
lo|Lao
ltg|Latgalian
la|Latin
lv|Latvian
lij|Ligurian
li|Limburgan
ln|Lingala
lt|Lithuanian
lmo|Lombard
luo|Luo
lb|Luxembourgish
mk|Macedonian
mai|Maithili
mak|Makassar
mg|Malagasy
ms|Malay
ms-Arab|Malay (Jawi)
ml|Malayalam
mt|Maltese
mi|Maori
mr|Marathi
chm|Meadow Mari
mni-Mtei|Meiteilon (Manipuri)
min|Minang
lus|Mizo
mn|Mongolian
my|Myanmar (Burmese)
nr|Ndebele (South)
new|Nepalbhasa (Newari)
ne|Nepali
nso|Northern Sotho (Sepedi)
no|Norwegian
nus|Nuer
oc|Occitan
or|Odia (Oriya)
om|Oromo
pag|Pangasinan
pap|Papiamento
ps|Pashto
fa|Persian
pl|Polish
pt|Portuguese
pt-PT|Portuguese (Portugal)
pt-BR|Portuguese (Brazil)
pa|Punjabi
pa-Arab|Punjabi (Shahmukhi)
qu|Quechua
rom|Romani
ro|Romanian
rn|Rundi
ru|Russian
sm|Samoan
sg|Sango
sa|Sanskrit
gd|Scots Gaelic
sr|Serbian
st|Sesotho
crs|Seychellois Creole
shn|Shan
sn|Shona
scn|Sicilian
szl|Silesian
sd|Sindhi
si|Sinhala (Sinhalese)
sk|Slovak
sl|Slovenian
so|Somali
es|Spanish
su|Sundanese
sw|Swahili
ss|Swati
sv|Swedish
tg|Tajik
ta|Tamil
tt|Tatar
te|Telugu
tet|Tetum
th|Thai
ti|Tigrinya
ts|Tsonga
tn|Tswana
tr|Turkish
tk|Turkmen
ak|Twi (Akan)
uk|Ukrainian
ur|Urdu
ug|Uyghur
uz|Uzbek
vi|Vietnamese
cy|Welsh
xh|Xhosa
yi|Yiddish
yo|Yoruba
yua|Yucatec Maya
zu|Zulu
    `.trim();

    const LANGUAGES = Object.freeze(
        LANGUAGE_DATA.split("\n").map((line) => {
            const separatorIndex = line.indexOf("|");

            return Object.freeze({
                code: line.slice(0, separatorIndex),
                name: line.slice(separatorIndex + 1)
            });
        })
    );

    const LANGUAGE_CODES = new Set(
        LANGUAGES.map((language) => language.code)
    );

    const RTL_LANGUAGES = new Set([
        "ar", "ckb", "dv", "fa", "iw", "ms-Arab",
        "pa-Arab", "ps", "sd", "ug", "ur", "yi"
    ]);

    function shouldRememberLanguage() {
        return localStorage.getItem("maRememberPreferences") !== "false";
    }

    function normalizeLanguage(languageCode) {
        return LANGUAGE_CODES.has(languageCode)
            ? languageCode
            : DEFAULT_LANGUAGE;
    }

    function getSavedLanguage() {
        const storage = shouldRememberLanguage()
            ? localStorage
            : sessionStorage;

        return normalizeLanguage(
            storage.getItem("maWebsiteLanguage") || DEFAULT_LANGUAGE
        );
    }

    function saveLanguage(languageCode) {
        const normalizedLanguage = normalizeLanguage(languageCode);

        if (shouldRememberLanguage()) {
            localStorage.setItem(
                "maWebsiteLanguage",
                normalizedLanguage
            );
            sessionStorage.removeItem("maWebsiteLanguage");
        } else {
            sessionStorage.setItem(
                "maWebsiteLanguage",
                normalizedLanguage
            );
            localStorage.removeItem("maWebsiteLanguage");
        }

        return normalizedLanguage;
    }

    function setTranslationCookie(languageCode) {
        const normalizedLanguage = normalizeLanguage(languageCode);
        const persistentPart = shouldRememberLanguage()
            ? "; Max-Age=31536000"
            : "";

        if (normalizedLanguage === DEFAULT_LANGUAGE) {
            document.cookie =
                "googtrans=; Path=/; Max-Age=0; SameSite=Lax";
            return;
        }

        document.cookie =
            `googtrans=/en/${normalizedLanguage}; Path=/; SameSite=Lax${persistentPart}`;
    }

    function applyDocumentLanguage(languageCode) {
        const normalizedLanguage = normalizeLanguage(languageCode);

        document.documentElement.setAttribute(
            "data-website-language",
            normalizedLanguage
        );
        document.documentElement.setAttribute(
            "lang",
            normalizedLanguage
        );
        document.documentElement.setAttribute(
            "dir",
            RTL_LANGUAGES.has(normalizedLanguage) ? "rtl" : "ltr"
        );
    }

    function ensureTranslatorHost() {
        let host = document.getElementById(TRANSLATOR_HOST_ID);

        if (!host) {
            host = document.createElement("div");
            host.id = TRANSLATOR_HOST_ID;
            host.className = "notranslate";
            host.setAttribute("translate", "no");
            host.setAttribute("aria-hidden", "true");
            document.body.appendChild(host);
        }

        return host;
    }

    function hideGoogleTranslationChrome() {
        const chromeElements =
            document.querySelectorAll?.(
                GOOGLE_TRANSLATION_CHROME_SELECTORS
            ) || [];

        chromeElements.forEach((element) => {
            element.style?.setProperty("display", "none", "important");
            element.style?.setProperty("visibility", "hidden", "important");
            element.style?.setProperty("width", "0", "important");
            element.style?.setProperty("height", "0", "important");
            element.setAttribute?.("aria-hidden", "true");
        });

        document.documentElement?.style?.setProperty(
            "top",
            "0px",
            "important"
        );
        document.documentElement?.style?.setProperty(
            "margin-top",
            "0px",
            "important"
        );
        document.body?.style?.setProperty("top", "0px", "important");
        document.body?.style?.setProperty(
            "margin-top",
            "0px",
            "important"
        );
    }

    function startGoogleTranslationChromeGuard() {
        hideGoogleTranslationChrome();

        if (
            translationChromeObserver ||
            typeof MutationObserver === "undefined" ||
            !document.documentElement
        ) {
            return;
        }

        translationChromeObserver = new MutationObserver((mutations) => {
            const containsGoogleChrome = mutations.some((mutation) => {
                return Array.from(mutation.addedNodes).some((node) => {
                    if (node.nodeType !== 1) return false;

                    return (
                        node.matches?.(GOOGLE_TRANSLATION_CHROME_SELECTORS) ||
                        node.querySelector?.(GOOGLE_TRANSLATION_CHROME_SELECTORS)
                    );
                });
            });

            if (containsGoogleChrome) {
                hideGoogleTranslationChrome();
            }
        });

        translationChromeObserver.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        window.clearTimeout(translationChromeGuardTimer);
        translationChromeGuardTimer = window.setTimeout(() => {
            translationChromeObserver?.disconnect();
            translationChromeObserver = null;
            hideGoogleTranslationChrome();
        }, 20000);
    }

    function initializeGoogleTranslator() {
        ensureTranslatorHost();
        startGoogleTranslationChromeGuard();

        if (
            !window.google ||
            !window.google.translate ||
            !window.google.translate.TranslateElement
        ) {
            return;
        }

        const host = document.getElementById(TRANSLATOR_HOST_ID);

        if (host.dataset.initialized === "true") return;

        new window.google.translate.TranslateElement(
            {
                pageLanguage: "en",
                autoDisplay: false,
                multilanguagePage: true
            },
            TRANSLATOR_HOST_ID
        );

        host.dataset.initialized = "true";
        hideGoogleTranslationChrome();
        document.dispatchEvent(new CustomEvent("ma:language-ready"));

        window.setTimeout(() => {
            applySavedLanguageToWidget();
        }, 0);
    }

    function applySavedLanguageToWidget(attempt = 0) {
        const savedLanguage = getSavedLanguage();

        if (savedLanguage === DEFAULT_LANGUAGE) return;

        const host = document.getElementById(TRANSLATOR_HOST_ID);
        const googleLanguageSelect =
            host?.querySelector?.(".goog-te-combo");

        if (googleLanguageSelect) {
            const hasSavedLanguage = Array.from(
                googleLanguageSelect.options
            ).some((option) => option.value === savedLanguage);

            if (hasSavedLanguage) {
                googleLanguageSelect.value = savedLanguage;
                googleLanguageSelect.dispatchEvent(
                    new Event("change", { bubbles: true })
                );
                hideGoogleTranslationChrome();
                return;
            }
        }

        if (attempt < 40) {
            window.setTimeout(() => {
                applySavedLanguageToWidget(attempt + 1);
            }, 250);
        }
    }

    function loadTranslatorScript() {
        if (document.getElementById(TRANSLATOR_SCRIPT_ID)) return;

        window.maGoogleTranslateElementInit = initializeGoogleTranslator;

        const script = document.createElement("script");
        script.id = TRANSLATOR_SCRIPT_ID;
        script.src =
            "https://translate.google.com/translate_a/element.js?cb=maGoogleTranslateElementInit";
        script.async = true;
        script.onerror = () => {
            document.dispatchEvent(
                new CustomEvent("ma:language-unavailable")
            );
        };
        document.head.appendChild(script);
    }

    function initialize() {
        const savedLanguage = getSavedLanguage();

        applyDocumentLanguage(savedLanguage);
        setTranslationCookie(savedLanguage);
        ensureTranslatorHost();

        if (savedLanguage !== DEFAULT_LANGUAGE) {
            startGoogleTranslationChromeGuard();
            loadTranslatorScript();
        } else {
            hideGoogleTranslationChrome();
        }
    }

    function changeLanguage(languageCode) {
        const normalizedLanguage = saveLanguage(languageCode);

        applyDocumentLanguage(normalizedLanguage);
        setTranslationCookie(normalizedLanguage);

        window.setTimeout(() => {
            window.location.reload();
        }, 80);
    }

    function syncCookiePersistence() {
        setTranslationCookie(getSavedLanguage());
    }

    function getLanguageName(languageCode) {
        const normalizedLanguage = normalizeLanguage(languageCode);
        const language = LANGUAGES.find(
            (item) => item.code === normalizedLanguage
        );

        return language ? language.name : "English (Original)";
    }

    function populateSelect(selectElement, searchText = "") {
        if (!selectElement) return;

        const normalizedSearch = searchText.trim().toLocaleLowerCase();
        const savedLanguage = getSavedLanguage();
        const matchingLanguages = LANGUAGES.filter((language) => {
            return (
                language.name.toLocaleLowerCase().includes(normalizedSearch) ||
                language.code.toLocaleLowerCase().includes(normalizedSearch)
            );
        });

        selectElement.replaceChildren();

        matchingLanguages.forEach((language) => {
            const option = document.createElement("option");
            option.value = language.code;
            option.textContent = `${language.name} — ${language.code}`;
            selectElement.appendChild(option);
        });

        if (
            matchingLanguages.some(
                (language) => language.code === savedLanguage
            )
        ) {
            selectElement.value = savedLanguage;
        }

        selectElement.disabled = matchingLanguages.length === 0;
    }

    window.MA_LANGUAGE = Object.freeze({
        defaultLanguage: DEFAULT_LANGUAGE,
        languages: LANGUAGES,
        getSavedLanguage,
        getLanguageName,
        populateSelect,
        changeLanguage,
        syncCookiePersistence,
        initializeGoogleTranslator
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, {
            once: true
        });
    } else {
        initialize();
    }

    window.addEventListener("storage", (event) => {
        if (
            event.key !== "maWebsiteLanguage" &&
            event.key !== "maRememberPreferences"
        ) {
            return;
        }

        const savedLanguage = getSavedLanguage();

        if (
            document.documentElement.getAttribute(
                "data-website-language"
            ) !== savedLanguage
        ) {
            setTranslationCookie(savedLanguage);
            window.location.reload();
        } else {
            syncCookiePersistence();
        }
    });
})();
