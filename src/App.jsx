import { useState, useRef } from 'react';
import { Heart, X, Sparkles, ChevronLeft, ArrowRight, Send, Loader2, Check } from 'lucide-react';

const profiles = [
  {
    id: 1,
    name: 'Raphael',
    age: 29,
    location: 'Surry Hills',
    job: 'In between things',
    initials: 'RA',
    gradient: 'from-stone-400 via-stone-600 to-stone-800',
    tagline: 'Serial monogamist. Cries at Pixar.',
    prompt: { q: 'Worst habit', a: 'Checking my phone during sex to see what time it is' },
    redFlags: ['Owns one fork', 'Has a podcast. Zero episodes.', 'Says "per my last text"'],
  },
  {
    id: 2,
    name: 'George',
    age: 29,
    location: 'Bondi',
    job: 'Founder (pre-revenue)',
    initials: 'GE',
    gradient: 'from-emerald-700 via-emerald-900 to-stone-900',
    tagline: "Building something big. Can't say what.",
    prompt: { q: 'Worst habit', a: 'Mentioning I went to Burning Man within 6 minutes of meeting someone' },
    redFlags: ['Microdoses. Unclear on what.', 'Strong opinions about sourdough', 'Parks Tesla diagonally'],
  },
];

const TOTAL = profiles.length;

const CREAM = '#F4EFE6';
const INK = '#1C1917';
const GOLD = '#8B6F3F';

// ---------- Message sending (calls our own API, which forwards to Discord) ----------
async function sendMessage({ sender, handle, text, bachelor }) {
  const res = await fetch('/api/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: sender || 'Anonymous',
      handle: handle || '',
      text,
      bachelorName: bachelor.name,
    }),
  });
  if (!res.ok) throw new Error('Send failed');
  return res.json();
}

