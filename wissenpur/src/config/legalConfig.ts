const clean = (value: string | undefined) => value?.trim() || '';
const placeholderPattern = /(todo|replace|muster|beispiel|example\.|example@|xxx)/i;

export const legalConfig = {
  publicAppUrl: clean(import.meta.env.VITE_PUBLIC_APP_URL),
  operatorName: clean(import.meta.env.VITE_LEGAL_OPERATOR_NAME),
  street: clean(import.meta.env.VITE_LEGAL_STREET),
  postalCity: clean(import.meta.env.VITE_LEGAL_POSTAL_CITY),
  country: clean(import.meta.env.VITE_LEGAL_COUNTRY),
  legalEmail: clean(import.meta.env.VITE_LEGAL_EMAIL),
  privacyEmail: clean(import.meta.env.VITE_PRIVACY_EMAIL),
  supportEmail: clean(import.meta.env.VITE_SUPPORT_EMAIL),
  effectiveDate: clean(import.meta.env.VITE_LEGAL_EFFECTIVE_DATE),
  minimumAge: Number.parseInt(clean(import.meta.env.VITE_MINIMUM_AGE) || '0', 10),
  legalReviewConfirmed: clean(import.meta.env.VITE_LEGAL_REVIEW_CONFIRMED).toLowerCase() === 'true',
  logRetentionDays: Number.parseInt(clean(import.meta.env.VITE_LOG_RETENTION_DAYS) || '0', 10),
  sessionRetentionDays: Number.parseInt(clean(import.meta.env.VITE_SESSION_RETENTION_DAYS) || '0', 10),
  supportRetentionDays: Number.parseInt(clean(import.meta.env.VITE_SUPPORT_RETENTION_DAYS) || '0', 10),
} as const;

const requiredTexts = [
  legalConfig.publicAppUrl,
  legalConfig.operatorName,
  legalConfig.street,
  legalConfig.postalCity,
  legalConfig.country,
  legalConfig.legalEmail,
  legalConfig.privacyEmail,
  legalConfig.supportEmail,
  legalConfig.effectiveDate,
];

export const legalConfigurationComplete =
  requiredTexts.every((value) => value.length > 0 && !placeholderPattern.test(value)) &&
  legalConfig.minimumAge >= 13 &&
  legalConfig.minimumAge <= 18 &&
  legalConfig.logRetentionDays > 0 &&
  legalConfig.sessionRetentionDays > 0 &&
  legalConfig.supportRetentionDays > 0 &&
  legalConfig.legalReviewConfirmed;
