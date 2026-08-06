import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'dotenv';

const protectedProcessKeys = new Set(Object.keys(process.env));
const envFiles = ['.env', '.env.production', '.env.local', '.env.production.local'];

for (const filename of envFiles) {
  const filepath = resolve(process.cwd(), filename);
  if (!existsSync(filepath)) continue;
  const values = parse(readFileSync(filepath));
  for (const [key, value] of Object.entries(values)) {
    if (!protectedProcessKeys.has(key)) process.env[key] = value;
  }
}

const placeholderPattern = /(todo|replace|muster|beispiel|dein[_ -]|example\.|example@|xxx)/i;
const errors = [];

const requireText = (key, label, minLength = 2) => {
  const value = String(process.env[key] || '').trim();
  if (value.length < minLength) {
    errors.push(`${label} fehlt (${key}).`);
    return '';
  }
  if (placeholderPattern.test(value)) errors.push(`${label} enthält noch einen Platzhalter (${key}).`);
  return value;
};

const appUrl = requireText('VITE_PUBLIC_APP_URL', 'Öffentliche App-URL', 8);
const operatorName = requireText('VITE_LEGAL_OPERATOR_NAME', 'Betreibername');
const street = requireText('VITE_LEGAL_STREET', 'Straße und Hausnummer');
const postalCity = requireText('VITE_LEGAL_POSTAL_CITY', 'Postleitzahl und Ort');
const country = requireText('VITE_LEGAL_COUNTRY', 'Land');
const legalEmail = requireText('VITE_LEGAL_EMAIL', 'Impressums-E-Mail', 5);
const privacyEmail = requireText('VITE_PRIVACY_EMAIL', 'Datenschutzkontakt', 5);
const supportEmail = requireText('VITE_SUPPORT_EMAIL', 'Supportkontakt', 5);
const effectiveDate = requireText('VITE_LEGAL_EFFECTIVE_DATE', 'Datenschutz-Stichtag', 10);
const minimumAge = requireText('VITE_MINIMUM_AGE', 'Mindestalter', 1);
const appCheckKey = requireText('VITE_RECAPTCHA_ENTERPRISE_SITE_KEY', 'App-Check-Websiteschlüssel', 10);
const firestoreDatabase = requireText('VITE_FIRESTORE_DATABASE_ID', 'Firestore-Datenbank', 1);

if (appUrl && !/^https:\/\//i.test(appUrl)) errors.push('Die öffentliche App-URL muss HTTPS verwenden.');
for (const [label, email] of [['Impressums-E-Mail', legalEmail], ['Datenschutzkontakt', privacyEmail], ['Supportkontakt', supportEmail]]) {
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push(`${label} ist keine gültige E-Mail-Adresse.`);
}
if (effectiveDate && !/^\d{4}-\d{2}-\d{2}$/.test(effectiveDate)) {
  errors.push('Der Datenschutz-Stichtag muss YYYY-MM-DD verwenden.');
}
const parsedAge = Number(minimumAge);
if (minimumAge && (!Number.isInteger(parsedAge) || parsedAge < 13 || parsedAge > 18)) {
  errors.push('Das Mindestalter muss als ganze Zahl zwischen 13 und 18 festgelegt werden.');
}
if (firestoreDatabase && firestoreDatabase !== '(default)') {
  errors.push('Produktions-Releases müssen VITE_FIRESTORE_DATABASE_ID=(default) verwenden.');
}
if (String(process.env.VITE_ENABLE_APPCHECK_DEBUG || '').toLowerCase() === 'true') {
  errors.push('App-Check-Debugmodus darf in Produktion nicht aktiviert sein.');
}
if (String(process.env.VITE_USE_FUNCTIONS_EMULATOR || '').toLowerCase() === 'true') {
  errors.push('Der Functions-Emulator darf in Produktion nicht aktiviert sein.');
}

if (errors.length > 0) {
  console.error('\nWissenPur-Release wurde blockiert:\n');
  for (const error of errors) console.error(`- ${error}`);
  console.error('\nTrage echte Betreiber- und Produktionswerte in .env.production.local oder die Hosting-Umgebung ein.\n');
  process.exit(1);
}

console.log(`Release-Konfiguration geprüft für ${operatorName}, ${street}, ${postalCity}, ${country}.`);
console.log(`App: ${appUrl} | Datenschutz: ${privacyEmail} | App Check: ${appCheckKey.slice(0, 6)}…`);
