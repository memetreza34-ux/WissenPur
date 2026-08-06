# WissenPur – Migration auf Firestore `(default)`

Stand: August 2026

## Ziel

Die bisherige AI-Studio-App verwendet die benannte Datenbank:

```text
ai-studio-e6a56a0b-5009-48b4-ab34-e5fc5f5f781b
```

Die Release-Konfiguration verwendet stattdessen die stabile Standarddatenbank:

```text
(default)
```

Web-App, Firebase CLI und die eingecheckte Functions-Umgebung sind bereits auf `(default)` umgestellt. Vor einem Deployment müssen Datenbank und Daten kontrolliert migriert werden.

## Voraussetzungen

- Blaze-Abrechnung ist aktiviert.
- `firebase` und `gcloud` sind mit dem richtigen Google-Konto angemeldet.
- Das Konto besitzt die nötigen Firestore- und Storage-Berechtigungen.
- Es existiert ein Cloud-Storage-Bucket für den Export.
- Während der Migration finden keine produktiven Schreibvorgänge statt.

## 1. Projekt ausdrücklich auswählen

Das alte Projekt ist nur noch unter dem Alias `dev` eingetragen. Es existiert absichtlich kein Default-Alias.

```bash
firebase use dev
firebase projects:list
```

Projekt-ID und Kontoinhaber müssen vor jedem weiteren Schritt kontrolliert werden.

## 2. Standarddatenbank erstellen

Die `(default)`-Datenbank kann in der Google-Cloud-/Firebase-Konsole erstellt werden. Alternativ unterstützt die Firebase CLI das Anlegen von Firestore-Datenbanken.

Wichtig:

- Region bewusst auswählen; sie lässt sich später nicht beliebig ändern.
- Standard Edition verwenden, sofern keine Enterprise-Funktionen benötigt werden.
- Die Zielregion muss zu Datenschutz, Latenz und Functions-Region passen.
- Noch keine Nutzer auf die leere Ziel-Datenbank schicken.

## 3. Bestehende Daten sichern

Beispiel mit einem eigenen Bucket und eindeutigem Exportpfad:

```bash
gcloud firestore export \
  gs://DEIN_BUCKET/wissenpur-migration/2026-08-06 \
  --database=ai-studio-e6a56a0b-5009-48b4-ab34-e5fc5f5b781b
```

Der Export verursacht Firestore-Leseoperationen. Nach Start muss der Operationsstatus geprüft werden. Ein fehlgeschlagener oder unvollständiger Export darf nicht importiert werden.

## 4. Regeln vor dem Nutzerzugriff vorbereiten

Die Regeln im Repository zielen jetzt auf die Standarddatenbank:

```bash
firebase deploy --only firestore:rules --project dev
```

Vor einem öffentlichen Betrieb müssen dieselben Regeln zusätzlich in Emulator-Tests geprüft werden.

## 5. Export in `(default)` importieren

Nur in eine kontrollierte, noch nicht produktiv verwendete Ziel-Datenbank importieren:

```bash
gcloud firestore import \
  gs://DEIN_BUCKET/wissenpur-migration/2026-08-06/EXPORT_PREFIX/ \
  --database='(default)'
```

Existierende Dokumente mit denselben Pfaden können beim Import überschrieben werden. Deshalb muss das Ziel vor dem Import leer beziehungsweise bewusst vorbereitet sein.

## 6. Daten prüfen

Mindestens kontrollieren:

- Anzahl der Nutzer
- Ranglisteneinträge
- Punkte und Münzen mehrerer Testkonten
- eigene Quizprojekte
- gespeicherte Fehlerfragen
- Lernpläne
- Quiz-Sitzungen und Ablaufzeitstempel
- alte Lobby- und Duel-Dokumente

Zusätzlich mit zwei Testkonten prüfen:

- Konto A kann Konto B nicht lesen.
- Cloud-Fortschritt wird auf einem zweiten Gerät geladen.
- eine gewertete Prüfung schreibt in Nutzer und Rangliste.
- Datenexport liest aus `(default)`.
- Testkontolöschung entfernt Nutzer, Rangliste und Auth-Konto.

## 7. TTL-Richtlinien einrichten

Für folgende Collection Groups ist das Feld `expiresAt` als TTL-Feld vorgesehen:

- `quizSessions`
- `roundReceipts`

TTL-Löschungen erfolgen nicht sofort. Abgelaufene Dokumente müssen daher weiterhin auch in der Anwendungslogik als ungültig behandelt werden.

## 8. Alt-Multiplayer bereinigen

Vor dem öffentlichen Release:

- alte `lobbies` vollständig prüfen beziehungsweise löschen,
- alte `duels` vollständig prüfen beziehungsweise löschen,
- keine verschachtelten Spieler-UIDs im Altbestand zurücklassen,
- Multiplayer-Schreibzugriffe deaktiviert lassen.

## 9. Release erst danach umschalten

Erst nach erfolgreicher Prüfung:

1. Staging auf `(default)` deployen.
2. Login, Quiz, Daily, Glücksrad, Shop, Export und Löschung testen.
3. Monitoring und Budgetwarnungen aktivieren.
4. Produktionsprojekt ausdrücklich auswählen.
5. Functions, Regeln und Hosting deployen.
6. alten Schreibpfad deaktiviert lassen.
7. Export-Backup bis nach erfolgreicher Abnahme aufbewahren.

## Rollback

Bei einem Fehler:

- Hosting-/Functions-Release zurückrollen,
- keine neuen Schreibvorgänge in zwei Datenbanken gleichzeitig zulassen,
- Ursache beheben,
- Daten anhand des Exportzeitpunkts und der nachfolgenden Schreibvorgänge abgleichen.

Ein bloßes Zurückstellen der Datenbank-ID ist kein sicherer Rollback, sobald in `(default)` bereits neue Nutzerdaten geschrieben wurden.
