# WissenPur

WissenPur ist eine Lern- und Prüfungs-Web-App mit servergeprüften Quizrunden, eigenen Lernsets, Karteikarten, Fehlertraining, Lernplan, persönlicher Lernanalyse und einer klar getrennten Übungs-/Ranglistenarchitektur.

Der aktuelle Entwicklungsstand liegt auf `agent/release-foundation`. Pull Request #2 bleibt **Draft**, bis die unten genannten externen und technischen Release-Blocker tatsächlich abgeschlossen sind.

## Repository-Struktur

- `wissenpur/` – React-/Vite-Web-App, PWA, Firestore-Regeln und Produktdokumentation
- `functions/` – Firebase Cloud Functions, Economy, sichere Quiz-Sitzungen, Account-Export/-Löschung und Release-Gates
- `rules-tests/` – Firestore-Emulator-Tests mit getrennten Testkonten
- `scripts/` – repositoryweite Release-Helfer, insbesondere reproduzierbare Lockfile-Erzeugung
- `.github/workflows/wissenpur-quality.yml` – Frontend-, Functions- und Rules-Qualitätsjobs
- `firebase.json` / `.firebaserc` – Firebase-Hosting-, Functions- und Rules-Konfiguration

## Sicherheitsmodell

### Gewertete Prüfungen

Gewertete Runden werden ausschließlich über den sicheren Sitzungsfluss ausgeführt:

1. `startSecureRankedQuiz` wählt Fragen serverseitig aus.
2. Der Browser erhält vor der Abgabe keine korrekten Antworten oder Erklärungen.
3. Die Sitzung speichert einen unveränderlichen Antwort-Snapshot.
4. `submitRankedQuiz` wertet nur gegen diesen Snapshot.
5. `revealSecureRankedQuiz` gibt Lösungen erst nach erfolgreicher Abgabe frei.
6. Punkte, Münzen, Streaks, Wochenziele und `trustedLeaderboard` werden serverseitig aktualisiert.

Der frühere client-vertraute Rundenergebnis-Pfad ist nicht Teil des aktiven Release-Codes.

### Authentifizierte Economy

Jede neue Auth-Sitzung lädt `getMyEconomyState` über eine App-Check-geschützte Callable Function. Der Server normalisiert den Kontostand und verwirft alte/client-schreibbare Economy-Werte, wenn sie nicht dem vertrauenswürdigen Economy-Schema entsprechen.

Während dieser Hydrierung:

- zeigt die Oberfläche keine Gastpunkte als Kontopunkte,
- sind gewertete Runden, Rangliste, Daily-Rewards und Shop-Aktionen gesperrt,
- können lokale Übungsrunden keine Economy-Werte verändern,
- sind asynchrone Reads/Writes an die erwartete Firebase-UID gebunden,
- werden verspätete Antworten einer alten Auth-Sitzung nach Logout/Kontowechsel verworfen.

### Gastdaten beim ersten Login

Nutzererstellte Lerninhalte werden beim ersten Login nicht unnötig gelöscht:

- Lernsets: lokale und Cloud-Bibliothek werden vereinigt, lokal gewinnt bei gleicher Deck-ID
- Fehlerfragen: lokale und Cloud-Fragen werden vereinigt, lokal gewinnt bei gleicher Frage-ID
- Lernplan: Zeitstempel-Konfliktregel
- lokale Lernanalyse: Wechsel in den neuen Kontokontext

Gastpunkte, Gastmünzen, Gaststreaks und andere Economy-Werte werden dagegen nicht in das Konto migriert.

## Freigegebene Toolchain

Für reproduzierbare Release-Arbeit gilt:

- **Node.js `22.12.0`**
- **npm `10.9.2`**
- Java 21 für die Firestore-Emulatortests

Frontend, Functions und Rules-Tests deklarieren `npm@10.9.2`. Der Quality-Workflow pinnt Node und npm ebenfalls exakt. Die verwendeten offiziellen GitHub Actions sind auf konkrete Commit-SHAs festgelegt; Checkout persistiert das GitHub-Token nicht im Git-Config.

## Lokaler Start während des Lockfile-Blockers

Solange die drei neuen Lockfiles noch nicht reproduzierbar committed sind, werden Abhängigkeiten lokal vorübergehend mit `npm install` installiert.

Frontend:

```bash
cd wissenpur
npm install --no-audit --no-fund
npm run lint
npm run dev
```

Functions:

```bash
cd functions
npm install --no-audit --no-fund
npm run verify
npm run compile
```

Firestore-Regeln:

```bash
cd rules-tests
npm install --no-audit --no-fund
npm test
```

Dieser temporäre Installationsweg ist **kein** Nachweis für einen reproduzierbaren Release.

## Package-Lock-Strategie

Der Release benötigt drei committed, zum jeweiligen Manifest passende Lockfiles:

- `wissenpur/package-lock.json` – aktuell noch aus der alten Demo-Abhängigkeitsstruktur und deshalb veraltet
- `functions/package-lock.json` – aktuell noch nicht committed
- `rules-tests/package-lock.json` – aktuell noch nicht committed

`npm --prefix functions run check:package-locks` blockiert fehlende, veraltete oder nicht mit dem Manifest synchronisierte Lockfiles.

Sobald Registry-Zugriff verfügbar ist, aus dem Repository-Root mit **Node 22.12.0 / npm 10.9.2** ausführen:

```bash
node scripts/regenerate-package-locks.mjs
```

Der Helfer erzeugt alle drei Lockfiles mit `--package-lock-only --ignore-scripts`. Scheitert ein Workspace, werden bereits veränderte Lockfiles auf den Zustand vor dem Lauf zurückgesetzt.

