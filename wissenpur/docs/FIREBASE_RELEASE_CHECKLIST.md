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
3. Geführte Einrichtung starten.
4. **Gemini Developer API** als Backend auswählen.
5. Abrechnung, APIs und Nutzungsbedingungen prüfen.
6. Testanfrage in der Konsole ausführen.

Die Web-App verwendet im Code `gemini-3.5-flash-lite`.

## 3. App Check

1. In Google Cloud einen score-basierten reCAPTCHA-Enterprise-Websiteschlüssel anlegen.
2. Nur die echten Entwicklungs-, Staging- und Produktionsdomains zulassen.
3. Unter **Firebase → Security → App Check → Apps** die WissenPur-Web-App registrieren.
4. Den Websiteschlüssel als `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` beim Hosting hinterlegen.
5. Unter **App Check → APIs** die Erzwingung für **Firebase AI Logic** aktivieren.
6. Nach erfolgreicher Prüfung auch Firestore und Authentication-bezogene Endpunkte gemäß Firebase-Empfehlung absichern.
7. Schutz vor Replay-Angriffen aktivieren, sobald die verwendete Konfiguration dies unterstützt.

### Lokale Entwicklung

In `.env.local`:

```env
VITE_RECAPTCHA_ENTERPRISE_SITE_KEY=dein_site_key
VITE_ENABLE_APPCHECK_DEBUG=true
```

Danach:

1. App lokal öffnen.
2. Browserkonsole öffnen.
3. ausgegebenen App-Check-Debugtoken kopieren.
4. In Firebase unter der Web-App als Debugtoken registrieren.

`VITE_ENABLE_APPCHECK_DEBUG=true` darf nie in Produktion gesetzt werden.

## 4. Kontingente und Kosten

Der Standardwert von Firebase AI Logic ist für WissenPur zu hoch.

Empfohlener Startwert:

- 3 bis 5 Generate-Content-Anfragen pro Nutzer und Minute
- zusätzlich produktseitiges Tageskontingent pro Tarif
- maximale 30 Fragen pro Generierung
- maximale Themenlänge 120 Zeichen

Zusätzlich:

- Budgetwarnungen einrichten
- Gemini-Ausgabenlimit setzen, sofern für das gewählte Backend verfügbar
- AI Monitoring aktivieren
- Fehlerquote, Tokens, Latenz und 429-Antworten überwachen
- Modellname später über Remote Config steuerbar machen

## 5. Firestore-Regeln

Vor Deployment:

```bash
firebase emulators:start --only firestore
```

Mindestens testen:

- Nutzer A kann Nutzer B nicht lesen oder verändern.
- Nutzer kann seine UID im Dokument nicht austauschen.
- kumulative Werte können nicht reduziert werden.
- Ranglistenpunkte müssen exakt den Punkten im Nutzerdokument entsprechen.
- unangemeldete Nutzer können nur die öffentliche Rangliste lesen.
- Lobby- und Duel-Schreibzugriffe sind für normale Clients gesperrt.
- Adminzugriff funktioniert ausschließlich über den Custom Claim `admin: true`.

Wichtig: Diese Regeln reduzieren Missbrauch, ersetzen aber noch keine serverseitige Punkteberechnung.

## 6. Authentifizierung

- nur benötigte Login-Anbieter aktivieren
- erlaubte Domains kontrollieren
- Datenschutzerklärung vor dem Login erreichbar machen
- Kontolöschung und Datenexport bereitstellen
- Session- und Fehlerverhalten auf Mobilgeräten testen

## 7. Hosting-Variablen

Erforderlich:

```env
VITE_RECAPTCHA_ENTERPRISE_SITE_KEY=...
VITE_ENABLE_APPCHECK_DEBUG=false
```

Nicht mehr verwenden:

```env
GEMINI_API_KEY=...
```

Ein privater Gemini-Schlüssel darf weder als Vite-Variable noch über `define` in das Browser-Bundle gelangen.

## 8. Manueller Release-Test

- Google-Login auf Desktop, Android und iPhone
- bestehender Cloud-Spielstand auf einem zweiten Gerät
- Offline-Start mit lokalen Fragen
- KI-Fallback bei absichtlich blockierter AI-Logic-Anfrage
- PWA-Installation und Update einer bestehenden Installation
- Dark Mode, Ton aus, Zoom und Tastaturbedienung
- Daily Challenge über einen Datumswechsel
- sehr lange Themen, Sonderzeichen und ungültige KI-Ausgaben
- Firestore-Zugriff mit einem zweiten Testkonto

## 9. Noch offener Sicherheitsblocker

Vor einer öffentlichen globalen Rangliste müssen Punkte, Coins, Belohnungen, Shopkäufe und Matchresultate in vertrauenswürdigem Backendcode berechnet werden. Bis dahin darf die Rangliste nicht als manipulationssicher oder wettbewerblich fair beworben werden.
