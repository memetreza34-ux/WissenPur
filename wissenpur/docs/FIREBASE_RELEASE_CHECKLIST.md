# Firebase- und Release-Checkliste für WissenPur

Diese Checkliste beschreibt den aktuellen sicheren Release-Pfad von Draft-PR #2. Sie ersetzt frühere Hinweise auf `recordRoundResult`, `startRankedQuiz`, direkte Browserreads von `trustedLeaderboard`, eine benannte Produktionsdatenbank oder noch fehlende PWA-PNG-Assets.

## 1. GitHub- und Paket-Voraussetzungen

Vor jeder Freigabe:

- GitHub Actions Billing/Spending-Limit so konfigurieren, dass Runner tatsächlich starten.
- exakt Node `22.12.0` und npm `10.9.2` für die reproduzierbare Dependency-Erzeugung verwenden.
- im Repository-Root `node scripts/regenerate-package-locks.mjs` ausführen.
- `wissenpur/package-lock.json`, `functions/package-lock.json` und `rules-tests/package-lock.json` prüfen und committen.
- danach alle drei CI-Installationen gemeinsam von `npm install` auf `npm ci` umstellen.
- Frontend-Typecheck und Produktionsbuild erfolgreich aus einem frischen Checkout ausführen.
- Functions-Verify und Functions-Compile erfolgreich aus einem frischen Checkout ausführen.
- Firestore-Regeltests mit Emulator und mindestens zwei getrennten Konten erfolgreich ausführen.

Der Lockfile-Helfer ist transaktional: Scheitert ein Workspace, werden bereits veränderte Lockfiles auf den Zustand vor dem Lauf zurückgesetzt.

Ein GitHub-Job mit leerer `steps`-Liste und `runner_id: 0` ist **kein ausgeführter Test** und weder ein bestätigter Codefehler noch ein erfolgreicher CI-Nachweis.

## 2. CI-Supply-Chain

Der Quality-Workflow muss vor Freigabe weiterhin folgende Eigenschaften besitzen:

- `permissions: contents: read`
- kein `pull_request_target`
- keine Deploy-, Cleanup-, Firestore-Import- oder Firestore-Export-Kommandos
- feste Job-Zeitlimits und Concurrency-Abbruch älterer Läufe
- `wissenpur/**`, `functions/**`, `rules-tests/**` und `scripts/**` in den PR-/Push-Triggern
- Node `22.12.0` und npm `10.9.2` exakt gepinnt
- `actions/checkout`, `actions/setup-node` und `actions/setup-java` ausschließlich über die im CI-Safety-Gate freigegebenen Commit-SHAs
- `persist-credentials: false` für Checkout
- keine neue GitHub Action außerhalb der expliziten Allowlist

## 3. Firebase-Projekte

Empfohlen sind getrennte Projekte für Entwicklung, Staging und Produktion. Entwicklungs- und Produktionsdaten dürfen nicht im selben Firestore-Projekt liegen.

Produktion verwendet die Firestore-Datenbank **`(default)`**. Eine benannte Produktionsdatenbank wird sowohl im Frontend-Runtimepfad als auch in der Functions-Runtime blockiert. Eine benannte Datenbank darf nur bewusst im lokalen Emulator für isolierte Tests verwendet werden.

`.firebaserc` erhält einen echten `production`-Alias erst nach bewusster Auswahl und Gegenprüfung des Zielprojekts.

## 4. Firebase AI Logic

1. Firebase AI Logic im echten Zielprojekt aktivieren.
2. das im Frontend konfigurierte Modell und Backend prüfen.
3. Abrechnung, APIs und Nutzungsbedingungen kontrollieren.
4. App Check für die AI-Logic-Nutzung konfigurieren und erzwingen.
5. Testanfragen im Staging-Projekt ausführen.
6. Fehlerquote, Latenz, Tokens, 429-Antworten und Kosten überwachen.
7. nutzerbezogene Kontingente und Kostenlimits festlegen.

