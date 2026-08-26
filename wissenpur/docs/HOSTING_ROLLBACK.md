# WissenPur – Hosting-Rollback

Stand: August 2026

## Zweck

Vor einem Produktionsdeploy soll der aktuell funktionierende Hosting-Stand als kontrollierter Rollback-Punkt erhalten bleiben. Das Repository enthält dafür `scripts/hosting-rollback-plan.mjs`.

Der Planer ist **nicht ausführend**. Er validiert das Ziel und gibt nur die vorgesehenen Firebase-CLI-Kommandos aus.

## Erforderliche Freigaben

In einer nicht eingecheckten Release-Umgebung:

```text
RELEASE_PRODUCTION_FIREBASE_PROJECT_ID=<PROJEKT_ID>
RELEASE_HOSTING_SITE=<SITE_ID>
RELEASE_HOSTING_SITE_CONFIRMATION=<SITE_ID>
RELEASE_HOSTING_ROLLBACK_CHANNEL=rollback-before-release
RELEASE_DEPLOYMENT_REVIEW_CONFIRMED=true
RELEASE_HOSTING_ROLLBACK_CONFIRMATION=ROLLBACK:<PROJEKT_ID>:<SITE_ID>:rollback-before-release
```

Zusätzlich muss `.firebaserc -> projects.production` exakt auf dieselbe Projekt-ID zeigen.

## Plan erzeugen

```bash
npm run rollback:plan
```

Der Planer gibt vier Schritte aus:

1. aktuellen `live`-Stand in einen `rollback-*`-Channel klonen,
2. neuen Hosting-Build deployen,
3. bei Bedarf den Snapshot wieder nach `live` klonen,
4. nach bestätigter Stabilität den temporären Channel löschen.

Der Planer startet **keinen** dieser Befehle selbst.

## Selbsttest

```bash
npm run rollback:self-test
```

Außerdem prüft `check:hosting-rollback` im Functions-Verify-Pfad, dass:

- Projekt und Site doppelt bestätigt werden,
- nur `rollback-*`-Channels akzeptiert werden,
- eine exakte Bestätigungsphrase erforderlich bleibt,
- der Planer keinen `child_process`- oder Firebase-SDK-Zugriff erhält,
- die Skripte im Frontend-Paket erhalten bleiben.

## Release-Ablauf

Vor dem Live-Deploy:

1. `npm run preflight:production`
2. Produktionsbuild und Security-Smokes bestätigen
3. `npm run rollback:plan`
4. ausgegebenen Snapshot-Befehl bewusst manuell ausführen
5. Snapshot/Channel im Firebase-Projekt kontrollieren
6. erst danach Hosting deployen
7. Kernfunktionen auf der Live-Domain prüfen

## Wann zurückrollen?

Beispiele:

- App startet nach Deploy nicht,
- Auth oder App Check funktioniert nicht,
- zentrale Navigation oder Lernpfade sind defekt,
- Service Worker liefert eine kaputte App-Shell,
- kritischer Datenschutz-/Securityfehler ist im neuen Frontend sichtbar.

Ein Hosting-Rollback stellt nur statische Hosting-Inhalte zurück. Er macht **keine Firestore-Datenänderungen und keine Functions-Migration** rückgängig.

## Noch offen

Der Planer und sein Gate sind im Repository vorhanden. Ein echter Snapshot/Restore gegen die Produktions-Site bleibt ein manueller Release-Test und darf erst nach Festlegung von Produktionsprojekt und Hosting-Site als durchgeführt markiert werden.
