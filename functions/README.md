# WissenPur Cloud Functions

Die Cloud Functions verwalten alle wettbewerbs- und wirtschaftsrelevanten Werte der Lern-App. Browsercode darf keine Ranglistenpunkte, Münzen, Serien, Erfolge, Shopbestände, Avatare oder täglichen Belohnungen als vertrauenswürdig festlegen.

## Vertrauensgrenze

### Browser darf

- das eigene Lernprofil lesen und erlaubte Profil-/Einstellungsfelder pflegen
- eigene Lernsets, Fehlerfragen und Lernplaninhalte speichern
- sichere Callable Functions aufrufen
- die serverseitig sanitierte Rangliste ausschließlich über `getTrustedLeaderboard` abrufen

Direkte Browserzugriffe auf `trustedLeaderboard` sind in den Firestore-Regeln verboten – auch für bekannte Dokument-IDs.

### Nur Cloud Functions dürfen

- Ranglistenfragen auswählen
- Lösungsschlüssel speichern und auswerten
- Punkte, Münzen und Serien berechnen
- Erfolge freischalten
- Daily-Belohnungen vergeben
- Glücksrad-Zufall erzeugen
- Shopkäufe und Power-up-Bestände verwalten
- Shop-Avatare setzen
- `trustedLeaderboard` schreiben
- Kontodaten exportieren und Konten löschen

## Exportierte Functions

Aktuell werden aus `src/entry.ts` exportiert:

### Verifizierte Ranglisten-Sitzungen

- `startSecureRankedQuiz`
- `submitRankedQuiz`
- `revealSecureRankedQuiz`

`startSecureRankedQuiz` wählt Fragen ausschließlich im Backend aus. Der Browser erhält:

- Sitzungs-ID
- Frage und Antwortoptionen
- Kategorie und Schwierigkeitsgrad
- Ablaufzeit

Der Browser erhält vor der Abgabe weder Lösungsindex noch Erklärung.

Jede Sitzung:

- gehört genau einem Firebase-Nutzer
- läuft technisch nach 30 Minuten ab
- kann nur einmal gewertet werden
- enthält einen unveränderlichen serverinternen Antwort-Snapshot
- bleibt dadurch auch bei einem Fragenkatalog-Deploy konsistent
- akzeptiert genau einen Antwortwert pro Frage
- akzeptiert keine fremden oder doppelten Frage-IDs
- wird serverseitig ausgewertet

Nach der Abgabe liefert `revealSecureRankedQuiz` dem Eigentümer die richtigen Antworten und Erklärungen.

KI-Fragen, eigene Lernsets und Offline-Fragen bleiben ungewertete Übungsinhalte.

### Economy und Belohnungen

- `getMyEconomyState`
- `claimDailyQuestReward`
- `spinDailyWheel`
- `purchaseShopItem`
- `consumePowerUp`
- `equipShopAvatar`

Wirtschaftsänderungen laufen serverseitig und transaktional. Preise, Tageslimits, Erfolgsprämien und Glücksrad-Zufall stammen aus dem Backend.

Die reine Geschäftslogik liegt weitgehend in `src/economyCore.ts` und kann ohne Browserzustand getestet werden.

### Rangliste

- `getTrustedLeaderboard`

Neue verifizierte Ergebnisse werden in

```text
trustedLeaderboard/{uid}
```

geschrieben. Die Collection ist für Browser-Direktreads und -writes gesperrt. `getTrustedLeaderboard` liest serverseitig, sanitisiert die Felder und gibt nur die für die öffentliche Darstellung nötigen Daten zurück.

Öffentliche Ranglisten-Avatare dürfen ausschließlich lokale App-Assets im Format

```text
/avatars/<name>.svg
```

sein. Externe Provider-`photoURL`-Werte werden nicht als öffentliche Lernprofil-/Ranglistenbilder übernommen. Fremde stabile Account-IDs werden in der öffentlichen Liste durch ranglokale IDs ersetzt; nur ein angemeldeter Nutzer darf seine eigene UID zur Markierung der eigenen Zeile zurückerhalten.

### Kontodaten

- `exportMyData`
- `deleteMyAccount`

Der Export entfernt vertrauliche Antwortschlüssel. Export- und Löschpfade sind an die UID gebunden, mit der der jeweilige Vorgang gestartet wurde; verspätete Antworten dürfen nach einem Kontowechsel nicht in einen anderen Sitzungskontext geschrieben werden.

Eine Kontolöschung verlangt eine ausreichend aktuelle Authentifizierung und entfernt die zugehörigen Release-Daten über den serverseitigen Kontopfad.

## Rate Limits und Retention

Geschützte Callables verwenden serverseitige Rate-Limits. Für allgemeine authentifizierte Callables existiert ein großzügiges 60-Sekunden-Fenster; Kontoexporte besitzen zusätzlich ein deutlich engeres eigenes Fenster. Ranked-Quizstarts besitzen eine separate Startbegrenzung.

`serverRateLimits/{uid}` ist für Browserzugriffe gesperrt und erhält `expiresAt` für eine vorgesehene Firestore-TTL von 24 Stunden.

`quizSessions.expiresAt` ist auf ungefähr 30 Minuten nach Sitzungsstart gesetzt. Die physische Löschung erfolgt asynchron über die in Produktion noch real zu aktivierende Firestore-TTL.

## Firestore und App Check

Produktion verwendet **immer** die Firestore-Standarddatenbank `(default)`.

`src/database.ts` blockiert eine benannte `FIRESTORE_DATABASE_ID` in einer deployten Functions-Runtime. Eine benannte Datenbank ist nur erlaubt, wenn der Functions Emulator läuft und sie bewusst für isolierte lokale Tests gesetzt wurde.

