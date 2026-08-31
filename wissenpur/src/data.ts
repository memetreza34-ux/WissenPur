import { Category, Question } from './types';

/**
 * Public web content only.
 *
 * These questions are intentionally separate from the server-side ranked bank.
 * Their IDs are never accepted by ranked Cloud Functions. They provide a small
 * offline/guest practice mode without shipping competitive answer keys.
 */
export const CATEGORIES: Category[] = [
  { id: 'allgemein', title: 'Allgemeinwissen', description: 'Bunt gemischte Fragen aus allen Lebensbereichen.', icon: 'Globe', color: 'bg-blue-500' },
  { id: 'geschichte', title: 'Geschichte', description: 'Reise durch die Zeit und entdecke historische Ereignisse.', icon: 'History', color: 'bg-amber-600' },
  { id: 'geografie', title: 'Geografie', description: 'Länder, Städte, Berge und Meere unserer Erde.', icon: 'Map', color: 'bg-emerald-500' },
  { id: 'wissenschaft', title: 'Wissenschaft', description: 'Spannende Fakten aus Biologie, Chemie und Physik.', icon: 'Beaker', color: 'bg-purple-500' },
  { id: 'technik', title: 'Technik', description: 'Von Erfindungen bis zur modernen Digitalwelt.', icon: 'Cpu', color: 'bg-slate-700' },
  { id: 'sprache', title: 'Sprache', description: 'Wortschatz, Grammatik und sprachliche Rätsel.', icon: 'Languages', color: 'bg-rose-500' },
  { id: 'deutschland', title: 'Deutschland', description: 'Bundesländer, Städte, Geschichte und Kultur.', icon: 'Landmark', color: 'bg-orange-500' },
  { id: 'tiere', title: 'Tiere', description: 'Spannendes Wissen über die Tierwelt.', icon: 'Dog', color: 'bg-amber-500' },
  { id: 'weltall', title: 'Weltall', description: 'Sterne, Planeten und das Universum.', icon: 'Rocket', color: 'bg-indigo-600' },
  { id: 'sport', title: 'Sport', description: 'Regeln, Disziplinen und Sportgeschichte.', icon: 'Trophy', color: 'bg-red-500' },
  { id: 'kunst', title: 'Kunst', description: 'Epochen, Techniken und bekannte Werke.', icon: 'Sparkles', color: 'bg-pink-500' },
  { id: 'musik', title: 'Musik', description: 'Instrumente, Formen und Musiktheorie.', icon: 'Volume2', color: 'bg-fuchsia-500' },
  { id: 'filme', title: 'Filme & Serien', description: 'Filmtechnik, Genres und Erzählformen.', icon: 'Camera', color: 'bg-rose-600' },
  { id: 'literatur', title: 'Literatur', description: 'Texte, Gattungen und Stilmittel.', icon: 'BookOpen', color: 'bg-cyan-600' },
  { id: 'medizin', title: 'Medizin', description: 'Körper, Gesundheit und medizinische Grundlagen.', icon: 'Activity', color: 'bg-red-400' },
  { id: 'natur', title: 'Natur', description: 'Pflanzen, Ökosysteme und Naturphänomene.', icon: 'Leaf', color: 'bg-green-500' },
  { id: 'wirtschaft', title: 'Wirtschaft', description: 'Grundbegriffe aus Unternehmen und Märkten.', icon: 'BarChart', color: 'bg-blue-600' },
  { id: 'politik', title: 'Politik', description: 'Demokratie, Institutionen und Staatsformen.', icon: 'Landmark', color: 'bg-slate-600' },
  { id: 'mythologie', title: 'Mythologie', description: 'Sagen, Gottheiten und antike Erzählungen.', icon: 'Crown', color: 'bg-amber-400' },
  { id: 'videospiele', title: 'Videospiele', description: 'Spieldesign, Technik und Gaming-Geschichte.', icon: 'Cpu', color: 'bg-indigo-500' },
  { id: 'flaggen', title: 'Flaggen', description: 'Farben, Symbole und Länderflaggen.', icon: 'Flag', color: 'bg-blue-600' },
];

