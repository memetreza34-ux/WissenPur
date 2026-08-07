# WissenPur Release-Status

Der aktive Release-Stand wird in Draft-PR #2 (`agent/release-foundation`) entwickelt. Der Branch ist nicht produktionsfreigegeben.

## Neuester Härtungsstand

- eine zentrale SRS-/Due-Queue für Heute, Bibliothek Plus und Lernplan.
- zeitabhängige Fälligkeit wird bei geöffneter App regelmäßig aktualisiert.
- Heute öffnet nur fällige Karten und kehrt nach dem Lernen zum aufrufenden Screen zurück.
- SRS-Änderungen werden nach dem Schließen sofort aus dem gespeicherten Zustand in die Produktoberfläche übernommen.
- Lernplan-Cloudoperationen sind an die beim Start erwartete Auth-UID gebunden.
- Lernplan empfiehlt nur tatsächlich fällige Karten.
- erste Konto-Hydrierung bleibt strikt, spätere Profil-/Lerninhalt-Syncs sind offline Best Effort.
- Glücksrad persistiert den Serverstand sofort und UID-gebunden; Animationstimer schreiben keine Kontodaten.
- PWA-Service-Worker cached beim Installieren die gebaute `index.html` und deren gehashte Vite-Assets.
- Root-App-Shell besitzt no-cache, gehashte Assets `immutable`.
- normales und maskierbares SVG-App-Icon sind getrennt.

## Noch blockiert

- GitHub Actions startet wegen Billing/Spending-Limit keinen Runner.
- Frontend-Lockfile muss reproduzierbar neu erzeugt werden.
- echte Builds, Typechecks und Emulator-Tests sind dadurch noch nicht bestätigt.
- Firebase-Produktionskonfiguration/Migration fehlt.
- Betreiber-/Rechtsangaben müssen finalisiert werden.
- PNG-/Apple-Touch-PWA-Icons und reale iOS-/Android-Tests fehlen.

PR #2 bleibt deshalb Draft.
