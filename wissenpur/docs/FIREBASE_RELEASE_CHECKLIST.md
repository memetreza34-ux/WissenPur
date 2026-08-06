# Firebase-Checkliste vor dem WissenPur-Release

Diese Schritte müssen im Produktionsprojekt abgeschlossen sein, bevor KI-Funktionen, Cloud-Fortschritt oder Ranglisten öffentlich beworben werden.

## 1. Getrennte Projekte

Empfohlen:

- `wissenpur-dev`
- `wissenpur-staging`
- `wissenpur-prod`

Entwicklungs- und Produktionsdaten dürfen nicht im selben Firestore-Projekt liegen.

## 2. Firebase AI Logic

1. Firebase-Konsole öffnen.
2. **Firebase AI Logic** auswählen.
3. geführte Einrichtung starten.
4. **Gemini Developer API** als Backend auswählen.
5. Abrechnung, APIs und Nutzungsbedingungen prüfen.
6. Testanfrage in der Konsole ausführen.

Die Web-App verwendet im Code `gemini-3.5-flash-lite`.

## 3. App Check

1. In Google Cloud einen score-basierten reCAPTCHA-Enterprise-Websiteschlüssel anlegen.
2. nur die echten Entwicklungs-, Staging- und Produktionsdomains zulassen.
3. unter **Firebase → Security → App Check → Apps** die WissenPur-Web-App registrieren.
4. den Websiteschlüssel als `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` beim Hosting hinterlegen.
5. die Erzwingung für Firebase AI Logic aktivieren.
6. die Erzwingung für Callable Functions erst nach erfolgreichen Debug- und Stagingtests aktivieren.
7. anschließend weitere unterstützte Firebase-Dienste absichern.

### Lokale Entwicklung

In `wissenpur/.env.local`:

```env
VITE_RECAPTCHA_ENTERPRISE_SITE_KEY=dein_site_key
VITE_ENABLE_APPCHECK_DEBUG=true
VITE_USE_FUNCTIONS_EMULATOR=true
```

Danach den ausgegebenen App-Check-Debugtoken in der Firebase-Konsole registrieren. Debugmodus darf nie in Produktion aktiv sein.

## 4. Cloud Functions

Die vertrauenswürdige Wirtschaft liegt unter `functions/`.

Lokal prüfen:

```bash
cd functions
npm install
cp .env.example .env
npm run lint
npm run build
```

Emulatoren aus dem Repository-Stamm starten:

```bash
firebase emulators:start --only auth,functions,firestore,hosting
```

Deployment:

```bash
firebase deploy --only functions,firestore
```

Vor Produktion kontrollieren:

- Node.js 22 wird verwendet.
- Region ist `europe-west1`.
- `FIRESTORE_DATABASE_ID` zeigt auf die richtige benannte Datenbank.
- `ENFORCE_APP_CHECK=true` ist gesetzt.
- kein Emulator-Schalter befindet sich in der Hosting-Konfiguration.
- Funktionsfehler, Latenz, Aufrufzahl und Kosten werden überwacht.

### Serverseitige Wirtschaft

Die Functions verwalten:

- Ranglistenpunkte
- Münzen
- Streaks
- Erfolge und Erfolgs-Münzen
- Daily Quest
- Glücksrad
- Shopkäufe
- Power-up-Verbrauch
- Ranglisteneinträge

`startRankedQuiz` und `submitRankedQuiz` sind der endgültige Ranglistenpfad. `recordRoundResult` ist nur der begrenzte Übergang für die aktuelle monolithische Oberfläche und darf nicht als vollständig cheat-sicher beworben werden.

## 5. TTL und Datenaufbewahrung

In Firestore TTL aktivieren für:

- Collection Group `quizSessions`, Feld `expiresAt`
- Collection Group `roundReceipts`, Feld `expiresAt`

Ohne TTL bleiben abgelaufene Sitzungen und Idempotenznachweise gespeichert. Zusätzlich Aufbewahrungsfristen in der Datenschutzerklärung dokumentieren.

## 6. Kontingente und Kosten

Empfohlener Startwert für KI:

- 3 bis 5 Generate-Content-Anfragen pro Nutzer und Minute
- zusätzlich produktseitiges Tageskontingent pro Tarif
- maximal 30 Fragen pro Generierung
- maximale Themenlänge 120 Zeichen

Zusätzlich:

