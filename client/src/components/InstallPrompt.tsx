import { useEffect, useState } from "react";
import { Download, X, Share, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "nup_install_dismissed_at";
const DISMISS_DAYS = 7;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function recentlyDismissed() {
  try {
    const ts = localStorage.getItem(DISMISS_KEY);
    if (!ts) return false;
    const days = (Date.now() - Number(ts)) / (1000 * 60 * 60 * 24);
    return days < DISMISS_DAYS;
  } catch {
    return false;
  }
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOS, setShowIOS] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setTimeout(() => setOpen(true), 4000);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (isIOS()) {
      setShowIOS(true);
      setTimeout(() => setOpen(true), 4000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setOpen(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setOpen(false);
  };

  if (!open || (!deferred && !showIOS)) return null;

  return (
    <div
      className="fixed left-3 right-3 z-[60] lg:left-auto lg:right-6 lg:max-w-sm"
      style={{ bottom: "calc(5rem + env(safe-area-inset-bottom))" }}
      data-testid="install-prompt"
    >
      <div className="bg-background border shadow-2xl rounded-2xl p-4 flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <Download className="w-6 h-6 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-0.5">Install NUP Diaspora</h3>
          {deferred ? (
            <p className="text-xs text-muted-foreground mb-2">
              Add to your home screen for quick access and an app-like experience.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mb-2 flex items-center flex-wrap gap-1">
              Tap <Share className="inline w-3.5 h-3.5" /> then <span className="font-semibold">Add to Home Screen</span> <Plus className="inline w-3.5 h-3.5" />
            </p>
          )}
          {deferred && (
            <Button
              size="sm"
              onClick={install}
              className="h-8 text-xs"
              data-testid="button-install-app"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Install App
            </Button>
          )}
        </div>
        <button
          onClick={dismiss}
          className="text-muted-foreground hover:text-foreground p-1 -m-1"
          aria-label="Dismiss"
          data-testid="button-dismiss-install"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
