import React, { useState } from 'react';

// RadialSegments: segmented donut chart with external labels and connectors
// - respects site fonts and CSS variables
// - default palette uses --accent-3 and a lighter variant

const polar = (cx, cy, r, angleDeg) => {
  const a = ((angleDeg - 90) * Math.PI) / 180.0;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
};

const describeDonutSegment = (cx, cy, rOuter, rInner, startDeg, endDeg) => {
  const largeArc = endDeg - startDeg <= 180 ? 0 : 1;
  const p1 = polar(cx, cy, rOuter, endDeg);
  const p2 = polar(cx, cy, rOuter, startDeg);
  const p3 = polar(cx, cy, rInner, startDeg);
  const p4 = polar(cx, cy, rInner, endDeg);
  return `M ${p1.x} ${p1.y} A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rInner} ${rInner} 0 ${largeArc} 1 ${p4.x} ${p4.y} Z`;
};

// Ordered steps for the audit flow (excluding center "Suivi")
const defaultSteps = [
  { title: 'Reconnaissance', desc: 'Collecte OSINT et cartographie.' },
  { title: 'Scanning', desc: 'Scan services, ports et versions.' },
  { title: 'Enumeration', desc: 'Collecte d\'informations applicatives.' },
  { title: 'Exploitation', desc: 'Tests contrôlés pour reproduire failles.' },
  { title: 'Post-Exploit', desc: 'Analyse d\'impact et persistance.' },
  { title: 'Reporting', desc: 'Rapport et recommandations.' },
  { title: 'Remédiation', desc: 'Coordination des corrections.' },
  { title: 'Validation', desc: 'Vérification des corrections effectuées.' },
];

const RadialSegments = ({
  steps = null,
  size = 760,
  innerRadius = 200,
  outerRadius = 320,
  centerTitle = 'Suivi',
  centerDesc = '',
  colors = null,
}) => {
  const cx = size / 2;
  const cy = size / 2;

  // default to 8 segments when no steps provided
  const useDefault = !steps || !Array.isArray(steps) || steps.length === 0;
  const renderSteps = useDefault ? defaultSteps.slice() : steps.slice();
  const count = Math.max(1, renderSteps.length);
  const anglePer = 360 / count;

  const [hovered, setHovered] = useState(null);

  return (
    <div className="radial-segments-wrapper" style={{ fontFamily: "Inter, -apple-system, 'SF Pro Display', system-ui, sans-serif" }}>
      {/* local interactivity */}
      {/* hovered index controls visual emphasis */}
      
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <defs>
          <linearGradient id="segGrad" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#7C4DFF" />
            <stop offset="100%" stopColor="#B388FF" />
          </linearGradient>
          <marker id="arrowHead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 z" fill="rgba(15,23,42,0.12)" />
          </marker>
        </defs>

        {/* background halo */}
        <circle cx={cx} cy={cy} r={outerRadius + 14} fill="url(#segGrad)" opacity="0.06" />

        {/* segments */}
        {renderSteps.map((s, i) => {
          const start = i * anglePer;
          const end = start + anglePer;
          const path = describeDonutSegment(cx, cy, outerRadius, innerRadius, start, end);
          const mid = start + anglePer / 2;
          const outerMid = polar(cx, cy, outerRadius, mid);
          const labelPos = polar(cx, cy, outerRadius + 40, mid);
          // small arrow along circumference indicating clockwise flow
          const arrowFrom = polar(cx, cy, outerRadius - 12, mid + (anglePer / 6));
          const arrowTo = polar(cx, cy, outerRadius - 6, mid + (anglePer / 6));

          // choose a color per segment (cycle from provided colors or default purple palette)
          const palette = colors && Array.isArray(colors) && colors.length >= count
            ? colors
            : Array.from({ length: count }).map((_, k) => (k % 2 === 0 ? 'var(--accent-3)' : 'rgba(179,136,255,0.72)'));

          const fill = palette[i % palette.length];

          return (
            <g
              key={i}
              className={`radial-seg-group`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <path
                d={path}
                className="radial-seg-path"
                style={{ animationDelay: `${i * 70}ms` }}
                fill={fill}
                fillOpacity={0.9}
                stroke="#ffffff"
                strokeOpacity={0.02}
                strokeWidth={1}
              />
              {/* connector line */}
              <line
                className="radial-seg-connector"
                x1={outerMid.x}
                y1={outerMid.y}
                x2={labelPos.x}
                y2={labelPos.y}
                stroke="rgba(15,23,42,0.06)"
                strokeWidth={1}
                strokeLinecap="round"
                style={{ animationDelay: `${i * 70 + 120}ms` }}
              />
              {/* small clockwise arrow indicator */}
              <line x1={arrowFrom.x} y1={arrowFrom.y} x2={arrowTo.x} y2={arrowTo.y} stroke="rgba(15,23,42,0.06)" strokeWidth={1.4} markerEnd="url(#arrowHead)" />
            </g>
          );
        })}

        {/* central hub */}
        <circle cx={cx} cy={cy} r={innerRadius - 6} fill="#ffffff" stroke="rgba(0,0,0,0.04)" />
      </svg>

      {/* HTML overlay for labels and center text */}
      <div className="radial-segments-center" style={{ width: innerRadius * 2 - 12, height: innerRadius * 2 - 12 }}>
        <h2 className="radial-center-title">{centerTitle}</h2>
        {centerDesc ? <p className="radial-center-desc">{centerDesc}</p> : null}
      </div>

      {/* Legend for segments (maps colors to steps) */}
      <div className="radial-legend" aria-hidden>
        {renderSteps.map((s, i) => (
          <div key={`leg-${i}`} className="radial-legend-item">
            <span className="radial-legend-swatch" style={{ background: (colors && colors[i]) || (i % 2 === 0 ? 'var(--accent-3)' : 'rgba(179,136,255,0.72)') }} />
            <span className="radial-legend-label">{s.title}</span>
          </div>
        ))}
      </div>

      {renderSteps.map((s, i) => {
        const mid = i * anglePer + anglePer / 2;
        const labelPos = polar(cx, cy, outerRadius + 72, mid);
        const left = labelPos.x;
        const top = labelPos.y;
        const quadrant = ((mid + 360) % 360);
        const alignLeft = quadrant > 90 && quadrant < 270; // left side if angle between 90 and 270
        const rotate = mid - 90;
        return (
          <div
            key={`lbl-${i}`}
            className={`radial-seg-label ${alignLeft ? 'left' : 'right'} ${hovered === i ? 'visible' : ''}`}
            style={{ left: left, top: top, transform: alignLeft ? `translate(-100%, -50%) rotate(${rotate}deg)` : `translate(0%, -50%) rotate(${rotate}deg)`, transitionDelay: `${i * 60}ms` }}
            role="listitem"
          >
            <div className="radial-seg-dot" aria-hidden />
            <div className="radial-seg-text" style={{ textAlign: alignLeft ? 'right' : 'left', transform: `rotate(-${rotate}deg)` }}>
              <div className="radial-seg-title">{s.title}</div>
              {s.desc ? <div className="radial-seg-sub">{s.desc}</div> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RadialSegments;
