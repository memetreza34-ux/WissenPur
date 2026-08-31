# WissenPur Produktions-Preflight

Der Produktions-Preflight ist eine **rein lesende Freigabeprüfung**. Er deployt, migriert und löscht nichts.

## Zweck

Vor einem echten Release müssen gleichzeitig stimmen:

1. Die Web-App ist auf das bewusst ausgewählte Firebase-Produktionsprojekt konfiguriert.
2. Produktionsschutz wie App Check, `(default)` Firestore und deaktivierte Emulator-/Debugpfade ist gesetzt.
3. Firebase AI Logic akzeptiert nur authentifizierte Nutzer und besitzt ein bewusst reduziertes per-user Rate-Limit.
4. AI-Monitoring und Budget-/Kostenschutz sind im realen Zielprojekt aktiviert und geprüft.
5. Kurzlebige Firestore-Daten besitzen aktivierte TTL-Policies.
6. Betreiber-, Datenschutz- und Freigabedaten sind vollständig bestätigt.

## 1. Produktionsprojekt explizit benennen

In der Repository-Root-Datei `.firebaserc` muss ein echter Alias vorhanden sein:

```json
{
  "projects": {
    "dev": "DEIN_DEV_PROJEKT",
    "production": "DEIN_PRODUKTIONS_PROJEKT"
  }
}
```

Der Preflight akzeptiert **keinen fehlenden `production`-Alias**. Er setzt den Alias nicht selbst.

## 2. Firebase AI Logic für Produktion absichern

Vor der Freigabe im echten Firebase-Projekt:

- Firebase App Check für AI Logic aktivieren und erzwingen.
- den **Authenticated-users mode** aktivieren, sodass Firebase AI Logic anonyme Requests projektseitig ablehnt.
- das per-user Kontingent für `Generate content requests` bewusst vom hohen Standardwert auf einen für WissenPur sinnvollen Wert reduzieren.
- AI-Monitoring aktivieren und mindestens Requests, Latenz, Fehler und Tokennutzung beobachten können.
- Budgetwarnungen und den vorgesehenen Kostenschutz des Produktionsprojekts aktivieren.

WissenPur erzeugt pro UI-Aktion ein vollständiges Lernset in einer einzelnen Generate-Content-Anfrage. Für den Release akzeptiert der Preflight deshalb nur einen dokumentierten Wert zwischen **1 und 20 RPM pro Nutzer**. Der konkrete Wert muss mit der realen Firebase-AI-Logic-Quota übereinstimmen; `10` ist lediglich ein konservatives Beispiel, kein automatisch gesetzter Wert.

Erst nach realer Prüfung setzen:

```dotenv
RELEASE_AI_AUTHENTICATED_USERS_CONFIRMED=true
RELEASE_AI_RATE_LIMIT_RPM=10
RELEASE_AI_MONITORING_CONFIRMED=true
RELEASE_BUDGET_GUARDS_CONFIRMED=true
```

Diese Variablen verändern keine Firebase-Einstellung. Sie sind ausschließlich fail-closed Release-Bestätigungen.

Zusätzlich besitzt der Web-Client einen Login-Gate vor der KI-Generierung. Dieser Client-Gate ist nur Defense-in-Depth und ersetzt **nicht** den projektseitigen Authenticated-users mode oder die Quotas.

## 3. Firestore TTL im echten Zielprojekt aktivieren

Vor der Freigabe müssen in der Produktionsdatenbank `(default)` zwei TTL-Policies aktiv sein:

- Collection Group `quizSessions` → Feld `expiresAt`
- Collection Group `serverRateLimits` → Feld `expiresAt`

Der Code schreibt die Ablaufzeit selbst:

- Quiz-Sessions: 30 Minuten nach Start
- Rate-Limit-Dokumente: 24 Stunden nach der letzten relevanten Aktualisierung

Wichtig: Ein vorhandenes `expiresAt`-Feld allein löscht noch nichts. Die TTL-Policy muss im echten Firestore-Projekt separat aktiviert sein. Erst danach darf die folgende Bestätigung gesetzt werden:

```dotenv
RELEASE_FIRESTORE_TTL_CONFIRMATION=quizSessions.expiresAt,serverRateLimits.expiresAt
```

Der Produktions-Preflight aktiviert oder verändert keine TTL-Policy selbst.

## 4. Release-Umgebung setzen

Erstelle lokal eine nicht versionierte `wissenpur/.env.production.local` oder setze dieselben Werte sicher in der Release-Umgebung.

Mindestens erforderlich:

