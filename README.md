# WissenPur

WissenPur ist eine deutschsprachige Lern-App für Quizze, Karteikarten, Spaced Repetition, Lernplanung, persönliche Lernanalyse und servergeprüfte Ranglistenrunden.

> **Release-Status:** Dieses Repository befindet sich auf dem Draft-Release-Branch `agent/release-foundation`. Der aktuelle Pull Request darf noch nicht produktiv gemergt oder deployed werden. GitHub Actions kann wegen eines Account-Billing-/Spending-Limit-Problems derzeit keine Runner starten; deshalb existiert noch kein bestätigter vollständiger CI-Build.

## Repository-Struktur

```text
.
├── wissenpur/                 # React/Vite-Web-App
│   ├── src/                   # aktive Produktoberfläche
│   ├── public/                # PWA-Manifest, Service Worker, Icon
│   ├── docs/                  # Produkt-, Datenschutz- und Release-Dokumentation
│   ├── scripts/               # Frontend-Release-Gates
│   └── legacy/                # archivierter Altcode, nicht Teil des Builds
├── functions/                 # Firebase Cloud Functions (Node.js 22)
│   ├── src/                   # serverautoritative Economy und Quiz-Sitzungen
│   ├── content/               # vollständiger Ranglisten-Fragenkatalog
│   ├── tests/                 # Unit-Tests
│   ├── scripts/               # Architektur-/Release-Prüfungen
│   └── legacy/                # archivierte alte Functions
├── rules-tests/               # Firestore-Regeltests mit Emulator Suite
├── firebase.json              # Hosting, Functions, Firestore und Emulatoren
└── .github/workflows/         # Qualitäts-Workflow
```

## Produktfunktionen

### Lernen

- Standard-, Daily- und Blitz-Quiz
- Fehlertraining
- SRS-Karteikarten
- fällige Wiederholungen
- ungewertete Probeprüfungen
- adaptive Lernplanung nach Prüfungsdatum und verfügbarer Lernzeit

### Lernsets

- KI-generierte Übungssets
- JSON-/CSV-/TSV-Import
- manuelles Erstellen und Bearbeiten
- 2–6 Antwortoptionen pro manuell bearbeitbarer Frage
- Suche und Fälligkeitsfilter
- JSON-Export
- Löschen einzelner Sets

### Persönliche Lernanalyse

- lokale Prüfungshistorie
- letzter-5-vs.-vorheriger-5-Trend
- stärkster und schwächster Wissensbereich
- Tagesempfehlung
- Priorisierung fälliger SRS-Karten

Die lokale Analyse enthält keine Antwortwerte, Fragentexte oder Lösungsschlüssel und beeinflusst weder Punkte noch Rangliste.

### Konto und Datenschutz

- Google-Login
- kontogebundene lokale Daten
- Auth-Hydrierungsgrenze vor Rendering kontoabhängiger Oberflächen
- serverseitiger JSON-Kontoexport
- lokale Lernanalyse wird beim Export nur im Browser ergänzt
- vollständige Selbstlöschung mit Reauth-Pflicht
- Logout und Löschung entfernen kontoabhängige lokale Daten

## Sicherheitsmodell

### Ranglistenrunden

Gewertete Runden sind serverautoritativ:

1. `startRankedQuiz`
   - Backend wählt die Fragen.
   - Der Browser erhält keine Lösungen.
   - Ein unveränderlicher Antwort-Snapshot wird serverseitig gespeichert.

2. `submitRankedQuiz`
   - Antworten werden gegen genau diesen Snapshot geprüft.
   - Die Sitzung ist nutzergebunden, zeitlich begrenzt und nur einmal wertbar.
   - Wiederholungsabgaben sind idempotent.

3. `revealRankedQuiz`
   - Lösungen und Erklärungen werden erst nach einer gültigen Abgabe freigegeben.

### Economy

Serververwaltet sind unter anderem:

- Punkte
- Münzen
- Streaks
- Achievements
- Daily Quest
- Glücksrad
- Shop
- Power-ups
- öffentliche Ranglistenwerte

Historische client-schreibbare Economy-Daten werden nicht vertraut. Ohne `economyVersion: 1` erzeugt der Server einen sauberen serververwalteten Ausgangszustand.

### Firestore

- Produktion verwendet Firestore `(default)`.
- Eine benannte Datenbank ist außerhalb des Emulators im Functions-Code blockiert.
- `trustedLeaderboard` ist die öffentliche Ranglistenquelle.
- Quiz-Sitzungen, Rate-Limits und vertrauenswürdige Ranglistenwerte sind nicht client-schreibbar.

### App Check

Cloud Functions erzwingen App Check außerhalb des Emulators. Ein Produktionsdeploy darf die Schutzprüfung nicht über eine einfache Environment-Variable deaktivieren.

## Voraussetzungen

- Node.js 22
- npm
- Java 21 für Firestore-Emulator-Tests
- Firebase CLI für Emulatoren/Deployment

## Frontend lokal starten