- Budgetwarnungen einrichten
- AI Monitoring aktivieren
- Fehlerquote, Tokens, Latenz und 429-Antworten überwachen
- Functions-Instanzen und Firestore-Schreibkosten überwachen
- Modellname später über Remote Config steuerbar machen

## 7. Firestore-Regeln

Mindestens testen:

- Nutzer A kann Nutzer B nicht lesen oder verändern.
- Nutzer kann seine UID im Dokument nicht austauschen.
- ein Legacy-Client kann `economyVersion: 1` nicht selbst setzen.
- nach `economyVersion: 1` kann der Client nur Profil, Einstellungen und eigene Lerninhalte ändern.
- Ranglisteneinträge migrierter Konten können nicht vom Browser geschrieben werden.
- `quizSessions` und `roundReceipts` sind für Browser vollständig gesperrt.
- Lobby- und Duel-Schreibzugriffe sind für normale Clients gesperrt.
- Adminzugriff funktioniert ausschließlich über den Custom Claim `admin: true`.

Die Admin SDK in Cloud Functions greift vertrauenswürdig auf Firestore zu und wird nicht durch Clientregeln autorisiert. Deshalb müssen Eingaben in jeder Function separat geprüft werden.

## 8. Migration vorhandener Testdaten

Die erste erfolgreiche Wirtschaftsfunktion setzt `economyVersion: 1`. Frühere Punkte und Münzen wurden clientseitig berechnet und sind daher nicht automatisch vertrauenswürdig.

Vor Veröffentlichung eine Entscheidung treffen:

- alle Testkonten zurücksetzen, oder
- ausgewählte Konten durch ein einmaliges Adminskript migrieren, oder
- Rangliste zum öffentlichen Start vollständig neu beginnen.

Empfehlung für WissenPur: **Rangliste zum öffentlichen Start neu beginnen** und klar als neue Saison kennzeichnen.

## 9. Authentifizierung und Datenschutz

- nur benötigte Login-Anbieter aktivieren
- erlaubte Domains kontrollieren
- Datenschutzerklärung vor dem Login erreichbar machen
- Kontolöschung und Datenexport bereitstellen
- Session- und Fehlerverhalten auf Mobilgeräten testen
- Datenverarbeitung durch Firebase, reCAPTCHA Enterprise, AI Logic und externe Bilddienste aufführen

## 10. Hosting-Variablen

Erforderlich:

```env
VITE_RECAPTCHA_ENTERPRISE_SITE_KEY=...
VITE_ENABLE_APPCHECK_DEBUG=false
VITE_USE_FUNCTIONS_EMULATOR=false
```

Nicht mehr verwenden:

```env
GEMINI_API_KEY=...
```

Ein privater Gemini-Schlüssel darf weder als Vite-Variable noch über `define` in das Browser-Bundle gelangen.

## 11. Manueller Release-Test

- Google-Login auf Desktop, Android und iPhone
- bestehender Cloud-Spielstand auf einem zweiten Gerät
- erste Migration auf `economyVersion: 1`
- dieselbe Runde zweimal einreichen
- zwei verschiedene Runden innerhalb von 15 Sekunden einreichen
- abgelaufene Ranglisten-Sitzung einreichen
- fremde oder manipulierte Frage-ID senden
- Erfolgsschwelle erreichen und Bonus genau einmal erhalten
- Daily Quest zweimal abholen
- Glücksrad zweimal am selben Tag drehen
- bestätigtes Glücksrad-Ergebnis nach Neuladen kontrollieren
- Shopkauf mit zu wenigen Münzen
- Power-up ohne Bestand verwenden
- Offline-Start mit lokalen Fragen
- KI-Fallback bei blockierter AI-Logic-Anfrage
- PWA-Installation und Update einer bestehenden Installation
- Dark Mode, Ton aus, Zoom und Tastaturbedienung
- Daily Challenge über einen Datumswechsel
- Firestore-Zugriff mit einem zweiten Testkonto

## 12. Verbleibender Ranglisten-Blocker

Der Backendkern ist vorhanden. Vor einer öffentlichen kompetitiven Rangliste muss die Quizoberfläche aber vollständig `startRankedQuiz` und `submitRankedQuiz` verwenden. Der Übergangsendpunkt `recordRoundResult` begrenzt und berechnet Belohnungen serverseitig, kann jedoch noch nicht beweisen, dass die vom Client gemeldete Anzahl richtiger Antworten tatsächlich aus den gezeigten Fragen stammt.
