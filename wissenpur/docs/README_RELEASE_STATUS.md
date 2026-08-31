# WissenPur Release-Status

Der aktive Release-Stand wird in Draft-PR #2 (`agent/release-foundation`) entwickelt. Der Branch ist **noch nicht produktionsfreigegeben**.

## Aktueller Stand

- Produktionsoberfläche mit **Heute, Lernen, Bibliothek, Fortschritt und Profil**.
- Daily Challenge, Blitz, Fehlertraining, Rangliste, Shop, SRS-Karteikarten und Prüfungs-Lernplan.
- JSON-/CSV-/TSV-Import sowie manuelles Erstellen, Bearbeiten und Export eigener Lernsets.
- Ranked-Inhalte sind von KI-/Nutzer-Übungsinhalten getrennt.
- Ranked-Fragen, Antworten, Economy, Shop, Streaks und Ranglistenwerte werden serverseitig autoritativ behandelt.
- Konto-, Logout- und Accountwechsel-Grenzen schützen vor verspäteten Cross-Session-Writes.
- Konto A → B beziehungsweise Konto → Logout entfernt lokale Stats, Lernplan sowie Lernanalyse und deren Owner-Marker direkt; ein Account-Storage-Reset remountet zusätzlich die Produktoberfläche.
- zentrale SRS-/Due-Queue für Heute, Bibliothek und Lernplan.
- lokale Wissens-/Lernanalyse und fällige Wiederholungen.
- App-Check-/Produktions-Runtime-Grenzen und `(default)`-Firestore-Policy sind vorbereitet.
- KI-Fragengenerierung verlangt im Client ein angemeldetes Konto und verwirft Ergebnisse nach einem Auth-Wechsel.
- Der Produktions-Preflight verlangt zusätzlich den real aktivierten Firebase-AI-Logic-Authenticated-users-mode, ein bestätigtes per-user Limit von 1–20 RPM, AI-Monitoring und Budget-/Kostenschutz.
- Datenschutz- und Hosting-Härtung mit CSP, datensparsamen Logs und callable-only Rangliste ist vorbereitet.
- Browser-Logging wird repositoryweit für den aktiven `wissenpur/src`-Baum auf rohe Error-Objekte/-Messages geprüft; lokale Economy-Syncfehler protokollieren nur begrenzte Fehlernamen/-codes.
- Vite definiert keine `process.env.*`-Werte mehr in das Browserbundle, lädt keine komplette Env-Datei und erzeugt für den Release keine Source Maps.
- alte, nicht mehr verwendete AI-Studio-/Firebase-Artefakte (`hooks.txt`, `metadata.json`, veralteter `firebase-blueprint.json`) wurden aus dem aktiven Release-Branch entfernt; historische Referenzen bleiben ausschließlich unter `legacy/`.
- PWA-App-Icons sind committed und verdrahtet: 192×192, 512×512, maskable 512×512 und Apple-Touch 180×180.
- Service Worker v7 cached App-Shell, gehashte Build-Assets, lokale Avatare und Icons.
- PWA-Update-UX ist statisch gegated: `skipWaiting()`/`clients.claim()` dürfen eine laufende Lernsession nicht automatisch reloaden; `controllerchange` zeigt „Später“/„Neu laden“ an.
- globale Offline-/Online-Anzeige ist vorhanden.
- Das tägliche Glücksrad gibt einen neuen Tagesdreh auch dann frei, wenn die App über den Berlin-Kalendertagswechsel hinweg geöffnet bleibt.
- Das Rechtliches-Modal verwendet den gemeinsamen Accessibility-Hook für Fokusfalle, Escape, Fokus-Rückgabe und Scroll-Lock.
- Frontend und Ranked-Backend deklarieren dieselben 21 Kategorie-IDs; der Generator verlangt für jede deklarierte Ranked-Kategorie mindestens fünf release-sichere Fragen und insgesamt mindestens 100.
- Das Allrounder-Achievement beschreibt jetzt korrekt seine bestehende Schwelle: zehn verschiedene Kategorien; ein eigener Unit-Test prüft 9 → gesperrt und 10 → freigeschaltet.
- Frontend, Functions und Firestore-Regeltests deklarieren einheitlich `npm@10.9.2`; die drei Hosted-CI-Jobs pinnen Node `22.12.0` und npm `10.9.2`.
- Root-Release-Skripte unter `scripts/**` lösen den Quality-Workflow sowohl bei Pull Requests als auch bei Pushes auf `main` aus.
- `actions/checkout`, `actions/setup-node` und `actions/setup-java` sind auf konkrete Commit-SHAs gepinnt; Checkout persistiert das GitHub-Token nicht im Git-Config.
- Der CI-Safety-Gate verwendet eine explizite Action-Allowlist, sodass neue Actions erst nach bewusster Freigabe in den Release-Workflow gelangen können.
- Zwei veraltete Release-Gate-Annahmen wurden korrigiert: Architecture prüft `trustedLeaderboard` jetzt korrekt als callable-only (`get/list/write=false`), Functions-Runtime prüft die aktuelle `getFirestore`-/`isFunctionsEmulator`-Implementierung statt alter `initializeFirestore`-/Variablennamen.
- Der Functions-NPM-Pfad besitzt keinen projektlosen Deploy mehr; optionaler Entwicklerdeploy ist ausschließlich als `deploy:dev --project dev` erlaubt. Ein Produktionsdeploy bleibt ein separat freizugebender Schritt.
- Legacy-Cleanup verwendet eine eigene, explizit an die bestätigte Projekt-ID gebundene Admin-App; `--apply` bricht bei aktivem `FIRESTORE_EMULATOR_HOST` ab und kann keine bereits initialisierte fremde Admin-App wiederverwenden.
- Der Package-Lock-Gate prüft alle drei Node-Arbeitsbereiche und blockiert fehlende, veraltete oder nicht zum jeweiligen Manifest passende Lockfiles.
- `node scripts/regenerate-package-locks.mjs` erzeugt die drei Lockfiles nur unter exakt Node `22.12.0` und npm `10.9.2`; bei einem Fehler werden bereits veränderte Lockfiles auf den Zustand vor dem Lauf zurückgesetzt.
- Der bekannte Lockfile-Gate läuft am Ende von `verify`, damit bei wieder funktionierenden Runnern zuerst Architektur-, Datenschutz-, Unit- und TypeScript-Diagnostik vollständig sichtbar wird.
- Ein eigener Release-Doku-Gate hält README, Firebase-/PWA-/Account-Dokumentation und den tatsächlichen Release-Code an zentralen Trust-Boundaries synchron.
- automatische Release-Gates decken u. a. Secrets, Architektur, Account-Isolation, App Check, AI-Auth/Quota, Ranked-Snapshots, Kategorieabdeckung, Rate-Limits, PWA-Update-UX, Accessibility, Browser-/Serverlog-Datenschutz, Lernbibliothek, SRS, Analytics, Migration und Production-Preflight ab.

