# WissenPur – Produkt- und Release-Roadmap

Stand: August 2026

## Produktziel

WissenPur soll keine weitere allgemeine Quiz-App werden. Das Produkt wird als persönliche Lernzentrale positioniert, die aus eigenen Unterlagen einen konkreten Lernweg erstellt und Lernen, Wiederholen, Prüfen und Fortschrittsanalyse verbindet.

Der besondere WissenPur-Vorteil bleibt das **Wissens-Gehirn**: Lernfortschritt wird nicht nur als Punktestand, sondern als verständliche Karte aus Stärken, Schwächen und fälligen Wiederholungen dargestellt.

## Aktueller Release-Kern

Die Release-Oberfläche bündelt inzwischen:

- servergeprüfte gewertete Prüfungen und Daily-/Blitz-Runden
- serververwaltete Punkte, Münzen, Streaks, Erfolge, Shop und Rangliste
- Lernset-Bibliothek mit JSON-, CSV- und TSV-Import
- manuelles Erstellen und Bearbeiten eigener Lernsets
- SRS-Karteikarten, Fehlertraining und ungewertete Probeprüfungen
- persönlichen Prüfungs-Lernplan
- lokale persönliche Lernanalyse mit Verlauf, Trend und Empfehlungen
- Datenexport und technische Kontolöschung
- installierbare PWA-Grundlage mit committed PNG-/Apple-Touch-Assets

## Sicherheits- und Kontogrenzen

### Gewertete Prüfungen

- Fragen werden serverseitig ausgewählt.
- Der Browser erhält vor der Abgabe keine Lösung und keine Erklärung.
- Jede Sitzung besitzt einen unveränderlichen Antwort-Snapshot.
- Abgabe und Auswertung verwenden ausschließlich diesen Snapshot.
- Der frühere client-vertraute `recordRoundResult`-Pfad ist aus dem aktiven Release entfernt.

### Economy

- Alle authentifizierten Economy-Werte sind serververwaltet.
- Jede neue Auth-Sitzung lädt `getMyEconomyState` über eine App-Check-geschützte Callable Function.
- Der Server normalisiert Tages-/Wochenwerte bei jeder neuen Sitzung.
- Alte oder client-schreibbare Economy-Dokumente werden nicht übernommen, wenn `economyVersion !== 1`.
- Während der Hydrierung zeigt die Web-App keine Gast- oder unbestätigten Punkte an.
- Gewertete Quizstarts, Daily-Rewards, Rangliste und Shop warten auf die sichere Hydrierung.
- Lokale Übungsrunden können bei angemeldeten Nutzern niemals Economy-Werte erhöhen – auch nicht während der Hydrierung.
- Asynchrone Profil-/Economy-Synchronisierung ist an die erwartete Firebase-UID gebunden.
- Verspätete Antworten einer alten Auth-Sitzung werden nach Logout oder Kontowechsel verworfen und dürfen LocalStorage nicht wieder auffüllen.

### Gastdaten und erster Login

Beim ersten Login werden nutzererstellte Lerninhalte erhalten, ohne Gast-Economy zu übernehmen:

- lokale Lernsets werden mit Cloud-Lernsets vereinigt; die aktuelle lokale Fassung gewinnt bei gleicher Deck-ID
- lokale Fehlerfragen werden mit Cloud-Fehlerfragen vereinigt; die lokale Fassung gewinnt bei gleicher Frage-ID
- der Lernplan verwendet seine vorhandene `updatedAt`-Konfliktregel
- lokale Lernanalyse wird beim ersten Login dem neuen Kontokontext zugeordnet
- Konto A → Konto B sowie Konto → Logout/Auth-Verlust löschen kontoabhängige lokale Daten weiterhin strikt

## Release-Prioritäten

### Release 0 – technische Grundlage

- [x] separater Release-Branch
- [x] kaputte Flashcard-Imports reparieren
- [x] zentrale Button-Interaktion korrigieren
- [x] PWA-Metadaten und Service-Worker-Lebenszyklus verbessern
- [x] automatische Frontend-, Functions- und Rules-Prüfungen hinzufügen
- [x] Gemini-Schlüssel aus dem Browser entfernen
- [x] KI-Zugriff auf Firebase AI Logic und App Check umstellen
- [x] gehärtete Firestore-Regeln und serververwaltete Economy
- [x] serverseitiges tägliches Glücksrad, Daily Quest und Shop
- [x] sicheren Ranglisten-Fragenkatalog und unveränderliche Antwort-Snapshots einführen
- [x] komplette Release-Quizoberfläche auf sicheren Start-/Submit-/Reveal-Flow umstellen
- [x] autoritative Economy-Hydrierung für jede neue Auth-Sitzung
- [x] Gast→Login-Migration für Lernsets und Fehlertraining ohne Economy-Übernahme
- [x] Auth-Hydrierung gegen verspätete Antworten nach Logout/Kontowechsel absichern
- [x] Firestore-Profilregeln für Lernplanstruktur, Listenlimits und Zeit-Einstellungen verschärfen
- [x] Package-Lock-Gate für Frontend, Functions und Rules-Tests ergänzen
- [x] Node 22.12.0 / npm 10.9.2 in Hosted-CI reproduzierbar pinnen
- [x] Root-Release-Skripte in die CI-Trigger aufnehmen
- [x] verwendete GitHub Actions auf Commit-SHAs pinnen, Checkout-Credentials nicht persistieren und Action-Allowlist erzwingen
- [x] transaktionalen Helfer zur Erzeugung aller drei Lockfiles hinzufügen
- [ ] alle drei Lockfiles aus den aktuellen Manifesten vollständig regenerieren und committen
- [ ] danach alle drei CI-Installationen gemeinsam auf `npm ci` umstellen
- [ ] GitHub-Actions-Billing/Spending-Limit korrigieren
- [ ] App Check, AI Logic, Functions, Quotas, Budgetwarnungen und Monitoring im Produktionsprojekt aktivieren
- [ ] Firestore-Regeln mit echter Emulator-Ausführung bestätigen
- [ ] vollständige Release-Konfiguration und Datenschutz-/Betreiberangaben eintragen

