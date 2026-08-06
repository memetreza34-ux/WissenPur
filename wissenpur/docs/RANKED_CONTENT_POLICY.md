# WissenPur – Richtlinie für gewertete Fragen

Stand: August 2026

## Ziel

Gewertete Prüfungsfragen beeinflussen Punkte, Serien, Erfolge und die öffentliche Rangliste. Sie müssen deshalb stabiler, eindeutiger und strenger geprüft werden als KI-generierte oder private Übungsfragen.

Der vollständige Ranglistenkatalog liegt ausschließlich unter:

```text
functions/content/rankedQuestions.ts
```

Der Browser erhält diesen Katalog und seine Lösungsschlüssel nicht.

## Automatische Release-Prüfung

Beim Functions-Build führt `scripts/sync-question-bank.ts` folgende Schritte aus:

1. doppelte Fragen-IDs erkennen
2. zeitabhängige Fragen ausschließen
3. inhaltlich gleiche Fragen anhand normalisierten Fragetexts zusammenführen
4. genau vier nichtleere und unterschiedliche Antwortoptionen verlangen
5. Lösungsindex gegen die Optionen prüfen
6. externe Bild-URLs aus dem gewerteten Katalog entfernen
7. Mindestanzahl sicherer Fragen insgesamt prüfen
8. Mindestanzahl sicherer Fragen je Kategorie prüfen
9. Ausschlüsse und Kategorieabdeckung im Buildprotokoll ausgeben
10. erst danach den serverseitigen Katalog erzeugen

## Zeitabhängige Inhalte

Folgende Formen werden derzeit automatisch aus gewerteten Releases ausgeschlossen:

- „aktuell“, „derzeit“, „zurzeit“, „momentan“, „gegenwärtig“ oder „heute“
- Formulierungen wie „Stand 2023“
- aktuelle Weltranglisten
- veränderliche Rekordhalter
- amtierende Präsidenten, Regierungschefs oder andere aktuelle Amtsinhaber
- „meiste Einwohner“, „meiste Muttersprachler“ oder „meiste Monde“
- ähnliche Fragen, deren richtige Antwort sich ohne Änderung des historischen Ereignisses ändern kann

Solche Inhalte können weiterhin als zeitgestempelte Übung vorkommen, dürfen aber nicht automatisch Punkte in der dauerhaften Rangliste vergeben.

## Historische Aussagen

Ein konkretes abgeschlossenes Ereignis bleibt zulässig, zum Beispiel:

- „Welches Land gewann die Fußball-Weltmeisterschaft 2014?“
- „Wer war der erste Präsident der USA?“
- „Wann fiel die Berliner Mauer?“

Entscheidend ist, dass die richtige Antwort nicht durch spätere Entwicklungen wechseln kann.

## Duplikate

Für die Duplikaterkennung werden Fragetexte:

- Unicode-normalisiert
- kleingeschrieben
- von Satzzeichen bereinigt
- auf einfache Leerzeichen reduziert

Dadurch gelten zum Beispiel diese Texte als dieselbe Frage:

```text
Wie viele Minuten hat eine Stunde?
WIE VIELE Minuten hat eine Stunde!!!
```

Die zuerst vorkommende stabile ID bleibt erhalten. Spätere Duplikate werden mit `duplicateOf=<ID>` im Buildprotokoll ausgewiesen.

## Antwortqualität

Jede gewertete Frage benötigt:

- genau vier Optionen
- vier unterschiedliche Optionen
- genau einen gültigen Lösungsindex von 0 bis 3
- eine sachliche Erklärung
- eine stabile ID
- eine bekannte Kategorie

Nicht zulässig sind:

- zwei gleichwertig richtige Antworten
- uneindeutige Formulierungen
- Meinungsfragen
- Fangfragen ohne Lernwert
- Lösungen, die nur wegen einer ungenannten Annahme gelten
- externe Bilder, deren Inhalt nachträglich geändert werden kann

## Abdeckung

Der Build verlangt derzeit mindestens:

```text
100 release-sichere Fragen insgesamt
5 release-sichere Fragen pro vorhandener Kategorie
```

Unterschreitet eine Kategorie den Mindestwert, schlägt der Build fehl. Dadurch kann eine Kategorie nicht sichtbar bleiben, obwohl sie im Backend kaum oder keine sicheren Fragen enthält.

Diese Mindestwerte sind eine technische Untergrenze und kein Qualitätsziel. Vor einem größeren öffentlichen Release sollte jede Hauptkategorie deutlich mehr geprüfte Fragen besitzen.

## Bilder und Flaggen

Gewertete Fragen sind aktuell bewusst textbasiert. Der erzeugte Serverkatalog setzt `imageUrl` immer auf `null`.

Gründe:

- keine versteckten Drittanbieteranfragen
- keine veränderlichen externen Dateien
- keine Trackingpixel
- deterministische Sitzungs-Snapshots
- identische Darstellung während der gesamten Prüfungsdauer

Flaggenfragen können in ungewerteten KI-Lernsets als Unicode-Flaggenemoji erscheinen. Eine spätere gewertete Bildfunktion benötigt eigene, versionierte und lokal gehostete Assets mit Prüfsumme.

## Manuelle redaktionelle Prüfung

Die automatische Prüfung ersetzt keine Fachredaktion. Vor Freigabe einer neuen Fragenserie müssen mindestens geprüft werden:

- fachliche Richtigkeit
- Aktualität der Erklärung
- Eindeutigkeit der Antwort
- angemessener Schwierigkeitsgrad
- Sprache und Barrierefreiheit
- mögliche kulturelle oder politische Verzerrungen
- Quellenlage bei nichttrivialen Fakten

## Änderungen am Katalog

Bei jeder Katalogänderung müssen erfolgreich laufen:

```bash
npm --prefix functions run check:content
npm --prefix functions run sync:questions
npm --prefix functions test
npm --prefix functions run typecheck
```

Laufende neue Quiz-Sitzungen speichern einen unveränderlichen Antwort-Snapshot. Dadurch bleibt ihre Auswertung auch dann konsistent, wenn danach ein neuer Katalog deployed wird.

## Offene redaktionelle Aufgabe

Der vorhandene Altbestand enthält zahlreiche automatisch erzeugte oder historisch gewachsene Fragen. Die Buildfilter verhindern, dass klar volatile oder doppelte Inhalte neu in den Ranglistenbuild gelangen. Vor dem öffentlichen Release muss der verbleibende erzeugte Bericht dennoch vollständig redaktionell geprüft werden.
