# Firebase-Checkliste vor dem WissenPur-Release

Stand: August 2026

Diese Schritte müssen im tatsächlichen Produktionsprojekt abgeschlossen sein, bevor WissenPur öffentlich als releasefähig gilt. Repository-Code allein beweist keine korrekt aktivierte Cloud-Konfiguration.

## 1. Getrennte Projekte und Firestore

Empfohlen:

- `wissenpur-dev`
- `wissenpur-staging`
- `wissenpur-prod`

Pflichtpunkte:

- [ ] Entwicklungs- und Produktionsdaten liegen nicht im selben Projekt.
- [ ] Produktion verwendet Firestore `(default)`.
- [ ] `FIRESTORE_DATABASE_ID` wird in Produktion **nicht** auf eine benannte Datenbank gesetzt.
- [ ] vorhandene Daten einer alten benannten Datenbank wurden kontrolliert migriert oder bewusst verworfen.
- [ ] Nutzerprofile, Lernpläne, Lernsets, Rangliste und Quiz-Sitzungen wurden nach der Migration stichprobenartig geprüft.
- [ ] alte Lobby-/Duel-Daten wurden vollständig bereinigt oder mit einer einmaligen Admin-Migration verarbeitet.

## 2. Firebase AI Logic

- [ ] Firebase AI Logic ist im Zielprojekt aktiviert.
- [ ] Gemini Developer API beziehungsweise das endgültig gewählte Backend ist korrekt eingerichtet.
- [ ] Abrechnung, APIs und Nutzungsbedingungen wurden geprüft.
- [ ] Testanfrage im Staging-Projekt funktioniert.
- [ ] Kosten-/Quota-Limits sind gesetzt.
- [ ] kein Gemini-/Google-AI-Schlüssel liegt im Browserbundle oder Repository.

Die Web-App greift nicht direkt mit einem privaten Gemini-Schlüssel auf die API zu.

## 3. App Check / reCAPTCHA Enterprise

- [ ] score-basierter reCAPTCHA-Enterprise-Websiteschlüssel angelegt.
- [ ] nur echte Entwicklungs-, Staging- und Produktionsdomains zugelassen.
- [ ] WissenPur-Web-App unter Firebase App Check registriert.
- [ ] `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` für den Produktionsbuild gesetzt.
- [ ] App Check schützt die Callable Functions.
- [ ] Firebase AI Logic wird ebenfalls durch App Check geschützt.
- [ ] Debug-App-Check ist ausschließlich lokal aktiv.

Lokale Entwicklung kann verwenden:

```env
VITE_RECAPTCHA_ENTERPRISE_SITE_KEY=dein_site_key
VITE_ENABLE_APPCHECK_DEBUG=true
VITE_USE_FUNCTIONS_EMULATOR=true
```

Debugmodus darf nie in Produktion aktiv sein.

## 4. Cloud Functions

Lokal:

```bash
cd functions
npm install
npm run verify
npm run compile
```

Emulatoren aus dem Repository-Stamm:

```bash
firebase emulators:start --only auth,functions,firestore,hosting
```

Deployment erst nach grüner Prüfung:

```bash
firebase deploy --only functions,firestore
```

Vor Produktion kontrollieren:

- [ ] Node.js 22 wird verwendet.
- [ ] Region ist wie vorgesehen konfiguriert.
- [ ] Produktion verwendet `(default)` Firestore.
- [ ] App Check ist außerhalb des Emulators im Code immer aktiv.
- [ ] Funktionsfehler, Latenz, Aufrufzahl und Kosten werden überwacht.

## 5. Autoritative Economy-Hydrierung

`getMyEconomyState` ist der sichere Einstieg in den authentifizierten Kontostand.

Prüfen:

- [ ] Callable ist deployed und App-Check-geschützt.
- [ ] jede neue Auth-Sitzung lädt Economy über den Backend-Normalisierer.
- [ ] `normalizeEconomy()` wird serverseitig verwendet.
- [ ] alte/client-schreibbare Werte werden bei fehlender vertrauenswürdiger `economyVersion: 1` nicht übernommen.
- [ ] Tages- und Wochenwerte werden beim neuen Login serverseitig normalisiert.
- [ ] während der Hydrierung zeigt die UI keine Gast-/ungeprüften Punkte oder Münzen.
- [ ] gewertete Quizstarts, Rangliste, Daily-Rewards und Shop sind während der Hydrierung gesperrt.
- [ ] lokale Übungsrunden verändern bei angemeldeten Nutzern niemals Economy-Werte.
- [ ] Logout/Kontowechsel während einer langsamen Hydrierung kann keine verspätete Antwort mehr lokal speichern.

