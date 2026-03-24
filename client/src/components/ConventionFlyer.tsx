import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { X, MapPin, Calendar, Hotel, Star, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import hiltonExteriorImg from "@assets/hilton-la-exterior.png";
import nupLogoImg from "@/assets/images/nup-official-logo.png";

const DISMISS_KEY = "nup-convention-flyer-dismissed";

export function ConventionFlyer() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(DISMISS_KEY);
    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, "true");
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={handleDismiss}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" data-testid="convention-flyer">
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                data-testid="button-close-flyer"
              >
                <X className="w-4 h-4 text-gray-700" />
              </button>

              <div className="relative h-40 overflow-hidden">
                <img src={hiltonExteriorImg} alt="Hilton Los Angeles Airport Hotel" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <img src={nupLogoImg} alt="NUP" className="h-10 w-10 object-contain bg-white/90 rounded-full p-1" />
                  <span className="text-white font-bold text-xs bg-red-600 px-2 py-1 rounded-full uppercase tracking-wide">2026 Convention</span>
                </div>
                <div className="absolute bottom-3 left-4 right-4">
                  <h2 className="text-white font-extrabold text-xl leading-tight drop-shadow-lg">
                    NUP Diaspora Convention
                  </h2>
                  <p className="text-white/90 text-sm font-medium drop-shadow">Los Angeles, California</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">Historic Gathering</span>
                </div>

                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Join Ugandans from across the globe at this pivotal convention as Uganda approaches a defining national election. Reflect, strategize, and build a New Uganda together.
                </p>

                <div className="space-y-2.5 mb-5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">August 13 – 17, 2026</p>
                      <p className="text-xs text-muted-foreground">5 Days of Unity & Strategy</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                      <Hotel className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Hilton Los Angeles Airport Hotel</p>
                      <p className="text-xs text-muted-foreground">5711 W Century Blvd, LA 90045</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Theme: Building a New Uganda Together</p>
                      <p className="text-xs text-muted-foreground">Democracy · Justice · Good Governance</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href="https://buy.stripe.com/fZucN60BC3SKcLR9eYaR20j"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold gap-2" size="lg" data-testid="button-flyer-register">
                      Register Now
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </a>
                </div>

                <div className="mt-3 text-center">
                  <Link href="/conferences/convention-2026" onClick={handleDismiss}>
                    <button className="text-sm text-primary hover:underline font-medium" data-testid="button-flyer-learn-more">
                      Learn more about the convention →
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
