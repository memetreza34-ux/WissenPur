# WissenPur

WissenPur ist eine Lern- und Prüfungs-Web-App mit servergeprüften Quizrunden, eigenen Lernsets, Karteikarten, Fehlertraining, Lernplan, persönlicher Lernanalyse und einer klar getrennten Übungs-/Ranglistenarchitektur.

Der aktuelle Entwicklungsstand liegt auf `agent/release-foundation`. Pull Request #2 bleibt **Draft**, bis die unten genannten externen und technischen Release-Blocker tatsächlich abgeschlossen sind.

## Repository-Struktur

- `wissenpur/` – React-/Vite-Web-App, PWA, Firestore-Regeln und Produktdokumentation
- `functions/` – Firebase Cloud Functions, Economy, sichere Quiz-Sitzungen, Account-Export/-Löschung und Release-Gates
- `rules-tests/` – Firestore-Emulator-Tests mit getrennten Testkonten
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

## Lokaler Start

Voraussetzung: Node.js 22.

### Frontend

```bash
cd wissenpur
npm install
npm run lint
npm run dev
```

### Functions

```bash
cd functions
npm install
npm run verify
npm run compile
```

### Firestore-Regeln

Die Rules-Tests benötigen Java und die Firebase Emulator Suite:

```bash
cd rules-tests
npm install
npm test
```

## Release-Build

Frontend:

```bash
cd wissenpur
npm run lint
npm run check:release
npm run build
```

Functions:

```bash
cd functions
npm run build
```

Der Functions-Verifikationspfad prüft unter anderem Secrets, Firebase-/Hosting-Konfiguration, Architekturgrenzen, Frontend-Manifest, **Frontend-Lockfile**, Konto-Isolation, Economy-Hydrierung, Ranglisten-Snapshots, PWA-Runtime, Lernset-Bibliothek, Lernanalyse und Inhaltsqualität.

## Frontend-Lockfile

`wissenpur/package-lock.json` ist derzeit **bewusst als Release-Blocker markiert**, weil der Root-Eintrag noch aus der älteren Demo-Abhängigkeitsstruktur stammt und direkte aktuelle Pakete wie `@types/react` und `@types/react-dom` nicht vollständig aufgelöst enthält.

Sobald Registry-Zugriff verfügbar ist:

```bash
cd wissenpur
rm -rf node_modules package-lock.json
npm install --no-audit --no-fund
npm run lint
npm run build
```

Danach muss das neue `package-lock.json` committed werden. Anschließend kann der GitHub-Workflow wieder von `npm install` auf `npm ci` umgestellt werden. Der Gate `check:frontend-lock` verhindert bis dahin einen irrtümlich reproduzierbar genannten Release.

## Produktionskonfiguration

Vor einem öffentlichen Deployment müssen mindestens vollständig gesetzt beziehungsweise geprüft sein:

- Firebase App Check / reCAPTCHA Enterprise
- Firebase AI Logic
- Cloud Functions
- Firestore `(default)` und kontrollierte Migration vorhandener Daten
- Quotas, Budgetwarnungen und Monitoring
- echte Betreiber-, Datenschutz- und Supportangaben
- definierte Log-/Session-/Support-Aufbewahrungsfristen
- rechtliche Freigabe

Die Release-App blockiert eine vollständige rechtliche Freigabe, solange die erforderliche Konfiguration fehlt.

## Bekannte Release-Blocker

- GitHub Actions startet aktuell keine Runner wegen Billing-/Spending-Limit des GitHub-Kontos.
- Deshalb existiert noch kein bestätigter echter Frontend-, Functions- oder Firestore-Regelbuild dieses Branches.
- Das Frontend-Lockfile muss aus dem bereinigten Manifest neu erzeugt werden.
- Firebase-Zielprojekt, App Check, AI Logic, Quotas und Monitoring müssen final konfiguriert werden.
- Firestore-Daten müssen kontrolliert nach `(default)` migriert werden.
- Emulator-Tests mit zwei echten Testkonten müssen tatsächlich ausgeführt werden.
- alte Lobby-/Duel-Daten müssen bereinigt werden.
- echte Betreiberangaben und rechtliche Prüfung fehlen noch.
- mobile/desktop End-to-End- und Rollback-Tests fehlen.
- PNG-/Apple-Touch-PWA-Icons und reale iOS-/Android-Installationstests fehlen.

## Wichtige Dokumente

- `wissenpur/docs/PRODUCT_RELEASE_ROADMAP.md`
- `wissenpur/docs/ACCOUNT_PRIVACY.md`
- `wissenpur/docs/FIREBASE_RELEASE_CHECKLIST.md`
- `wissenpur/docs/FIRESTORE_DEFAULT_MIGRATION.md`
- `wissenpur/docs/LEARNING_SET_IMPORT.md`
- `wissenpur/docs/LEARNING_ANALYTICS.md`
- `wissenpur/docs/RANKED_CONTENT_POLICY.md`

## Release-Regel

PR #2 bleibt Draft. Er darf erst als releasefähig gelten, wenn **echte** Builds und Emulator-Tests erfolgreich gelaufen sind, das Lockfile reproduzierbar ist, die Produktionskonfiguration vollständig ist und die rechtlichen Pflichtangaben freigegeben wurden.