## 6. Gastdaten beim ersten Login

Gast-Lerninhalte dürfen erhalten bleiben, Gast-Economy nicht.

Testen:

- [ ] Gast erstellt Lernset → Login → Lernset bleibt vorhanden.
- [ ] bestehendes Konto besitzt Cloud-Lernsets + Gast besitzt neue lokale Sets → Login → beide Bibliotheken werden vereinigt.
- [ ] gleiche Deck-ID lokal/cloud → lokale aktuelle Fassung gewinnt.
- [ ] lokale und Cloud-Fehlerfragen werden vereinigt; lokale gleiche ID gewinnt.
- [ ] Lernplan verwendet seine `updatedAt`-Konfliktregel.
- [ ] lokale Lernanalyse wird beim ersten Login dem Kontokontext zugeordnet.
- [ ] Gastpunkte, Gastmünzen, Gaststreaks, Erfolge und Inventar werden nicht übernommen.
- [ ] Konto A → Konto B verwirft lokale Daten von A.
- [ ] Konto → Logout/Auth-Verlust entfernt kontoabhängige lokale Daten.

## 7. Sichere Ranglistenprüfungen

Der endgültige Ranglistenpfad lautet:

- `startSecureRankedQuiz`
- `submitRankedQuiz`
- `revealSecureRankedQuiz`

Prüfen:

- [ ] Backend wählt die Fragen selbst.
- [ ] Browser erhält vor Abgabe weder Lösungsindex noch Erklärung.
- [ ] jede Sitzung besitzt einen unveränderlichen Antwort-Snapshot.
- [ ] Submit verwendet ausschließlich `readSessionAnswerKey`.
- [ ] Reveal ist erst nach erfolgreicher Abgabe möglich.
- [ ] fehlender/beschädigter Snapshot schlägt hart fehl.
- [ ] kein Fallback auf den aktuellen Fragenkatalog existiert.
- [ ] wiederholte Submit-Anfrage ist idempotent.
- [ ] fremde oder manipulierte Session-/Frage-IDs werden abgelehnt.

`recordRoundResult` und der alte client-vertraute Übergang sind **nicht** Teil des aktiven Release-Pfads.

## 8. Firestore-Regeln

Die Emulator-Suite muss tatsächlich ausgeführt werden.

Mindestens bestätigen:

- [ ] Nutzer A kann Nutzer B nicht lesen oder verändern.
- [ ] Browser kann keine Economy-, Inventar-, Shop-Avatar- oder Ranglistenwerte schreiben.
- [ ] `trustedLeaderboard` ist browser-write-geschützt.
- [ ] `quizSessions` und `serverRateLimits` sind vollständig für Browser gesperrt.
- [ ] Lernplan akzeptiert nur die dokumentierte Struktur ohne Zusatzfelder.
- [ ] `customDifficultyTimes` akzeptiert nur `leicht`, `mittel`, `schwer`, `all` mit Integerwerten 5–120.
- [ ] `wrongQuestions` ist auf 300 Einträge begrenzt.
- [ ] `customQuizzes` ist auf 100 Einträge begrenzt.
- [ ] Lobby-/Duel-Schreibzugriffe bleiben bis zu einem neuen serverautoritativen Modell gesperrt.
- [ ] Browser-Admin-Claims geben keinen Zugriff auf Antwortschlüssel oder Rate-Limit-Interna.

Die Admin SDK in Cloud Functions umgeht Clientregeln. Deshalb müssen Function-Eingaben separat validiert bleiben.

## 9. Lernset-Bibliothek

- [ ] JSON-, CSV- und TSV-Import getestet.
- [ ] Bibliothekslimits bestätigt: 100 Lernsets, 500 Fragen, 700.000 serialisierte Bytes.
- [ ] doppelte IDs werden stabil normalisiert.
- [ ] manuelles Erstellen und Bearbeiten funktioniert.
- [ ] geänderte Frage verwirft alten SRS-Status.
- [ ] fällige Teilsets schreiben SRS zurück in das Originaldeck.
- [ ] ungewertete Probeprüfung vergibt keine Ranglistenpunkte.
- [ ] Cloud-/lokaler Merge verursacht keinen Datenverlust.

## 10. Kontodaten, Export und Löschung

