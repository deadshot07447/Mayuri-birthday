import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
import confetti from "canvas-confetti";
import { Heart, ChevronLeft } from "lucide-react";

// ── palette ────────────────────────────────────────────────────────────────
const WINE = "#722F37";
const BLUSH = "#F4A7B9";
const IVORY = "#FAF7F2";
const GOLD = "#D4AF7A";
const MAUVE = "#C8A2C8";

// ── ADD YOUR MESSAGES HERE ────────────────────────────────────────────────
// The images folder has been created at: src/assets/images/
// Simply drop your images there (jpeg, png, webp).
// The app will automatically load them and set their captions based on their file names!
// Example: "Our favourite day 🌸.jpg" becomes a slide with caption "Our favourite day 🌸"

const MESSAGES: string[] = [
  "Every day with you feels like the most beautiful dream 💭",
  "Everyday, you have given me reason to fall in love with you more and more 😤",
  "The best is yet to come — and I get to live it all with you. 🌹",
  "Happy Birthday, Mayu! 💕",
  "Cheers to many more years of laughter, adventures, and endless love together! 🥂✨"
];

type SlideItem =
  | { kind: "photo"; id: string; src: string; caption?: string }
  | { kind: "message"; id: string; text: string };

// Dynamically read images dropped in src/assets/images
const imageModules = import.meta.glob("../assets/images/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP}", { eager: true });
const IMAGES = Object.entries(imageModules).map(([path, mod]: [string, any]) => {
  const filename = path.split("/").pop() || "";
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  // clean up common naming separators like hyphens/underscores if any
  const caption = nameWithoutExt.replace(/[-_]/g, " ");
  return {
    src: mod.default || mod,
    caption: caption || undefined,
  };
});

// Build the slides by interleaving messages and photos
const SLIDES: SlideItem[] = [];
const maxItems = Math.max(MESSAGES.length, IMAGES.length);
for (let i = 0; i < maxItems; i++) {
  if (i < MESSAGES.length) {
    SLIDES.push({
      kind: "message",
      id: `msg-${i}`,
      text: MESSAGES[i],
    });
  }
  if (i < IMAGES.length) {
    SLIDES.push({
      kind: "photo",
      id: `photo-${i}`,
      src: IMAGES[i].src,
      caption: IMAGES[i].caption,
    });
  }
}
// ─── end of content area ──────────────────────────────────────────────────

// ── countdown ──────────────────────────────────────────────────────────────
function getBirthdayTarget(): Date {
  return new Date(2026, 5, 12, 0, 0, 0); // June 12, 2026 00:00:00
}

function useCountdown(target: Date) {
  const calc = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { h: 0, m: 0, s: 0, done: true };
    return { h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000), done: false };
  };
  const [tick, setTick] = useState(calc);
  useEffect(() => { const id = setInterval(() => setTick(calc()), 1000); return () => clearInterval(id); }, []);
  return tick;
}

function pad(n: number) { return String(n).padStart(2, "0"); }

// ── bokeh ──────────────────────────────────────────────────────────────────
const BOKEH = Array.from({ length: 18 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  size: 4 + Math.random() * 24, color: [GOLD, BLUSH, MAUVE, IVORY][Math.floor(Math.random() * 4)],
  delay: Math.random() * 4, dur: 3 + Math.random() * 4,
}));

const HEARTS_BG = Array.from({ length: 10 }, (_, i) => ({
  id: i, x: 5 + Math.random() * 90, emoji: ["💕", "✨", "💖", "⭐", "💗", "🌟"][i % 6],
  delay: Math.random() * 6, dur: 6 + Math.random() * 4, size: 14 + Math.random() * 14,
}));

const MIDNIGHT_HEARTS = Array.from({ length: 18 }, (_, i) => ({
  id: i, x: 2 + Math.random() * 96, emoji: ["💕", "✨", "💖", "⭐", "💗", "🌟", "🎊", "🎀"][i % 8],
  delay: Math.random() * 3, dur: 4 + Math.random() * 3, size: 14 + Math.random() * 20,
}));