// ---------- Swipeable Card ----------
function SwipeCard({ profile, onSwipe, isTop, stackIndex }) {
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [exiting, setExiting] = useState(null);
  const startRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
    if (!isTop || exiting) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    setDrag({
      x: e.clientX - startRef.current.x,
      y: e.clientY - startRef.current.y,
    });
  };

  const handlePointerUp = (e) => {
    if (!dragging) return;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
    setDragging(false);
    const threshold = 110;
    if (drag.x > threshold) {
      setExiting('right');
      setTimeout(() => onSwipe('right'), 280);
    } else if (drag.x < -threshold) {
      setExiting('left');
      setTimeout(() => onSwipe('left'), 280);
    } else {
      setDrag({ x: 0, y: 0 });
    }
  };

  let x = drag.x;
  let y = drag.y;
  let rotate = drag.x * 0.06;
  if (exiting === 'right') { x = 800; rotate = 30; }
  if (exiting === 'left') { x = -800; rotate = -30; }

  const stackOffset = stackIndex * 8;
  const stackScale = 1 - stackIndex * 0.04;
  const stackOpacity = stackIndex === 0 ? 1 : 0.55;

  const likeOpacity = Math.min(Math.max(drag.x / 100, 0), 1);
  const nopeOpacity = Math.min(Math.max(-drag.x / 100, 0), 1);

  const transformStyle = isTop
    ? `translate(${x}px, ${y + stackOffset}px) rotate(${rotate}deg) scale(${stackScale})`
    : `translate(0px, ${stackOffset}px) scale(${stackScale})`;

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`absolute inset-0 select-none ${isTop ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
      style={{
        transform: transformStyle,
        opacity: stackOpacity,
        transition: dragging ? 'none' : 'transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease',
        touchAction: 'none',
        zIndex: 10 - stackIndex,
      }}
    >
      <div className={`relative h-full w-full bg-gradient-to-br ${profile.gradient} shadow-2xl overflow-hidden`}>
        <div className="absolute inset-0 grain opacity-60 pointer-events-none" />

        {isTop && (
          <>
            <div
              className="absolute top-10 left-8 border-4 px-5 py-2 font-display italic pointer-events-none"
              style={{ color: CREAM, borderColor: CREAM, opacity: likeOpacity, fontSize: '38px', letterSpacing: '0.1em', transform: 'rotate(-18deg)' }}
            >
              YES
            </div>
            <div
              className="absolute top-10 right-8 border-4 px-5 py-2 font-display italic pointer-events-none"
              style={{ color: CREAM, borderColor: CREAM, opacity: nopeOpacity, fontSize: '38px', letterSpacing: '0.1em', transform: 'rotate(18deg)' }}
            >
              PASS
            </div>
          </>
        )}

        <div className="absolute top-4 left-4 right-4 flex justify-between items-start text-white">
          <div className="bg-black bg-opacity-30 backdrop-blur px-2 py-1 uppercase" style={{ fontSize: '10px', letterSpacing: '0.25em' }}>Verified</div>
          <div className="bg-black bg-opacity-30 backdrop-blur px-2 py-1 uppercase" style={{ fontSize: '10px', letterSpacing: '0.25em' }}>{profile.id} of {TOTAL}</div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-white" style={{ fontSize: '180px', lineHeight: '1', opacity: 0.9 }}>{profile.initials}</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 text-white" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92), rgba(0,0,0,0.6), transparent)' }}>
          <div className="flex items-baseline gap-2 mb-1">
            <h2 className="font-display text-4xl">{profile.name}</h2>
            <span className="font-display text-2xl opacity-80">{profile.age}</span>
          </div>
          <p className="opacity-70 mb-2" style={{ fontSize: '11px' }}>{profile.location} · {profile.job}</p>
          <p className="text-sm italic mb-3">"{profile.tagline}"</p>

          <div className="border-t border-white border-opacity-20 pt-3 mt-2">
            <p className="uppercase opacity-60 mb-1" style={{ fontSize: '9px', letterSpacing: '0.2em' }}>{profile.prompt.q}</p>
            <p className="font-display italic leading-snug" style={{ fontSize: '17px' }}>"{profile.prompt.a}"</p>
          </div>

          <div className="border-t border-white border-opacity-20 pt-3 mt-3">
            <p className="uppercase mb-1" style={{ fontSize: '9px', letterSpacing: '0.2em', color: '#D4A574' }}>Red flags · legally required</p>
            <ul className="space-y-0.5 opacity-90" style={{ fontSize: '11px' }}>
              {profile.redFlags.map((f, i) => <li key={i}>— {f}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Message Form ----------
function MessageForm({ bachelor, onClose }) {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState('idle');

  const canSend = text.trim().length > 0 && status === 'idle';

  const handleSubmit = async () => {
    if (!canSend) return;
    setStatus('sending');
    try {
      await sendMessage({ sender: name, handle, text, bachelor });
      setStatus('sent');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 anim-in" style={{ backgroundColor: 'rgba(28,25,23,0.85)' }}>
      <div className="relative w-full max-w-md anim-pop" style={{ backgroundColor: CREAM, color: INK }}>
        <div className="p-6 md:p-8">
          {status === 'sent' ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex items-center justify-center" style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: GOLD, color: CREAM }}>
                <Check className="w-7 h-7" />
              </div>
              <p className="uppercase mb-2" style={{ color: GOLD, fontSize: '10px', letterSpacing: '0.3em' }}>Delivered</p>
              <h2 className="font-display text-4xl italic mb-3">Message sent.</h2>
              <p className="text-sm opacity-60 mb-6">
                {bachelor.name} has been notified.<br />
                <span className="italic">They will reply in 4 seconds. They are always online.</span>
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 text-white uppercase"
                style={{ backgroundColor: INK, fontSize: '12px', letterSpacing: '0.2em', border: 'none', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className={`bg-gradient-to-br ${bachelor.gradient} flex items-center justify-center shrink-0`} style={{ width: '48px', height: '48px' }}>
                  <span className="font-display text-white" style={{ fontSize: '20px', opacity: 0.9 }}>{bachelor.initials}</span>
                </div>
                <div>
                  <p className="uppercase opacity-50" style={{ fontSize: '9px', letterSpacing: '0.25em' }}>Message</p>
                  <h2 className="font-display text-2xl">{bachelor.name}, {bachelor.age}</h2>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block uppercase opacity-60 mb-1" style={{ fontSize: '9px', letterSpacing: '0.2em' }}>Your name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Or alias. We're not picky."
                    className="w-full bg-transparent border-b py-2 outline-none text-sm"
                    style={{ borderColor: 'rgba(28,25,23,0.3)' }}
                  />
                </div>
                <div>
                  <label className="block uppercase opacity-60 mb-1" style={{ fontSize: '9px', letterSpacing: '0.2em' }}>Instagram <span className="opacity-50">(optional but encouraged)</span></label>
                  <input
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="@yourhandle"
                    className="w-full bg-transparent border-b py-2 outline-none text-sm"
                    style={{ borderColor: 'rgba(28,25,23,0.3)' }}
                  />
                </div>
                <div>
                  <label className="block uppercase opacity-60 mb-1" style={{ fontSize: '9px', letterSpacing: '0.2em' }}>Your message</label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    placeholder={`Hey ${bachelor.name}, I saw your red flags and I'm intrigued...`}
                    className="w-full bg-transparent border-b py-2 outline-none text-sm resize-none"
                    style={{ borderColor: 'rgba(28,25,23,0.3)' }}
                  />
                  <p className="opacity-50 mt-2 italic" style={{ fontSize: '11px', lineHeight: '1.4' }}>
                    Messages are read by the bachelors personally. Please only send if it's actually from you.
                  </p>
                </div>
              </div>

              {status === 'error' && (
                <p className="mt-3 text-sm" style={{ color: '#a33' }}>Something went wrong. Try again in a moment.</p>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 uppercase opacity-60 hover:opacity-100"
                  style={{ fontSize: '12px', letterSpacing: '0.2em', background: 'none', border: `1px solid ${INK}`, color: INK, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSend}
                  className="flex-1 py-3 text-white uppercase flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: INK,
                    fontSize: '12px',
                    letterSpacing: '0.2em',
                    border: 'none',
                    cursor: canSend ? 'pointer' : 'not-allowed',
                    opacity: canSend ? 1 : 0.5,
                  }}
                >
                  {status === 'sending' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Sending
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Main ----------
export default function App() {
  const [view, setView] = useState('landing');
  const [stack, setStack] = useState(profiles);
  const [loopCount, setLoopCount] = useState(0);
  const [showMatch, setShowMatch] = useState(null);
  const [showMessage, setShowMessage] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, ms = 2400) => {
    setToast(msg);
    setTimeout(() => setToast(null), ms);
  };

  const handleSwipe = (direction) => {
    const swiped = stack[0];
    const rest = stack.slice(1);
    if (direction === 'right') setShowMatch(swiped);
    if (rest.length === 0) {
      setStack(profiles);
      setLoopCount((c) => c + 1);
      if (loopCount === 0) showToast("You've seen everyone in your area. Expanding search radius: global.", 3000);
      else if (loopCount === 1) showToast("No new matches. Showing you the same 2 men again.", 3000);
      else showToast("It's still just them. There is no one else.", 3000);
    } else {
      setStack(rest);
    }
  };

  const openMessage = () => {
    const b = showMatch;
    setShowMatch(null);
    setShowMessage(b);
  };

  const fonts = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
      .font-display { font-family: 'Instrument Serif', serif; letter-spacing: -0.01em; }
      .font-body { font-family: 'DM Sans', system-ui, sans-serif; }
      @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes pop { 0% { transform: scale(0.85); opacity: 0; } 60% { transform: scale(1.04); } 100% { transform: scale(1); opacity: 1; } }
      @keyframes confetti { 0% { transform: translateY(-20px) rotate(0); opacity: 1; } 100% { transform: translateY(500px) rotate(720deg); opacity: 0; } }
      @keyframes shimmer { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
      @keyframes floatIn { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
      .anim-up { animation: fadeUp 0.7s ease-out forwards; }
      .anim-in { animation: fadeIn 0.5s ease-out forwards; }
      .anim-pop { animation: pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      .anim-float-inner { animation: floatIn 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
      .anim-shimmer { animation: shimmer 2s ease-in-out infinite; }
      .grain { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
      .hero-headline { font-size: clamp(52px, 9vw, 110px); line-height: 0.95; }
      .micro { font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; }
      .micro-narrow { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; }
      .micro-wide { font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; }
      .bachelor-card { width: 200px; aspect-ratio: 3 / 4; }
      @media (min-width: 768px) { .bachelor-card { width: 240px; } }
      .bachelor-card { transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
      .bachelor-card:hover { transform: var(--base-transform) translateY(-8px) scale(1.05) !important; }
      .swipe-area { width: 100%; max-width: 360px; aspect-ratio: 3 / 4.4; }
      .fan-stage { position: relative; width: 100%; max-width: 720px; height: 360px; }
      @media (min-width: 768px) { .fan-stage { height: 440px; } }
      .cta-btn {
        display: inline-flex; align-items: center; gap: 12px;
        padding: 16px 40px; color: white; background: ${INK};
        text-transform: uppercase; font-size: 13px; letter-spacing: 0.25em;
        transition: opacity 0.2s; cursor: pointer; border: none;
      }
      .cta-btn:hover { opacity: 0.9; }
    `}</style>
  );

  // ---------- LANDING ----------
  if (view === 'landing') {
    return (
      <div className="font-body min-h-screen w-full relative overflow-hidden flex flex-col" style={{ backgroundColor: CREAM, color: INK }}>
        {fonts}
        <div className="absolute inset-0 grain opacity-40 pointer-events-none" />

        <nav className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5 border-b" style={{ borderColor: 'rgba(28,25,23,0.12)' }}>
          <div className="font-display text-xl md:text-2xl" style={{ letterSpacing: '0.15em' }}>
            FINA<span style={{ color: GOLD }}>·</span>LIST<span className="align-top ml-1" style={{ color: GOLD, fontSize: '10px' }}>™</span>
          </div>
          <div className="micro opacity-60 hidden sm:block">
            <span className="anim-shimmer inline-block mr-2" style={{ color: GOLD }}>●</span> Accepting applications
          </div>
        </nav>

        <section className="relative z-10 px-6 pt-10 md:pt-14 pb-4 text-center">
          <div className="inline-flex items-center gap-2 mb-5 anim-up micro-wide" style={{ color: GOLD }}>
            <span style={{ width: '24px', height: '1px', backgroundColor: GOLD }} /> By Invitation Only <span style={{ width: '24px', height: '1px', backgroundColor: GOLD }} />
          </div>
          <h1 className="font-display hero-headline mb-4 anim-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
            2 men. <em className="italic" style={{ color: GOLD }}>Handpicked.</em>
          </h1>
          <p className="text-base md:text-lg max-w-xl mx-auto opacity-70 anim-up" style={{ animationDelay: '0.25s', opacity: 0 }}>
            The world's most curated dating experience. Ruthlessly vetted by a committee of their exes.
          </p>
        </section>

        <section className="relative z-10 px-6 py-6 md:py-8 flex-1 flex items-center justify-center">
          <div className="fan-stage flex items-center justify-center">
            {profiles.map((p, i) => {
              const configs = [
                { rotate: -7, offsetX: '-95%', delay: '0.4s', z: 2 },
                { rotate: 7, offsetX: '-5%', delay: '0.55s', z: 3 },
              ];
              const cfg = configs[i];
              const baseTransform = `translate(${cfg.offsetX}, -50%) rotate(${cfg.rotate}deg)`;
              return (
                <div
                  key={p.id}
                  className="absolute anim-float-inner"
                  style={{
                    left: '50%',
                    top: '50%',
                    animationDelay: cfg.delay,
                    zIndex: cfg.z,
                  }}
                >
                  <div
                    className={`bachelor-card relative bg-gradient-to-br ${p.gradient} shadow-2xl overflow-hidden`}
                    style={{
                      '--base-transform': baseTransform,
                      transform: baseTransform,
                    }}
                  >
                    <div className="absolute inset-0 grain opacity-60 pointer-events-none" />
                    <div className="absolute top-3 left-3 bg-black bg-opacity-30 backdrop-blur px-2 py-1 text-white micro-narrow">
                      Bachelor {p.id}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-display text-white" style={{ fontSize: '120px', lineHeight: '1', opacity: 0.9 }}>{p.initials}</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3.5 text-white" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92), transparent)' }}>
                      <div className="flex items-baseline gap-1.5">
                        <h3 className="font-display text-2xl md:text-3xl">{p.name}</h3>
                        <span className="font-display text-base opacity-80">{p.age}</span>
                      </div>
                      <p className="opacity-70 italic truncate" style={{ fontSize: '10px' }}>{p.tagline}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="relative z-10 px-6 pb-10 md:pb-14 text-center">
          <button
            onClick={() => setView('swipe')}
            className="cta-btn anim-up"
            style={{ animationDelay: '0.9s', opacity: 0 }}
          >
            Meet the Bachelors
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="micro opacity-50 mt-5 anim-up" style={{ animationDelay: '1.05s', opacity: 0 }}>
            0.0002% acceptance rate · 8,472 on waitlist · 0 matches made
          </p>
        </section>

        <footer className="relative z-10 py-4 px-6 text-center opacity-40 border-t" style={{ borderColor: 'rgba(28,25,23,0.08)', fontSize: '10px' }}>
          FinaList™ · Sydney · Est. 2026 · Not an actual company
        </footer>
      </div>
    );
  }

  // ---------- SWIPE ----------
  return (
    <div className="font-body min-h-screen w-full relative overflow-hidden flex flex-col" style={{ backgroundColor: CREAM, color: INK }}>
      {fonts}
      <div className="absolute inset-0 grain opacity-40 pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(28,25,23,0.12)' }}>
        <button onClick={() => setView('landing')} className="flex items-center gap-1 opacity-60 hover:opacity-100 micro-narrow">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <div className="font-display text-lg md:text-xl" style={{ letterSpacing: '0.15em' }}>
          FINA<span style={{ color: GOLD }}>·</span>LIST
        </div>
        <div className="opacity-60 text-right" style={{ fontSize: '10px', letterSpacing: '0.2em', width: '48px' }}>{stack.length}/{TOTAL}</div>
      </div>

      <div className="relative z-10 text-center py-1.5 micro" style={{ color: GOLD, backgroundColor: 'rgba(139,111,63,0.08)' }}>
        <span className="anim-shimmer inline-block">●</span> drag to swipe · 2 men in your area
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-5 py-6">
        <div className="swipe-area relative">
          {stack.slice(0, 2).reverse().map((profile, revIdx, arr) => {
            const stackIndex = arr.length - 1 - revIdx;
            return (
              <SwipeCard
                key={`${profile.id}-${loopCount}-${stack.length}`}
                profile={profile}
                isTop={stackIndex === 0}
                stackIndex={stackIndex}
                onSwipe={handleSwipe}
              />
            );
          })}
        </div>
      </div>

      <div className="relative z-10 pb-8 pt-2 flex justify-center gap-5">
        <button onClick={() => handleSwipe('left')} className="border-2 rounded-full flex items-center justify-center hover:scale-110 transition bg-white bg-opacity-50" style={{ borderColor: INK, width: '56px', height: '56px' }} aria-label="Pass">
          <X className="w-6 h-6" />
        </button>
        <button onClick={() => showToast('Super Like used. ($4.99 charged.) It made no difference.')} className="border-2 rounded-full flex items-center justify-center hover:scale-110 transition bg-white bg-opacity-50" style={{ borderColor: GOLD, color: GOLD, width: '56px', height: '56px' }} aria-label="Super like">
          <Sparkles className="w-5 h-5" />
        </button>
        <button onClick={() => handleSwipe('right')} className="rounded-full flex items-center justify-center hover:scale-110 transition text-white" style={{ backgroundColor: INK, width: '56px', height: '56px' }} aria-label="Like">
          <Heart className="w-6 h-6" fill="currentColor" />
        </button>
      </div>

      {showMatch && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-6 anim-in" style={{ backgroundColor: 'rgba(28,25,23,0.85)' }}>
          {[...Array(24)].map((_, i) => (
            <div key={i} className="absolute pointer-events-none" style={{
              width: '8px', height: '12px',
              left: `${Math.random() * 100}%`,
              top: '-20px',
              backgroundColor: [GOLD, CREAM, '#D4A574'][i % 3],
              animation: `confetti ${2 + Math.random() * 2}s ease-in ${Math.random() * 0.5}s forwards`,
            }} />
          ))}
          <div className="relative max-w-sm w-full text-center anim-pop" style={{ backgroundColor: CREAM, color: INK }}>
            <div className="p-8">
              <p className="mb-2 uppercase" style={{ color: GOLD, fontSize: '10px', letterSpacing: '0.3em' }}>It's a match</p>
              <h2 className="font-display text-6xl italic mb-2">Mutual.</h2>
              <p className="text-sm opacity-60 mb-5">
                {showMatch.name} likes you too.<br />
                <span className="italic">(They like everyone. 100% match rate.)</span>
              </p>
              <div className={`aspect-square bg-gradient-to-br ${showMatch.gradient} mx-auto mb-6 flex items-center justify-center`} style={{ width: '112px' }}>
                <span className="font-display text-5xl text-white" style={{ opacity: 0.9 }}>{showMatch.initials}</span>
              </div>
              <button
                onClick={openMessage}
                className="w-full py-3 text-white mb-2 uppercase"
                style={{ backgroundColor: INK, fontSize: '12px', letterSpacing: '0.2em', border: 'none', cursor: 'pointer' }}
              >
                Send a message
              </button>
              <button onClick={() => setShowMatch(null)} className="w-full py-3 opacity-60 hover:opacity-100 uppercase" style={{ fontSize: '12px', letterSpacing: '0.2em', background: 'none', border: 'none', cursor: 'pointer', color: INK }}>
                Keep Browsing
              </button>
            </div>
          </div>
        </div>
      )}

      {showMessage && (
        <MessageForm bachelor={showMessage} onClose={() => setShowMessage(null)} />
      )}

      {toast && (
        <div className="fixed left-1/2 z-50 px-5 py-3 text-sm anim-pop max-w-xs text-center" style={{ bottom: '112px', transform: 'translateX(-50%)', backgroundColor: INK, color: CREAM }}>
          {toast}
        </div>
      )}
    </div>
  );
}
