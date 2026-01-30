import React from 'react'

const DEFAULT_LAYERS = [
  { title: 'Reconnaissance (OSINT)', desc: "Collecte d'informations publiques sur le domaine et l'infrastructure (WHOIS, DNS, sous-domaines, services exposés)." },
  { title: 'Cartographie & Découverte', desc: "Identifier les hôtes, sous-domaines, ports et services actifs pour construire la surface d'attaque." },
  { title: 'Analyse des Vulnérabilités', desc: "Scanner et analyser les versions/flags, vulnérabilités connues et mauvaises configurations." },
  { title: 'Exploitation contrôlée', desc: "Valider les vulnérabilités exploitables de manière sécurisée pour mesurer l'impact réel." },
  { title: 'Post-exploitation & Impact', desc: "Évaluer persistance, mouvements latéraux possibles et sensibilité des données compromises." },
  { title: 'Rapport & Priorisation', desc: "Rédiger un rapport clair avec preuves, niveau de criticité et recommandations actionnables." },
  { title: 'Remédiation & Validation', desc: "Accompagner les corrections, retester les corrections et valider les mesures appliquées." },
  { title: 'Suivi & Surveillance', desc: "Mettre en place une surveillance continue et plan de contrôle pour prévenir les régressions." }
]

export default function OSILayers({ layers = DEFAULT_LAYERS, compact = false }) {
  const render = layers && Array.isArray(layers) && layers.length > 0 ? layers : DEFAULT_LAYERS;

  return (
    <div className={`osi-wrapper ${compact ? 'compact' : ''}`} role="list" aria-label="OSI model layers">
      <div className="osi-stack">
        {render.map((l, i) => (
          <div
            key={l.title || i}
            className="osi-layer"
            style={{ animationDelay: `${i * 60}ms`, padding: compact ? '10px 12px' : undefined, ['--osi-delay']: `${i * 60}ms` }}
            role="listitem"
            tabIndex={0}
          >
            <div className="osi-inner">
              <div className="osi-left">
                <div className="osi-step-badge" aria-hidden>{i + 1}</div>
                <div className="osi-layer-title">{l.title}</div>
              </div>
              <div className="osi-right">
                <div className="osi-layer-desc">{l.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