Danach aus einem sauberen Checkout beziehungsweise nach Entfernen alter `node_modules`:

```bash
npm ci --prefix wissenpur
npm ci --prefix functions
npm ci --prefix rules-tests

npm --prefix wissenpur run lint
npm --prefix wissenpur run build
npm --prefix functions run verify
npm --prefix functions run compile
npm --prefix rules-tests test
```

Erst wenn diese Prüfung erfolgreich ist, werden alle drei Lockfiles committed und die drei CI-Installationen gemeinsam von `npm install` auf `npm ci` umgestellt.

## Release-Build

Ein echter Produktions-Build des Frontends läuft fail-closed über:

```bash
cd wissenpur
npm run build:release
```

`build:release` führt den Typecheck, den Produktions-Preflight und anschließend den Vite-Build aus. Der Produktions-Preflight erwartet bewusst echte Firebase-, TTL-, Rechts- und Freigabewerte und darf mit Platzhaltern nicht erfolgreich sein.

Functions:

```bash
cd functions
npm run build
```

Der Functions-Verifikationspfad prüft unter anderem Secrets, CI-Rechte und Action-Allowlist, Hosting/CSP, Architekturgrenzen, Frontend-Manifest/Toolchain, **alle drei Package-Lockfiles**, Konto-/Session-Isolation, App Check, Economy-Hydrierung, Ranked-Snapshots, Callable-Limits, PWA-Runtime, Accessibility, Datenschutz, Lernbibliothek/SRS/Analytics, Produktions-Preflight, Migration/Rollback und Inhaltsqualität.

## PWA-Stand

Bereits committed und verdrahtet sind:

- 192×192 PNG-App-Icon
- 512×512 PNG-App-Icon
- 512×512 maskable PNG-Icon
- 180×180 Apple-Touch-Icon
- lokale SVG-Avatare
- Service Worker v7 mit App-Shell-/Build-Asset-/Icon-Caching
- globale Offline-/Online-Anzeige

Noch offen sind reale Installations-, Update- und Offline-Start-Tests auf Android und iPhone.

## Produktionskonfiguration

Vor einem öffentlichen Deployment müssen mindestens vollständig gesetzt beziehungsweise geprüft sein:

- Firebase App Check / reCAPTCHA Enterprise
- Firebase AI Logic
- Cloud Functions
- Firestore `(default)` und kontrollierte Migration vorhandener Daten
- TTL für `quizSessions.expiresAt` und `serverRateLimits.expiresAt`
- Quotas, Budgetwarnungen und Monitoring
- echter `production`-Alias erst nach bewusster Zielprojektwahl
- echte Betreiber-, Datenschutz- und Supportangaben
- definierte Log-/Session-/Support-Aufbewahrungsfristen
- bestätigte rechtliche Prüfung

Die Release-App und der Produktions-Preflight blockieren eine vollständige Freigabe, solange diese Konfiguration fehlt.

## Bekannte Release-Blocker

1. GitHub Actions startet aktuell keine Runner wegen Billing-/Spending-Limit des GitHub-Kontos. Deshalb existiert weiterhin kein bestätigter Hosted-CI-Nachweis.
2. Alle drei Package-Lockfiles müssen mit der freigegebenen Toolchain reproduzierbar erzeugt und committed werden; danach CI auf `npm ci` umstellen.
3. Frontend-Build, Functions-Verify/Compile und Firestore-Emulatortests müssen aus einem frischen Checkout vollständig erfolgreich laufen.
4. Firebase-Zielprojekt, App Check, AI Logic, Functions, Quotas, Budgetwarnungen und Monitoring müssen final konfiguriert werden.
5. Firestore muss kontrolliert nach `(default)` migriert und die benötigte TTL real aktiviert werden.
6. Legacy-Daten-Cleanup muss erst als Dry Run und danach kontrolliert gegen die bestätigte Allowlist erfolgen.
7. Echte Betreiberangaben, Aufbewahrungsfristen, Mindestalter und Rechtsprüfung müssen finalisiert werden.
8. Hosting-Snapshot/Restore muss real getestet werden.
9. Android-, iPhone- und Desktop-E2E inklusive Installation, Offline-Start, Update, Auth-Wechsel, Konto-Löschung, Ranked, KI und SRS fehlen noch.

## Wichtige Dokumente

- `wissenpur/docs/README_RELEASE_STATUS.md`
- `wissenpur/docs/PRODUCT_RELEASE_ROADMAP.md`
- `wissenpur/docs/ACCOUNT_PRIVACY.md`
- `wissenpur/docs/FIREBASE_RELEASE_CHECKLIST.md`
- `wissenpur/docs/FIRESTORE_DEFAULT_MIGRATION.md`
- `wissenpur/docs/HOSTING_ROLLBACK.md`
- `wissenpur/docs/PRODUCTION_PREFLIGHT.md`
- `wissenpur/docs/PWA_RELEASE_CHECKLIST.md`
- `wissenpur/docs/LEARNING_SET_IMPORT.md`
- `wissenpur/docs/LEARNING_ANALYTICS.md`
- `wissenpur/docs/RANKED_CONTENT_POLICY.md`

## Release-Regel

PR #2 bleibt Draft. Er darf erst als releasefähig gelten, wenn **echte** Builds und Emulator-Tests erfolgreich gelaufen sind, alle drei Lockfiles reproduzierbar sind, die Produktionskonfiguration und Migration vollständig sind, die rechtlichen Pflichtangaben freigegeben wurden und die Realgerät-/Rollback-Tests abgeschlossen sind.
