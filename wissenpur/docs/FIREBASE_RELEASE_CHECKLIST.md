# Firebase- und Release-Checkliste für WissenPur

Diese Checkliste beschreibt den aktuellen sicheren Release-Pfad. Sie ersetzt frühere Hinweise auf `recordRoundResult`, `startRankedQuiz` oder eine benannte Produktionsdatenbank.

## 1. GitHub- und Paket-Voraussetzungen

Vor jeder Freigabe:

- GitHub Actions Billing/Spending-Limit so konfigurieren, dass Runner tatsächlich starten.
- `wissenpur/package-lock.json` aus dem aktuellen `wissenpur/package.json` vollständig neu erzeugen.
- danach Frontend-CI wieder auf `npm ci` und Lockfile-Caching umstellen.
- Frontend-Typecheck und Produktionsbuild erfolgreich ausführen.
- Functions-Verify und Functions-Compile erfolgreich ausführen.
- Firestore-Regeltests mit Emulator und mindestens zwei Konten erfolgreich ausführen.

Solange ein GitHub-Job `steps: null` besitzt, ist das **kein ausgeführter Test**.

## 2. Firebase-Projekte

Empfohlen:

- `wissenpur-dev`
- `wissenpur-staging`
- `wissenpur-prod`

Entwicklungs- und Produktionsdaten dürfen nicht im selben Firestore-Projekt liegen.

Produktion verwendet die Firestore-Datenbank **`(default)`**. Eine benannte Produktionsdatenbank ist im Functions-Runtime-Gate nicht erlaubt.

## 3. Firebase AI Logic

1. Firebase-Konsole öffnen.
2. **Firebase AI Logic** auswählen.
3. Einrichtung abschließen.
4. das im Frontend konfigurierte Modell und die gewünschte Provider-Konfiguration prüfen.
5. Abrechnung, APIs und Nutzungsbedingungen kontrollieren.
6. Testanfrage im Staging-Projekt ausführen.
7. Fehlerquote, Latenz, Tokens und 429-Antworten überwachen.

Ein privater Gemini/API-Schlüssel darf nicht als Vite-Variable oder Browser-Bundle-Konstante ausgeliefert werden.

## 4. App Check

1. In Google Cloud einen score-basierten reCAPTCHA-Enterprise-Websiteschlüssel anlegen.
2. ausschließlich echte Dev-, Staging- und Produktionsdomains zulassen.
3. WissenPur unter **Firebase → Security → App Check → Apps** registrieren.
4. `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` im Hosting setzen.
5. App Check für Firebase AI Logic aktivieren.
6. Callable Functions zunächst in Staging prüfen.
7. anschließend Enforcement für die produktiven Callable Functions aktivieren.

### Lokale Entwicklung

In `wissenpur/.env.local`:

```env
VITE_RECAPTCHA_ENTERPRISE_SITE_KEY=dein_site_key
VITE_ENABLE_APPCHECK_DEBUG=true
VITE_USE_FUNCTIONS_EMULATOR=true
```

Den ausgegebenen Debugtoken nur im Entwicklungsprojekt registrieren. Debugmodus darf in Produktion nicht aktiv sein.

## 5. Cloud Functions und autoritative Economy

Die Produktions-Functions verwenden Node.js 22 und Firestore `(default)`.

Aktueller sicherer Ranglistenfluss:

1. `startSecureRankedQuiz`
2. `submitRankedQuiz`
3. `revealSecureRankedQuiz`

Eigenschaften:

- Backend wählt die Fragen.
- Browser erhält vor Abgabe keinen Lösungsindex und keine Erklärung.
- jede Quizsitzung besitzt einen unveränderlichen Antwort-Snapshot.
- Submit wertet nur gegen diesen Snapshot.
- Reveal funktioniert erst nach erfolgreicher Abgabe.
- `trustedLeaderboard` wird ausschließlich serverseitig geschrieben.

Aktuelle serververwaltete Economy:

- Punkte und Münzen
- Streaks
- Kategorienstatistik
- Wochenziel
- Erfolge
- Daily Quest
- Glücksrad
- Shop und Power-up-Bestand
- Ranglistenprofil

`getMyEconomyState` normalisiert die Economy bei jeder neuen Auth-Sitzung serverseitig. Gast-/Legacy-Economy wird nicht als vertrauenswürdiger Kontostand migriert.

