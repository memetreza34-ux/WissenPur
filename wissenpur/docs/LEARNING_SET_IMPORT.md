# WissenPur Lernset-Import

WissenPur kann eigene Lernsets als JSON, CSV oder TSV importieren und zusätzlich manuell erstellen beziehungsweise bearbeiten. Diese Inhalte sind private Übungsinhalte. Sie vergeben keine Ranglistenpunkte und werden nicht in den serverseitigen Fragenkatalog übernommen.

## Sicherheitsgrenzen

- maximal 1 MB pro Importdatei
- maximal 100 gültige Fragen pro Datei beziehungsweise bestehendem Lernset
- neu manuell angelegte Sets maximal 30 Fragen
- maximal 100 Lernsets in der Bibliothek
- maximal 500 Fragen über die gesamte Bibliothek
- zusätzliches Größenbudget von 700.000 serialisierten Bytes für zuverlässige Firestore-Synchronisierung
- Fragetext maximal 500 Zeichen
- zwei bis sechs eindeutige Antwortoptionen
- Antwortoption maximal 250 Zeichen
- Erklärung maximal 2.000 Zeichen
- Bilder und eingebettetes HTML werden beim Dateiimport nicht übernommen

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

`correctAnswer` ist im JSON-Format nullbasiert. Alternativ darf die korrekte Antwort als Buchstabe oder als exakt übereinstimmender Antworttext angegeben werden.

## CSV-/TSV-Format

Die App stellt im Importfenster eine CSV-Vorlage bereit. Unterstützte Spaltennamen sind Deutsch oder Englisch.

```csv
frage;option1;option2;option3;option4;richtig;erklaerung;kategorie;schwierigkeit
Welche Netzspannung ist üblich?;230 V;24 V;12 V;400 V;1;230 V ist die übliche Nennspannung.;technik;leicht
```

Numerische Lösungen in CSV-Dateien sind einsbasiert. Auch Buchstaben wie `A`, `B`, `C` oder der vollständige Antworttext werden unterstützt. Komma, Semikolon und Tabulator werden als Trennzeichen erkannt.

## Kategorien und Schwierigkeit

Erlaubte Kategorien:

`allgemein`, `geschichte`, `geografie`, `wissenschaft`, `technik`, `sprache`, `deutschland`, `tiere`, `weltall`, `sport`, `kunst`, `musik`, `filme`, `literatur`, `medizin`, `natur`, `wirtschaft`, `politik`, `mythologie`, `videospiele`, `flaggen`

Unbekannte Kategorien werden zu `allgemein` normalisiert.

Unterstützte Schwierigkeitswerte:

- `leicht`
- `mittel`
- `schwer`

## Manueller Editor

Vorhandene Lernsets können geladen und weiterbearbeitet werden. Einzelne Fragen können geändert oder gelöscht werden. Bearbeitbar sind Fragetext, 2–6 Antwortoptionen, richtige Antwort, Erklärung, Kategorie und Schwierigkeit.

Wird der Inhalt einer Frage geändert, wird der bisherige SRS-Status bewusst verworfen. Geänderter Inhalt darf nicht als bereits gelernt gelten.

## Export und Wiederimport

Jedes Lernset kann als `*.wissenpur.json` exportiert werden. Der Export enthält vorhandene SRS-Wiederholungsdaten und kann wieder importiert werden.

## Fällige Karteikarten

Eine neue Karte ist sofort fällig. Nach jeder Bewertung berechnet die SRS-Logik den nächsten Wiederholungstermin. Beim Wiederholen eines Teilsets werden nur geänderte Karten in das ursprüngliche Lernset zurückgeführt; nicht fällige Karten bleiben erhalten.

## Probeprüfung

Aus Lernsets kann eine ungewertete Probeprüfung gestartet werden:

- maximal 20 zufällig gemischte Fragen
- keine Sofortanzeige der richtigen Lösung
- vollständige Auswertung erst nach der letzten Antwort
- keine Punkte, Münzen oder Ranglistenänderung
- falsch beantwortete Fragen werden dem Fehlertraining hinzugefügt

## Cloud-, Offline- und Gast-Synchronisierung

Angemeldete Nutzer synchronisieren ihre Bibliothek über das eigene `users/{uid}`-Dokument. Ohne Anmeldung bleiben Lernsets im Browser.

Beim ersten Wechsel **Gast → Login** werden lokale Lerninhalte nicht verworfen:

1. lokale und Cloud-Bibliothek werden zunächst jeweils normalisiert,
2. Decks mit unterschiedlichen IDs bleiben erhalten,
3. bei derselben Deck-ID gewinnt die aktuelle lokale Fassung,
4. anschließend werden alle globalen Bibliothekslimits erneut angewendet.

Gespeicherte Fehlerfragen verwenden dieselbe Grundidee: lokal und Cloud werden per ID vereinigt, lokal gewinnt bei gleicher ID, ungültige Einträge werden verworfen und maximal 300 Fragen behalten.

Diese Merge-Logik betrifft ausschließlich nutzererstellte Lerninhalte. **Gastpunkte, Münzen, Streaks, Erfolge und Inventar werden nicht übernommen.** Die authentifizierte Economy wird separat vom Backend geladen und normalisiert.

Bei Konto A → Konto B sowie Konto → Logout/Auth-Verlust werden kontoabhängige lokale Daten weiterhin gelöscht.
