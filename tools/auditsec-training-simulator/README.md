# AuditSec Training Simulator (OWASP Top 10)

Outil **éducatif** destiné à la **formation** et aux **tests autorisés**.

Objectif : aider les développeurs à comprendre des risques OWASP Top 10 via des **vérifications passives** (headers, CORS, cookies, disclosures) et produire un **rapport pédagogique** (recommandations + priorisation).

## Sécurité / garde-fous

- Par défaut, le simulateur refuse de scanner des cibles non-locales.
- Pas de fonctionnalités d’évasion WAF, pas de techniques furtives, pas de payloads offensifs.
- Utilisation recommandée : environnement contrôlé (local/dev/staging) avec autorisation.

## Installation

Depuis le repo racine :

```bash
cd tools/auditsec-training-simulator
python -m venv .venv
# Windows
.\.venv\Scripts\activate
pip install -U pip
pip install -e .
```

## Utilisation

Scan (local uniquement par défaut) :

```bash
auditsec-train scan --base-url http://127.0.0.1:5175 --out-dir ./out
```

Autoriser une cible spécifique (allowlist) :

```bash
auditsec-train scan --base-url https://staging.example.com --allow-host staging.example.com --out-dir ./out
```

## Sorties

- `out/report.md` : rapport pédagogique
- `out/report.json` : résultats structurés

## Limites

Ce simulateur est volontairement **non offensif** : il ne prouve pas des exploitations (ex: SQLi/RCE). Il aide à **détecter des signaux** et à **prioriser** des actions de sécurisation.
