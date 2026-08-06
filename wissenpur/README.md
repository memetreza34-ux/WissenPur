# WissenPur

WissenPur ist eine deutschsprachige Lern-App mit Quizzen, Karteikarten, Wiederholungslogik, Gamification und einer visuellen Wissens-Gehirn-Auswertung.

## Aktueller Status

Die Anwendung befindet sich in aktiver Entwicklung. Quiz, Daily Challenge, Blitzmodus, Fehlertraining, eigene Quizprojekte, Google-Anmeldung, Rangliste, Karteikarten und verschiedene Fortschrittsfunktionen sind bereits vorhanden.

Die KI-Fragenerstellung verwendet Firebase AI Logic. Dadurch wird kein eigener Gemini-Schlüssel mehr in das Browser-Bundle eingebaut. Vor einer öffentlichen Version müssen weiterhin insbesondere folgende Punkte abgeschlossen werden:

- Firebase AI Logic und App Check im Produktionsprojekt aktivieren und testen
- nutzerbezogene KI-Kontingente und Kostenlimits einstellen
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
- Firebase AI Logic mit Gemini
- Firebase App Check
- Motion
- Progressive Web App

## Lokal starten

### Voraussetzungen

- Node.js 22 oder neuer
- npm
- ein Firebase-Projekt
- aktiviertes Firebase AI Logic
- eine registrierte Web-App in Firebase App Check

### Installation

```bash
npm ci
cp .env.example .env.local
```

Trage in `.env.local` den reCAPTCHA-Enterprise-Websiteschlüssel ein:

```env
VITE_RECAPTCHA_ENTERPRISE_SITE_KEY=dein_recaptcha_enterprise_site_key
VITE_ENABLE_APPCHECK_DEBUG=true
```

`VITE_ENABLE_APPCHECK_DEBUG=true` darf ausschließlich lokal verwendet werden. Beim ersten lokalen Start erscheint in der Browserkonsole ein App-Check-Debugtoken. Dieses Token muss in der Firebase-Konsole für die Web-App freigegeben werden.

### Erforderliche Firebase-Konfiguration

1. Firebase AI Logic für das Projekt aktivieren und den Gemini-Developer-API-Backenddienst auswählen.
2. Unter **Security → App Check** die Web-App mit reCAPTCHA Enterprise registrieren.
3. App Check für **Firebase AI Logic** erzwingen.
4. Den lokalen Debugtoken für Entwicklungsgeräte freigeben.
5. In Google Cloud das nutzerbezogene Limit für Generate-Content-Anfragen deutlich unter dem Standardwert setzen.
6. Budgetwarnungen, Monitoring und gegebenenfalls ein Ausgabenlimit konfigurieren.

Ohne gültige App-Check-Konfiguration fällt die KI-Fragenerstellung kontrolliert auf die lokalen Fragen zurück.

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
├── services/       Firebase-AI-, Firestore- und SRS-Dienste
├── App.tsx         Aktuelle Hauptanwendung
├── data.ts         Lokale Kategorien und Fragen
├── storage.ts      Lokale Statistik- und Profildaten
└── types.ts        Zentrale TypeScript-Typen
```

`App.tsx` und `data.ts` werden schrittweise in kleinere Feature-Module beziehungsweise validierte Inhaltsdateien zerlegt.

## Firebase

Die Datei `firebase-applet-config.json` enthält die öffentliche Firebase-Webkonfiguration. Ein Firebase-Web-API-Key ist kein Servergeheimnis; der Zugriff wird über Security Rules, App Check, Authentifizierung und Quotas geschützt. Private Server-Schlüssel dürfen nicht in das Repository gelangen.

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
