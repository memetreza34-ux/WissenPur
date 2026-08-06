# WissenPur – Produkt- und Release-Roadmap

Stand: August 2026

## Produktziel

WissenPur soll keine weitere allgemeine Quiz-App werden. Das Produkt wird als persönliche Lernzentrale positioniert, die aus eigenen Unterlagen einen konkreten Lernweg erstellt und Lernen, Wiederholen, Prüfen und Fortschrittsanalyse verbindet.

Der besondere WissenPur-Vorteil bleibt das **Wissens-Gehirn**: Lernfortschritt wird nicht nur als Punktestand, sondern als verständliche Karte aus Stärken, Schwächen und fälligen Wiederholungen dargestellt.

## Konkurrenzmuster

### Quizlet

Starke Muster:

- Dokumente, Notizen und PDFs in Karteikarten, Study Guides und Probeklausuren umwandeln
- verschiedene Lernprodukte aus derselben Quelle erzeugen
- anpassbare Schwierigkeit, Dauer und Fragetypen
- KI-Erklärungen statt nur richtiger oder falscher Antwort

### StudySmarter

Starke Muster:

- Lernplan aus Prüfungsdatum und Lernziel
- ein gemeinsamer Bereich für Dokumente, Notizen, Karteikarten und Quizze
- Erinnerungen, Tagesziele und Lernstatistik
- Spaced Repetition und verschiedene Abfragemodi
- Lernsets mit Unterordnern, Tags und Freigabe

### Knowunity

Starke Muster:

- KI-Lernbegleiter als zentraler Einstieg
- personalisierte Lernpläne, Zusammenfassungen, Quizze und Probeklausuren
- Antworten auf Fragen mit nachvollziehbaren Erklärungen
- große, durchsuchbare Themen- und Materialstruktur

### Kahoot

Starke Muster:

- klare Lernfolge: Karteikarten → Lernen → Test
- Prüfungsmodus ohne sofort eingeblendete Lösungen
- Wiederholung verpasster Fragen
- Lerngruppen und gemeinsam nutzbare Sets
- unterbrochene Sitzungen fortsetzen

## Zielstruktur der App

### 1. Heute

Die Startseite soll eine eindeutige nächste Handlung zeigen:

- heutige Wiederholungen
- nächste Prüfung und verbleibende Tage
- empfohlene 10- oder 20-Minuten-Lerneinheit
- fällige Karteikarten
- schwächster Wissensbereich
- aktuelle Serie und Wochenziel

### 2. Lernen

Ein Lernset kann in mehreren Modi verwendet werden:

- Karteikarten
- adaptives Quiz
- Prüfungsmodus
- Fehlertraining
- Schnellwiederholung
- mündliche Abfrage
- Wahr/Falsch
- Lückentext
- Zuordnung

### 3. Erstellen und Importieren

Nutzer können Lernmaterial erstellen aus:

- Thema oder Texteingabe
- PDF
- Foto oder Scan
- Notizen
- später: Webseite und Video-Transkript

Aus einem Import werden erzeugt:

- Zusammenfassung
- Schlüsselbegriffe
- Karteikarten
- Quizfragen
- Probeklausur
- Lernplan

### 4. Bibliothek

- Fächer
- Lernsets
- Unterordner
- Tags
- Suche und Filter
- Favoriten
- archivierte Sets
- eigene und geteilte Sets

### 5. Fortschritt

- Wissens-Gehirn
- Beherrschung pro Thema
- fällige Wiederholungen
- Zeitaufwand
- Genauigkeit
- Fehlerarten
- Prüfungsbereitschaft
- Verlauf über Tage und Wochen

### 6. Gemeinsam lernen

Erst nach sicherem Backend:

- private Lerngruppen
- gemeinsames Quiz
- Duelle
- Klassen- und Lehreransicht
- geteilte Lernsets
- Moderation und Meldefunktion

## Release-Prioritäten

### Release 0 – technische Grundlage

- [x] separater Release-Branch
- [x] kaputte Flashcard-Imports reparieren
- [x] zentrale Button-Interaktion korrigieren
- [x] PWA-Metadaten und Icon reparieren
- [x] Service-Worker-Lebenszyklus verbessern
- [x] automatische Typecheck- und Build-Prüfung hinzufügen
- [ ] Gemini-Schlüssel aus dem Browser entfernen
- [ ] serverseitige KI-Funktion mit Authentifizierung und Rate-Limit
- [ ] serverseitige Punkte, Münzen und Belohnungen
- [ ] sichere Firestore-Regeln
- [ ] Cloud-Spielstand vor lokaler Synchronisierung laden
- [ ] Fehlerüberwachung und Datenschutzkonzept

### Release 1.0 – verlässliche Kern-Lernapp

- [ ] stabiles Login und Gerätesynchronisierung
- [ ] Quiz, Daily, Blitz und Fehlertraining
- [ ] vollständige Karteikarten mit fälligen Wiederholungen
- [ ] Lernsets und Bibliothek
- [ ] Wissens-Gehirn und Fortschrittsübersicht
- [ ] eigene manuelle Quizze
- [ ] echtes Impressum und vollständige Datenschutzerklärung
- [ ] installierbare PWA mit Offline-Grundfunktionen
- [ ] mobile und Desktop-End-to-End-Tests

### Release 1.1 – konkurrenzfähige KI-Lernwerkzeuge

- [ ] PDF-, Bild- und Notizimport
- [ ] Zusammenfassung und Schlüsselbegriffe
- [ ] Karteikarten und Quiz aus derselben Quelle
- [ ] Probeklausur mit Zeitlimit und versteckten Lösungen
- [ ] KI-Tutor, der ausschließlich auf dem Lernset antwortet
- [ ] sichtbare Quellenstellen für KI-Antworten
- [ ] Kontingent- und Kostenkontrolle

### Release 1.2 – persönlicher Lernplan

- [ ] Prüfungsdatum und Zielnote
- [ ] automatisch berechnete tägliche Einheiten
- [ ] Tagesansicht mit fälligen Aufgaben
- [ ] Reminder
- [ ] dynamische Anpassung nach verpassten Einheiten
- [ ] Prüfungsbereitschaft als verständlicher Wert

### Release 2.0 – Social und Multiplayer

- [ ] echte Firestore-Lobbys
- [ ] sichere serverseitige Match-Ergebnisse
- [ ] Reconnect und Abbruchlogik
- [ ] Lerngruppen
- [ ] geteilte Sets
- [ ] Moderation
- [ ] Lehrer- und Klassenmodus

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
- keine clientseitig manipulierbaren Ranglistenwerte
- stabile Build-, Typecheck- und End-to-End-Prüfungen