export const QUESTIONS: Question[] = [
  {
    id: 'offline-allgemein-1', category: 'allgemein', difficulty: 'leicht',
    question: 'Wie viele Minuten hat eine Stunde?',
    options: ['30', '45', '60', '90'], correctAnswer: 2,
    explanation: 'Eine Stunde besteht aus 60 Minuten.',
  },
  {
    id: 'offline-allgemein-2', category: 'allgemein', difficulty: 'leicht',
    question: 'Welche Form hat drei Seiten?',
    options: ['Kreis', 'Dreieck', 'Rechteck', 'Fünfeck'], correctAnswer: 1,
    explanation: 'Ein Dreieck besitzt drei Seiten und drei Ecken.',
  },
  {
    id: 'offline-allgemein-3', category: 'allgemein', difficulty: 'mittel',
    question: 'Welches Zahlensystem verwendet nur 0 und 1?',
    options: ['Dezimalsystem', 'Hexadezimalsystem', 'Binärsystem', 'Römisches System'], correctAnswer: 2,
    explanation: 'Das Binärsystem stellt Werte ausschließlich mit 0 und 1 dar.',
  },
  {
    id: 'offline-geschichte-1', category: 'geschichte', difficulty: 'leicht',
    question: 'Welche Schrift nutzten die alten Ägypter unter anderem?',
    options: ['Runen', 'Hieroglyphen', 'Keilschriftzeichen nur aus Zahlen', 'Kyrillisch'], correctAnswer: 1,
    explanation: 'Hieroglyphen waren eine bedeutende Schriftform des alten Ägypten.',
  },
  {
    id: 'offline-geografie-1', category: 'geografie', difficulty: 'leicht',
    question: 'Auf welchem Kontinent liegt die Sahara?',
    options: ['Asien', 'Afrika', 'Südamerika', 'Australien'], correctAnswer: 1,
    explanation: 'Die Sahara erstreckt sich über große Teile Nordafrikas.',
  },
  {
    id: 'offline-wissenschaft-1', category: 'wissenschaft', difficulty: 'leicht',
    question: 'Bei welcher Temperatur gefriert reines Wasser ungefähr?',
    options: ['0 °C', '10 °C', '50 °C', '100 °C'], correctAnswer: 0,
    explanation: 'Bei normalem Luftdruck gefriert reines Wasser bei etwa 0 °C.',
  },
  {
    id: 'offline-technik-1', category: 'technik', difficulty: 'leicht',
    question: 'Welche Einheit wird für elektrische Spannung verwendet?',
    options: ['Ampere', 'Volt', 'Ohm', 'Wattstunde'], correctAnswer: 1,
    explanation: 'Die elektrische Spannung wird in Volt angegeben.',
  },
  {
    id: 'offline-sprache-1', category: 'sprache', difficulty: 'leicht',
    question: 'Welches Wort ist ein Verb?',
    options: ['laufen', 'blau', 'Haus', 'schnell'], correctAnswer: 0,
    explanation: '„Laufen“ bezeichnet eine Tätigkeit und ist ein Verb.',
  },
  {
    id: 'offline-deutschland-1', category: 'deutschland', difficulty: 'leicht',
    question: 'Welche Stadt ist ein deutsches Bundesland und zugleich eine Stadt?',
    options: ['München', 'Köln', 'Hamburg', 'Dresden'], correctAnswer: 2,
    explanation: 'Hamburg ist einer der drei deutschen Stadtstaaten.',
  },
  {
    id: 'offline-tiere-1', category: 'tiere', difficulty: 'leicht',
    question: 'Welches Tier ist ein Säugetier?',
    options: ['Forelle', 'Delfin', 'Eidechse', 'Frosch'], correctAnswer: 1,
    explanation: 'Delfine atmen Luft und säugen ihre Jungen.',
  },
  {
    id: 'offline-weltall-1', category: 'weltall', difficulty: 'leicht',
    question: 'Wie heißt der natürliche Satellit der Erde?',
    options: ['Mars', 'Mond', 'Venus', 'Titan'], correctAnswer: 1,
    explanation: 'Der Mond ist der natürliche Satellit der Erde.',
  },
  {
    id: 'offline-sport-1', category: 'sport', difficulty: 'leicht',
    question: 'Wie viele Spieler stehen bei einer Fußballmannschaft normalerweise zu Spielbeginn auf dem Feld?',
    options: ['7', '9', '11', '12'], correctAnswer: 2,
    explanation: 'Eine Mannschaft beginnt regulär mit elf Spielern einschließlich Torwart.',
  },
  {
    id: 'offline-kunst-1', category: 'kunst', difficulty: 'mittel',
    question: 'Welche Grundfarbe entsteht nicht durch Mischen anderer Farben im traditionellen Farbkreis?',
    options: ['Rot', 'Orange', 'Grün', 'Violett'], correctAnswer: 0,
    explanation: 'Rot zählt im traditionellen Farbkreis zu den Grundfarben.',
  },
  {
    id: 'offline-musik-1', category: 'musik', difficulty: 'leicht',
    question: 'Welches Instrument besitzt typischerweise schwarze und weiße Tasten?',
    options: ['Trompete', 'Klavier', 'Geige', 'Flöte'], correctAnswer: 1,
    explanation: 'Ein Klavier wird über eine Klaviatur mit schwarzen und weißen Tasten gespielt.',
  },
  {
    id: 'offline-filme-1', category: 'filme', difficulty: 'mittel',
    question: 'Wie nennt man die schriftliche Vorlage für Szenen und Dialoge eines Films?',
    options: ['Drehbuch', 'Abspann', 'Storyboard-Kamera', 'Kulisse'], correctAnswer: 0,
    explanation: 'Das Drehbuch beschreibt Handlung, Szenen und Dialoge.',
  },
  {
    id: 'offline-literatur-1', category: 'literatur', difficulty: 'leicht',
    question: 'Welche Textform besteht häufig aus Versen und Strophen?',
    options: ['Gedicht', 'Lexikonartikel', 'Bedienungsanleitung', 'Protokoll'], correctAnswer: 0,
    explanation: 'Gedichte sind häufig in Verse und Strophen gegliedert.',
  },
  {
    id: 'offline-medizin-1', category: 'medizin', difficulty: 'leicht',
    question: 'Welches Organ pumpt Blut durch den Körper?',
    options: ['Lunge', 'Leber', 'Herz', 'Magen'], correctAnswer: 2,
    explanation: 'Das Herz treibt den Blutkreislauf an.',
  },
  {
    id: 'offline-natur-1', category: 'natur', difficulty: 'leicht',
    question: 'Welchen Stoff nehmen Pflanzen bei der Fotosynthese aus der Luft auf?',
    options: ['Sauerstoff ausschließlich', 'Kohlenstoffdioxid', 'Helium', 'Stickstoff als Gas direkt'], correctAnswer: 1,
    explanation: 'Pflanzen nutzen Kohlenstoffdioxid zusammen mit Wasser und Lichtenergie.',
  },
  {
    id: 'offline-wirtschaft-1', category: 'wirtschaft', difficulty: 'mittel',
    question: 'Was beschreibt Umsatz?',
    options: ['Nur den Gewinn', 'Die Summe der Verkaufserlöse', 'Nur Personalkosten', 'Den Lagerbestand'], correctAnswer: 1,
    explanation: 'Umsatz ist die Summe der Erlöse aus Verkäufen vor Abzug der Kosten.',
  },
  {
    id: 'offline-politik-1', category: 'politik', difficulty: 'leicht',
    question: 'Was ist ein wesentliches Merkmal einer Demokratie?',
    options: ['Regelmäßige freie Wahlen', 'Erbliche Alleinherrschaft', 'Verbot jeder Opposition', 'Keine Gewaltenteilung'], correctAnswer: 0,
    explanation: 'Freie und regelmäßige Wahlen gehören zu den Grundmerkmalen einer Demokratie.',
  },
  {
    id: 'offline-mythologie-1', category: 'mythologie', difficulty: 'leicht',
    question: 'Wie heißt der Götterberg der griechischen Mythologie?',
    options: ['Olymp', 'Vesuv', 'Etna', 'Parnass ausschließlich als Unterwelt'], correctAnswer: 0,
    explanation: 'Der Olymp gilt in der griechischen Mythologie als Sitz vieler Götter.',
  },
  {
    id: 'offline-videospiele-1', category: 'videospiele', difficulty: 'mittel',
    question: 'Was bezeichnet „NPC“ in Videospielen?',
    options: ['Eine nicht spielbare Figur', 'Eine Grafikkarte', 'Einen Spielstand', 'Eine Netzwerkleitung'], correctAnswer: 0,
    explanation: 'NPC steht für „Non-Player Character“, also eine nicht direkt spielbare Figur.',
  },
  {
    id: 'offline-flaggen-1', category: 'flaggen', difficulty: 'leicht',
    question: 'Welche Farben hat die deutsche Flagge?',
    options: ['Schwarz-Rot-Gold', 'Blau-Weiß-Rot', 'Grün-Weiß-Rot', 'Schwarz-Gelb-Blau'], correctAnswer: 0,
    explanation: 'Die Bundesflagge Deutschlands zeigt Schwarz, Rot und Gold.',
  },
  {
    id: 'offline-allgemein-4', category: 'allgemein', difficulty: 'mittel',
    question: 'Wie lautet das Ergebnis von 12 × 8?',
    options: ['86', '92', '96', '108'], correctAnswer: 2,
    explanation: 'Zwölf mal acht ergibt 96.',
  },
  {
    id: 'offline-wissenschaft-2', category: 'wissenschaft', difficulty: 'mittel',
    question: 'Welches Teilchen trägt eine negative elektrische Ladung?',
    options: ['Proton', 'Neutron', 'Elektron', 'Photon immer'], correctAnswer: 2,
    explanation: 'Elektronen tragen eine negative Elementarladung.',
  },
  {
    id: 'offline-technik-2', category: 'technik', difficulty: 'mittel',
    question: 'Welche Beziehung beschreibt das Ohmsche Gesetz?',
    options: ['U = R × I', 'P = m × g', 's = v ÷ t ausschließlich', 'E = m ÷ c'], correctAnswer: 0,
    explanation: 'Beim Ohmschen Gesetz gilt Spannung U gleich Widerstand R mal Strom I.',
  },
  {
    id: 'offline-geografie-2', category: 'geografie', difficulty: 'mittel',
    question: 'Welcher Ozean liegt zwischen Europa und Nordamerika?',
    options: ['Pazifik', 'Atlantik', 'Indischer Ozean', 'Südlicher Ozean'], correctAnswer: 1,
    explanation: 'Der Atlantische Ozean trennt unter anderem Europa und Nordamerika.',
  },
  {
    id: 'offline-geschichte-2', category: 'geschichte', difficulty: 'mittel',
    question: 'Welche antike Stadt wurde durch den Ausbruch des Vesuvs verschüttet?',
    options: ['Pompeji', 'Athen', 'Sparta', 'Alexandria'], correctAnswer: 0,
    explanation: 'Pompeji wurde im Jahr 79 n. Chr. durch den Vesuvausbruch verschüttet.',
  },
  {
    id: 'offline-sprache-2', category: 'sprache', difficulty: 'mittel',
    question: 'Was ist ein Synonym?',
    options: ['Ein bedeutungsähnliches Wort', 'Ein Satzzeichen', 'Eine Zeitform', 'Ein Gegensatzpaar ausschließlich'], correctAnswer: 0,
    explanation: 'Synonyme sind Wörter mit gleicher oder ähnlicher Bedeutung.',
  },
  {
    id: 'offline-natur-2', category: 'natur', difficulty: 'mittel',
    question: 'Welche Rolle haben Bienen bei vielen Blütenpflanzen?',
    options: ['Bestäubung', 'Bodenverdichtung', 'Fotosynthese', 'Wasserverdunstung'], correctAnswer: 0,
    explanation: 'Beim Blütenbesuch übertragen Bienen Pollen und unterstützen die Bestäubung.',
  },
];
