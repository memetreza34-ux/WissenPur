# WissenPur Lernset-Import

WissenPur kann eigene Lernsets als JSON, CSV oder TSV importieren. Importierte Inhalte sind private Übungsinhalte. Sie vergeben keine Ranglistenpunkte und werden nicht in den serverseitigen Fragenkatalog übernommen.

## Sicherheitsgrenzen

- maximal 1 MB pro Importdatei
- maximal 100 gültige Fragen pro Datei
- maximal 100 Lernsets in der Bibliothek
- maximal 500 Fragen über die gesamte Bibliothek
- zusätzliches Größenbudget von 700.000 serialisierten Bytes für zuverlässige Firestore-Synchronisierung
- Fragetext maximal 500 Zeichen
- zwei bis sechs eindeutige Antwortoptionen
- Antwortoption maximal 250 Zeichen
- Erklärung maximal 2.000 Zeichen
- Bilder und eingebettetes HTML werden nicht importiert

Ungültige oder unvollständige Zeilen werden übersprungen. Wenn keine gültige Frage übrig bleibt, wird der gesamte Import abgelehnt.

## JSON-Format

```json
{
  "title": "Elektrotechnik AP1",
  "questions": [
    {
      "question": "Welche Einheit hat die elektrische Spannung?",
      "options": ["Volt", "Ampere", "Ohm", "Watt"],
      "correctAnswer": 0,
      "explanation": "Die elektrische Spannung wird in Volt angegeben.",
      "category": "technik",
      "difficulty": "leicht"
    }
  ]
}
```

`correctAnswer` ist im JSON-Format nullbasiert:

- `0` = erste Antwort
- `1` = zweite Antwort
- `2` = dritte Antwort

Alternativ darf die korrekte Antwort als Buchstabe oder als exakt übereinstimmender Antworttext angegeben werden.

## CSV-Format

Die App stellt im Importfenster eine CSV-Vorlage bereit. Unterstützte Spaltennamen sind Deutsch oder Englisch.

```csv
frage;option1;option2;option3;option4;richtig;erklaerung;kategorie;schwierigkeit
Welche Netzspannung ist üblich?;230 V;24 V;12 V;400 V;1;230 V ist die übliche Nennspannung.;technik;leicht
```

Numerische Lösungen in CSV-Dateien sind benutzerfreundlich einsbasiert:

- `1` = erste Antwort
- `2` = zweite Antwort
- `3` = dritte Antwort

Auch Buchstaben wie `A`, `B`, `C` oder der vollständige Antworttext werden unterstützt. Komma, Semikolon und Tabulator werden als Trennzeichen erkannt. Felder mit Trennzeichen können in doppelte Anführungszeichen gesetzt werden.

## Kategorien

Erlaubte Kategorien:

`allgemein`, `geschichte`, `geografie`, `wissenschaft`, `technik`, `sprache`, `deutschland`, `tiere`, `weltall`, `sport`, `kunst`, `musik`, `filme`, `literatur`, `medizin`, `natur`, `wirtschaft`, `politik`, `mythologie`, `videospiele`, `flaggen`

Unbekannte Kategorien werden zu `allgemein` normalisiert.

## Schwierigkeit

Unterstützt werden:

- `leicht`
- `mittel`
- `schwer`

Andere Werte werden ignoriert.

## Export und Wiederimport

Jedes Lernset kann aus der erweiterten Bibliothek als `*.wissenpur.json` exportiert werden. Der Export enthält auch vorhandene SRS-Wiederholungsdaten und kann wieder importiert werden.

## Fällige Karteikarten

Eine neue Karte ist sofort fällig. Nach jeder Bewertung berechnet die bestehende SRS-Logik den nächsten Wiederholungstermin. Der Filter **Fällig** und die rote Anzahl am Bibliotheksbutton zeigen ausschließlich Karten, deren Termin erreicht ist.

Beim Wiederholen eines Teilsets werden nur die geänderten Karten in das ursprüngliche Lernset zurückgeführt. Nicht fällige Karten bleiben erhalten.

## Probeprüfung

Aus jedem Lernset kann eine ungewertete Probeprüfung gestartet werden:

- maximal 20 zufällig gemischte Fragen
- keine Sofortanzeige der richtigen Lösung
- vollständige Auswertung erst nach der letzten Antwort
- keine Punkte, Münzen oder Ranglistenänderung
- falsch beantwortete Fragen werden dem Fehlertraining hinzugefügt

## Cloud-Synchronisierung

Angemeldete Nutzer synchronisieren ihre Bibliothek über das eigene `users/{uid}`-Dokument. Ohne Anmeldung bleiben die Lernsets im aktuellen Browser. Die bestehende Konto-Isolation entfernt lokale Lernsets bei einem Kontowechsel, Logout oder einer vollständigen Kontolöschung.