## 6. Missbrauchs- und Kostenlimits

Vor Produktion mit Lasttests prüfen:

- Quizstart: maximal 12 Starts pro Minute und Konto.
- allgemeine geschützte Callables: 120 Aktionen pro Minute und Konto.
- Kontodatenexport: 5 Exporte pro 10 Minuten.
- Kontolöschung bleibt von der allgemeinen Rate-Sperre ausgenommen, benötigt aber App Check und Recent-Reauth.

`serverRateLimits/{uid}` ist für Browser vollständig gesperrt und wird bei Kontolöschung mit entfernt.

## 7. Konto-, Gast- und Sync-Verhalten

Mit echten Testkonten prüfen:

- Gast erstellt Lernsets und Fehlerfragen → erster Login übernimmt diese Lerninhalte.
- lokale + Cloud-Lernsets werden vereinigt; lokale Fassung gewinnt bei gleicher Deck-ID.
- lokale + Cloud-Fehlerfragen werden vereinigt; lokale Fassung gewinnt bei gleicher Frage-ID.
- Lernplan verwendet `updatedAt` zur Konfliktentscheidung.
- Gastpunkte/Münzen werden **nicht** als Kontopunkte übernommen.
- Konto A → Konto B entfernt lokale Daten von Konto A.
- Konto → Logout/Auth-Verlust entfernt kontoabhängige Browserdaten.
- Logout/Kontowechsel während Hydrierung darf keine verspätete Antwort lokal persistieren.
- Lernplan-Laden, -Speichern und -Löschen bleibt an die UID gebunden, mit der der Vorgang gestartet wurde.
- Glücksrad-Serverstand wird vor der Animation und nur in derselben Auth-Sitzung lokal übernommen.
- erste Auth-Hydrierung ist strikt; spätere Profil-/Lerninhalt-Syncs dürfen offline Best Effort sein.

## 8. Lernsets, SRS und Lernplan

Prüfen:

- JSON-, CSV- und TSV-Import.
- manuelles Erstellen und Bearbeiten.
- zentrale Bibliothekslimits: 100 Sets, 500 Fragen, 700.000 serialisierte Bytes.
- neue manuelle Sets maximal 30 Fragen; bestehende/importierte Sets maximal 100 Fragen.
- fällige Karten werden in **Heute**, **Bibliothek Plus** und **Lernplan** über dieselbe zentrale Due-Queue bestimmt.
- fällige Queue aktualisiert sich auch bei offen bleibender App zeitbasiert.
- „Heute“ öffnet ausschließlich wirklich fällige Karten.
- nach SRS-Bewertung wird der aktuelle gespeicherte Kartenstand wieder in die Produktoberfläche übernommen.
- Lernplan empfiehlt niemals mehr Karteikarten als tatsächlich fällig sind.
- 0 fällige Karten ergeben 0 empfohlene Karten.
- Probeprüfung zeigt Lösungen erst nach der letzten Antwort und vergibt keine Ranglistenpunkte.

## 9. Firestore-Regeln

Mindestens testen:

- Nutzer A kann Nutzer B nicht lesen oder verändern.
- Nutzer kann seine UID im Dokument nicht austauschen.
- Browser kann keine Economy-, Inventar- oder Shop-Avatar-Felder schreiben.
- `trustedLeaderboard` ist public-read und browser-write-gesperrt.
- `quizSessions` und `serverRateLimits` sind für Browser vollständig gesperrt.
- Lernplan akzeptiert nur die definierte Feldstruktur.
- `customDifficultyTimes` erlaubt nur `leicht`, `mittel`, `schwer`, `all` und Werte von 5 bis 120.
- `wrongQuestions` ist auf 300 Einträge begrenzt.
- `customQuizzes` ist auf 100 Einträge begrenzt.
- Lobby-/Duel-Daten sind für normale Clients gesperrt.

Die Admin SDK in Cloud Functions umgeht Clientregeln. Eingaben müssen daher zusätzlich in Functions geprüft werden.

## 10. Datenmigration und alte Testdaten

Vor Produktion:

- Firestore-Inhalte kontrolliert nach `(default)` migrieren.
- alte client-schreibbare Ranglistenwerte nicht als vertrauenswürdig übernehmen.
- alte Lobby-/Duel-Testdaten entfernen.
- alte oder inkonsistente Bibliotheksdaten durch die zentrale Learning-Library-Policy normalisieren.
- Rangliste zum öffentlichen Start vorzugsweise als neue Saison beginnen.

