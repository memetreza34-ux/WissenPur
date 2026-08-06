/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RECAPTCHA_ENTERPRISE_SITE_KEY?: string;
  readonly VITE_ENABLE_APPCHECK_DEBUG?: 'true' | 'false';
  readonly VITE_USE_FUNCTIONS_EMULATOR?: 'true' | 'false';
  readonly VITE_FIRESTORE_DATABASE_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
