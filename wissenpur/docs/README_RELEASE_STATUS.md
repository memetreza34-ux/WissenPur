# WissenPur Release-Status

Der aktive Release-Stand wird in Draft-PR #2 (`agent/release-foundation`) entwickelt. Der Branch ist **noch nicht produktionsfreigegeben**.

## Aktueller Stand

- Produktionsoberfläche mit **Heute, Lernen, Bibliothek, Fortschritt und Profil**.
- Daily Challenge, Blitz, Fehlertraining, Rangliste, Shop, SRS-Karteikarten und Prüfungs-Lernplan.
- JSON-/CSV-/TSV-Import sowie manuelles Erstellen, Bearbeiten und Export eigener Lernsets.
- Ranked-Inhalte sind von KI-/Nutzer-Übungsinhalten getrennt.
- Ranked-Fragen, Antworten, Economy, Shop, Streaks und Ranglistenwerte werden serverseitig autoritativ behandelt.
- Konto-, Logout- und Accountwechsel-Grenzen schützen vor verspäteten Cross-Session-Writes.
- zentrale SRS-/Due-Queue für Heute, Bibliothek und Lernplan.
- lokale Wissens-/Lernanalyse und fällige Wiederholungen.
- App-Check-/Produktions-Runtime-Grenzen und `(default)`-Firestore-Policy sind vorbereitet.
- Datenschutz- und Hosting-Härtung mit CSP, datensparsamen Logs und callable-only Rangliste ist vorbereitet.
- PWA-App-Icons sind committed und verdrahtet: 192×192, 512×512, maskable 512×512 und Apple-Touch 180×180.
- Service Worker v7 cached App-Shell, gehashte Build-Assets, lokale Avatare und Icons.
- globale Offline-/Online-Anzeige ist vorhanden.
- Das tägliche Glücksrad gibt einen neuen Tagesdreh auch dann frei, wenn die App über den Berlin-Kalendertagswechsel hinweg geöffnet bleibt.
- Das Rechtliches-Modal verwendet den gemeinsamen Accessibility-Hook für Fokusfalle, Escape, Fokus-Rückgabe und Scroll-Lock.
- Frontend, Functions und Firestore-Regeltests deklarieren einheitlich `npm@10.9.2`; die drei Hosted-CI-Jobs pinnen Node `22.12.0` und npm `10.9.2`.
- Root-Release-Skripte unter `scripts/**` lösen den Quality-Workflow sowohl bei Pull Requests als auch bei Pushes auf `main` aus.
- `actions/checkout`, `actions/setup-node` und `actions/setup-java` sind auf konkrete Commit-SHAs gepinnt; Checkout persistiert das GitHub-Token nicht im Git-Config.
- Der CI-Safety-Gate verwendet eine explizite Action-Allowlist, sodass neue Actions erst nach bewusster Freigabe in den Release-Workflow gelangen können.
- Der Package-Lock-Gate prüft alle drei Node-Arbeitsbereiche und blockiert fehlende, veraltete oder nicht zum jeweiligen Manifest passende Lockfiles.
- `node scripts/regenerate-package-locks.mjs` erzeugt die drei Lockfiles nur unter exakt Node `22.12.0` und npm `10.9.2`; bei einem Fehler werden bereits veränderte Lockfiles auf den Zustand vor dem Lauf zurückgesetzt.
- automatische Release-Gates decken u. a. Secrets, Architektur, Account-Isolation, App Check, Ranked-Snapshots, Rate-Limits, PWA, Accessibility, Datenschutz, Lernbibliothek, SRS, Analytics, Migration und Production-Preflight ab.

## Weiterhin offene Release-Blocker

1. **GitHub Actions Billing/Spending-Limit korrigieren.** Die aktuellen Workflow-Läufe starten weiterhin keinen Runner; die Jobs enden ohne ausgeführte Steps. Dadurch liegt weiterhin kein bestätigter Hosted-CI-Codefehler vor, aber auch kein erfolgreicher Hosted-CI-Nachweis.
2. **Alle drei Node-Lockfiles reproduzierbar herstellen.** `wissenpur/package-lock.json` stammt noch aus dem alten Frontend-Manifest und enthält veraltete direkte Pakete; `@types/react` und `@types/react-dom` fehlen dort vollständig. `functions/package-lock.json` und `rules-tests/package-lock.json` fehlen derzeit ganz. Mit exakt Node `22.12.0` und npm `10.9.2` im Repository-Root `node scripts/regenerate-package-locks.mjs` ausführen, die drei erzeugten Lockfiles prüfen und committen. Erst danach alle drei CI-Installationen gemeinsam auf `npm ci` umstellen.
3. **Clean-Checkout-Verifikation durchführen:** Frontend-Typecheck und Build, Functions-Verify/Compile sowie Firestore-Emulatortests vollständig erfolgreich bestätigen.
4. **Produktions-Firebase konfigurieren:** App Check, AI Logic, Functions, Quotas, Budgetwarnungen und Monitoring im echten Zielprojekt aktivieren.
5. **Firestore-Produktion fertigstellen:** `(default)` als Produktionsdatenbank verwenden, kontrollierte Migration durchführen und TTL für `quizSessions.expiresAt` sowie `serverRateLimits.expiresAt` aktivieren.
6. **Legacy-Cleanup kontrolliert ausführen:** zuerst Dry Run, danach nur mit explizit bestätigter Allowlist im Zielprojekt.
7. **Rechtsangaben finalisieren:** echte Betreiber-/Kontaktangaben, Aufbewahrungsfristen, Mindestalter und bestätigte Rechtsprüfung eintragen.
8. **Hosting-Rollback real testen:** Snapshot-/Restore-Probe gegen die echte Produktions-Site durchführen.
9. **Realgeräte/E2E testen:** Android, iPhone und Desktop inklusive Installation, Offline-Start, Update, Login, Accountwechsel, Logout, Konto-Löschung, Ranked, KI, SRS und langsamer/unterbrochener Verbindung.

## Aktueller CI-Status

Für den jeweils neuesten PR-Head ist der Workflow **WissenPur quality checks** maßgeblich. Solange dessen drei erwartete Jobs (`frontend-typecheck-and-build`, `functions-verify-and-build`, `firestore-security-rules`) ohne ausgeführte Steps und ohne zugewiesenen Runner enden, gilt der bekannte GitHub-Actions-Billing-/Spending-Limit-Blocker als aktiv. Dieser Zustand ist **kein bestätigter TypeScript-, Build- oder Firestore-Testfehler**, aber ebenso kein erfolgreicher CI-Nachweis.

Konkrete Commit-SHAs und Workflow-Run-IDs werden hier bewusst nicht fest eingetragen, da sie nach jedem weiteren Härtungscommit sofort veralten. Der aktuelle Stand ist direkt am Head von Draft-PR #2 und im zugehörigen GitHub-Actions-Lauf abzulesen.

PR #2 bleibt deshalb bewusst **Draft** und darf erst nach vollständiger Verifikation, Produktionsmigration, Rechtsfinalisierung und Realgerätetest gemergt werden.