Ein privater Gemini/API-Schlüssel darf nicht als Vite-Variable oder Browser-Bundle-Konstante ausgeliefert werden.

Die aktive KI-Implementierung validiert Schema, Frageanzahl, eindeutige Optionen, Lösungsindex, Erklärung und Duplikate. Schlägt die Generierung fehl oder ist die Ausgabe nicht vollständig gültig, wird die Anfrage kontrolliert abgebrochen. Es existiert **kein automatischer lokaler KI-Fallback**, der in diesem Fall still andere Fragen einsetzt.

## 5. App Check

1. In Google Cloud einen score-basierten reCAPTCHA-Enterprise-Websiteschlüssel anlegen.
2. ausschließlich echte Dev-, Staging- und Produktionsdomains zulassen.
3. WissenPur unter **Firebase → Security → App Check → Apps** registrieren.
4. `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` im Hosting setzen.
5. App Check für Firebase AI Logic aktivieren.
6. Callable Functions zunächst in Staging prüfen.
7. Enforcement für die produktiven Callable Functions aktivieren beziehungsweise verifizieren.

### Lokale Entwicklung

In `wissenpur/.env.local` dürfen für Entwicklungszwecke beispielsweise gesetzt werden:

```env
VITE_RECAPTCHA_ENTERPRISE_SITE_KEY=dein_site_key
VITE_ENABLE_APPCHECK_DEBUG=true
VITE_USE_FUNCTIONS_EMULATOR=true
VITE_FIRESTORE_DATABASE_ID=(default)
```

Den Debugtoken nur im Entwicklungsprojekt registrieren. Debugmodus und Functions-Emulator sind in Produktion verboten und werden vom Produktions-Preflight blockiert.

## 6. Cloud Functions und autoritative Economy

Die Produktions-Functions verwenden Node.js 22 und Firestore `(default)`.

Aktueller sicherer Ranked-Fluss:

1. `startSecureRankedQuiz`
2. `submitRankedQuiz`
3. `revealSecureRankedQuiz`

Eigenschaften:

- Backend wählt die Fragen.
- Browser erhält vor Abgabe keinen Lösungsindex und keine Erklärung.
- jede Quizsitzung besitzt einen unveränderlichen Antwort-Snapshot.
- Submit wertet nur gegen diesen Snapshot.
- Reveal funktioniert erst nach erfolgreicher Abgabe.
- Economy und `trustedLeaderboard` werden ausschließlich serverseitig autoritativ verändert.

Aktuelle serververwaltete Economy umfasst unter anderem:

- Punkte und Münzen
- Streaks
- Kategorienstatistik
- Wochenziel
- Erfolge
- Daily Quest
- Glücksrad
- Shop und Power-up-Bestand
- Shop-Avatar
- Ranglistenwerte

`getMyEconomyState` normalisiert die Economy bei jeder neuen Auth-Sitzung serverseitig. Gast-/Legacy-Economy wird nicht als vertrauenswürdiger Kontostand migriert.

## 7. Rangliste und Datenschutz

`trustedLeaderboard` ist **nicht public-read**. Browser-Direktreads und Browser-Writes sind vollständig verboten. Die öffentliche Darstellung läuft ausschließlich über `getTrustedLeaderboard`.

Prüfen:

- ein normaler Browserread der Collection schlägt fehl.
- auch ein Direktread einer bekannten `trustedLeaderboard/{uid}`-Dokument-ID schlägt fehl.
- die Callable liefert nur die minimal nötigen, serverseitig sanitisierten Felder.
- Ranglisten-Avatare akzeptieren ausschließlich lokale `/avatars/*.svg`-Assets.
- externe Provider-`photoURL`-Werte gelangen nicht als Ranglistenavatar in die Ausgabe.
- fremde stabile Account-IDs werden in der öffentlichen Liste redigiert; nur der angemeldete Nutzer darf seine eigene UID zur Markierung der eigenen Zeile zurückerhalten.

