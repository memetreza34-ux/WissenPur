# WissenPur

WissenPur ist eine deutschsprachige Lern-App mit Quizzen, Karteikarten, Wiederholungslogik, Gamification und einer visuellen Wissens-Gehirn-Auswertung.

## Aktueller Status

Die Anwendung befindet sich in aktiver Entwicklung. Quiz, Daily Challenge, Blitzmodus, Fehlertraining, eigene Quizprojekte, Google-Anmeldung, Rangliste, Karteikarten und verschiedene Fortschrittsfunktionen sind bereits vorhanden.

Vor einer öffentlichen Version müssen insbesondere folgende Punkte abgeschlossen werden:

- Gemini-Anfragen über ein geschütztes Backend ausführen
- Punkte, Münzen und Belohnungen serverseitig berechnen
- Firestore-Regeln und Cloud-Synchronisierung absichern
- rechtliche Texte vervollständigen
- Multiplayer entweder vollständig anbinden oder als Vorschau kennzeichnen

Die detaillierte Planung befindet sich in [`docs/PRODUCT_RELEASE_ROADMAP.md`](docs/PRODUCT_RELEASE_ROADMAP.md).

## Technologie

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Firebase Authentication und Firestore
- Google Gemini
- Motion
- Progressive Web App

## Lokal starten

### Voraussetzungen

- Node.js 22 oder neuer
- npm
- ein Firebase-Projekt
- für die aktuelle Entwicklungsimplementierung ein Gemini-API-Schlüssel

### Installation

```bash
npm ci
```

Erstelle anschließend eine `.env.local`:

```env
GEMINI_API_KEY=dein_lokaler_entwicklungsschluessel
```

> Der aktuelle Browser-Aufruf von Gemini ist nur für lokale Entwicklung vorgesehen. Vor einer öffentlichen Bereitstellung muss die Anfrage über eine geschützte Serverfunktion laufen.

### Entwicklung

```bash
npm run dev
```

Die App ist anschließend standardmäßig unter `http://localhost:3000` erreichbar.

### Prüfungen

```bash
npm run lint
npm run build
```

`npm run lint` führt derzeit den TypeScript-Typecheck aus. Pull Requests werden zusätzlich über GitHub Actions geprüft.

## Projektstruktur

```text
src/
├── components/     Gemeinsame UI und größere Visualisierungen
├── lib/            Hilfslogik für Ranking, Sicherheit und Sound
├── pages/          Ausgelagerte Seiten
├── services/       Firebase-, Gemini- und SRS-Dienste
├── App.tsx         Aktuelle Hauptanwendung
├── data.ts         Lokale Kategorien und Fragen
├── storage.ts      Lokale Statistik- und Profildaten
└── types.ts        Zentrale TypeScript-Typen
```

`App.tsx` und `data.ts` werden schrittweise in kleinere Feature-Module beziehungsweise validierte Inhaltsdateien zerlegt.

## Firebase

Die Datei `firebase-applet-config.json` enthält die öffentliche Firebase-Webkonfiguration. Sensible Server-Schlüssel gehören nicht in das Repository.

Firestore-Regeln liegen in `firestore.rules`. Änderungen an Datenmodell und Regeln müssen immer gemeinsam getestet werden.

## PWA

Die App enthält Manifest, App-Icon und Service Worker. Der Service Worker cached nur eigene statische Dateien und verwendet für Navigationen eine Network-first-Strategie.

## Beitragen

Änderungen sollten über einen Branch und Pull Request erfolgen. Jeder Pull Request muss mindestens folgende Prüfungen bestehen:

- `npm ci`
- `npm run lint`
- `npm run build`

## Lizenz und Veröffentlichung

Vor einer öffentlichen oder kommerziellen Veröffentlichung müssen Lizenz, Impressum, Datenschutz, verwendete Drittanbieter und Nutzungsbedingungen abschließend festgelegt werden.
