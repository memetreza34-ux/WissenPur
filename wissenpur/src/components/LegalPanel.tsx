import { useState } from 'react';
import { FileText, Scale, Shield, X } from 'lucide-react';
import {
  legalConfig,
  legalConfigurationComplete,
} from '../config/legalConfig';

type LegalTab = 'imprint' | 'privacy' | 'terms';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
    <h3 className="text-lg font-black text-slate-950 dark:text-white">{title}</h3>
    <div className="mt-3 space-y-3 text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">
      {children}
    </div>
  </section>
);

export const LegalPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<LegalTab>('imprint');

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-44 right-4 z-[80] flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-xs font-black text-slate-700 shadow-xl backdrop-blur-xl hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-100"
        aria-label="Impressum, Datenschutz und Nutzungsbedingungen öffnen"
      >
        <Scale size={18} className="text-slate-600 dark:text-slate-300" />
        Rechtliches
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-dialog-title"
            className="max-h-[94dvh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">WissenPur</p>
                <h2 id="legal-dialog-title" className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
                  Rechtliche Informationen
                </h2>
              </div>
              <button
                type="button"
                aria-label="Rechtliche Informationen schließen"
                onClick={() => setIsOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {!legalConfigurationComplete && (
              <div className="mt-5 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm font-black text-rose-900 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-100">
                Entwicklungsstand: Betreiberangaben oder rechtliche Freigabe fehlen. Diese Version darf nicht öffentlich veröffentlicht werden.
              </div>
            )}

            <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-2 dark:bg-slate-800">
              {([
                ['imprint', 'Impressum', FileText],
                ['privacy', 'Datenschutz', Shield],
                ['terms', 'Bedingungen', Scale],
              ] as const).map(([id, label, Icon]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-3 text-[10px] font-black uppercase tracking-wider sm:flex-row sm:text-xs ${tab === id ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white' : 'text-slate-500'}`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              {tab === 'imprint' && (
                <>
                  <Section title="Anbieter und Verantwortlicher">
                    <address className="not-italic">
                      <strong>{legalConfig.operatorName || '[Betreibername fehlt]'}</strong><br />
                      {legalConfig.street || '[Straße fehlt]'}<br />
                      {legalConfig.postalCity || '[Ort fehlt]'}<br />
                      {legalConfig.country || '[Land fehlt]'}
                    </address>
                    <p>
                      E-Mail: <a className="font-bold text-blue-600 underline" href={`mailto:${legalConfig.legalEmail}`}>{legalConfig.legalEmail || '[E-Mail fehlt]'}</a><br />
                      Support: <a className="font-bold text-blue-600 underline" href={`mailto:${legalConfig.supportEmail}`}>{legalConfig.supportEmail || '[Support fehlt]'}</a>
                    </p>
                  </Section>

                  <Section title="Inhalt und technische Verfügbarkeit">
                    <p>WissenPur stellt Lern-, Quiz-, Karteikarten- und KI-gestützte Übungsfunktionen bereit. KI-Inhalte können unvollständig oder fehlerhaft sein und müssen vor einer wichtigen Verwendung geprüft werden.</p>
                    <p>Es besteht kein Anspruch auf eine jederzeit unterbrechungsfreie Verfügbarkeit. Sicherheits-, Wartungs- und Missbrauchsschutzmaßnahmen können Funktionen zeitweise begrenzen.</p>
                  </Section>

                  <Section title="Kontakt für rechtliche Anliegen">
                    <p>Rechtliche Anfragen und Hinweise zu Inhalten können an <a className="font-bold text-blue-600 underline" href={`mailto:${legalConfig.legalEmail}`}>{legalConfig.legalEmail || '[E-Mail fehlt]'}</a> gerichtet werden.</p>
                  </Section>
                </>
              )}

              {tab === 'privacy' && (
                <>
                  <Section title="Verantwortlicher und Kontakt">
                    <p>Verantwortlich für die Verarbeitung ist {legalConfig.operatorName || '[Betreibername fehlt]'}, {legalConfig.street || '[Straße fehlt]'}, {legalConfig.postalCity || '[Ort fehlt]'}, {legalConfig.country || '[Land fehlt]'}.</p>
                    <p>Datenschutzanfragen: <a className="font-bold text-blue-600 underline" href={`mailto:${legalConfig.privacyEmail}`}>{legalConfig.privacyEmail || '[Datenschutzkontakt fehlt]'}</a></p>
                    <p>Stand dieser Informationen: {legalConfig.effectiveDate || '[Datum fehlt]'}</p>
                  </Section>

                  <Section title="Welche Daten verarbeitet werden">
                    <ul className="list-disc space-y-2 pl-5">
                      <li>Kontodaten aus Firebase Authentication, insbesondere UID, Anzeigename, E-Mail-Adresse, Profilbild und Login-Anbieter.</li>
                      <li>Lernfortschritt, Antworten, Punkte, Münzen, Streaks, Erfolge, Lernpläne, eigene Lernsets und gespeicherte Fehlerfragen.</li>
                      <li>Quiz-Sitzungen, Sicherheitsnachweise und technische Metadaten zur Verhinderung doppelter oder manipulierter Wertungen.</li>
                      <li>Auf dem aktuellen Gerät eine kompakte persönliche Lernanalyse mit Zeitpunkten, Kategorien und Ergebniskennzahlen neuer Prüfungen. Sie enthält keine Fragentexte, Antworten oder Lösungsschlüssel.</li>
                      <li>Texteingaben für KI-Lernsets sowie die daraus erzeugten Fragen und Erklärungen.</li>
                      <li>Technische Verbindungs-, Sicherheits- und Fehlerdaten, soweit sie durch Hosting, Functions, Firestore, App Check oder reCAPTCHA Enterprise anfallen.</li>
                    </ul>
                  </Section>

                  <Section title="Eingesetzte Dienste">
                    <ul className="list-disc space-y-2 pl-5">
                      <li>Firebase Authentication für Anmeldung und Kontoverwaltung.</li>
                      <li>Cloud Firestore für Profile, Fortschritt, Lernpläne, Rangliste und Sitzungen.</li>
                      <li>Cloud Functions for Firebase für serverseitige Wertung, Belohnungen, Export und Löschung.</li>
                      <li>Firebase Hosting beziehungsweise der konfigurierte Hostinganbieter für die Web-App.</li>
                      <li>Firebase App Check und reCAPTCHA Enterprise zum Schutz vor automatisiertem Missbrauch.</li>
                      <li>Firebase AI Logic und Google Gemini für ausdrücklich gestartete KI-Lernfunktionen.</li>
                      <li>Externe Bildquellen können beim Anzeigen einzelner Lerninhalte die IP-Adresse des Geräts erhalten. Vor Release sind alle verwendeten Domains abschließend zu dokumentieren oder durch eigenes Hosting zu ersetzen.</li>
                    </ul>
                  </Section>

                  <Section title="Lokale Speicherung">
                    <p>Die App verwendet Browser-Speicher für Offline-Fortschritt, Einstellungen, Lernplan, Lernsets und die persönliche Lernanalyse. Kontoabhängige lokale Daten werden beim Logout und bei der vollständigen Kontolöschung entfernt.</p>
                    <p>Die Lernanalyse bleibt gerätegebunden und wird nicht für Punkte oder Ranglisten verwendet. Bei einem JSON-Datenexport wird sie nach Prüfung des lokalen Besitzer-Markers ausschließlich im Browser an die heruntergeladene Datei angefügt; dafür wird sie nicht in Firestore hochgeladen.</p>
                  </Section>

                  <Section title="Speicherdauer">
                    <ul className="list-disc space-y-2 pl-5">
                      <li>Kontodaten und servergespeicherter Lernfortschritt: bis zur Kontolöschung oder bis eine andere erforderliche Frist abläuft.</li>
                      <li>Lokale Lernanalyse: höchstens 80 neue Sitzungen auf dem aktuellen Gerät, bis Logout, Kontolöschung oder Browserdaten-Löschung sie entfernt.</li>
                      <li>Quiz-Sitzungen und Rundennachweise: höchstens {legalConfig.sessionRetentionDays || '[Frist fehlt]'} Tage, zusätzlich technisch über Ablaufzeit und TTL begrenzt.</li>
                      <li>Technische Sicherheits- und Fehlerlogs: höchstens {legalConfig.logRetentionDays || '[Frist fehlt]'} Tage, soweit der jeweilige Dienst dies unterstützt.</li>
                      <li>Supportanfragen: höchstens {legalConfig.supportRetentionDays || '[Frist fehlt]'} Tage nach Abschluss, sofern keine gesetzlichen Pflichten entgegenstehen.</li>
                    </ul>
                  </Section>

                  <Section title="Rechte und Selbstbedienung">
                    <p>Angemeldete Nutzer können über „Daten“ einen JSON-Export anfordern. Der Download enthält die serverseitig exportierbaren Kontodaten und ergänzt die zu diesem Konto gehörende lokale Lernanalyse des aktuell verwendeten Browsers.</p>
                    <p>Über dieselbe Oberfläche kann das Konto technisch selbst gelöscht werden. Dabei werden nach erfolgreicher Serverlöschung auch kontoabhängige lokale Daten dieses Browsers entfernt.</p>
                    <p>Darüber hinaus können Auskunft, Berichtigung, Einschränkung, Widerspruch und weitere anwendbare Rechte über den Datenschutzkontakt geltend gemacht werden. Eine Beschwerde bei einer zuständigen Datenschutzaufsichtsbehörde bleibt möglich.</p>
                  </Section>

                  <Section title="Minderjährige">
                    <p>Das konfigurierte Mindestalter beträgt {legalConfig.minimumAge || '[Alter fehlt]'} Jahre. Das tatsächliche Alters- und Einwilligungskonzept muss zur Zielgruppe und zum Veröffentlichungsland passen und wurde für den Release gesondert bestätigt.</p>
                  </Section>
                </>
              )}

              {tab === 'terms' && (
                <>
                  <Section title="Geltungsbereich">
                    <p>Diese Bedingungen gelten für die Nutzung von WissenPur unter {legalConfig.publicAppUrl || '[App-URL fehlt]'}. Mit der Nutzung werden sie in ihrer jeweils veröffentlichten Fassung akzeptiert, soweit rechtlich zulässig.</p>
                  </Section>

                  <Section title="Lern- und KI-Inhalte">
                    <p>WissenPur ist ein Lernwerkzeug und ersetzt keine fachliche, medizinische, rechtliche, finanzielle oder sicherheitskritische Beratung. Automatisch erzeugte Inhalte können Fehler enthalten. Nutzer müssen wichtige Aussagen anhand geeigneter Quellen prüfen.</p>
                  </Section>

                  <Section title="Nutzerinhalte">
                    <p>Nutzer dürfen nur Inhalte eingeben oder hochladen, die sie verwenden dürfen. Verboten sind insbesondere rechtswidrige Inhalte, persönliche Daten Dritter ohne Grundlage, Schadsoftware, Täuschungsversuche und die Umgehung technischer Schutzmaßnahmen.</p>
                    <p>Erforderliche Nutzungsrechte werden nur in dem Umfang eingeräumt, der für Speicherung, Synchronisierung und die ausdrücklich ausgewählten Lernfunktionen notwendig ist.</p>
                  </Section>

                  <Section title="Rangliste und Fairness">
                    <p>Gewertete Punkte entstehen ausschließlich in servergeprüften Prüfungsrunden. Manipulation, automatisierte Massennutzung, Mehrfachkonten zur Wettbewerbsverzerrung und Eingriffe in Sitzungen können zur Entfernung von Wertungen oder zur Sperrung führen.</p>
                  </Section>

                  <Section title="Konto und Beendigung">
                    <p>Nutzer sind für den Schutz ihres Kontozugangs verantwortlich. Das Konto kann über die Datenschutzfunktion selbst gelöscht werden. Der Betreiber kann Zugänge bei Sicherheitsrisiken, Missbrauch oder erheblichen Verstößen beschränken, soweit dies verhältnismäßig und rechtlich zulässig ist.</p>
                  </Section>

                  <Section title="Änderungen und Kontakt">
                    <p>Erforderliche Änderungen an Funktionen oder Bedingungen werden transparent veröffentlicht. Bei wesentlichen Änderungen wird eine angemessene Information beziehungsweise erneute Zustimmung vorgesehen, soweit erforderlich.</p>
                    <p>Kontakt: <a className="font-bold text-blue-600 underline" href={`mailto:${legalConfig.supportEmail}`}>{legalConfig.supportEmail || '[Support fehlt]'}</a></p>
                  </Section>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
};
