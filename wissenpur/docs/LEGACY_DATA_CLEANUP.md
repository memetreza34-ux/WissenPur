# WissenPur Legacy-Datenbereinigung

Dieses Dokument beschreibt die einmalige Bereinigung historischer Firestore-Collections vor dem öffentlichen Release.

## Welche Daten werden bereinigt?

Das Skript `functions/scripts/cleanup-legacy-release-data.ts` besitzt eine feste Allowlist:

- `leaderboard`
- `lobbies`
- `duels`
- `roundReceipts`

Nicht Teil dieses Cleanups sind insbesondere:

- `users`
- `quizSessions`
- `trustedLeaderboard`
- `serverRateLimits`

Aktuelle Ranglisten-Sessions, Profile und serververwaltete Sicherheitsdaten werden dadurch nicht angefasst.

## Voraussetzungen

- gültige Google/Firebase-Admin-Anmeldedaten für das Zielprojekt
- Node.js 22
- installierte Functions-Abhängigkeiten
- Ziel ist die Firestore-Datenbank `(default)`

## 1. Dry Run

Immer zuerst nur zählen:

```bash
cd functions
WISSENPUR_TARGET_PROJECT_ID="dein-projekt-id" npm run cleanup:legacy
```

Der Dry Run führt keine Löschoperation aus. Für jede Legacy-Collection wird nur die Anzahl gefundener Dokumente ausgegeben.

Die Ausgabe dokumentieren und mit den erwarteten Test-/Alt-Daten vergleichen.

## 2. Echtes Löschen

Erst nach geprüftem Dry Run:

```bash
cd functions
WISSENPUR_TARGET_PROJECT_ID="dein-projekt-id" \
WISSENPUR_CONFIRM_PROJECT_ID="dein-projekt-id" \
WISSENPUR_CONFIRM_LEGACY_CLEANUP="DELETE-WISSENPUR-LEGACY-DATA" \
npm run cleanup:legacy -- --apply
```

Das Skript bricht ab, wenn:

- keine Ziel-Projekt-ID gesetzt ist,
- Bestätigungs-Projekt-ID und Ziel-Projekt-ID nicht exakt gleich sind,
- die feste Löschphrase fehlt oder abweicht.

## 3. Nachkontrolle

Nach dem Apply erneut einen Dry Run ausführen:

```bash
WISSENPUR_TARGET_PROJECT_ID="dein-projekt-id" npm run cleanup:legacy
```

Erwartet: `0` Dokumente in allen vier Legacy-Collections.

Anschließend zusätzlich prüfen:

- `users` ist unverändert vorhanden.
- `trustedLeaderboard` ist unverändert vorhanden.
- aktuelle `quizSessions` sind unverändert vorhanden.
- `serverRateLimits` ist unverändert vorhanden.
- gewertete Prüfung kann im Staging weiterhin gestartet, abgegeben und ausgewertet werden.

## Sicherheitsregel

`cleanup:legacy` ist absichtlich **nicht** Teil von `verify`, `build` oder `deploy`. Der statische Gate `check:legacy-cleanup` prüft diese Trennung, die Allowlist und die erforderlichen Bestätigungen.
