# WissenPur Cloud Functions

Die Cloud Functions verwalten alle wettbewerbs- und wirtschaftsrelevanten Werte der Lern-App. Browsercode darf keine Ranglistenpunkte, Münzen, Serien, Erfolge, Shopbestände, Avatare oder täglichen Belohnungen als vertrauenswürdig festlegen.

## Vertrauensgrenze

### Browser darf

- das eigene Profil lesen
- Anzeigename und Einstellungen pflegen
- eigene Lernsets und Fehlerfragen speichern
- einen Lernplan speichern
- sichere Callable Functions aufrufen
- die serververifizierte Rangliste lesen

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
- läuft nach 30 Minuten ab
- kann nur einmal gewertet werden
- enthält einen unveränderlichen serverinternen Antwort-Snapshot
- bleibt dadurch auch bei einem Fragenkatalog-Deploy konsistent
- akzeptiert genau einen Antwortwert pro Frage
- akzeptiert keine fremden oder doppelten Frage-IDs
- wird vollständig in einer Firestore-Transaktion ausgewertet

Nach der Abgabe liefert `revealSecureRankedQuiz` dem Eigentümer die richtigen Antworten und Erklärungen.

Quizstarts werden pro Nutzer in einem festen 60-Sekunden-Fenster begrenzt. Der dreizehnte Start im selben Fenster wird abgewiesen. Der Datensatz `serverRateLimits/{uid}` ist für sämtliche Browserkonten verborgen.

KI-Fragen, eigene Lernsets und Offline-Fragen bleiben ungewertete Übungsinhalte.

### Wirtschaft und Belohnungen

- `claimDailyQuestReward`
- `spinDailyWheel`
- `purchaseShopItem`
- `consumePowerUp`

Alle Änderungen laufen als Firestore-Transaktionen. Preise, Tageslimits, Erfolgsprämien und Glücksrad-Zufall stammen aus dem Backend.

Die reine Geschäftslogik liegt in `src/economyCore.ts` und kann ohne Firebase ausgeführt und getestet werden.

### Kontodaten

- `exportMyData`
- `deleteMyAccount`

Der Export enthält Profil, Lernfortschritt, verifizierte und historische Ranglistendaten, Sitzungsmetadaten sowie zuordenbare Alt-Daten. Der vertrauliche `answerKey` wird immer entfernt, auch bei einer aktiven Runde.

Die Löschung entfernt:

- Nutzerdokument
- verifizierte und historische Ranglisteneinträge
- Quiz-Sitzungen
- Rate-Limit-Datensatz
- zuordenbare Alt-Lobbys und Alt-Duelle
- Firebase-Authentication-Konto

Eine Kontolöschung verlangt eine höchstens zehn Minuten alte Anmeldung.

## Rangliste

Neue verifizierte Ergebnisse werden ausschließlich nach

```text
trustedLeaderboard/{uid}
```

geschrieben. Die historische Collection `leaderboard` ist für Release-Clients unsichtbar und darf die neue Rangliste nicht beeinflussen.

Öffentliche Profilbilder stammen nur aus:

1. einem serverseitig gekauften Shop-Avatar oder
2. dem verifizierten HTTPS-Bild des Identity-Provider-Tokens.

Ein Client kann keine beliebige `customPhotoURL` in die Rangliste einschleusen.

## Firestore

Produktion verwendet die stabile Standarddatenbank `(default)`. Eine benannte Datenbank wird nur verwendet, wenn `FIRESTORE_DATABASE_ID` ausdrücklich auf einen anderen Wert gesetzt wird.

Die aktive Release-Konfiguration:

```env
FIRESTORE_DATABASE_ID=(default)
ENFORCE_APP_CHECK=true
```

## Verifikation

```bash
cd functions
npm install
npm run verify
npm run compile
```

`npm run verify` führt aus:

1. Architekturgrenzen prüfen
2. öffentlichen Offline- und privaten Ranglistenkatalog trennen
3. serverseitigen Fragenkatalog erzeugen
4. Tests typprüfen
5. Economy-, Snapshot-, Export- und Rate-Limit-Tests ausführen
6. alle aktiven Functions typprüfen

Die Firestore-Regeln werden separat über `rules-tests` mit der Firebase Emulator Suite und simulierten Konten getestet.

## Lokale Entwicklung

Aus dem Repository-Stamm:

```bash
npm install --prefix functions
npm install --prefix rules-tests
npm --prefix functions run verify
npm --prefix rules-tests test
firebase emulators:start --only auth,functions,firestore,hosting --project demo-wissenpur
```

In `wissenpur/.env.local`:

```env
VITE_USE_FUNCTIONS_EMULATOR=true
VITE_ENABLE_APPCHECK_DEBUG=true
VITE_RECAPTCHA_ENTERPRISE_SITE_KEY=DEIN_TEST_SITE_KEY
VITE_FIRESTORE_DATABASE_ID=(default)
```

## Deployment

Vor Produktion müssen erfolgreich sein:

```bash
npm --prefix functions run build
npm --prefix rules-tests test
npm --prefix wissenpur run build:release
```

Danach projektbezogen deployen; es existiert absichtlich kein Firebase-Default-Alias:

```bash
firebase deploy --project DEINE_PROJEKT_ID --only functions,firestore:rules,hosting
```

## Noch erforderliche Produktionsarbeiten

1. GitHub Actions lauffähig machen.
2. App Check für Web-App und Callable Functions erzwingen.
3. Firebase AI Logic, Quotas und Monitoring konfigurieren.
4. Daten kontrolliert nach Firestore `(default)` migrieren.
5. TTL für `quizSessions.expiresAt` aktivieren.
6. alte `leaderboard`, `lobbies`, `duels` und `roundReceipts` bereinigen.
7. echte Betreiber- und Datenschutzangaben eintragen.
8. End-to-End- und Rollback-Tests durchführen.

## Bestandsmigration

Die erste erfolgreiche verifizierte Wirtschaftsfunktion setzt `economyVersion: 1`. Nur solche Dokumente werden beim Login als vertrauenswürdiger Punkte- und Inventarstand geladen.

Alte clientseitig beschreibbare Wirtschaftswerte werden nicht übernommen. Profil, Einstellungen und eigene Lerninhalte können weiter geladen werden; Punkte, Münzen, Erfolge, Power-ups und Avatare beginnen ohne eine bewusste administrative Migration beim verifizierten Stand.