Beispiel Produktion:

```env
FIRESTORE_DATABASE_ID=(default)
```

App Check wird in deployten Functions immer erzwungen. Nur im lokalen Functions Emulator kann `ENFORCE_APP_CHECK=false` ausdrücklich verwendet werden.

## Datenschutz und Logging

Release-Logging ist datensparsam. Runtime-Logs dürfen insbesondere keine UID, E-Mail, Session-ID, Fragentexte, Antworten oder vollständigen Request-Payloads protokollieren.

Provider-Anzeigename und Provider-Profilbild werden nicht zusätzlich als Lernprofilfelder in Firestore gespiegelt.

## Freigegebene Toolchain

- Node.js für Hosted-CI: `22.12.0`
- Functions-Runtime: Node 22
- npm: `10.9.2`

Bis die drei repositoryweiten Lockfiles reproduzierbar committed sind, bleibt `npm install` nur ein temporärer Entwicklungsweg.

## Verifikation

Temporär, solange `functions/package-lock.json` noch nicht committed ist:

```bash
cd functions
npm install --no-audit --no-fund
npm run verify
npm run compile
```

`npm run verify` prüft unter anderem:

1. Repository-Secrets
2. Hosting-/CSP- und CI-Sicherheitsgrenzen
3. Action-Allowlist und immutable Action-SHA-Pins
4. Release-Architektur und Frontend-Manifest/Toolchain
5. alle drei Package-Lockfiles
6. Konto-, Session-, KI- und App-Check-Grenzen
7. Ranked-Snapshots und Rate-Limits
8. PWA, Accessibility und Datenschutz
9. Lernbibliothek, SRS und Lernanalyse
10. Legacy-Cleanup, Produktions-Preflight, Rollback und Firestore-Migrationsplan
11. Unit-Tests und TypeScript

Die Firestore-Regeln werden separat über `rules-tests` mit der Firebase Emulator Suite und simulierten getrennten Konten getestet.

## Reproduzierbare Lockfiles

Aus dem Repository-Root mit exakt Node `22.12.0` und npm `10.9.2`:

```bash
node scripts/regenerate-package-locks.mjs
```

Der Helfer erzeugt `wissenpur/package-lock.json`, `functions/package-lock.json` und `rules-tests/package-lock.json`. Scheitert ein Workspace, werden vorherige Lockfile-Zustände wiederhergestellt.

Nach erfolgreicher Erzeugung und Prüfung sollen alle drei Bereiche über `npm ci` installiert werden.

## Lokale Entwicklung

Bis zur Lockfile-Finalisierung aus dem Repository-Stamm:

```bash
npm install --prefix functions --no-audit --no-fund
npm install --prefix rules-tests --no-audit --no-fund
npm --prefix functions run verify
npm --prefix rules-tests test
firebase emulators:start --only auth,functions,firestore,hosting --project demo-wissenpur
```

In `wissenpur/.env.local` darf für lokale Emulatorarbeit beispielsweise gesetzt werden:

```env
VITE_USE_FUNCTIONS_EMULATOR=true
VITE_ENABLE_APPCHECK_DEBUG=true
VITE_RECAPTCHA_ENTERPRISE_SITE_KEY=DEIN_TEST_SITE_KEY
VITE_FIRESTORE_DATABASE_ID=(default)
```

Solche Debug-/Emulatorwerte sind in Produktion verboten und werden vom Produktions-Preflight blockiert.

## Deployment

Vor Produktion müssen erfolgreich sein:

```bash
npm --prefix functions run build
npm --prefix rules-tests test
npm --prefix wissenpur run build:release
```

Der tatsächliche Produktions-Deploy darf erst nach bewusster Zielprojektwahl, vollständigem Preflight, Migration, TTL-Aktivierung, Rechtsfreigabe und getesteter Rollback-Strategie erfolgen.

## Noch erforderliche Produktionsarbeiten

1. GitHub Actions Billing/Spending-Limit korrigieren und Hosted-CI tatsächlich ausführen.
2. Alle drei Package-Lockfiles mit Node 22.12.0 / npm 10.9.2 reproduzierbar erzeugen und CI auf `npm ci` umstellen.
3. Frontend-/Functions-Builds und Firestore-Emulatortests aus einem frischen Checkout bestätigen.
4. App Check, Firebase AI Logic, Functions, Quotas, Budgetwarnungen und Monitoring im echten Zielprojekt konfigurieren.
5. Daten kontrolliert nach Firestore `(default)` migrieren.
6. TTL für `quizSessions.expiresAt` und `serverRateLimits.expiresAt` real aktivieren.
7. Legacy-Cleanup zunächst als Dry Run und anschließend nur kontrolliert gegen die Allowlist ausführen.
8. echte Betreiber-, Datenschutz- und Aufbewahrungsangaben finalisieren und rechtlich prüfen.
9. Hosting-Snapshot/Restore sowie Android-/iPhone-/Desktop-E2E real testen.

## Bestandsmigration

Die erste erfolgreiche verifizierte Wirtschaftsfunktion setzt `economyVersion: 1`. Nur solche Dokumente werden beim Login als vertrauenswürdiger Punkte- und Inventarstand geladen.

Alte clientseitig beschreibbare Wirtschaftswerte werden nicht übernommen. Profil, Einstellungen und eigene Lerninhalte können weiter geladen werden; Punkte, Münzen, Erfolge, Power-ups und Avatare beginnen ohne eine bewusste administrative Migration beim verifizierten Stand.
