# WissenPur – Kontodaten, Export und Löschung

Stand: August 2026

## Technische Selbstbedienung

Angemeldete Nutzer finden in der Release-App die Schaltfläche **Daten**. Dort stehen geschützte Export- und Löschfunktionen zur Verfügung.

### Datenexport

`exportMyData` erzeugt serverseitig eine JSON-Grundlage mit:

- Firebase-Konto-ID
- E-Mail-Adresse, Verifizierungsstatus und Login-Anbieter
- Nutzerprofil und Einstellungen
- Lernfortschritt, Punkte, Münzen, Streaks und Erfolge
- eigene Lernsets, Lernplan und gespeicherte Fehlerfragen, soweit sie im Nutzerdokument liegen
- serververifiziertem Ranglisteneintrag aus `trustedLeaderboard`
- gegebenenfalls historischem Alt-Ranglisteneintrag, klar getrennt vom verifizierten Eintrag
- eigenen Quiz-Sitzungen und serverseitigen Rundennachweisen
- serverseitigem Rate-Limit-Dokument des eigenen Kontos
- selbst erstellten Alt-Lobbys sowie zuordenbaren Alt-Duellen

Die Web-App ergänzt anschließend **nur lokal im Browser** die gerätegebundene persönliche Lernanalyse (`localDevice.learningAnalytics`). Diese Historie wird für den Export nicht nach Firestore hochgeladen.

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

Firestore-Zeitstempel werden als ISO-Datum ausgegeben. Pro zugeordneter Sammlung werden höchstens 500 Dokumente exportiert. Für ungewöhnlich große Konten ist deshalb vor einem größeren öffentlichen Betrieb ein paginierter Export oder ein klar definierter Supportprozess erforderlich.

## Browser- und Inhalts-Privacy

WissenPur reduziert vermeidbare Drittanbieterrequests im Lernbetrieb:

- Die Anwendung lädt **keine Google Fonts**. Schrift wird über lokale beziehungsweise systemeigene Schriftstapel dargestellt.
- Nutzerverwaltete Lernsets unterstützen keinen `imageUrl`-Kanal. Manipulierte oder ältere Bild-URLs werden durch die zentrale Bibliotheksrichtlinie entfernt.
- Die veröffentlichten Offline- und Ranked-Fragen dürfen keinen `imageUrl` enthalten, solange kein ausdrücklich freigegebener Same-Origin-Assetpfad existiert.
- Shop-Avatare liegen als versionierte SVG-Dateien unter `/avatars/*.svg` auf demselben Hosting-Origin.
- Frühere externe DiceBear-Avatar-URLs werden bei der serverseitigen Economy-Normalisierung verworfen.
- `trustedLeaderboard.photoURL` darf nur einen freigegebenen lokalen Avatarpfad enthalten. Profilbilder des Login-Anbieters werden nicht in die vertrauenswürdige Rangliste übernommen.
- Die lokalen Shop-Avatare gehören zur Service-Worker-App-Shell und stehen dadurch auch nach erfolgreicher PWA-Installation offline zur Verfügung.

Firebase Auth kann weiterhin eine Provider-`photoURL` im Authobjekt enthalten. WissenPur spiegelt diesen Wert **nicht** als Lernprofilfeld in Firestore und **nicht** in die öffentliche Rangliste. Die Produktions-CSP erlaubt Bilder nur von derselben Origin sowie `data:`/`blob:`. Falls ein externer Providerbild-URL als persönlicher UI-Fallback vorhanden ist, wird dieser durch die Release-CSS ausgeblendet und durch den neutralen lokalen Buchstaben-Fallback ersetzt; dadurch wird das externe Bild im gehärteten Releasepfad nicht als sichtbares Profilbild verwendet.

### Datensparsame Serverlogs

App-eigene Cloud-Functions-Runtime-Logs laufen ausschließlich über den zentralen `privacyLogger.ts`.

Bei unerwarteten Serverfehlern werden nur grobe technische Angaben wie Fehlername und technischer Fehlercode protokolliert. Die Anwendung protokolliert in diesen eigenen Runtime-Logs insbesondere nicht:

- Firebase-UID
- Quiz-Session-ID
- E-Mail-Adresse
- Fragentexte oder Antworten
- vollständige Request-Payloads

Direkte `logger.*`- oder `console.*`-Runtime-Logs außerhalb des zentralen Privacy-Loggers sind durch einen Release-Gate verboten.

## Gastdaten beim ersten Login

