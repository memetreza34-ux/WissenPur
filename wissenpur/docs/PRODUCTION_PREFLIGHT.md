# WissenPur Produktions-Preflight

Der Produktions-Preflight ist eine **rein lesende Freigabeprüfung**. Er deployt, migriert und löscht nichts.

## Zweck

Vor einem echten Release müssen drei Dinge gleichzeitig stimmen:

1. Die Web-App ist auf das bewusst ausgewählte Firebase-Produktionsprojekt konfiguriert.
2. Produktionsschutz wie App Check, `(default)` Firestore und deaktivierte Emulator-/Debugpfade ist gesetzt.
3. Betreiber-, Datenschutz- und Freigabedaten sind vollständig bestätigt.

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

## 2. Release-Umgebung setzen

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

## 3. Nur Preflight ausführen

```bash
cd wissenpur
npm run preflight:production
```

Erwartetes Verhalten:

- fehlende oder Platzhalter-Werte -> **Fehler**
- fehlender `projects.production`-Alias -> **Fehler**
- Projekt-ID stimmt nicht überein -> **Fehler**
- falsche Bestätigungsphrase -> **Fehler**
- benannte Firestore-Datenbank statt `(default)` -> **Fehler**
- App-Check-Debugmodus -> **Fehler**
- Functions-Emulator -> **Fehler**
- localhost/lokale Produktions-URL -> **Fehler**
- echte, konsistente Produktionswerte -> Preflight erfolgreich

Der Befehl führt **kein** `firebase deploy`, keine Datenmigration und kein Cleanup aus.

## 4. Release-Build

```bash
npm run build:release
```

Dieser Befehl führt aus:

1. TypeScript-Prüfung
2. Produktions-Preflight
3. Vite-Produktionsbuild

Ein Release-Build kann den Preflight daher nicht umgehen.

## 5. Selbsttest der Sicherheitslogik

```bash
npm run preflight:self-test
```

Der Selbsttest verwendet ausschließlich synthetische Testwerte. Er benötigt kein Firebase-Projekt und keine Produktionszugänge.

## 6. Deployment bleibt separat

Ein erfolgreicher Preflight bedeutet nur: **Die statisch prüfbaren Freigabedaten sind konsistent.**

Vor einem echten Deployment bleiben zusätzlich erforderlich:

- GitHub-Hosted-CI erfolgreich
- App Check im Zielprojekt aktiviert und erzwungen
- Auth/Functions/Firestore/AI Logic im Zielprojekt geprüft
- Quotas, Budgetwarnungen und Monitoring eingerichtet
- Firestore-Migration nach `(default)` abgeschlossen
- Legacy-Cleanup zunächst als Dry Run geprüft
- mobile/Desktop-E2E-Tests und Rollback-Test erfolgreich
- reale Betreiber-/Rechtstexte final geprüft

Erst danach darf ein separater, bewusst ausgeführter Deployment-Schritt erfolgen.