// ── shared primitives ──────────────────────────────────────────────────────
function BokehLayer() {
  return (
    <>
      {BOKEH.map(b => (
        <motion.div key={b.id}
          style={{ position: "absolute", left: `${b.x}%`, top: `${b.y}%`, width: b.size, height: b.size, borderRadius: "50%", background: b.color, opacity: 0, filter: "blur(6px)", pointerEvents: "none" }}
          animate={{ opacity: [0, 0.22, 0.07, 0.18, 0] }}
          transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </>
  );
}

function DiagonalRibbons() {
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox="0 0 375 812" preserveAspectRatio="none">
      <defs>
        <linearGradient id="rb1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={BLUSH} stopOpacity="0.18" /><stop offset="100%" stopColor={BLUSH} stopOpacity="0.04" /></linearGradient>
        <linearGradient id="rb2" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={GOLD} stopOpacity="0.15" /><stop offset="100%" stopColor={GOLD} stopOpacity="0.03" /></linearGradient>
        <linearGradient id="rb3" x1="0%" y1="50%" x2="100%" y2="50%"><stop offset="0%" stopColor={MAUVE} stopOpacity="0.12" /><stop offset="100%" stopColor={MAUVE} stopOpacity="0.02" /></linearGradient>
      </defs>
      <path d="M -20 180 Q 100 300 280 120 Q 350 60 420 200" stroke="url(#rb1)" strokeWidth="36" fill="none" strokeLinecap="round" />
      <path d="M 380 50 Q 220 220 100 400 Q 20 520 -10 680" stroke="url(#rb2)" strokeWidth="28" fill="none" strokeLinecap="round" />
      <path d="M -30 500 Q 120 420 260 540 Q 340 610 400 720" stroke="url(#rb3)" strokeWidth="22" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function TopStreamers() {
  return (
    <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "220px", pointerEvents: "none" }} viewBox="0 0 375 220">
      <defs>
        <linearGradient id="st1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={BLUSH} stopOpacity="0.8" /><stop offset="100%" stopColor={BLUSH} stopOpacity="0.1" /></linearGradient>
        <linearGradient id="st2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={GOLD} stopOpacity="0.9" /><stop offset="100%" stopColor={GOLD} stopOpacity="0.1" /></linearGradient>
        <linearGradient id="st3" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={BLUSH} stopOpacity="0.7" /><stop offset="100%" stopColor={MAUVE} stopOpacity="0.1" /></linearGradient>
        <linearGradient id="st4" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={GOLD} stopOpacity="0.8" /><stop offset="100%" stopColor={GOLD} stopOpacity="0" /></linearGradient>
      </defs>
      <path d="M 0 0 C 30 60 10 100 50 140 C 70 160 40 190 60 210" stroke="url(#st1)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 20 0 C 60 50 30 110 70 160 C 90 185 55 205 75 220" stroke="url(#st2)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 375 0 C 345 60 365 100 325 140 C 305 160 335 190 315 210" stroke="url(#st3)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 355 0 C 315 50 345 110 305 160 C 285 185 320 205 300 220" stroke="url(#st4)" strokeWidth="2" fill="none" strokeLinecap="round" />
      {[30, 60, 90, 130, 170, 210, 250, 290, 330, 355].map((x, i) => (
        <circle key={i} cx={x} cy={4 + (i % 3) * 6} r={2 + (i % 2)} fill={[GOLD, BLUSH, MAUVE, IVORY][i % 4]} opacity={0.7} />
      ))}
    </svg>
  );
}

function FloatingParticle({ x, emoji, delay, dur, size }: { x: number; emoji: string; delay: number; dur: number; size: number }) {
  return (
    <motion.div
      style={{ position: "absolute", left: `${x}%`, bottom: "5%", fontSize: `${size}px`, pointerEvents: "none", zIndex: 10 }}
      animate={{ y: [0, -480], opacity: [0, 1, 1, 0] }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: "easeOut" }}
    >
      {emoji}
    </motion.div>
  );
}



function TimerDigit({ value }: { value: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <AnimatePresence mode="popLayout">
        <motion.span key={value} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.3 }}
          style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 700, fontSize: "56px", color: IVORY, letterSpacing: "-2px", lineHeight: 1, display: "block", textShadow: `0 0 30px rgba(212,175,122,0.5)` }}>
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function GlowingTimer({ h, m, s }: { h: number; m: number; s: number }) {
  return (
    <motion.div animate={{ boxShadow: ["0 0 20px rgba(212,175,122,0.2)", "0 0 50px rgba(212,175,122,0.5)", "0 0 20px rgba(212,175,122,0.2)"] }} transition={{ duration: 2.5, repeat: Infinity }} style={{ borderRadius: "16px", padding: "16px 8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }}>
        <TimerDigit value={pad(h)} />
        <span style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 700, fontSize: "40px", color: GOLD, lineHeight: 1, marginBottom: "6px" }}>:</span>
        <TimerDigit value={pad(m)} />
        <span style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 700, fontSize: "40px", color: GOLD, lineHeight: 1, marginBottom: "6px" }}>:</span>
        <TimerDigit value={pad(s)} />
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "36px", marginTop: "6px" }}>
        {["HRS", "MIN", "SEC"].map(l => (
          <span key={l} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: MAUVE, letterSpacing: "2px", fontWeight: 300 }}>{l}</span>
        ))}
      </div>
    </motion.div>
  );
}

