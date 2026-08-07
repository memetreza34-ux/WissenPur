# WissenPur – Produkt- und Release-Roadmap

Stand: August 2026

## Produktziel

WissenPur wird als persönliche Lernzentrale aufgebaut, die **Lernen, Wiederholen, Prüfen, Lernplanung und Fortschrittsanalyse** in einer Oberfläche verbindet.

Der zentrale Produktvorteil ist das Wissensprofil: Nutzer sollen nicht nur Punkte sehen, sondern verstehen,

- welche Inhalte fällig sind,
- welche Bereiche schwach oder stark sind,
- wie sich ihre Prüfungsleistung entwickelt,
- und was sie als Nächstes lernen sollten.

## Aktueller Architekturstand

### Release-Oberfläche

Bereits vorhanden:

- Heute
- Lernen
- Bibliothek
- Fortschritt
- Profil
- Rangliste
- Shop
- Fehlertraining
- Daily Challenge
- Blitz-Prüfung
- SRS-Karteikarten
- adaptiver Prüfungs-Lernplan
- persönliche Lernanalyse

### Gewertete Prüfungen

Die frühere client-vertraute Rundenergebnis-Architektur ist **nicht mehr Teil des aktiven Release-Pfads**.

Gewertete Runden verwenden stattdessen:

1. `startRankedQuiz`
   - Backend wählt die Fragen.
   - Browser erhält keine Lösungen.
   - Sitzung erhält einen unveränderlichen Antwort-Snapshot.

2. `submitRankedQuiz`
   - Antworten werden ausschließlich gegen den Sitzungssnapshot geprüft.
   - Sitzung ist nutzergebunden, ablaufbegrenzt und einmal wertbar.
   - Wiederholungsabgaben liefern idempotent das bereits gespeicherte Ergebnis.

3. `revealRankedQuiz`
   - Lösungen und Erklärungen werden erst nach einer gültigen Abgabe freigegeben.

Punkte, Münzen, Streaks, Achievements, Wochenziele und Ranglistenwerte werden serverseitig berechnet.

### Legacy-Economy-Migration

Alte Dokumente waren historisch teilweise client-schreibbar und werden deshalb nicht als vertrauenswürdige Economy-Basis akzeptiert.

`normalizeEconomy()` übernimmt Wirtschaftswerte nur, wenn `economyVersion === 1` gilt. Andernfalls wird ein sauberer serververwalteter Ausgangszustand erzeugt.

Dafür existiert ein eigener Regressionstest.

### Lernset-Bibliothek

Bereits umgesetzt:

- JSON-, CSV- und TSV-Import
- Importvorschau
- deutsche CSV-Vorlage
- deutsche und englische Spaltennamen
- Lösung per Index, Buchstabe oder Antworttext
- Suche
- Fälligkeitsfilter
- JSON-Export
- dauerhaftes Löschen
- vollständige Kartenstapel
- ausschließlich fällige Karten
- ungewertete Probeprüfung
- falsche Probeprüfungsfragen ins Fehlertraining
- Offline-first-Speicherung
- Best-Effort-Cloud-Synchronisierung

Bibliotheksgrenzen:

- maximal 1 MB je Importdatei
- maximal 100 Fragen je Lernset
- maximal 100 Lernsets
- maximal 500 Bibliotheksfragen
- maximal 700.000 serialisierte Bytes

Doppelte oder ungültige Deck- und Frage-IDs werden zentral normalisiert.

### Persönliche Lernanalyse

Bereits umgesetzt:

- lokale Prüfungshistorie ab dieser Release-Version
- maximal 80 kompakte Sitzungen
- keine Antworten oder Fragentexte in der Historie
- automatische Erkennung neuer serverbestätigter Runden
- Schutz gegen falsche Historieneinträge während Cloud-Hydrierung
- gewichteter Vergleich letzte 5 gegen vorherige 5 Prüfungen
- stärkster und schwächster Wissensbereich
- Tagesempfehlung
- Priorisierung fälliger SRS-Karten

Die Analyse ist lokal und gerätegebunden. Sie beeinflusst keine Economy- oder Ranglistenwerte.

