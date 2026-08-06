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
- eigene Lernsets und gespeicherte Fehlerfragen, soweit sie im Nutzerdokument liegen
- Ranglisteneintrag
- eigene Quiz-Sitzungen und Rundennachweise
- selbst erstellte Alt-Lobbys sowie zuordenbare Alt-Duelle

Firestore-Zeitstempel werden als ISO-Datum ausgegeben. Pro zugeordneter Sammlung werden höchstens 500 Dokumente exportiert. Dieser Grenzwert muss vor einem größeren öffentlichen Betrieb durch paginierten Export oder einen Supportprozess ersetzt werden.

### Kontolöschung

`deleteMyAccount` löscht:

- `users/{uid}`
- `leaderboard/{uid}`
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
