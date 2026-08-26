# WissenPur – Migration auf Firestore `(default)`

Stand: August 2026

## Ziel

Die Release-App und Cloud Functions verwenden ausschließlich die stabile Firestore-Standarddatenbank `(default)`. Falls noch Daten in einer benannten Alt-Datenbank liegen, werden sie **nicht** mit einem selbstgebauten Dokumentkopierer verschoben. WissenPur verwendet dafür den von Google Cloud verwalteten Firestore Export/Import-Pfad.

Die tatsächliche Produktionstransaktion bleibt bewusst manuell. Das Repository enthält nur einen **fail-closed Planer**, der nach mehreren Bestätigungen die vorgesehenen `gcloud`-Kommandos ausgibt und selbst nichts ausführt.

## Sicherheitsprinzipien

- Quell-Datenbank muss benannt sein und darf nicht `(default)` sein.
- Ziel ist immer exakt `(default)`.
- Quell-Datenbank muss zweimal identisch angegeben werden.
- `.firebaserc -> projects.production` muss mit der bestätigten Produktions-Projekt-ID übereinstimmen.
- Der Exportpfad muss unter `gs://.../wissenpur-migration/...` liegen.
- Die `(default)`-Zieldatenbank muss vor dem Import ausdrücklich als kontrolliert leer bestätigt werden.
- Deployment-/Migrationsreview muss bestätigt sein.
- Eine exakte Bestätigungsphrase ist erforderlich.
- Der Planer besitzt keinen Firebase-/Firestore-SDK-Zugriff und startet kein `gcloud`- oder Firebase-Kommando.

## 1. Produktionsziel festlegen

Erst wenn das echte Zielprojekt bewusst feststeht, wird in `.firebaserc` ein `production`-Alias eingetragen. Bis dahin soll der Produktions-Preflight absichtlich blockieren.

Vor einer Migration müssen mindestens diese Werte in einer **nicht eingecheckten** Release-Umgebung gesetzt sein:

```text
RELEASE_PRODUCTION_FIREBASE_PROJECT_ID=<PROJEKT_ID>
RELEASE_FIRESTORE_SOURCE_DATABASE_ID=<BENANNTE_QUELLE>
RELEASE_FIRESTORE_SOURCE_DATABASE_CONFIRMATION=<BENANNTE_QUELLE>
VITE_FIRESTORE_DATABASE_ID=(default)
RELEASE_FIRESTORE_MIGRATION_GCS_PATH=gs://<BUCKET>/wissenpur-migration/<SNAPSHOT>
RELEASE_FIRESTORE_DEFAULT_EMPTY_CONFIRMED=true
RELEASE_DEPLOYMENT_REVIEW_CONFIRMED=true
RELEASE_FIRESTORE_MIGRATION_CONFIRMATION=MIGRATE:<PROJEKT_ID>:<BENANNTE_QUELLE>:(default)
```

Keine dieser Freigaben gehört mit realen Produktionswerten ins Repository.

## 2. Planer ausführen

Im Frontend-Verzeichnis:

```bash
npm run migration:plan
```

Der Befehl prüft nur die Freigaben und gibt anschließend den vorgesehenen Ablauf aus. Er führt **weder Export noch Import** aus.

Der paketfreie Selbsttest lautet:

```bash
npm run migration:self-test
```

Zusätzlich ist `check:firestore-migration` Bestandteil des Functions-Verify-Pfads und verhindert, dass der Planer später still zu einem ausführenden Datenjob umgebaut wird.

## 3. Managed Export bewusst starten

Nur nach Prüfung des ausgegebenen Plans wird der Managed Export mit `gcloud firestore export` manuell gestartet. Dabei gelten weiterhin:

- richtiges Google-Konto und Zielprojekt kontrollieren,
- Firestore-/Storage-Berechtigungen kontrollieren,
- produktive Schreibvorgänge für das Migrationsfenster stoppen,
- Operationsstatus bis zum vollständigen Erfolg prüfen,
- unvollständige oder fehlgeschlagene Exporte niemals importieren.

Der Exportpfad muss dauerhaft dem dokumentierten Snapshot zuordenbar sein.

## 4. `(default)`-Ziel vor Import prüfen

Vor dem Import:

- Region und Edition der `(default)`-Datenbank bestätigen,
- Ziel darf noch keine unkontrollierten Produktionsschreibvorgänge enthalten,
- Rules und erforderliche Indexe vorbereiten,
- dokumentieren, dass das Ziel kontrolliert leer beziehungsweise bewusst für den Import vorbereitet ist.

Ein Import kann bestehende Dokumentpfade überschreiben. Deshalb ist die Variable `RELEASE_FIRESTORE_DEFAULT_EMPTY_CONFIRMED=true` eine bewusste Release-Freigabe und kein automatischer Test.

## 5. Managed Import bewusst starten

Erst nach erfolgreichem Export und Zielprüfung wird der vom Planer ausgegebene `gcloud firestore import`-Befehl manuell ausgeführt. Ziel bleibt zwingend `(default)`.

Während des Imports keine App-Version veröffentlichen, die gleichzeitig in Quelle und Ziel schreibt.

## 6. Nachkontrolle

Mindestens vergleichen:

- Anzahl der Nutzerprofile,
- `trustedLeaderboard`,
- Punkte, Münzen, Streaks und Inventar mehrerer Testkonten,
- eigene Lernsets und Fehlerfragen,
- Lernpläne,
- Quiz-Sitzungen und Ablaufzeitstempel,
- Rate-Limit-Dokumente, soweit für den Releasezustand erforderlich,
- Alt-Collections vor dem separat guarded Legacy-Cleanup.

Danach mit mindestens zwei getrennten Testkonten prüfen:

- Konto A kann Konto B nicht lesen,
- Konto B kann keine Ranked-Session von A submitten oder revealen,
- eine eigene Ranked-Session kann vollständig abgeschlossen werden,
- Cloud-Lerninhalte werden nach erneutem Login korrekt geladen,
- Datenexport liest aus `(default)`,
- Testkontolöschung entfernt die vorgesehenen Daten und das Auth-Konto.

## 7. TTL, Regeln und Cleanup

Für zeitlich begrenzte Collections müssen die vorgesehenen TTL-Felder und Regeln im Zielprojekt geprüft werden. Alte `lobbies`, `duels`, `leaderboard` und `roundReceipts` werden **nicht** während des Imports nebenbei gelöscht. Dafür existiert der separate Dry-Run-first Legacy-Cleanup.

## 8. Release und Rollback

Vor dem Hosting-Release:

1. Produktions-Preflight ausführen.
2. Rules/Functions gegen `(default)` prüfen.
3. Daten- und Zwei-Konto-Smokes durchführen.
4. Hosting-Rollback-Plan erzeugen und aktuellen Live-Stand in einem `rollback-*`-Channel sichern.
5. Erst danach Hosting veröffentlichen.

Ein Datenbank-Rollback ist nach neuen Schreibvorgängen in `(default)` **keine einfache Umschaltung der Datenbank-ID**. Bei einem Fehler müssen Schreibvorgänge gestoppt, Exportzeitpunkt und neue Writes abgeglichen und eine kontrollierte Wiederherstellung geplant werden.

## Noch offen vor Produktion

Der Planer und seine Sicherheitsgates sind Repository-Code. Die reale Migration bleibt offen, bis Produktionsprojekt, Berechtigungen, Bucket, Quell-Datenbank, Zielregion und Releasefenster tatsächlich feststehen. Ohne diese Werte darf die Migration nicht als durchgeführt bezeichnet werden.