### Release 1.0 – verlässliche Kern-Lernapp

- [x] Quiz, Daily und Blitz über die serververwaltete Economy
- [x] Karteikarten mit fälligen Wiederholungen
- [x] Lernsets und Bibliothek
- [x] manuelles Erstellen und Bearbeiten eigener Lernsets
- [x] ungewertete Probeprüfung und Fehlertraining
- [x] persönlicher Prüfungs-Lernplan
- [x] Wissensprofil mit Stärken/Schwächen und persönlicher Analyse
- [x] installierbare PWA mit Offline-Grundfunktionen
- [x] 192×192-, 512×512-, maskable-512×512- und Apple-Touch-180×180-PNG-Assets committed und statisch geprüft
- [ ] erfolgreiche echte Frontend-/Functions-Builds aus frischem Checkout
- [ ] erfolgreiche Firestore-Emulator-Suite mit zwei Testkonten
- [ ] echtes Impressum und rechtlich geprüfte Datenschutzerklärung
- [ ] mobile und Desktop-End-to-End-Tests
- [ ] reale Android-/iPhone-Installation, Offline-Erststart und Updatepfad

### Release 1.1 – konkurrenzfähige KI-Lernwerkzeuge

- [ ] PDF-, Bild- und Notizimport
- [ ] Zusammenfassung und Schlüsselbegriffe
- [ ] Karteikarten und Quiz aus derselben Quelle
- [x] ungewertete Probeklausur mit versteckten Lösungen bis zum Ende
- [ ] KI-Tutor, der ausschließlich auf dem Lernset antwortet
- [ ] sichtbare Quellenstellen für KI-Antworten
- [ ] Kontingent- und Kostenkontrolle

### Release 1.2 – persönlicher Lernplan

- [x] Prüfungsdatum und Lernziel
- [x] automatisch berechnete tägliche Einheiten
- [x] Tagesansicht mit fälligen Karten und schwachem Bereich
- [x] lokale Fortschrittsanalyse und Trendberechnung
- [ ] Reminder
- [ ] dynamische Anpassung nach verpassten Einheiten
- [ ] Prüfungsbereitschaft als eigener verständlicher Wert

### Release 2.0 – Social und Multiplayer

- [ ] echte Firestore-Lobbys
- [ ] sichere serverseitige Match-Ergebnisse
- [ ] Reconnect und Abbruchlogik
- [ ] Lerngruppen
- [ ] geteilte Sets
- [ ] Moderation
- [ ] Lehrer- und Klassenmodus

## Automatische Release-Gates

Der Functions-Verifikationspfad prüft unter anderem:

- Repository-Secrets über alle versionierten Textdateien
- Hosting- und Firebase-Konfiguration
- CI-Rechte, Trigger-Abdeckung, Action-Allowlist, Action-SHA-Pins und Checkout-Credential-Grenzen
- Architektur- und Trust-Boundaries
- Frontend-Paketmanifest und freigegebene Toolchain
- **Package-Lock-Konsistenz für Frontend, Functions und Rules-Tests**
- Konto-Isolation und Gast→Login-Regeln
- autoritative Economy-Hydrierung, UI-Maskierung und Auth-Race-Schutz
- unveränderliche Ranglisten-Snapshots
- PWA-/Service-Worker-Laufzeit einschließlich echter PNG-Signaturen und erwarteter Bildmaße
- Functions-Runtime und Produktions-App-Check
- Lernset-Import, Bibliothekslimits und Cloud-Merge
- manuellen Lernset-Editor und SRS-Reset bei Inhaltsänderung
- persönliche Lernanalyse, Export und Löschung
- Legacy-Economy-Migration und kontrollierten Cleanup-Pfad
- Produktions-Preflight, Hosting-Rollback-Plan und Firestore-Migrationsplan
- Fragenkataloggrenzen und Inhaltsqualität
- Unit-Tests und TypeScript

Der Package-Lock-Gate ist derzeit absichtlich rot: `wissenpur/package-lock.json` stammt noch aus der älteren Demo-Struktur, während `functions/package-lock.json` und `rules-tests/package-lock.json` noch fehlen. Alle drei werden erst mit Registry-Zugriff über `node scripts/regenerate-package-locks.mjs` und exakt Node 22.12.0 / npm 10.9.2 neu erzeugt. Integritäts-Hashes werden nicht manuell erfunden.

## Bewusste Abgrenzung

Nicht für Version 1.0:

- offene öffentliche Community ohne Moderation
- Echtgeld-Münzen oder käufliche Ranglistenpunkte
- unlimitierte KI-Generierung
- simulierte Multiplayer-Funktionen, die als echt erscheinen
- neue Spielmodi ohne nachweisbaren Lernnutzen

## Erfolgskennzahlen

- Nutzer schließen ihre erste Lerneinheit ab
- Nutzer kehren am nächsten Tag zurück
- Anteil korrekt beantworteter Wiederholungen steigt
- mindestens ein eigenes Lernset pro aktivem Nutzer
- geringe KI-Kosten pro aktivem Nutzer
- keine clientseitig frei wählbaren Ranglistenwerte
- Gast-Lerninhalte gehen beim ersten Login nicht verloren
- kein Gast-/Legacy-Economy-Wert erscheint als authentifizierter Kontostand
- stabile Build-, Typecheck-, Rules- und End-to-End-Prüfungen
