/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RECAPTCHA_ENTERPRISE_SITE_KEY?: string;
  readonly VITE_ENABLE_APPCHECK_DEBUG?: 'true' | 'false';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
