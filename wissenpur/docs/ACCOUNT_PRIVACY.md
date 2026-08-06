# WissenPur – Kontodaten, Export und Löschung

Stand: August 2026

## Technische Selbstbedienung

Angemeldete Nutzer finden in der Release-App die Schaltfläche **Daten**. Dort stehen zwei serverseitig geschützte Aktionen zur Verfügung.

### Datenexport

`exportMyData` erzeugt eine JSON-Datei mit:

- Firebase-Konto-ID
- E-Mail-Adresse, Verifizierungsstatus und Login-Anbieter
- Nutzerprofil und Einstellungen
- Lernfortschritt, Punkte, Münzen, Streaks und Erfolge
- eigene Lernsets, Lernplan und gespeicherte Fehlerfragen, soweit sie im Nutzerdokument liegen
- serververifiziertem Ranglisteneintrag aus `trustedLeaderboard`
- gegebenenfalls historischem Alt-Ranglisteneintrag, klar getrennt vom verifizierten Eintrag
- eigenen Quiz-Sitzungen und öffentlichen Rundenergebnissen
- serverseitigem Quizstart-Limit des eigenen Kontos
- selbst erstellten Alt-Lobbys sowie zuordenbaren Alt-Duellen

#### Sicherheitsredaktion

Der serverinterne `answerKey` einer Quiz-Sitzung wird niemals exportiert. Das gilt auch für eine aktuell laufende Runde. Der Export enthält dafür einen maschinenlesbaren Redaktionshinweis:

```json
{
  "redactions": {
    "quizSessionAnswerKeys": "excluded-security-secret"
  }
}
```

Der Lösungsschlüssel ist kein vom Nutzer bereitgestelltes Kontodatum, sondern ein vertrauliches Prüfungsgeheimnis. Nach einer erfolgreichen Abgabe liefert der geschützte Auswertungsendpunkt die für die persönliche Auswertung notwendigen richtigen Antworten und Erklärungen.

Firestore-Zeitstempel werden als ISO-Datum ausgegeben. Pro zugeordneter Sammlung werden höchstens 500 Dokumente exportiert. Dieser Grenzwert muss vor einem größeren öffentlichen Betrieb durch paginierten Export oder einen Supportprozess ersetzt werden.

### Kontolöschung

`deleteMyAccount` löscht:

- `users/{uid}`
- `trustedLeaderboard/{uid}`
- den historischen Eintrag `leaderboard/{uid}`, falls vorhanden
- `serverRateLimits/{uid}`
- Quiz-Sitzungen des Nutzers
- Rundennachweise des Nutzers
- selbst erstellte Alt-Lobbys
- zuordenbare Alt-Duelle
- anschließend den Firebase-Authentication-Nutzer

Die Löschung verlangt:

1. ein angemeldetes Konto,
2. ein gültiges App-Check-Token,
3. eine Anmeldung, die höchstens zehn Minuten zurückliegt,
4. die sichtbare Bestätigung `LÖSCHEN` in der Oberfläche.

Ist die Anmeldung zu alt, öffnet die Web-App für das derzeit ausschließlich unterstützte Google-Konto eine Neuauthentifizierung. Nach erfolgreicher Bestätigung wird das ID-Token erneuert und die Löschanfrage genau einmal wiederholt.

Die Löschung ist wiederholbar ausgelegt. Wird ein Versuch nach der Firestore-Löschung unterbrochen, kann die Aktion erneut gestartet werden, um den Authentication-Eintrag zu entfernen.

## Nicht automatisch auffindbare Alt-Daten

Alte Lobbydokumente könnten Nutzer-IDs ausschließlich innerhalb verschachtelter Spielerobjekte enthalten. Solche nicht indexierbaren Alt-Daten können nicht zuverlässig über eine UID-Abfrage gefunden werden. Vor dem öffentlichen Release sind deshalb entweder:

- alle alten Lobby- und Duel-Sammlungen zu löschen, oder
- eine einmalige Admin-Migration mit vollständigem Collection-Scan auszuführen.

Neue Multiplayer-Daten dürfen erst wieder geschrieben werden, wenn ein klar löschbares und serververwaltetes Datenmodell vorhanden ist.

## Noch notwendige rechtliche Arbeiten

Die technische Export- und Löschfunktion ersetzt keine Rechtsprüfung. Vor Veröffentlichung müssen mindestens ergänzt beziehungsweise geprüft werden:

- vollständige Datenschutzerklärung mit Verantwortlichem und Kontakt
- Impressum mit echten Betreiberangaben
- Rechtsgrundlagen und Speicherdauern
- Firebase-, Google-Login-, Firebase-AI-Logic-, reCAPTCHA-Enterprise- und Hosting-Hinweise
- Verarbeitung außerhalb der EU beziehungsweise eingesetzte Garantien
- Verfahren für Auskunft, Berichtigung, Widerspruch und Beschwerden
- Löschfristen für Logs, Backups und Supportdaten
- Altersgrenze und Einwilligungsprozess, falls Minderjährige Zielgruppe sind

Ohne diese Angaben darf WissenPur nicht als rechtlich vollständig veröffentlichungsbereit bezeichnet werden.