### Konto- und Datenschutzgrenzen

Bereits umgesetzt:

- lokaler Statistikzustand besitzt einen Kontobesitzer
- Lernplan ist kontogebunden
- Konto- und Authwechsel verwerfen lokalen Kontokontext
- komplette Produktoberfläche wird bei Kontowechsel neu gemountet
- komplette Produktoberfläche wird **erst nach aufgelöstem Firebase-Auth-State** gerendert
- serverseitiger JSON-Datenexport
- vollständige Kontolöschung
- Reauth-Pflicht vor Löschung

### KI

Bereits umgesetzt:

- kein direkter Gemini-API-Schlüssel im Browser
- kein direktes Gemini-SDK als Frontend-Abhängigkeit
- Firebase AI Logic vorbereitet
- App Check vorbereitet
- KI-Ausgaben werden strukturell validiert
- KI-Lernsets bleiben ungewertete Übungsinhalte

### Firestore und Functions

Bereits umgesetzt:

- Produktion verwendet Firestore `(default)`
- benannte Datenbank außerhalb des Emulators blockiert Functions-Start
- App Check kann außerhalb des Emulators nicht deaktiviert werden
- öffentliche Rangliste liest ausschließlich `trustedLeaderboard`
- Browser kann keine Quiz-Sitzungen, Rate-Limits oder vertrauenswürdigen Ranglistenwerte schreiben
- alte Lobbys und Duelle bleiben admin-only bis zur Bereinigung

### PWA und Hosting

Bereits umgesetzt:

- PWA-Manifest
- Service Worker
- Network-first für Navigation
- sicherer Offline-Fallback
- stale-while-revalidate für statische Ressourcen
- Cache-Versionierung
- Service-Worker-Registrierung ohne Inline-JavaScript
- Security-Header
- `index.html` und `sw.js` ohne langlebigen Cache

## Automatische Release-Prüfungen

Der verpflichtende Functions-Verifikationspfad kontrolliert:

1. Repository-Secrets
2. Hosting- und Firebase-Konfiguration
3. Release-Architektur
4. Frontend-Paketmanifest
5. Konto-Isolation
6. Auth-Hydrierungsgrenze
7. unveränderliche Ranglisten-Snapshots
8. PWA-Runtime
9. Functions-Runtime und App Check
10. Lernset-Import und Export-Roundtrip
11. Bibliothekslimits und ID-Idempotenz
12. Offline-Speicherung und SRS-Persistenz
13. persönliche Lernanalyse und Trendlogik
14. Trennung und Qualität der Fragenkataloge
15. Legacy-Economy-Migration
16. Unit-Tests und TypeScript
17. Firestore-Regeln über die Emulator-Test-Suite

## Release-Prioritäten

### Release 0 – technische Grundlage

- [x] separater Release-Branch
- [x] alter App-Monolith aus aktivem Release-Pfad entfernt
- [x] sichere Ranglisten-Sitzungen
- [x] serververwaltete Economy
- [x] unveränderliche Antwort-Snapshots
- [x] client-vertrauten Ergebnis-Übergangspfad entfernen
- [x] Secret-Scanner
- [x] App-Check-Laufzeitgrenze
- [x] Firestore-Produktionsdatenbank absichern
- [x] Hosting-Security-Header
- [x] PWA-Laufzeit härten
- [x] Konto-Isolation
- [x] Auth-Hydrierung vor Rendering erzwingen
- [x] Firestore-Regeltests anlegen
- [ ] GitHub-Actions-Billing beziehungsweise Spending-Limit korrigieren
- [ ] vollständigen Frontend-Build tatsächlich ausführen
- [ ] vollständigen Functions-Build tatsächlich ausführen
- [ ] Firestore-Emulator-Tests tatsächlich ausführen
- [ ] Frontend-Lockfile neu erzeugen
- [ ] CI wieder auf `npm ci` umstellen

### Release 1.0 – verlässliche Kern-Lernapp