// ── COUNTDOWN SCREEN ───────────────────────────────────────────────────────
function CountdownScreen({ h, m, s }: { h: number; m: number; s: number }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <TopStreamers />
      {HEARTS_BG.map(p => <FloatingParticle key={p.id} {...p} />)}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px", width: "100%", zIndex: 20 }}>
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} style={{ textAlign: "center", marginBottom: "36px", marginTop: "60px" }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "15px", color: MAUVE, letterSpacing: "1px", marginBottom: "12px" }}>— for someone extraordinary —</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 400, fontSize: "28px", color: GOLD, lineHeight: 1.35, textShadow: `0 0 40px rgba(212,175,122,0.4)` }}>
            Something special<br />awaits you 🎀
          </h1>
        </motion.div>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 }} style={{ width: "100%", background: "rgba(250,247,242,0.07)", backdropFilter: "blur(20px)", border: `1px solid rgba(212,175,122,0.25)`, borderRadius: "24px", boxShadow: `0 8px 48px rgba(114,47,55,0.4)`, padding: "28px 24px" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontStyle: "italic", fontSize: "13px", color: MAUVE, textAlign: "center", letterSpacing: "1.5px", marginBottom: "12px" }}>Your birthday begins in</p>
          <GlowingTimer h={h} m={m} s={s} />
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} style={{ display: "flex", gap: "16px", marginTop: "28px" }}>
          {["💕", "✨", "💖", "⭐", "💗"].map((e, i) => (
            <motion.span key={i} style={{ fontSize: "20px" }} animate={{ y: [0, -8, 0], opacity: [0.6, 1, 0.6] }} transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}>{e}</motion.span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── BIRTHDAY SCREEN ────────────────────────────────────────────────────────
function BirthdayScreen({ onOpenGallery }: { onOpenGallery: () => void }) {
  const hasLaunched = useRef(false);
  useEffect(() => {
    if (hasLaunched.current) return;
    hasLaunched.current = true;
    const colors = [BLUSH, GOLD, MAUVE, IVORY, WINE, "#ff9eb5"];
    const end = Date.now() + 5000;
    const frame = () => {
      confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0, y: 0.3 }, colors });
      confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1, y: 0.3 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {MIDNIGHT_HEARTS.map(p => <FloatingParticle key={p.id} {...p} />)}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px", width: "100%", zIndex: 20 }}>
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} style={{ textAlign: "center", marginBottom: "32px" }}>
          <motion.h1 animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 3, repeat: Infinity }}
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: "30px", color: GOLD, lineHeight: 1.3, textShadow: `0 0 50px rgba(212,175,122,0.6)` }}>
            Happy Birthday,<br />Mayuri! 🎂🎉
          </motion.h1>
        </motion.div>
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4 }} style={{ width: "100%", background: "rgba(250,247,242,0.07)", backdropFilter: "blur(20px)", border: `1px solid rgba(212,175,122,0.25)`, borderRadius: "24px", boxShadow: `0 8px 48px rgba(114,47,55,0.4)`, padding: "28px 24px" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontStyle: "italic", fontSize: "13px", color: MAUVE, marginBottom: "24px" }}>A little something made just for you…</p>
            <motion.button onClick={onOpenGallery} whileTap={{ scale: 0.95 }} animate={{ y: [0, -6, 0] }} transition={{ duration: 1.8, repeat: Infinity }}
              style={{ background: `linear-gradient(135deg, ${WINE} 0%, #b0505a 40%, #C8827A 100%)`, border: `1.5px solid rgba(212,175,122,0.5)`, borderRadius: "60px", padding: "16px 52px", cursor: "pointer", boxShadow: `0 8px 32px rgba(114,47,55,0.7)`, display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", color: IVORY, fontWeight: 700, letterSpacing: "2px" }}>YAY! 🎉</span>
            </motion.button>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "rgba(200,162,200,0.6)", marginTop: "14px", fontStyle: "italic" }}>swipe through your memories 💕</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ display: "flex", gap: "12px", marginTop: "28px", flexWrap: "wrap", justifyContent: "center" }}>
          {["🎊", "💕", "🎀", "✨", "🌟", "💖", "🎂"].map((e, i) => (
            <motion.span key={i} style={{ fontSize: "22px" }} animate={{ rotate: [-10, 10, -10], scale: [1, 1.2, 1] }} transition={{ duration: 1.5 + i * 0.2, repeat: Infinity, delay: i * 0.15 }}>{e}</motion.span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── SWIPEABLE SLIDE CARD ───────────────────────────────────────────────────
const SWIPE_THRESHOLD = 80;

function SwipeCard({
  item, onSwipeLeft, onSwipeRight, isTop, stackIndex,
}: {
  item: SlideItem; onSwipeLeft: () => void; onSwipeRight: () => void; isTop: boolean; stackIndex: number;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const opacity = useTransform(x, [-200, -80, 0, 80, 200], [0, 1, 1, 1, 0]);

  // tint overlays on drag
  const leftTint = useTransform(x, [-100, 0], [0.35, 0]);
  const rightTint = useTransform(x, [0, 100], [0, 0.35]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -SWIPE_THRESHOLD) onSwipeLeft();
    else if (info.offset.x > SWIPE_THRESHOLD) onSwipeRight();
  };

  // stack peek effect for cards below
  const scale = isTop ? 1 : 1 - stackIndex * 0.04;
  const yOffset = isTop ? 0 : stackIndex * 12;

  return (
    <motion.div
      style={{
        position: "absolute",
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? opacity : 1,
        scale,
        y: yOffset,
        width: "100%",
        cursor: isTop ? "grab" : "default",
        zIndex: 10 - stackIndex,
        transformOrigin: "50% 110%",
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={isTop ? handleDragEnd : undefined}
      whileDrag={{ cursor: "grabbing" }}
      animate={{ scale, y: yOffset }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* card shell */}
      <div style={{
        background: "rgba(250,247,242,0.07)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: `1px solid rgba(212,175,122,0.22)`,
        borderRadius: "28px",
        overflow: "hidden",
        boxShadow: isTop
          ? `0 16px 60px rgba(114,47,55,0.5), 0 0 0 1px rgba(212,175,122,0.08), inset 0 1px 0 rgba(250,247,242,0.1)`
          : `0 8px 24px rgba(114,47,55,0.3)`,
        height: "380px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}>
        {item.kind === "photo" ? (
          <img
            src={item.src}
            alt={item.caption ?? ""}
            draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", userSelect: "none" }}
          />
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "36px 28px 32px" }}>
            {/* decorative quote */}
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "72px", color: "rgba(212,175,122,0.12)", lineHeight: 0.8, display: "block", marginBottom: "8px" }}>"</span>
            <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "18px", color: IVORY, lineHeight: 1.7, flex: 1 }}>
              {item.text}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "24px" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(212,175,122,0.2)" }} />
              <Heart size={13} color={BLUSH} fill={BLUSH} />
            </div>
          </div>
        )}

        {/* drag-direction tints */}
        {isTop && (
          <>
            <motion.div style={{ position: "absolute", inset: 0, background: `linear-gradient(to right, rgba(200,162,200,0.5), transparent)`, opacity: leftTint, borderRadius: "28px", pointerEvents: "none" }} />
            <motion.div style={{ position: "absolute", inset: 0, background: `linear-gradient(to left, rgba(212,175,122,0.5), transparent)`, opacity: rightTint, borderRadius: "28px", pointerEvents: "none" }} />
          </>
        )}
      </div>
    </motion.div>
  );
}

// ── GALLERY / SWIPE SCREEN ─────────────────────────────────────────────────
function GalleryScreen({ onBack }: { onBack: () => void }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [gone, setGone] = useState<number[]>([]);

  const activeSlides = SLIDES.filter((_, i) => !gone.includes(i));
  const finished = activeSlides.length === 0;

  const swipeNext = () => {
    setDirection(1);
    setGone(g => [...g, SLIDES.indexOf(activeSlides[0])]);
    setIndex(i => i + 1);
  };
  const swipePrev = () => {
    if (gone.length === 0) return;
    setDirection(-1);
    setGone(g => g.slice(0, -1));
    setIndex(i => Math.max(0, i - 1));
  };
  const resetGallery = () => {
    setDirection(-1);
    setGone([]);
    setIndex(0);
  };

  const total = SLIDES.length;
  const current = Math.min(index + 1, total);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.4 }}
      style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}
    >
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "54px 22px 10px", zIndex: 20, position: "relative" }}>
        <button onClick={onBack} style={{ background: "rgba(212,175,122,0.1)", border: "1px solid rgba(212,175,122,0.22)", borderRadius: "50%", width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ChevronLeft size={18} color={GOLD} />
        </button>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "19px", color: GOLD, lineHeight: 1 }}>Our Memories</p>
          {!finished && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: MAUVE, letterSpacing: "1px", marginTop: "3px" }}>
              {current} of {total}
            </p>
          )}
        </div>
        <Heart size={18} color={BLUSH} fill={BLUSH} />
      </div>

      {/* dot indicators */}
      <div style={{ display: "flex", justifyContent: "center", gap: "7px", padding: "0 0 16px", zIndex: 20, position: "relative" }}>
        {SLIDES.map((_, i) => (
          <motion.div key={i}
            animate={{ width: i === index ? 20 : 7, background: i === index ? GOLD : i < index ? BLUSH : "rgba(250,247,242,0.2)" }}
            transition={{ duration: 0.3 }}
            style={{ height: "7px", borderRadius: "4px" }}
          />
        ))}
      </div>

      {/* card stack area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", position: "relative", zIndex: 20 }}>
        {finished ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <motion.span style={{ fontSize: "56px" }} animate={{ scale: [1, 1.2, 1], rotate: [-5, 5, -5] }} transition={{ duration: 2, repeat: Infinity }}>💖</motion.span>
            <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "22px", color: GOLD, lineHeight: 1.4 }}>See you soon!</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: MAUVE, fontStyle: "italic" }}>be ready for the Mayuri Day! 🌹</p>
            <button onClick={resetGallery} style={{ marginTop: "8px", background: "rgba(212,175,122,0.12)", border: "1px solid rgba(212,175,122,0.3)", borderRadius: "50px", padding: "10px 24px", cursor: "pointer" }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: GOLD }}>← Revisit memories</span>
            </button>
          </motion.div>
        ) : (
          <div style={{ position: "relative", width: "100%", height: "420px" }}>
            {/* render stack — top card first, then peeking cards behind */}
            {activeSlides.slice(0, 3).map((item, stackIndex) => (
              <SwipeCard
                key={item.id}
                item={item}
                isTop={stackIndex === 0}
                stackIndex={stackIndex}
                onSwipeLeft={swipeNext}
                onSwipeRight={swipeNext}
              />
            ))}
          </div>
        )}
      </div>

      {/* hint row */}
      {!finished && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "16px", padding: "0 0 12px", zIndex: 20, position: "relative" }}>
          <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity }}
            style={{ fontFamily: "'DM Sans', sans-serif", fontStyle: "italic", fontSize: "12px", color: "rgba(250,247,242,0.4)", letterSpacing: "0.5px" }}>
            swipe to continue
          </motion.p>
        </div>
      )}

    </motion.div>
  );
}