Provider-Anzeigename und Provider-Profilbild werden nicht zusätzlich als Lernprofilfelder in Firestore gespiegelt.

## 8. Missbrauchs- und Kostenlimits

Vor Produktion mit Lasttests prüfen:

- Ranked-Quizstarts: maximal 12 Starts pro Minute und Konto.
- allgemeine geschützte Callables: 120 Aktionen pro Minute und Konto.
- Kontodatenexport: 5 Exporte pro 10 Minuten.
- Kontolöschung verwendet nicht den engen Export-Bucket, benötigt aber App Check und Recent-Reauth.

`serverRateLimits/{uid}` ist für Browser vollständig gesperrt und besitzt `expiresAt` für eine vorgesehene TTL von 24 Stunden.

## 9. Konto-, Gast- und Sync-Verhalten

Mit echten Testkonten prüfen:

- Gast erstellt Lernsets und Fehlerfragen → erster Login übernimmt diese Lerninhalte.
- lokale + Cloud-Lernsets werden vereinigt; lokale Fassung gewinnt bei gleicher Deck-ID.
- lokale + Cloud-Fehlerfragen werden vereinigt; lokale Fassung gewinnt bei gleicher Frage-ID.
- Lernplan verwendet `updatedAt` zur Konfliktentscheidung.
- Gastpunkte/Münzen werden **nicht** als Kontopunkte übernommen.
- Konto A → Konto B entfernt beziehungsweise isoliert lokale Daten von Konto A.
- Konto → Logout/Auth-Verlust entfernt kontoabhängige Browserdaten.
- Logout/Kontowechsel während Hydrierung darf keine verspätete Antwort lokal persistieren.
- Lernplan-Laden, -Speichern und -Löschen bleibt an die UID gebunden, mit der der Vorgang gestartet wurde.
- Glücksrad-Serverstand wird UID-gebunden übernommen; Animationstimer dürfen keine Kontodaten schreiben.
- ein über Mitternacht geöffnetes Glücksrad gibt am nächsten Berlin-Kalendertag den neuen Tagesdreh ohne Reload frei.
- erste Auth-Hydrierung ist strikt; spätere Profil-/Lerninhalt-Syncs dürfen offline Best Effort sein.

## 10. Lernsets, SRS und Lernplan

Prüfen:

- JSON-, CSV- und TSV-Import.
- manuelles Erstellen und Bearbeiten.
- zentrale Bibliothekslimits: 100 Sets, 500 Fragen, 700.000 serialisierte Bytes.
- neue manuelle Sets maximal 30 Fragen; bestehende/importierte Sets maximal 100 Fragen.
- fällige Karten werden in **Heute**, **Bibliothek** und **Lernplan** über dieselbe zentrale Due-Queue bestimmt.
- fällige Queue aktualisiert sich bei offen bleibender App zeitbasiert.
- „Heute“ öffnet ausschließlich wirklich fällige Karten.
- nach SRS-Bewertung wird der aktuelle gespeicherte Kartenstand wieder in die Produktoberfläche übernommen.
- Lernplan empfiehlt niemals mehr Karteikarten als tatsächlich fällig sind.
- 0 fällige Karten ergeben 0 empfohlene Karten.
- Probeprüfung zeigt Lösungen erst nach Ende und vergibt keine Ranglistenpunkte.

## 11. Firestore-Regeln

Mindestens testen:

- Nutzer A kann private Daten von Nutzer B nicht lesen oder verändern.
- Nutzer kann seine UID im eigenen Dokument nicht austauschen.
- Browser kann keine Economy-, Inventar-, Shop-, Ranked-, Quiz-Session- oder Rate-Limit-Felder autoritativ schreiben.
- `trustedLeaderboard` ist für Browser **weder lesbar noch beschreibbar**.
- `quizSessions` und `serverRateLimits` sind für Browser vollständig gesperrt.
- Lernplan akzeptiert nur die definierte Feldstruktur.
- `customDifficultyTimes` erlaubt nur die vorgesehenen Schlüssel und Wertebereiche.
- `wrongQuestions` und `customQuizzes` halten die festgelegten Listenlimits ein.
- Lobby-/Duel-Altpfade sind für normale Release-Clients gesperrt.

Die Admin SDK in Cloud Functions umgeht Clientregeln. Eingaben müssen daher zusätzlich serverseitig validiert werden.

## 12. Firestore-TTL

Vor Produktionsfreigabe im echten `(default)`-Projekt aktivieren und kontrollieren:

- `quizSessions.expiresAt`
- `serverRateLimits.expiresAt`

Erwartete fachliche Retention:

- Ranked-Sitzung technisch etwa 30 Minuten aktiv.
- Rate-Limit-Dokumente mit 24-Stunden-`expiresAt`.

TTL-Löschung erfolgt asynchron und ist nicht identisch mit dem fachlichen Ablaufzeitpunkt. Der Produktions-Preflight verlangt nach realer Aktivierung die exakte Bestätigung:

```text
quizSessions.expiresAt,serverRateLimits.expiresAt
```

## 13. Datenmigration und Legacy-Cleanup

Vor Produktion:

- Managed Export/Import kontrolliert nach `(default)` planen und ausführen.
- Quellprojekt/-datenbank und Zielprojekt bewusst gegenprüfen.
- alte client-schreibbare Ranglistenwerte nicht als vertrauenswürdig übernehmen.
- Legacy-Cleanup zuerst ausschließlich als Dry Run ausführen.
- reale Löschung nur mit explizit bestätigter Allowlist durchführen.
- Cleanup niemals automatisch in Build oder Deploy integrieren.
- Rangliste zum öffentlichen Start bei Bedarf als neue Saison beginnen.

## 14. Datenexport und Kontolöschung

Prüfen:

- Export enthält die vorgesehenen Kontodaten und eigenen Firestore-Daten.
- vertrauliche Quiz-Antwortschlüssel sind redigiert.
- lokale Lernanalyse wird clientseitig ergänzt und dafür nicht unnötig in Firestore hochgeladen.
- Export-Rate-Limit funktioniert.
- Export und Löschung bleiben an die UID gebunden, mit der der Vorgang gestartet wurde.
- Kontolöschung verlangt ausreichend aktuelle Authentifizierung.
- Kontolöschung entfernt die vorgesehenen nutzerbezogenen Release-/Legacy-Daten und das Auth-Konto.
- Browser-LocalStorage/SessionStorage werden anschließend aus dem Kontokontext bereinigt.

## 15. PWA, Offline und Hosting

Statisch vorhanden und automatisch geprüft:

- Service Worker v7 mit explizitem Root-Scope.
- `sw.js` und Root-App-Shell ohne langlebigen HTTP-Cache.
- gehashte `/assets/**` ein Jahr `immutable`.
- Build-Asset-Precache aus der gebauten `index.html`.
- Navigation speichert keine vollständigen Query-URLs im Runtime-Cache.
- Offline-Navigation fällt auf die feste App-Shell zurück.
- Cache-Cleanup beschränkt sich auf alte `wissenpur-*`-Caches.
- lokale Avatare werden offline gecacht.
- 192×192 PNG-App-Icon.
- 512×512 PNG-App-Icon.
- 512×512 maskable PNG-App-Icon.
- 180×180 Apple-Touch-PNG.
- PNG-Signaturen und IHDR-Abmessungen werden im PWA-Gate geprüft.
- Manifest-, mobile Web-App- und iOS-Standalone-Metadaten sind verdrahtet.
- globale Offline-/Online-Anzeige ist vorhanden.

