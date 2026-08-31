# WissenPur Web-App

WissenPur ist eine deutschsprachige Lern- und Prüfungs-PWA mit Quizzen, SRS-Karteikarten, Fehlertraining, eigenen Lernsets, Lernplan, Lernanalyse, Gamification und dem visuellen **Wissens-Gehirn**.

Der aktuelle Releasepfad wird auf `agent/release-foundation` entwickelt und ist Teil von Draft-PR #2. Der Branch ist noch nicht produktionsfreigegeben.

## Aktueller Release-Kern

Bereits im aktiven Releasepfad vorhanden:

- Produktionsnavigation **Heute, Lernen, Bibliothek, Fortschritt, Profil**
- servergeprüfte gewertete Quiz-, Daily- und Blitz-Runden
- serververwaltete Punkte, Münzen, Streaks, Erfolge, Shop und Rangliste
- SRS-Karteikarten und zentrale Due-Queue
- Fehlertraining und ungewertete Probeprüfungen
- JSON-/CSV-/TSV-Import
- manuelles Erstellen, Bearbeiten und Export eigener Lernsets
- persönlicher Prüfungs-Lernplan
- lokale kontogebundene Lernanalyse
- Firebase-Authentifizierung
- KI-Lernsets über Firebase AI Logic
- installierbare PWA mit lokalen PNG-/SVG-Assets

Die frühere Demo-Anwendung ist nicht der aktive Release-Einstiegspunkt. Die Produktionsoberfläche liegt in `src/ReleaseApp.tsx`.

## Sicherheitsmodell

### Ranked und Economy

Gewertete Fragen werden serverseitig ausgewählt. Der Browser erhält vor der Abgabe weder korrekte Antworten noch Erklärungen. Jede Ranked-Sitzung besitzt einen unveränderlichen Antwort-Snapshot.

Punkte, Münzen, Streaks, Erfolge, Shop, Daily-Rewards und Ranglistenwerte werden für angemeldete Nutzer serverseitig autoritativ behandelt. Gast-/Legacy-Economy wird nicht als vertrauenswürdiger Kontostand übernommen.

### Rangliste

`trustedLeaderboard` ist für Browser-Direktzugriffe gesperrt. Die Oberfläche liest die Rangliste ausschließlich über die serverseitige Callable Function `getTrustedLeaderboard`.

Öffentliche Ranglistenbilder sind auf lokale `/avatars/*.svg`-Assets begrenzt. Provider-Profilbilder werden nicht als öffentliche Lernprofil-/Ranglistenbilder gespiegelt.

### KI

Die KI-Fragenerstellung verwendet `firebase/ai` und Firebase AI Logic. Ein eigener Gemini-API-Schlüssel wird nicht als Vite-Variable in das Browser-Bundle eingebaut.

Der Service validiert Anzahl, Schema, Antwortoptionen, Lösungsindex, Erklärungen und Duplikate. Ändert sich während einer Anfrage die Auth-Sitzung, wird das Ergebnis verworfen.

Schlägt die KI-Anfrage fehl oder liefert kein vollständig gültiges Set, wird **kein automatischer lokaler KI-Ersatz erzeugt**. Die Anfrage wird abgebrochen und die Oberfläche zeigt einen kontrollierten Fehlerhinweis.

## Freigegebene Toolchain

Für Release-Arbeit gilt:

- Node.js `22.12.0`
- npm `10.9.2`
- Java 21 für Firestore-Emulatortests

`package.json` verlangt Node `>=22.12.0 <23` und deklariert `npm@10.9.2`.

## Abhängigkeiten während des Lockfile-Blockers

`wissenpur/package-lock.json` ist derzeit noch aus der alten Demo-Struktur und **nicht releasefähig**. Deshalb ist `npm ci` im Frontend aktuell noch nicht der korrekte Installationsweg.

Temporär für lokale Entwicklung:

```bash
npm install --no-audit --no-fund
npm run lint
npm run dev
```

Sobald Registry-Zugriff mit exakt Node `22.12.0` und npm `10.9.2` verfügbar ist, werden aus dem Repository-Root alle drei Lockfiles gemeinsam erzeugt:

```bash
node scripts/regenerate-package-locks.mjs
```

Danach müssen Frontend, Functions und Rules-Tests aus einem frischen Zustand mit `npm ci` erfolgreich geprüft werden, bevor CI ebenfalls auf `npm ci` umgestellt wird.

