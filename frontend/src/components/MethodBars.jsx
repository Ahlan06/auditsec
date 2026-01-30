import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Animated horizontal bars inspired by the AuditSec Method image
// Each bar is clickable and routes to the corresponding guides detail page.
// Colors follow the site's neon/dark palette.

const bars = [
  {
    label: 'Compliance',
    slug: '/guides/conformite-normes',
    color: 'from-emerald-500 to-green-600',
    start: 0,
    length: 45,
  },
  {
    label: 'MVP Development',
    slug: '/guides/tests-techniques',
    color: 'from-purple-500 to-pink-600',
    start: 10,
    length: 58,
  },
  {
    label: 'Testing',
    slug: '/guides/tests-techniques',
    color: 'from-cyan-500 to-blue-600',
    start: 22,
    length: 56,
  },
  {
    label: 'Training',
    slug: '/guides/remediation-validation',
    color: 'from-gray-500 to-slate-600',
    start: 35,
    length: 54,
  },
  {
    label: 'Deployment',
    slug: '/guides/pre-audit-reconnaissance',
    color: 'from-zinc-400 to-gray-500',
    start: 50,
    length: 44,
  },
  {
    label: 'Innovation',
    slug: '/guides/tools',
    // High-contrast neon to stay visible on light backgrounds
    color: 'from-amber-400 to-yellow-600',
    start: 64,
    length: 40,
  },
];

const MethodBars = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      // Ensure animation class is present even if IntersectionObserver doesn't trigger
      el.classList.add('animate-in');
    }
    // Mobile breakpoint detection
    const mq = window.matchMedia('(max-width: 640px)');
    const onChange = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toPx = (percent) => `calc(${percent}% - 0.5rem)`;

  // Render bottom-to-top: reverse visual stacking order
  const renderBars = [...bars];

  return (
    <div ref={containerRef} className="relative w-full min-h-[220px]">
      <div className="flex flex-col gap-6 sm:gap-8">
        {renderBars.map((bar, i) => (
          <div key={bar.label} className="relative h-16 overflow-visible">
            {/* dotted baseline */}
            <div className="hidden sm:block absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dotted border-gray-300/70 dark:border-gray-600" />

            {/* bar */}
            <button
              onClick={() => navigate(bar.slug)}
              aria-label={`Open ${bar.label}`}
              className={`group absolute top-1/2 -translate-y-1/2 rounded-full shadow-md backdrop-blur-sm
                         bg-gradient-to-r ${bar.color}
                         text-white dark:text-slate-100
                         transition-transform duration-500 ease-out
                         hover:scale-[1.03] active:scale-[0.99]
                         ring-1 ring-white/10 dark:ring-black/20
                         overflow-hidden`}
              style={{
                left: isMobile ? 0 : toPx(bar.start),
                width: isMobile ? '100%' : toPx(bar.length),
                height: isMobile ? '2.75rem' : '3.25rem',
                boxShadow: '0 10px 28px rgba(0, 255, 180, 0.12)',
                // Bottom-to-top stagger: first (bottom) animates first
                animationDelay: `${i * (isMobile ? 90 : 120)}ms`,
              }}
            >
              <div className="flex items-center justify-between px-5 sm:px-6 h-full">
                <span className="text-sm sm:text-base font-semibold drop-shadow-sm flex items-center">
                  <span className="mr-2 text-white/90 dark:text-white/90 font-bold">{i + 1}.</span>
                  {bar.label}
                </span>
                <span className="opacity-0 group-hover:opacity-100 text-xs sm:text-sm transition-opacity">→</span>
              </div>
              {/* dynamic shimmer accent */}
              <span className="hidden sm:block absolute inset-y-0 left-0 w-1/3 pointer-events-none opacity-0 group-hover:opacity-20 bar-shimmer" />
            </button>
          </div>
        ))}
      </div>

      {/* subtle animate in */}
      <style>{`
        .animate-in button { opacity: 0; transform: translateY(-50%) translateX(-14px); }
        .animate-in button { animation: barIn 700ms ease-out forwards; }
        @keyframes barIn { to { opacity: 1; transform: translateY(-50%) translateX(0); } }

        /* shimmer accent */
        .bar-shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,0.0), rgba(255,255,255,0.7), rgba(255,255,255,0.0));
          animation: shine 1200ms ease-in-out infinite;
        }
        @keyframes shine { 0% { transform: translateX(-60%); } 50% { transform: translateX(60%); } 100% { transform: translateX(120%); } }
      `}</style>
    </div>
  );
};

export default MethodBars;