// ── APP ROOT ───────────────────────────────────────────────────────────────
type Screen = "countdown" | "birthday" | "gallery";

export default function App() {
  /* MARKER-MAKE-KIT-INVOKED */
  const [birthdayTarget] = useState(getBirthdayTarget);
  const { h, m, s, done } = useCountdown(birthdayTarget);
  const [screen, setScreen] = useState<Screen>("countdown");

  useEffect(() => {
    if (done && screen === "countdown") setScreen("birthday");
  }, [done]);

  const activeScreen: Screen = done ? screen : "countdown";

  return (
    <div className="app-wrapper">
      <div className="phone-container">

        <div style={{ position: "absolute", inset: 0, zIndex: 1 }}><BokehLayer /></div>
        <div style={{ position: "absolute", inset: 0, zIndex: 2 }}><DiagonalRibbons /></div>

        <div style={{ position: "absolute", inset: 0, zIndex: 5 }}>
          <AnimatePresence mode="wait">
            {activeScreen === "countdown" && <CountdownScreen key="countdown" h={h} m={m} s={s} />}
            {activeScreen === "birthday" && <BirthdayScreen key="birthday" onOpenGallery={() => setScreen("gallery")} />}
            {activeScreen === "gallery" && <GalleryScreen key="gallery" onBack={() => setScreen("birthday")} />}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