- [x] servergeprüfte Standard-, Daily- und Blitz-Runden
- [x] Fehlertraining
- [x] SRS-Karteikarten
- [x] Lernset-Bibliothek
- [x] JSON-/CSV-/TSV-Import
- [x] Probeprüfung ohne Sofortlösungen
- [x] adaptiver Prüfungs-Lernplan
- [x] persönliche Lernanalyse
- [x] Stärken-/Schwächenansicht
- [x] Tagesempfehlung
- [x] installierbare PWA-Grundlage
- [ ] echte Produktions-Firebase-Konfiguration
- [ ] App Check im Zielprojekt aktivieren und verifizieren
- [ ] AI Logic im Zielprojekt verifizieren
- [ ] Firestore-Daten kontrolliert nach `(default)` migrieren
- [ ] alte Lobby-/Duel-Daten bereinigen
- [ ] Quotas, Budgetwarnungen und Monitoring aktivieren
- [ ] echte Betreiberangaben eintragen
- [ ] rechtliche Freigabe bestätigen
- [ ] mobile und Desktop-End-to-End-Tests
- [ ] Hosting-Rollback testen
- [ ] PNG-/Apple-Touch-PWA-Icons ergänzen

### Release 1.1 – Materialimport und KI-Lernwerkzeuge

- [ ] PDF-Import
- [ ] Bild- und Scanimport
- [ ] Notizimport
- [ ] Zusammenfassung
- [ ] Schlüsselbegriffe
- [ ] mehrere Lernprodukte aus derselben Quelle
- [ ] KI-Tutor, der auf das konkrete Lernset begrenzt ist
- [ ] nachvollziehbare Quellenstellen für KI-Antworten
- [ ] Kosten- und Nutzungskontingente

### Release 1.2 – stärkere Lernplanung

- [x] Prüfungsdatum und Lernziel
- [x] tägliche Lernzeit
- [x] Wochenrhythmus
- [x] Tagesaufgaben
- [ ] Zielnote
- [ ] dynamische Neuplanung nach verpassten Einheiten
- [ ] Reminder
- [ ] geräteübergreifende Analysehistorie mit eigenem Datenschutzvertrag
- [ ] Prüfungsbereitschaft als transparenter, erklärbarer Wert

### Release 2.0 – Social und Multiplayer

Erst nach neuem serverautoritativen Modell:

- [ ] private Lerngruppen
- [ ] gemeinsame Quizze
- [ ] sichere Duelle
- [ ] Reconnect- und Abbruchlogik
- [ ] geteilte Lernsets
- [ ] Moderation und Meldesystem
- [ ] Lehrer- und Klassenmodus

## Bewusste Abgrenzung

Nicht für Version 1.0:

- offene öffentliche Community ohne Moderation
- Echtgeld-Münzen
- käufliche Ranglistenpunkte
- unlimitierte KI-Generierung
- simulierte Multiplayer-Funktionen, die als echt erscheinen
- neue Spielmodi ohne klaren Lernnutzen

## Aktuelle externe Blocker

GitHub Actions erzeugt für jeden neuen Head weiterhin drei Jobs, startet aber keinen Runner. Die aktuelle GitHub-Annotation lautet sinngemäß:

- letzte Kontozahlungen fehlgeschlagen oder
- Actions-Spending-Limit muss erhöht werden

Die Jobs enden daher mit `failure`, obwohl keine Build- oder Testschritte ausgeführt werden.

Bis dieses externe Problem gelöst ist, darf kein fehlgeschlagener Actions-Lauf als tatsächlicher Codefehler interpretiert werden. Umgekehrt darf auch **kein Build als erfolgreich behauptet werden**, solange kein Runner die Schritte wirklich ausgeführt hat.

## Freigabekriterium

Der Draft-PR darf erst auf **Ready for review** gesetzt werden, wenn mindestens:

- alle CI-Jobs tatsächlich ausgeführt und erfolgreich sind,
- Frontend- und Functions-Lockfiles reproduzierbar sind,
- Firebase im Zielprojekt getestet ist,
- Firestore-Regeln und Callables im Emulator bestanden haben,
- keine technischen Release-Gates mehr offen sind,
- Rechtstexte und Betreiberangaben vollständig sind,
- ein realer End-to-End-Smoke-Test erfolgreich durchgeführt wurde.