## Lokale Konfiguration

Aus `.env.example` eine lokale Datei erstellen und nur Entwicklungswerte eintragen. Für lokale App-Check-/Functions-Emulator-Arbeit können beispielsweise verwendet werden:

```env
VITE_RECAPTCHA_ENTERPRISE_SITE_KEY=DEIN_TEST_SITE_KEY
VITE_ENABLE_APPCHECK_DEBUG=true
VITE_USE_FUNCTIONS_EMULATOR=true
VITE_FIRESTORE_DATABASE_ID=(default)
```

Debugmodus und Functions-Emulator sind in Produktion verboten und werden vom Produktions-Preflight blockiert.

## Entwicklung

```bash
npm run dev
```

Standardmäßig läuft Vite auf Port 3000.

## Statische Frontend-Prüfung

```bash
npm run lint
npm run build
```

`npm run lint` ist derzeit der TypeScript-Typecheck (`tsc --noEmit`). Ein erfolgreicher lokaler Build ersetzt keinen Hosted-CI-/Clean-Checkout-Nachweis.

## Produktions-Build

Ein echter Release-Build läuft fail-closed über:

```bash
npm run build:release
```

Dieser Pfad führt Typecheck, Produktions-Preflight und Vite-Build aus. Der Preflight verlangt unter anderem echte Betreiber-/Rechtswerte, bewusst bestätigtes Firebase-Produktionsziel, Firestore `(default)`, App-Check-Produktionskonfiguration und die TTL-Bestätigung.

## Projektstruktur

```text
src/
├── components/     Release-UI, Dialoge und größere Lernfunktionen
├── config/         rechtliche/runtimebezogene Konfiguration
├── hooks/          gemeinsame UI-/Accessibility-Hooks
├── lib/            Hilfslogik
├── pages/          ausgelagerte Seiten wie Karteikarten
├── services/       Firebase-, Economy-, KI-, SRS- und Lernlogik
├── ReleaseApp.tsx  aktive Release-Anwendung
├── data.ts         lokale Offline-/Übungsfragen
├── storage.ts      lokale Lern-/UI-Daten innerhalb der Trust-Grenzen
└── types.ts        zentrale TypeScript-Typen
```

Alte Demo-Dateien liegen nur noch unter `legacy/` und dürfen nicht wieder in den aktiven Releasepfad importiert werden.

## Firebase

`firebase-applet-config.json` enthält die öffentliche Firebase-Webkonfiguration. Der Firebase-Web-API-Key ist kein Servergeheimnis; Zugriffsschutz erfolgt über Security Rules, App Check, Authentifizierung, serverseitige Trust-Boundaries und Quotas.

Produktion verwendet ausschließlich Firestore `(default)`. Eine benannte Datenbank ist im Produktions-Runtimepfad verboten.

## PWA

Committed und statisch geprüft sind:

- 192×192 PNG-App-Icon
- 512×512 PNG-App-Icon
- 512×512 maskable PNG-Icon
- 180×180 Apple-Touch-Icon
- SVG-Fallbacks
- lokale Shop-Avatare
- Service Worker v7
- Offline-App-Shell und globale Connectivity-Anzeige

Offen bleiben reale Android-/iPhone-/Desktop-Tests für Installation, Offline-Erststart, Update und Rollback.

## Noch offene Release-Blocker

1. GitHub-Actions-Billing/Spending-Limit korrigieren, sodass Runner tatsächlich starten.
2. Alle drei Package-Lockfiles reproduzierbar erzeugen und anschließend CI auf `npm ci` umstellen.
3. Frontend-/Functions-Build und Firestore-Emulatortests aus einem frischen Checkout bestätigen.
4. App Check, Firebase AI Logic, Functions, Quotas, Budgetwarnungen und Monitoring im echten Produktionsprojekt konfigurieren.
5. Firestore kontrolliert nach `(default)` migrieren und TTL real aktivieren.
6. Legacy-Cleanup kontrolliert durchführen.
7. echte Betreiber-/Datenschutz-/Aufbewahrungswerte und Rechtsprüfung finalisieren.
8. Hosting-Snapshot/Restore real testen.
9. Android-, iPhone- und Desktop-E2E abschließen.

Details stehen in `docs/README_RELEASE_STATUS.md`, `docs/PRODUCT_RELEASE_ROADMAP.md` und `docs/FIREBASE_RELEASE_CHECKLIST.md`.