- [ ] JSON-Datenexport funktioniert.
- [ ] `answerKey` bleibt aus dem Export redigiert.
- [ ] lokale persönliche Lernanalyse wird erst im Browser in den Download ergänzt und nicht dafür hochgeladen.
- [ ] Kontolöschung verlangt App Check.
- [ ] zu alte Auth-Sitzung verlangt Neuauthentifizierung.
- [ ] Firestore-, Ranglisten-, Quiz- und Auth-Daten werden gelöscht.
- [ ] lokale Stats, Besitzer-Marker, Lernplan, Analyse und `sessionStorage` werden entfernt.

## 11. TTL und Datenaufbewahrung

- [ ] TTL für `quizSessions.expiresAt` aktiviert.
- [ ] weitere serverseitige Ablauf-/Rate-Limit-Daten auf benötigte Aufbewahrung geprüft.
- [ ] Log-, Session- und Supportfristen technisch und rechtlich bestätigt.
- [ ] Exportgrenze von 500 Dokumenten pro zugeordneter Sammlung für den erwarteten Betrieb bewertet.

## 12. Frontend-Abhängigkeiten und Lockfile

Aktueller Release-Blocker:

`wissenpur/package-lock.json` stammt im Root-Eintrag noch aus der früheren Demo-Abhängigkeitsstruktur und löst direkte aktuelle Pakete wie `@types/react` und `@types/react-dom` nicht vollständig auf.

Sobald Registry-Zugriff verfügbar ist:

```bash
cd wissenpur
rm -rf node_modules package-lock.json
npm install --no-audit --no-fund
npm run lint
npm run build
```

Danach:

- [ ] neues `package-lock.json` committen.
- [ ] `npm --prefix functions run check:frontend-lock` läuft grün.
- [ ] GitHub-Frontend-Job wieder auf `npm ci` umstellen.
- [ ] Frontend-Typecheck läuft grün.
- [ ] Produktionsbundle läuft grün.
- [ ] `npm run check:release` mit Produktionsvariablen läuft grün.

Keine Integritäts-Hashes dürfen manuell erfunden werden.

## 13. PWA / Hosting

- [ ] Hosting-Header auf echter Domain geprüft.
- [ ] `index.html` und `sw.js` werden nicht langlebig gecacht.
- [ ] Offline-Fallback funktioniert nach Erstbesuch.
- [ ] Service Worker aktualisiert sauber.
- [ ] PNG-/Apple-Touch-Icons ergänzt.
- [ ] Installation auf realem iOS und Android getestet.
- [ ] Hosting-Rollback praktisch getestet.

## 14. Monitoring und Kosten

- [ ] Cloud Logging und Error Reporting geprüft.
- [ ] Budgetwarnungen eingerichtet.
- [ ] Firestore-/Functions-/AI-Quotas dokumentiert.
- [ ] Missbrauchs- und Kostenalarme haben verantwortliche Empfänger.
- [ ] Aufbewahrungsfristen für Logs bestätigt.

## 15. Datenschutz / Recht

- [ ] echte Betreiberangaben eingetragen.
- [ ] Datenschutz- und Supportkontakt eingetragen.
- [ ] Datenschutzerklärung rechtlich geprüft.
- [ ] Impressum rechtlich geprüft.
- [ ] Nutzungsbedingungen geprüft.
- [ ] Mindestalter/Einwilligungsmodell festgelegt.
- [ ] Speicherdauern bestätigt.
- [ ] lokale Analyse, Gastdatenmigration und clientseitige Exportergänzung transparent beschrieben.

## 16. End-to-End-Abnahme

Mindestens diese Szenarien müssen auf Staging/Produktion getestet werden:

1. Gast erstellt Lernset → Login → Lernset bleibt, Gast-Economy nicht.
2. bestehendes Konto + lokale Offline-Sets → Login → Union ohne Datenverlust.
3. Logout während langsamer Economy-Hydrierung → keine alten Daten erscheinen wieder.
4. Konto A → Konto B → keine Daten von A bei B sichtbar.
5. gewertete Standardprüfung vollständig.
6. Daily Challenge nur einmal gewertet.
7. Blitz-Prüfung mit Timeout.
8. wiederholte Submit-Anfrage idempotent.
9. fehlender/beschädigter Antwort-Snapshot scheitert sicher.
10. Lernset importieren, bearbeiten, SRS lernen und synchronisieren.
11. Datenexport einschließlich lokaler Analyse.
12. vollständige Kontolöschung.
13. Offline-PWA und Wiederverbindung.
14. Hosting-Rollback.

## Freigaberegel

Der Release darf nicht freigegeben werden, solange GitHub Actions keine echten Schritte ausgeführt hat, Frontend-Lockfile und Builds nicht reproduzierbar bestätigt sind, Rules-/Emulator-Tests fehlen oder Produktions-/Rechtskonfiguration unvollständig ist.