```bash
cd wissenpur
npm install --no-audit --no-fund
npm run dev
```

Frontend-Typecheck:

```bash
cd wissenpur
npm run lint
```

Normaler Build:

```bash
cd wissenpur
npm run build
```

Produktions-Release-Build mit Release-Gates:

```bash
cd wissenpur
npm run build:release
```

`build:release` darf absichtlich fehlschlagen, solange verpflichtende Produktions- und Rechtsangaben fehlen.

## Functions prüfen

```bash
cd functions
npm install --no-audit --no-fund
npm run verify
npm run compile
```

Vollständiger Functions-Build:

```bash
cd functions
npm run build
```

Der `verify`-Pfad enthält unter anderem Checks für:

- Secrets
- Hosting/Firebase-Konfiguration
- Release-Architektur
- Frontend-Paketmanifest
- Konto-Isolation und Auth-Hydrierung
- Ranglisten-Snapshots
- PWA-Runtime
- Functions-Runtime und App Check
- Lernset-Import und Bibliothekslimits
- Lernanalyse
- manuellen Lernset-Editor
- Fragenkatalog-Trennung und -Qualität
- Unit-Tests und TypeScript

## Firestore-Regeln testen

Die Regeltests liegen getrennt unter `rules-tests/` und benötigen die Firebase Emulator Suite.

```bash
cd rules-tests
npm install --no-audit --no-fund
npm test
```

Alternativ den in der Workflow-Datei dokumentierten Emulator-Aufruf verwenden.

## Lokale Firebase-Emulatoren

Nach installierten Functions-Abhängigkeiten:

```bash
firebase emulators:start --only auth,functions,firestore,hosting
```

Die Ports sind in `firebase.json` festgelegt.

## Environment-Dateien

Beispiele:

- `wissenpur/.env.example`
- `functions/.env.example`

Lokale `.env`-Dateien, Service-Account-Dateien, private Schlüssel und andere Credentials dürfen nicht committed werden. Der Repository-Secret-Scanner prüft versionierte Dateien vor dem Functions-Build.

## Lernset-Limits

Zur Begrenzung von LocalStorage-/Firestore-Größe gelten aktuell:

- Importdatei: maximal 1 MB
- Fragen pro importiertem Lernset: maximal 100
- neu manuell angelegtes Set: maximal 30 Fragen
- Bibliothek: maximal 100 Lernsets
- Bibliothek: maximal 500 Fragen insgesamt
- Bibliothek: maximal 700.000 serialisierte Bytes

Die zentrale Bibliotheksrichtlinie normalisiert ungültige oder doppelte IDs und wird sowohl lokal als auch vor Cloud-Synchronisierung angewendet.

## Wichtige Dokumentation

- `wissenpur/docs/PRODUCT_RELEASE_ROADMAP.md`
- `wissenpur/docs/FIREBASE_RELEASE_CHECKLIST.md`
- `wissenpur/docs/FIRESTORE_DEFAULT_MIGRATION.md`
- `wissenpur/docs/ACCOUNT_PRIVACY.md`
- `wissenpur/docs/RANKED_CONTENT_POLICY.md`
- `wissenpur/docs/LEARNING_SET_IMPORT.md`
- `wissenpur/docs/LEARNING_ANALYTICS.md`

## Aktuelle Release-Blocker

Vor einem öffentlichen Release müssen mindestens folgende Punkte erledigt sein:

1. GitHub-Actions-Billing/Spending-Limit korrigieren.
2. Frontend-, Functions- und Firestore-Regeljobs tatsächlich ausführen und erfolgreich abschließen.
3. Frontend-`package-lock.json` aus dem bereinigten Manifest neu erzeugen.
4. CI danach wieder auf reproduzierbares `npm ci` umstellen.
5. Firebase-Zielprojekt vollständig konfigurieren.
6. App Check und AI Logic im Zielprojekt verifizieren.
7. Firestore-Daten kontrolliert nach `(default)` migrieren.
8. Alte Lobby-/Duel-Daten bereinigen.
9. Quotas, Budgetwarnungen und Monitoring aktivieren.
10. Echte Betreiber-, Support- und Rechtsangaben eintragen und rechtlich freigeben.
11. Mobile und Desktop-End-to-End-Tests durchführen.
12. PWA auf realen iOS-/Android-Geräten testen und PNG-/Apple-Touch-Icons ergänzen.
13. Hosting-Rollback einmal praktisch verifizieren.

## CI-Hinweis

Ein GitHub-Actions-Job mit `conclusion: failure` ist derzeit **kein nachgewiesener Codefehler**, wenn er gleichzeitig keine Steps, keine Logs und keinen Runner besitzt. Die aktuelle GitHub-Annotation nennt fehlgeschlagene Kontozahlungen beziehungsweise ein zu niedriges Actions-Spending-Limit.

Umgekehrt gilt: Solange kein Runner die Schritte tatsächlich ausgeführt hat, ist auch **kein erfolgreicher Build bestätigt**.
