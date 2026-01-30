import React, { useState } from 'react';

const positions = [0, 60, 120, 180, 240, 300];

const defaultSteps = [
  { title: 'Reconnaissance', desc: 'Collecte OSINT, découverte de la surface d\'attaque.' },
  { title: 'Scanning', desc: 'Scan services/ports, identification des versions.' },
  { title: 'Exploitation', desc: 'Tests contrôlés pour confirmer les vulnérabilités.' },
  { title: 'Post-Exploit', desc: 'Évaluer persistance et impact.' },
  { title: 'Reporting', desc: 'Rapport avec preuves et recommandations.' },
  { title: 'Suivi', desc: 'Re-tests et validation des remédiations.' },
];

const AuditCircle = ({ steps = defaultSteps, variant = null, centerTitle = null, centerDesc = null }) => {
  const [active, setActive] = useState(0);

  // Determine configuration for 'suivi' variant
  const isSuivi = variant === 'suivi';
  const nodeCount = isSuivi ? 8 : steps.length;

  // circle/center sizes (pixels). For 'suivi' we use a larger center (200px)
  const circleSize = isSuivi ? 520 : 260;
  const centerSize = isSuivi ? 200 : Math.round(circleSize * 0.42);

  // radius for translateX: distance from center to node center
  const radius = Math.round(circleSize / 2) - Math.round(centerSize / 2) - 20; // leave some padding

  const angles = Array.from({ length: nodeCount }, (_, i) => (360 / nodeCount) * i);

  // Ensure we have at least nodeCount steps (pad with placeholders if necessary)
  const renderSteps = steps.slice();
  while (renderSteps.length < nodeCount) {
    renderSteps.push({ title: `Étape ${renderSteps.length + 1}`, desc: '' });
  }

  const centerLabel = centerTitle || (isSuivi ? 'Suivi' : renderSteps[active].title);
  const centerText = centerDesc || (isSuivi ? 'Surveillance continue et validation des remédiations.' : renderSteps[active].desc);

  return (
    <div className="audit-circle-wrapper">
      <div
        className={`audit-circle ${isSuivi ? 'suivi' : ''}`}
        role="group"
        aria-label={isSuivi ? 'Suivi diagramme' : 'Audit steps'}
        style={{ width: `${circleSize}px`, height: `${circleSize}px` }}
      >
        <div
          className="audit-center"
          style={{ width: `${centerSize}px`, height: `${centerSize}px` }}
        >
          <h3 className="audit-center-title" style={isSuivi ? { fontFamily: "Inter, -apple-system, 'SF Pro Display', sans-serif", fontWeight: 800, fontSize: 36 } : {}}>
            {centerLabel}
          </h3>
          <p className="audit-center-desc" style={isSuivi ? { fontSize: 16 } : {}}>{centerText}</p>
        </div>

        {angles.map((angle, i) => (
          <button
            key={i}
            className={`audit-node ${i === active ? 'active' : ''}`}
            style={{ transform: `rotate(${angle}deg) translateX(${radius}px) rotate(-${angle}deg)` }}
            onClick={() => setActive(i)}
            aria-pressed={i === active}
            aria-label={renderSteps[i].title}
            title={renderSteps[i].title}
          >
            <span className="audit-node-dot" />
            <span className="audit-node-label">{renderSteps[i].title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AuditCircle;