WissenPur trennt **Lerninhalte** und **Economy** bewusst voneinander.

Beim ersten Wechsel vom Gastmodus in ein angemeldetes Konto bleiben nutzererstellte Lerninhalte erhalten:

- lokale Lernsets werden mit vorhandenen Cloud-Lernsets vereinigt
- bei identischer Deck-ID gewinnt die aktuelle lokale Fassung
- lokale Fehlerfragen werden mit Cloud-Fehlerfragen vereinigt; bei gleicher ID gewinnt lokal
- der Lernplan verwendet seine Zeitstempel-Konfliktregel
- die lokale Lernanalyse wird dem neuen Kontokontext zugeordnet

Gastpunkte, Gastmünzen, Gaststreaks, Erfolge, Shop-Bestände und andere Economy-Werte werden **nicht** übernommen.

Jede neue Auth-Sitzung lädt den Economy-Zustand über die App-Check-geschützte Callable Function `getMyEconomyState`. Der Server normalisiert dabei auch bereits vertrauenswürdige Economy-Zustände erneut, damit Tages-/Wochenresets vor der Anzeige konsistent angewendet werden.

Während dieser Hydrierung:

- zeigt die Web-App keine unbestätigten Gast-Economy-Werte,
- bleiben gewertete Quizstarts, Rangliste, Daily-Rewards und Shop gesperrt,
- können lokale Übungsrunden keine Economy-Werte erhöhen.

Jeder asynchrone Sync ist außerdem an die erwartete Firebase-UID gebunden. Ändert sich die Auth-Sitzung während eines laufenden Reads/Callables/Writes, wird die verspätete Antwort verworfen und darf keine alten Kontodaten erneut in LocalStorage speichern.

## Konto- und Browserwechsel

`AccountSessionBoundary` behandelt den Wechsel zwischen Auth-Kontexten als harte Datenschutzgrenze:

- **Gast → erstes Konto:** lokale Lerninhalte dürfen für die bewusste Erstübernahme erhalten bleiben.
- **Konto → Logout/Auth-Verlust:** kontoabhängige lokale Daten werden entfernt.
- **Konto A → Konto B:** lokale Daten von Konto A werden vor dem neuen Kontokontext entfernt.

Bei einer Löschtransition werden Nutzerstand, Owner-Marker, Lernplan sowie Lernanalyse und deren Owner-Marker direkt entfernt. Zusätzlich löst `wissenpur:account-storage-reset` einen Produktoberflächen-Refresh aus. Die Analytics-Bereinigung hängt dadurch nicht davon ab, dass das Analysefenster gerade geöffnet oder sein Listener montiert ist.

## Kontolöschung

`deleteMyAccount` löscht serverseitig:

- `users/{uid}`
- `trustedLeaderboard/{uid}`
- den historischen Eintrag `leaderboard/{uid}`, falls vorhanden
- `serverRateLimits/{uid}`
- Quiz-Sitzungen des Nutzers
- Rundennachweise des Nutzers
- selbst erstellte Alt-Lobbys
- zuordenbare Alt-Duelle
- anschließend den Firebase-Authentication-Nutzer

Die Web-App entfernt nach erfolgreicher Löschung zusätzlich die kontoabhängigen lokalen Browserdaten, darunter:

- lokalen Nutzerstand und Besitzer-Marker
- lokalen Lernplan
- lokale Lernanalyse und deren Besitzer-Marker
- Sitzungsdaten im `sessionStorage`

Die Löschung verlangt:

1. ein angemeldetes Konto,
2. ein gültiges App-Check-Token,
3. eine Anmeldung, die höchstens zehn Minuten zurückliegt,
4. die sichtbare Bestätigung `LÖSCHEN` in der Oberfläche.

Ist die Anmeldung zu alt, öffnet die Web-App für das derzeit ausschließlich unterstützte Google-Konto eine Neuauthentifizierung. Nach erfolgreicher Bestätigung wird das ID-Token erneuert und die Löschanfrage genau einmal wiederholt.

Export und Löschung erfassen die UID, mit der der Vorgang gestartet wurde. Eine verspätete Antwort darf nach Logout oder Kontowechsel nicht in einen anderen Kontokontext übernommen werden. Nach erfolgreicher Löschung werden lokale Daten nur dann vom Löschpfad selbst entfernt, wenn noch dasselbe Konto aktiv ist; ist bereits ein anderes Konto aktiv, wird dieses nicht verändert.

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
