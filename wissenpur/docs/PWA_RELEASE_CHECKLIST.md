# WissenPur PWA-Release-Checkliste

## Automatisch/statisch abgesichert

- Service Worker wird unter `/sw.js` mit Root-Scope `/` registriert.
- `sw.js` wird ohne langlebigen HTTP-Cache ausgeliefert.
- `/` und `/index.html` werden ohne langlebigen HTTP-Cache ausgeliefert.
- gehashte `/assets/**` werden langfristig `immutable` gecacht.
- Installationsphase lädt die gebaute `index.html` frisch, liest deren `/assets/...`-Referenzen und cached die Vite-JavaScript-/CSS-Bundles für den ersten Offline-Start.
- App-Shell enthält Manifest, normales SVG-Icon und separates maskierbares SVG-Icon.
- Navigation besitzt einen gültigen Offline-Fallback.
- stale-while-revalidate hält Hintergrundanfragen über `event.waitUntil` am Leben.
- Manifest verwendet konsistent `id`, `start_url` und `scope` mit `/`.
- mobile Web-App- und iOS-Standalone-Metadaten sind gesetzt.

## Vor öffentlichem Release manuell prüfen

- aktuelle Chrome-/Android-Version: Installation aus dem Browser.
- App direkt nach frischer Installation offline starten, ohne vorherigen zweiten Seitenaufruf.
- Online → Offline → Online wechseln und Lerninhalte weiterverwenden.
- neue Release-Version deployen und Update von einer alten Cache-Version testen.
- Safari/iPhone: Zum Home-Bildschirm, Standalone-Start und Statusleiste prüfen.
- echte PNG-PWA-Icons in geeigneten Größen ergänzen.
- echtes Apple-Touch-PNG ergänzen und auf iOS prüfen.
- Android-Maskierung auf Kreis/Squircle prüfen.
- Hosting-Rollback testen und kontrollieren, dass Service Worker/App-Shell wieder konsistent werden.

## Offener Asset-Blocker

Das Repository besitzt normale und maskierbare SVG-Icons. Für maximale Plattformkompatibilität fehlen weiterhin echte PNG-PWA-Icons und insbesondere ein Apple-Touch-PNG. Dieser Punkt darf erst nach Einchecken der Binärassets und realem Gerätetest als erledigt markiert werden.