## 11. Datenexport und Kontolöschung

Prüfen:

- Export enthält Kontodaten und eigene Firestore-Daten.
- vertrauliche Quiz-Antwortschlüssel sind redigiert.
- lokale Lernanalyse wird clientseitig ergänzt und dafür nicht erst in Firestore hochgeladen.
- Export-Rate-Limit funktioniert.
- Kontolöschung verlangt eine höchstens zehn Minuten alte Anmeldung.
- Kontolöschung entfernt Userprofil, trusted/legacy Leaderboard, Rate Limits und nutzerbezogene Dokumente.
- Browser-LocalStorage und SessionStorage werden anschließend entfernt.

## 12. PWA, Offline und Hosting

Statisch vorhanden:

- Service Worker mit explizitem Root-Scope.
- `sw.js` und Root-App-Shell ohne langlebigen HTTP-Cache.
- gehashte `/assets/**` ein Jahr `immutable`.
- Service Worker lädt bei Installation die **gebaute** `index.html`, extrahiert deren `/assets/...`-JS/CSS und cached diese für den ersten Offline-Start.
- Navigation besitzt einen gültigen Offline-Fallback.
- stale-while-revalidate hält die Hintergrundanfrage über `event.waitUntil` am Leben.
- normales SVG-Icon und separates maskierbares SVG-Icon.
- Manifest, mobile Web-App- und iOS-Standalone-Metadaten.

Vor öffentlichem Release noch real prüfen:

- PNG-Icons in geeigneten PWA-Größen ergänzen.
- echtes Apple-Touch-PNG ergänzen.
- Installation auf aktuellem Chrome/Android testen.
- Installation/Standalone-Verhalten auf aktuellem Safari/iPhone testen.
- frisch installierte App ohne vorherigen zweiten Seitenaufruf offline starten.
- PWA-Update von einer alten Cache-Version auf die neue Version testen.
- Hosting-Rollback testen.

## 13. Hosting- und Produktionsvariablen

Erforderlich:

```env
VITE_RECAPTCHA_ENTERPRISE_SITE_KEY=...
VITE_ENABLE_APPCHECK_DEBUG=false
VITE_USE_FUNCTIONS_EMULATOR=false
```

Nicht verwenden:

```env
GEMINI_API_KEY=...
```

Zusätzlich Quotas, Budgetwarnungen, Error Monitoring und Functions-/Firestore-Kostenüberwachung aktivieren.

## 14. Manueller Release-Test

- Google-Login auf Desktop, Android und iPhone.
- Gast → Login mit vorhandenen Lernsets und Fehlerfragen.
- schneller Logout/Kontowechsel während Profil-/Economy-Hydrierung.
- Lernplan speichern/laden/löschen während eines simulierten Kontowechsels.
- bestehender Cloud-Spielstand auf zweitem Gerät.
- gewertete Runde zweimal abgeben.
- abgelaufene oder fremde Quizsitzung abgeben.
- manipulierte Frage-ID und Antwortanzahl senden.
- fehlenden/beschädigten Antwort-Snapshot testen.
- Daily Quest zweimal abholen.
- Glücksrad zweimal am selben Tag und Logout während der Animation testen.
- Shopkauf ohne genügend Münzen.
- fällige SRS-Karten über einen realen Zeitübergang prüfen.
- kleine Due-Queue (0, 2, 10+) im Lernplan prüfen.
- Offline-Lernsetänderung und spätere Cloud-Synchronisierung testen.
- KI-Fallback bei blockierter AI-Logic-Anfrage.
- vollständigen Account-Export herunterladen und prüfen.
- Kontolöschung mit alter und frischer Auth-Sitzung testen.
- PWA frisch installieren, offline starten, aktualisieren und deinstallieren.
- Dark Mode, Zoom, Tastaturbedienung und kleine Displays prüfen.

## Release-Regel

Der Draft-PR darf erst als review-ready markiert oder gemergt werden, wenn die oben genannten echten Builds, Emulator-/E2E-Tests, Produktionskonfigurationen, rechtlichen Angaben und verbleibenden Geräte-/PWA-Checks abgeschlossen sind.
