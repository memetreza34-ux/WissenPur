# WissenPur Cloud Functions

Diese Functions verwalten die wettbewerbsrelevanten Werte der Lern-App. Browsercode darf keine Ranglistenpunkte, Münzen, Shopbestände oder täglichen Belohnungen als vertrauenswürdig festlegen.

## Exportierte Functions

### Ranglisten-Sitzungen

- `startRankedQuiz`
- `submitRankedQuiz`

Der Server akzeptiert ausschließlich stabile IDs aus dem statischen WissenPur-Fragenkatalog. Beim Build erzeugt `scripts/sync-question-bank.ts` daraus eine reduzierte Serverdatei mit ID, Kategorie, Lösungsindex und Anzahl der Optionen.

Eine Sitzung:

- gehört genau einem Firebase-Nutzer
- läuft nach 30 Minuten ab
- kann nur einmal gewertet werden
- akzeptiert keine fremden oder doppelten Fragen
- berechnet Punkte und Münzen im Backend

KI-Fragen, manuelle Projekte und eigene Quizze sind zunächst Übungsmodus und vergeben keine Ranglistenpunkte.

### Übergang für die aktuelle Oberfläche

- `recordRoundResult`

Die bestehende monolithische Quizansicht übermittelt vorübergehend nur die begrenzten Werte `correct` und `total`. Der Endpunkt ignoriert clientseitige Punktwerte, berechnet die Belohnung selbst, verwendet einmalige Rundennachweise und begrenzt schnelle Mehrfacheinreichungen.

Dieser Endpunkt ist sicherer als die frühere direkte Firestore-Synchronisierung, aber schwächer als `startRankedQuiz`/`submitRankedQuiz`, weil der Client die Anzahl richtiger Antworten noch meldet. Vor einer öffentlichen kompetitiven Rangliste muss die Oberfläche vollständig auf Ranglisten-Sitzungen umgestellt werden.

### Wirtschaft und Belohnungen

- `claimDailyQuestReward`
- `spinDailyWheel`
- `purchaseShopItem`
- `consumePowerUp`

Alle Änderungen laufen als Firestore-Transaktionen. Preise, tägliche Limits und Glücksrad-Zufall stammen aus dem Backend.

## Lokale Entwicklung

```bash
cd functions
npm install
cp .env.example .env
npm run lint
npm run build
```

Aus dem Repository-Stamm:

```bash
firebase emulators:start --only auth,functions,firestore,hosting
```

In `wissenpur/.env.local`:

```env
VITE_USE_FUNCTIONS_EMULATOR=true
VITE_ENABLE_APPCHECK_DEBUG=true
VITE_RECAPTCHA_ENTERPRISE_SITE_KEY=dein_test_site_key
```

## Deployment

```bash
firebase deploy --only functions,firestore
```

Vor Produktion:

1. App Check für die Web-App und Callable Functions aktivieren.
2. `ENFORCE_APP_CHECK=true` setzen.
3. die benannte Firestore-Datenbank kontrollieren.
4. TTL für `quizSessions.expiresAt` und `roundReceipts.expiresAt` aktivieren.
5. Emulator- und Integrationstests ausführen.
6. Monitoring, Budgetwarnungen und Alarme einrichten.

## Datenmigration

Die erste erfolgreiche vertrauenswürdige Wirtschaftsfunktion setzt `economyVersion: 1`. Ab dann dürfen Browser nur noch Profil, Einstellungen und eigene Lerninhalte ändern. Punkte, Münzen, Serien, Power-ups, Shopfreischaltungen und Rangliste gehören den Cloud Functions.

Alte lokale beziehungsweise clientseitig synchronisierte Wirtschaftswerte werden nicht automatisch als vertrauenswürdig übernommen. Für eine öffentliche Bestandsmigration muss vor dem Release bewusst entschieden werden, ob Testkonten zurückgesetzt oder ausgewählte Konten administrativ migriert werden.
