# WissenPur PWA-Release-Checkliste

## Automatisch/statisch abgesichert

- Service Worker wird unter `/sw.js` mit Root-Scope `/` registriert.
- `sw.js`, `/` und `/index.html` werden ohne langlebigen HTTP-Cache ausgeliefert.
- gehashte `/assets/**` werden langfristig `immutable` gecacht.
- Installationsphase lädt die gebaute `index.html` frisch, liest deren `/assets/...`-Referenzen und cached die Vite-JavaScript-/CSS-Bundles für den ersten Offline-Start.
- Navigationen werden nicht unter vollständigen URLs oder Querystrings im Runtime-Cache gespeichert.
- Offline-Navigation fällt ausschließlich auf die feste `/index.html`-App-Shell zurück.
- Cache-Cleanup entfernt nur alte `wissenpur-*`-Caches und greift keine fremden Origin-Caches an.
- stale-while-revalidate hält Hintergrundanfragen über `event.waitUntil` am Leben.
- Manifest verwendet konsistent `id`, `start_url` und `scope` mit `/` sowie `display: standalone`.
- mobile Web-App- und iOS-Standalone-Metadaten sind gesetzt.
- lokale Shop-Avatare werden als Teil der Offline-App-Shell gecacht.
- 192×192 PNG-App-Icon ist committed, besitzt gültige PNG-Signatur/IHDR-Maße und ist im Manifest verdrahtet.
- 512×512 PNG-App-Icon ist committed, besitzt gültige PNG-Signatur/IHDR-Maße und ist im Manifest verdrahtet.
- 512×512 maskable PNG-App-Icon ist committed, besitzt gültige PNG-Signatur/IHDR-Maße und ist im Manifest als `maskable` verdrahtet.
- 180×180 Apple-Touch-PNG ist committed, besitzt gültige PNG-Signatur/IHDR-Maße und ist in `index.html` verdrahtet.
- normale und maskierbare SVG-Icons bleiben als zusätzliche Fallbacks vorhanden.

Diese Punkte werden durch `npm --prefix functions run check:pwa-runtime` regressiv geprüft.

## Vor öffentlichem Release manuell prüfen

### Android / Chrome

- Installation aus einer aktuellen Chrome-/Android-Version.
- App direkt nach frischer Installation offline starten, ohne vorherigen zweiten Seitenaufruf.
- Online → Offline → Online wechseln und lokale Lerninhalte weiterverwenden.
- 192-/512-PNG-Darstellung im Installationsdialog prüfen.
- Maskierung auf Kreis/Squircle prüfen; Logo darf nicht ungewollt abgeschnitten werden.
- neue Release-Version deployen und Update von einer alten Cache-Version testen.

### iPhone / Safari

- „Zum Home-Bildschirm“ mit dem 180×180 Apple-Touch-Icon prüfen.
- Standalone-Start ohne Browser-Chrome prüfen.
- Statusleiste, Safe Areas und Hoch-/Querformat-Verhalten prüfen.
- App direkt nach Installation offline starten.
- Online → Offline → Online und Release-Update testen.

### Desktop

- installierbare PWA in aktuellem Chromium-Browser prüfen.
- normaler Browserstart und installierter Standalone-Start müssen dieselbe aktuelle Version laden.
- Offline-Start und Wiederverbindung prüfen.

### Rollback

- Hosting-Snapshot/Restore real testen.
- nach Rollback kontrollieren, dass Service Worker, App-Shell und gehashte Assets wieder aus derselben Release-Version stammen.
- mindestens einen Client testen, der vor dem Rollback bereits eine neuere Cache-Version besaß.

## Offener Release-Blocker

Die erforderlichen PWA-Binärassets sind **nicht mehr offen**. Der verbleibende PWA-Blocker ist die reale Geräteverifikation: Installation, Offline-Erststart, Updatepfad und Rollback müssen auf Android und iPhone tatsächlich geprüft werden. Diese manuellen Ergebnisse dürfen nicht allein durch den statischen PWA-Gate als bestanden markiert werden.
