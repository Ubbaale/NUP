import { useState, useEffect, useRef } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const languages = [
  { code: "en", name: "English (US)", flag: "🇺🇸" },
  { code: "en", name: "English (UK)", flag: "🇬🇧" },
  { code: "lg", name: "Luganda", flag: "🇺🇬" },
  { code: "sw", name: "Kiswahili", flag: "🇰🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "zh-CN", name: "中文", flag: "🇨🇳" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "rw", name: "Kinyarwanda", flag: "🇷🇼" },
  { code: "am", name: "አማርኛ", flag: "🇪🇹" },
  { code: "ha", name: "Hausa", flag: "🇳🇬" },
  { code: "yo", name: "Yorùbá", flag: "🇳🇬" },
  { code: "zu", name: "isiZulu", flag: "🇿🇦" },
  { code: "so", name: "Soomaaliga", flag: "🇸🇴" },
  { code: "ti", name: "ትግርኛ", flag: "🇪🇷" },
];

const browserLangToCode: Record<string, string> = {
  "en": "en", "lg": "lg", "sw": "sw", "fr": "fr", "de": "de",
  "nl": "nl", "ar": "ar", "zh": "zh-CN", "es": "es", "pt": "pt",
  "it": "it", "ru": "ru", "hi": "hi", "ja": "ja", "ko": "ko",
  "rw": "rw", "am": "am", "ha": "ha", "yo": "yo", "zu": "zu",
  "so": "so", "ti": "ti",
};

function triggerGoogleTranslate(langCode: string) {
  const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event("change"));
  }
}

function getCurrentLang(): string {
  const cookie = document.cookie.match(/googtrans=\/en\/([^;]+)/);
  return cookie ? cookie[1] : "en";
}

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentLang(getCurrentLang());

    const saved = localStorage.getItem("nup_language");
    if (!saved || saved === "en") {
      const browserLang = navigator.language?.split("-")[0] || "en";
      const mapped = browserLangToCode[browserLang];
      if (mapped && mapped !== "en") {
        const timer = setTimeout(() => {
          triggerGoogleTranslate(mapped);
          setCurrentLang(mapped);
          localStorage.setItem("nup_language", mapped);
        }, 1500);
        return () => clearTimeout(timer);
      }
    } else if (saved !== "en") {
      const timer = setTimeout(() => {
        triggerGoogleTranslate(saved);
        setCurrentLang(saved);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectLanguage = (code: string) => {
    if (code === "en") {
      document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
      document.cookie = "googtrans=; path=/; domain=." + window.location.hostname + "; expires=Thu, 01 Jan 1970 00:00:00 UTC";
      window.location.reload();
    } else {
      triggerGoogleTranslate(code);
    }
    setCurrentLang(code);
    localStorage.setItem("nup_language", code);
    setOpen(false);
  };

  const current = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <div className="relative notranslate" ref={dropdownRef}>
      <Button
        variant="ghost"
        size={compact ? "icon" : "sm"}
        onClick={() => setOpen(!open)}
        className={compact ? "h-8 w-8" : "h-8 gap-1.5 px-2.5"}
        data-testid="button-language-selector"
      >
        <Globe className="w-4 h-4" />
        {!compact && (
          <>
            <span className="text-xs font-medium">{current.flag}</span>
            <ChevronDown className="w-3 h-3" />
          </>
        )}
      </Button>
      {open && (
        <div className="absolute top-full right-0 mt-1 bg-background border rounded-lg shadow-lg py-1 min-w-[200px] max-h-[320px] overflow-y-auto z-[100]">
          <div className="px-3 py-1.5 border-b mb-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Select Language</p>
          </div>
          {languages.map((lang, idx) => (
            <button
              key={`${lang.code}-${idx}`}
              onClick={() => selectLanguage(lang.code)}
              className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 hover:bg-muted transition-colors ${
                currentLang === lang.code ? "bg-muted text-primary font-medium" : ""
              }`}
              data-testid={`button-language-${lang.code}-${idx}`}
            >
              <span className="text-base">{lang.flag}</span>
              <span className="flex-1">{lang.name}</span>
              {currentLang === lang.code && <Check className="w-3.5 h-3.5 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
