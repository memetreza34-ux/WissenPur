# Persönliche Lernanalyse

Die Lernanalyse von WissenPur ist eine **private, lokale Lernhilfe**. Sie ist ausdrücklich getrennt von Economy, Rangliste und serverseitiger Wertung.

## Was gespeichert wird

Pro neu erkannter gewerteter Prüfung wird maximal ein kompakter Verlaufseintrag gespeichert:

- interne Sitzungs-ID
- Abschlusszeitpunkt
- Typ (`ranked` oder zukünftig `mock`)
- kurze Bezeichnung
- Kategorie oder `all` / `daily`
- Anzahl richtiger Antworten
- Anzahl beantworteter Fragen
- daraus berechnete Genauigkeit in Prozent

Es werden **keine** übertragenen Antwortwerte, Frageformulierungen, Erklärungen oder Lösungsschlüssel in der Analysehistorie gespeichert.

## Speicherort

Die Historie liegt ausschließlich im lokalen Browser-Speicher:

- `wissenpur_learning_history_v1`
- `wissenpur_learning_history_owner_v1`

Sie wird nicht in `users/{uid}` geschrieben und nicht für Ranglistenpunkte, Münzen, Streaks, Achievements oder Shop-Bestände verwendet.

## Kontokontext

Die gesamte Produktoberfläche wird erst nach der ersten aufgelösten Firebase-Auth-Sitzung gerendert. Dadurch wird ein bereits angemeldetes Konto während der Start-Hydrierung nicht kurz als anonymer Nutzer behandelt.

Für Wechsel gilt dieselbe zentrale Session-Policy wie für andere lokale Kontodaten:

- erste Auth-Auflösung → vorhandene Daten bleiben erhalten
- Gast → erster Login → lokale Analyse wird dem neuen Konto zugeordnet
- gleiches Konto → Daten bleiben erhalten
- Konto → Logout/Auth-Verlust → Analyse wird gelöscht
- Konto A → Konto B → Analyse von A wird gelöscht

Die Gast→Login-Übernahme betrifft nur diese persönliche lokale Lernhistorie. Sie verändert keine serververwaltete Economy.

## Historiengrenze

Es werden höchstens **80 Sitzungen** behalten. Ältere Einträge werden automatisch abgeschnitten.

Ungültige Einträge werden verworfen. Dazu gehören insbesondere:

- unbekannter Session-Typ
- fehlende oder leere ID
- ungültiger Zeitstempel
- weniger als eine oder mehr als 30 Fragen
- mehr richtige Antworten als Gesamtfragen
- doppelte Session-ID

Die gespeicherte Prozentzahl wird nicht vertraut, sondern immer erneut aus `correct / total` berechnet.

## Erkennung neuer gewerteter Runden

Die Web-App beobachtet nur die serverbestätigten kumulierten Economy-Werte.

Eine neue Verlaufssitzung wird nur erzeugt, wenn zwischen zwei Snapshots exakt gilt:

- `roundsPlayed` steigt um genau 1
- `totalQuestionsAnswered` steigt um 1 bis 30
- `correctAnswers` steigt um einen Wert zwischen 0 und der Zahl neuer Fragen

Mehrere nachgeladene Altrunden erzeugen deshalb keine künstlichen Verlaufseinträge.

Nach einem Authwechsel wird zusätzlich eine kurze Hydrierungsphase verwendet, in der nur die Baseline aktualisiert wird. Die Release-Oberfläche zeigt während der eigentlichen Konto-Hydrierung außerdem keine ungeprüfte Gast-Economy an.

## Kategorie-Erkennung

Für eine normale gewertete Kategorie wird geprüft, ob genau ein Eintrag in `categoryStats` gleichzeitig um eine Runde und neue Fragen gestiegen ist.

Wenn keine einzelne Kategorie eindeutig ist, wird die Sitzung als `all` behandelt. Wird gleichzeitig erstmals die aktuelle Daily Challenge bestätigt, wird sie als `daily` gekennzeichnet.

Diese Klassifizierung dient ausschließlich der Anzeige und persönlichen Lernempfehlung.

## Trendberechnung

Der Verlauf verwendet eine gewichtete Trefferquote:

- letzte bis zu 5 Sitzungen = aktueller Wert
- Sitzungen 6 bis 10 = vorheriger Vergleichswert
- Trend = aktueller Wert minus vorheriger Wert in Prozentpunkten

Die Gewichtung erfolgt über die tatsächliche Fragenzahl und nicht über den einfachen Durchschnitt einzelner Prozentwerte.

## Stärken und Schwächen

Das Wissensprofil verwendet die kumulierten `categoryStats` aus dem serververwalteten Economy-Zustand.

Für jede Kategorie wird berechnet:

`accuracy = correctAnswers / totalQuestions`

- schwächster Bereich = niedrigste Trefferquote
- stärkster Bereich = höchste Trefferquote

Bei Gleichstand werden Bereiche mit mehr beantworteten Fragen stärker gewichtet.

## Tagesempfehlung

Die Empfehlung folgt einer festen Priorität:

1. **Fällige SRS-Karten vorhanden** → zuerst wiederholen.
2. **Schwächste Kategorie unter 80 % und mindestens 5 Fragen** → kurze gezielte Runde empfehlen.
3. **Historie vorhanden, aber keine akute Schwäche** → gemischten Wissenscheck empfehlen.
4. **Noch keine neue Historie** → erste gewertete Baseline-Runde empfehlen.

Die Empfehlung löst keine automatische Wertung aus und verändert keine Economy-Daten.

## Datenschutz und Export

Die Historie ist gerätegebunden und kann beim Löschen lokaler Browserdaten verloren gehen.

Beim JSON-Kontoexport lädt die Web-App zunächst den serverseitig geschützten Export und ergänzt anschließend die lokale Analyse **nur im heruntergeladenen Browser-JSON**. Die Analyse wird dafür nicht nach Firestore hochgeladen.

Logout und technische Kontolöschung entfernen die Analysehistorie und ihren Besitzer-Marker explizit.

Falls später geräteübergreifende Analysen eingeführt werden, muss dafür ein eigener Datenvertrag mit klarer Firestore-Regel, Speicherfrist, Export- und Löschlogik erstellt werden. Die aktuelle lokale Historie darf nicht still in bestehende vertrauenswürdige Economy-Felder übernommen werden.
