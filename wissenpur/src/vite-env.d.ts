/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RECAPTCHA_ENTERPRISE_SITE_KEY?: string;
  readonly VITE_ENABLE_APPCHECK_DEBUG?: 'true' | 'false';
  readonly VITE_USE_FUNCTIONS_EMULATOR?: 'true' | 'false';
  readonly VITE_FIRESTORE_DATABASE_ID?: string;
  readonly VITE_PUBLIC_APP_URL?: string;
  readonly VITE_LEGAL_OPERATOR_NAME?: string;
  readonly VITE_LEGAL_STREET?: string;
  readonly VITE_LEGAL_POSTAL_CITY?: string;
  readonly VITE_LEGAL_COUNTRY?: string;
  readonly VITE_LEGAL_EMAIL?: string;
  readonly VITE_PRIVACY_EMAIL?: string;
  readonly VITE_SUPPORT_EMAIL?: string;
  readonly VITE_LEGAL_EFFECTIVE_DATE?: string;
  readonly VITE_MINIMUM_AGE?: string;
  readonly VITE_LOG_RETENTION_DAYS?: string;
  readonly VITE_SESSION_RETENTION_DAYS?: string;
  readonly VITE_SUPPORT_RETENTION_DAYS?: string;
  readonly VITE_LEGAL_REVIEW_CONFIRMED?: 'true' | 'false';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