## Weiterhin offene Release-Blocker

1. **GitHub Actions Billing/Spending-Limit korrigieren.** Die aktuellen Workflow-Läufe starten weiterhin keinen Runner; die Jobs enden ohne ausgeführte Steps. Dadurch liegt weiterhin kein bestätigter Hosted-CI-Codefehler vor, aber auch kein erfolgreicher Hosted-CI-Nachweis.
2. **Alle drei Node-Lockfiles reproduzierbar herstellen.** `wissenpur/package-lock.json` stammt noch aus dem alten Frontend-Manifest und enthält veraltete direkte Pakete; `@types/react` und `@types/react-dom` fehlen dort vollständig. `functions/package-lock.json` und `rules-tests/package-lock.json` fehlen derzeit ganz. Mit exakt Node `22.12.0` und npm `10.9.2` im Repository-Root `node scripts/regenerate-package-locks.mjs` ausführen, die drei erzeugten Lockfiles prüfen und committen. Erst danach alle drei CI-Installationen gemeinsam auf `npm ci` umstellen.
3. **Clean-Checkout-Verifikation durchführen:** Frontend-Typecheck und Build, Functions-Verify/Compile sowie Firestore-Emulatortests vollständig erfolgreich bestätigen.
4. **Produktions-Firebase konfigurieren:** App Check, AI Logic, Functions und den Firebase-AI-Logic-Authenticated-users-mode aktivieren; reales per-user AI-Limit auf den bestätigten 1–20-RPM-Wert setzen sowie Quotas, Monitoring, Budgetwarnungen und Kostenschutz prüfen.
5. **Firestore-Produktion fertigstellen:** `(default)` als Produktionsdatenbank verwenden, kontrollierte Migration durchführen und TTL für `quizSessions.expiresAt` sowie `serverRateLimits.expiresAt` aktivieren.
6. **Legacy-Cleanup kontrolliert ausführen:** zuerst Dry Run, danach nur mit explizit bestätigter Allowlist, Projekt-ID und deaktiviertem Emulator gegen das echte Zielprojekt.
7. **Rechtsangaben finalisieren:** echte Betreiber-/Kontaktangaben, Aufbewahrungsfristen, Mindestalter und bestätigte Rechtsprüfung eintragen.
8. **Hosting-Rollback real testen:** Snapshot-/Restore-Probe gegen die echte Produktions-Site durchführen.
9. **Realgeräte/E2E testen:** Android, iPhone und Desktop inklusive Installation, Offline-Start, Update, Login, Accountwechsel, Logout, Konto-Löschung, Ranked, KI, SRS und langsamer/unterbrochener Verbindung. Für KI zusätzlich Gast ohne Netzwerkrequest sowie angemeldeter Nutzer mit realem Authenticated-users-/Quota-Setup prüfen.

## Aktueller CI-Status

Für den jeweils neuesten PR-Head ist der Workflow **WissenPur quality checks** maßgeblich. Solange dessen drei erwartete Jobs (`frontend-typecheck-and-build`, `functions-verify-and-build`, `firestore-security-rules`) ohne ausgeführte Steps und ohne zugewiesenen Runner enden, gilt der bekannte GitHub-Actions-Billing-/Spending-Limit-Blocker als aktiv. Dieser Zustand ist **kein bestätigter TypeScript-, Build- oder Firestore-Testfehler**, aber ebenso kein erfolgreicher CI-Nachweis.

Konkrete Commit-SHAs und Workflow-Run-IDs werden hier bewusst nicht fest eingetragen, da sie nach jedem weiteren Härtungscommit sofort veralten. Der aktuelle Stand ist direkt am Head von Draft-PR #2 und im zugehörigen GitHub-Actions-Lauf abzulesen.

PR #2 bleibt deshalb bewusst **Draft** und darf erst nach vollständiger Verifikation, Produktionsmigration, Rechtsfinalisierung und Realgerätetest gemergt werden.