Vor öffentlichem Release noch real prüfen:

- Installation auf aktuellem Chrome/Android.
- Installation/Standalone-Verhalten auf aktuellem Safari/iPhone.
- frisch installierte App direkt offline starten.
- Online → Offline → Online.
- Update von einer alten Cache-Version auf eine neue Release-Version.
- Android-Maskierung auf Kreis/Squircle.
- Apple-Touch-Darstellung und iOS-Safe-Area-Verhalten.
- Desktop-PWA.
- Hosting-Snapshot/Restore und Clientverhalten nach Rollback.

## 16. Hosting- und Produktionsvariablen

Mindestens erforderlich beziehungsweise bewusst zu bestätigen sind unter anderem:

```env
VITE_RECAPTCHA_ENTERPRISE_SITE_KEY=...
VITE_ENABLE_APPCHECK_DEBUG=false
VITE_USE_FUNCTIONS_EMULATOR=false
VITE_FIRESTORE_DATABASE_ID=(default)
RELEASE_EXPECTED_FIREBASE_PROJECT_ID=...
RELEASE_PRODUCTION_FIREBASE_PROJECT_ID=...
RELEASE_DEPLOYMENT_REVIEW_CONFIRMED=true
RELEASE_FIRESTORE_TTL_CONFIRMATION=quizSessions.expiresAt,serverRateLimits.expiresAt
```

Zusätzlich müssen echte Betreiber-/Rechtswerte und der exakte Produktionsbestätigungstext gesetzt sein. `npm --prefix wissenpur run build:release` muss fail-closed blockieren, solange diese Werte fehlen oder Platzhalter enthalten.

Nicht als Browsergeheimnis verwenden:

```env
GEMINI_API_KEY=...
```

Quotas, Budgetwarnungen, Error Monitoring und Functions-/Firestore-/AI-Kostenüberwachung aktivieren.

## 17. Manueller Release-Test

- Google-Login auf Desktop, Android und iPhone.
- Gast → Login mit vorhandenen Lernsets und Fehlerfragen.
- schneller Logout/Kontowechsel während Profil-/Economy-Hydrierung.
- Lernplan speichern/laden/löschen während simuliertem Kontowechsel.
- bestehender Cloud-Spielstand auf zweitem Gerät.
- gewertete Runde zweimal abgeben.
- abgelaufene oder fremde Quizsitzung abgeben.
- manipulierte Frage-ID und Antwortanzahl senden.
- fehlenden/beschädigten Antwort-Snapshot testen.
- Daily Quest zweimal abholen.
- Glücksrad zweimal am selben Tag sowie über den Berlin-Tageswechsel testen.
- Logout/Kontowechsel während Glücksrad-Animation.
- Shopkauf ohne genügend Münzen.
- fällige SRS-Karten über einen realen Zeitübergang prüfen.
- kleine Due-Queue (0, 2, 10+) im Lernplan prüfen.
- Offline-Lernsetänderung und spätere Cloud-Synchronisierung testen.
- blockierte/ungültige AI-Logic-Anfrage: kontrollierte Fehlermeldung und **keine** still eingesetzten Ersatzfragen prüfen.
- vollständigen Account-Export prüfen.
- Kontolöschung mit alter und frischer Auth-Sitzung testen.
- PWA frisch installieren, offline starten, aktualisieren und deinstallieren.
- Dark Mode, Browser-Zoom, Tastaturbedienung, Dialog-Fokus und kleine Displays prüfen.

## Release-Regel

Draft-PR #2 darf erst als review-ready markiert oder gemergt werden, wenn die echten Hosted-CI-Läufe, reproduzierbaren Lockfiles, Clean-Checkout-Builds, Emulator-/E2E-Tests, Produktionskonfiguration, `(default)`-Migration, TTL, Rechtsangaben, Cleanup-, Rollback- und Realgerätechecks abgeschlossen sind.