```dotenv
VITE_RECAPTCHA_ENTERPRISE_SITE_KEY=REALER_APPCHECK_SITE_KEY
VITE_FIRESTORE_DATABASE_ID=(default)
VITE_PUBLIC_APP_URL=https://deine-produktions-domain.example

RELEASE_EXPECTED_FIREBASE_PROJECT_ID=DEIN_PRODUKTIONS_PROJEKT
RELEASE_PRODUCTION_FIREBASE_PROJECT_ID=DEIN_PRODUKTIONS_PROJEKT
RELEASE_PRODUCTION_CONFIRMATION=PRODUCTION:DEIN_PRODUKTIONS_PROJEKT:RELEASE
RELEASE_DEPLOYMENT_REVIEW_CONFIRMED=true

RELEASE_AI_AUTHENTICATED_USERS_CONFIRMED=true
RELEASE_AI_RATE_LIMIT_RPM=10
RELEASE_AI_MONITORING_CONFIRMED=true
RELEASE_BUDGET_GUARDS_CONFIRMED=true

RELEASE_FIRESTORE_TTL_CONFIRMATION=quizSessions.expiresAt,serverRateLimits.expiresAt
RELEASE_FIREBASE_PROJECT_REVIEW_CONFIRMED=true

VITE_LEGAL_OPERATOR_NAME=ECHTER_BETREIBER
VITE_LEGAL_STREET=ECHTE_STRASSE_UND_HAUSNUMMER
VITE_LEGAL_POSTAL_CITY=PLZ_UND_ORT
VITE_LEGAL_COUNTRY=Deutschland
VITE_LEGAL_EMAIL=ECHTE_EMAIL
VITE_PRIVACY_EMAIL=ECHTE_EMAIL
VITE_SUPPORT_EMAIL=ECHTE_EMAIL
VITE_LEGAL_EFFECTIVE_DATE=YYYY-MM-DD
VITE_MINIMUM_AGE=16
VITE_LOG_RETENTION_DAYS=30
VITE_SESSION_RETENTION_DAYS=30
VITE_SUPPORT_RETENTION_DAYS=180
VITE_LEGAL_REVIEW_CONFIRMED=true

VITE_ENABLE_APPCHECK_DEBUG=false
VITE_USE_FUNCTIONS_EMULATOR=false
```

Die beiden Projektvariablen, `firebase-applet-config.json` und `.firebaserc -> projects.production` müssen exakt dieselbe Projekt-ID enthalten.

## 5. Nur Preflight ausführen

```bash
cd wissenpur
npm run preflight:production
```

Erwartetes Verhalten:

- fehlende oder Platzhalter-Werte → **Fehler**
- fehlender `projects.production`-Alias → **Fehler**
- Projekt-ID stimmt nicht überein → **Fehler**
- falsche Bestätigungsphrase → **Fehler**
- benannte Firestore-Datenbank statt `(default)` → **Fehler**
- fehlende/falsche TTL-Bestätigung → **Fehler**
- AI Authenticated-users mode nicht bestätigt → **Fehler**
- AI per-user Rate-Limit fehlt, ist nicht ganzzahlig oder liegt außerhalb 1..20 RPM → **Fehler**
- AI-Monitoring nicht bestätigt → **Fehler**
- Budget-/Kostenschutz nicht bestätigt → **Fehler**
- App-Check-Debugmodus → **Fehler**
- Functions-Emulator → **Fehler**
- localhost/lokale Produktions-URL → **Fehler**
- echte, konsistente Produktionswerte → Preflight erfolgreich

Der Befehl führt **kein** `firebase deploy`, keine Quota-/Auth-/Monitoring-Konfiguration, keine TTL-Konfiguration, keine Datenmigration und kein Cleanup aus.

## 6. Release-Build

```bash
npm run build:release
```

Dieser Befehl führt aus:

1. TypeScript-Prüfung
2. Produktions-Preflight
3. Vite-Produktionsbuild

Ein Release-Build kann den Preflight daher nicht umgehen.

## 7. Selbsttest der Sicherheitslogik

```bash
npm run preflight:self-test
```

Der Selbsttest verwendet ausschließlich synthetische Testwerte. Er benötigt kein Firebase-Projekt und keine Produktionszugänge. Er prüft unter anderem, dass folgende fehlende oder unsichere Bestätigungen blockieren:

- Firestore-TTL
- AI Authenticated-users mode
- zu hohes beziehungsweise ungültiges AI-RPM-Limit
- AI-Monitoring
- Budget-/Kostenschutz
- falsches Produktionsprojekt
- Functions-Emulator

## 8. Deployment bleibt separat

Ein erfolgreicher Preflight bedeutet nur: **Die statisch prüfbaren Freigabedaten und manuellen Produktionsbestätigungen sind konsistent.**

Vor einem echten Deployment bleiben zusätzlich erforderlich:

- GitHub-Hosted-CI erfolgreich
- alle drei Package-Lockfiles reproduzierbar und CI auf `npm ci`
- App Check im Zielprojekt aktiviert und erzwungen
- Firebase AI Logic Authenticated-users mode real aktiviert
- AI per-user Quota real auf den bestätigten Wert gesetzt
- AI-Monitoring sowie Budget-/Kostenschutz real geprüft
- Auth/Functions/Firestore/AI Logic im Zielprojekt geprüft
- Firestore-TTL für `quizSessions.expiresAt` und `serverRateLimits.expiresAt` real aktiviert
- Firestore-Migration nach `(default)` abgeschlossen
- Legacy-Cleanup zunächst als Dry Run geprüft
- mobile/Desktop-E2E-Tests und Rollback-Test erfolgreich
- reale Betreiber-/Rechtstexte final geprüft

Erst danach darf ein separater, bewusst ausgeführter Deployment-Schritt erfolgen.
