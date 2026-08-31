import { Question, Category } from './types';

export const CATEGORIES: Category[] = [
  {
    id: 'allgemein',
    title: 'Allgemeinwissen',
    description: 'Bunt gemischte Fragen aus allen Lebensbereichen.',
    icon: 'Globe',
    color: 'bg-blue-500'
  },
  {
    id: 'geschichte',
    title: 'Geschichte',
    description: 'Reise durch die Zeit und entdecke historische Ereignisse.',
    icon: 'History',
    color: 'bg-amber-600'
  },
  {
    id: 'geografie',
    title: 'Geografie',
    description: 'Länder, Städte, Berge und Meere unserer Erde.',
    icon: 'Map',
    color: 'bg-emerald-500'
  },
  {
    id: 'wissenschaft',
    title: 'Wissenschaft',
    description: 'Spannende Fakten aus Biologie, Chemie und Physik.',
    icon: 'Beaker',
    color: 'bg-purple-500'
  },
  {
    id: 'technik',
    title: 'Technik',
    description: 'Von Erfindungen bis zur modernen Digitalwelt.',
    icon: 'Cpu',
    color: 'bg-slate-700'
  },
  {
    id: 'sprache',
    title: 'Sprache',
    description: 'Wortschatz, Grammatik und linguistische Rätsel.',
    icon: 'Languages',
    color: 'bg-rose-500'
  },
  {
    id: 'deutschland',
    title: 'Deutschland',
    description: 'Fakten über deutsche Bundesländer, Städte und Kultur.',
    icon: 'Landmark',
    color: 'bg-orange-500'
  },
  {
    id: 'tiere',
    title: 'Tiere',
    description: 'Spannendes Wissen über die Tierwelt unserer Erde.',
    icon: 'Dog',
    color: 'bg-amber-500'
  },
  {
    id: 'weltall',
    title: 'Weltall',
    description: 'Sterne, Planeten und die Geheimnisse des Universums.',
    icon: 'Rocket',
    color: 'bg-indigo-600'
  },
  {
    id: 'sport',
    title: 'Sport',
    description: 'Rekorde, Regeln und Geschichte verschiedener Sportarten.',
    icon: 'Trophy',
    color: 'bg-red-500'
  },
  {
    id: 'kunst',
    title: 'Kunst',
    description: 'Meisterwerke, Epochen und berühmte Künstler.',
    icon: 'Sparkles',
    color: 'bg-pink-500'
  },
  {
    id: 'musik',
    title: 'Musik',
    description: 'Instrumente, Komponisten und moderne Popkultur.',
    icon: 'Volume2',
    color: 'bg-fuchsia-500'
  },
  {
    id: 'filme',
    title: 'Filme & Serien',
    description: 'Blockbuster, Klassiker und berühmte Schauspieler.',
    icon: 'Camera',
    color: 'bg-rose-600'
  },
  {
    id: 'literatur',
    title: 'Literatur',
    description: 'Bücher, Autoren und literarische Meisterwerke.',
    icon: 'Globe',
    color: 'bg-cyan-600'
  },
  {
    id: 'medizin',
    title: 'Medizin',
    description: 'Der menschliche Körper, Krankheiten und Heilung.',
    icon: 'Activity',
    color: 'bg-red-400'
  },
  {
    id: 'natur',
    title: 'Natur',
    description: 'Pflanzen, Ökosysteme und Naturphänomene.',
    icon: 'Leaf',
    color: 'bg-green-500'
  },
  {
    id: 'wirtschaft',
    title: 'Wirtschaft',
    description: 'Finanzen, Unternehmen und globale Märkte.',
    icon: 'BarChart',
    color: 'bg-blue-600'
  },
  {
    id: 'politik',
    title: 'Politik',
    description: 'Regierungssysteme, Wahlen und Weltpolitik.',
    icon: 'Landmark',
    color: 'bg-slate-600'
  },
  {
    id: 'mythologie',
    title: 'Mythologie',
    description: 'Götter, Sagen und antike Legenden.',
    icon: 'Crown',
    color: 'bg-amber-400'
  },
  {
    id: 'videospiele',
    title: 'Videospiele',
    description: 'Konsolen, PC-Spiele und Gaming-Geschichte.',
    icon: 'Cpu',
    color: 'bg-indigo-500'
  },
  {
    id: 'flaggen',
    title: 'Flaggen erraten',
    description: 'Erkenne die Flaggen aller Länder der Welt.',
    icon: 'Flag',
    color: 'bg-blue-600'
  }
];

export const QUESTIONS: Question[] = [
  // Allgemeinwissen (20)
  {
    id: 'a1',
    category: 'allgemein',
    difficulty: 'leicht',
    question: 'Welches Land hat die meisten Einwohner der Welt?',
    options: ['USA', 'Indien', 'China', 'Russland'],
    correctAnswer: 1,
    explanation: 'Indien hat China im Jahr 2023 als bevölkerungsreichstes Land der Welt abgelöst.'
  },
  {
    id: 'a2',
    category: 'allgemein',
    difficulty: 'leicht',
    question: 'Wie viele Bundesländer hat Deutschland?',
    options: ['12', '14', '16', '18'],
    correctAnswer: 2,
    explanation: 'Deutschland besteht aus 16 Bundesländern, darunter drei Stadtstaaten (Berlin, Hamburg, Bremen).'
  },
  {
    id: 'a3',
    category: 'allgemein',
    difficulty: 'mittel',
    question: 'Was ist die Hauptstadt von Australien?',
    options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
    correctAnswer: 2,
    explanation: 'Canberra wurde als Kompromiss zwischen den Rivalen Sydney und Melbourne zur Hauptstadt gewählt.'
  },
  {
    id: 'a4',
    category: 'allgemein',
    question: 'Welches Element hat das chemische Symbol "O"?',
    options: ['Gold', 'Silber', 'Sauerstoff', 'Eisen'],
    correctAnswer: 2,
    explanation: 'O steht für Oxygenium, den lateinischen Namen für Sauerstoff.'
  },
  {
    id: 'a5',
    category: 'allgemein',
    question: 'Wer malte die "Mona Lisa"?',
    options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Claude Monet'],
    correctAnswer: 2,
    explanation: 'Leonardo da Vinci schuf dieses weltberühmte Gemälde im frühen 16. Jahrhundert.'
  },
  {
    id: 'a6',
    category: 'allgemein',
    question: 'In welcher Stadt steht der Eiffelturm?',
    options: ['London', 'Berlin', 'Paris', 'Rom'],
    correctAnswer: 2,
    explanation: 'Der Eiffelturm ist das Wahrzeichen von Paris und wurde 1889 fertiggestellt.'
  },
  {
    id: 'a7',
    category: 'allgemein',
    question: 'Wie viele Planeten hat unser Sonnensystem?',
    options: ['7', '8', '9', '10'],
    correctAnswer: 1,
    explanation: 'Seit Pluto 2006 der Status als Planet aberkannt wurde, hat unser Sonnensystem 8 Planeten.'
  },
  {
    id: 'a8',
    category: 'allgemein',
    question: 'Welches Tier ist das größte Säugetier der Welt?',
    options: ['Elefant', 'Blauwal', 'Giraffe', 'Nashorn'],
    correctAnswer: 1,
    explanation: 'Der Blauwal kann bis zu 30 Meter lang werden und über 180 Tonnen wiegen.'
  },
  {
    id: 'a9',
    category: 'allgemein',
    question: 'Was ist die Währung in Japan?',
    options: ['Yuan', 'Won', 'Yen', 'Baht'],
    correctAnswer: 2,
    explanation: 'Der Yen ist die offizielle Währung Japans.'
  },
  {
    id: 'a10',
    category: 'allgemein',
    question: 'Wie viele Kontinente gibt es auf der Erde?',
    options: ['5', '6', '7', '8'],
    correctAnswer: 2,
    explanation: 'Es gibt 7 Kontinente: Afrika, Antarktis, Asien, Australien, Europa, Nordamerika und Südamerika.'
  },
  {
    id: 'a11',
    category: 'allgemein',
    question: 'Welches Organ im menschlichen Körper pumpt Blut?',
    options: ['Lunge', 'Leber', 'Herz', 'Niere'],
    correctAnswer: 2,
    explanation: 'Das Herz ist ein Hohlmuskel, der den Blutkreislauf antreibt.'
  },
  {
    id: 'a12',
    category: 'allgemein',
    question: 'Welche Farbe erhält man, wenn man Blau und Gelb mischt?',
    options: ['Lila', 'Orange', 'Grün', 'Braun'],
    correctAnswer: 2,
    explanation: 'Grün ist eine Sekundärfarbe, die aus den Primärfarben Blau und Gelb entsteht.'
  },
  {
    id: 'a13',
    category: 'allgemein',
    difficulty: 'schwer',
    question: 'Wer schrieb das Drama "Faust"?',
    options: ['Friedrich Schiller', 'Johann Wolfgang von Goethe', 'Thomas Mann', 'Bertolt Brecht'],
    correctAnswer: 1,
    explanation: 'Goethe arbeitete über 60 Jahre lang an seinem Hauptwerk "Faust".'
  },
  {
    id: 'a14',
    category: 'allgemein',
    difficulty: 'mittel',
    question: 'Welches ist der längste Fluss der Welt?',
    options: ['Amazonas', 'Nil', 'Jangtsekiang', 'Mississippi'],
    correctAnswer: 1,
    explanation: 'Der Nil gilt traditionell als der längste Fluss, obwohl neuere Messungen den Amazonas oft als länger einstufen.'
  },
  {
    id: 'a15',
    category: 'allgemein',
    difficulty: 'leicht',
    question: 'Was ist das härteste natürliche Material?',
    options: ['Gold', 'Eisen', 'Diamant', 'Quarz'],
    correctAnswer: 2,
    explanation: 'Diamant besteht aus reinem Kohlenstoff und ist das härteste bekannte natürliche Material.'
  },
  {
    id: 'a16',
    category: 'allgemein',
    question: 'Wie viele Zähne hat ein erwachsener Mensch normalerweise?',
    options: ['28', '30', '32', '34'],
    correctAnswer: 2,
    explanation: 'Ein vollständiges bleibendes Gebiss eines Erwachsenen besteht aus 32 Zähnen, inklusive der Weisheitszähne.'
  },
  {
    id: 'a17',
    category: 'allgemein',
    question: 'Welcher Ozean liegt zwischen Europa und Amerika?',
    options: ['Pazifischer Ozean', 'Indischer Ozean', 'Atlantischer Ozean', 'Arktischer Ozean'],
    correctAnswer: 2,
    explanation: 'Der Atlantik trennt die "Alte Welt" (Europa/Afrika) von der "Neuen Welt" (Amerika).'
  },
  {
    id: 'a18',
    category: 'allgemein',
    question: 'Was ist die Quadratwurzel von 81?',
    options: ['7', '8', '9', '10'],
    correctAnswer: 2,
    explanation: '9 mal 9 ergibt 81.'
  },
  {
    id: 'a19',
    category: 'allgemein',
    question: 'Welches Land ist für seine Pyramiden bekannt?',
    options: ['Griechenland', 'Italien', 'Ägypten', 'Mexiko'],
    correctAnswer: 2,
    explanation: 'Die Pyramiden von Gizeh in Ägypten gehören zu den bekanntesten Bauwerken der Antike.'
  },
  {
    id: 'a20',
    category: 'allgemein',
    question: 'Wie viele Minuten hat eine Stunde?',
    options: ['50', '60', '80', '100'],
    correctAnswer: 1,
    explanation: 'Eine Stunde besteht aus 60 Minuten, eine Minute aus 60 Sekunden.',
    difficulty: 'leicht'
  },
  {
    id: 'a21',
    category: 'allgemein',
    question: 'Welches Land ist flächenmäßig das zweitgrößte der Welt?',
    options: ['USA', 'China', 'Kanada', 'Brasilien'],
    correctAnswer: 2,
    explanation: 'Kanada ist nach Russland das zweitgrößte Land der Erde.',
    difficulty: 'leicht'
  },
  {
    id: 'a22',
    category: 'allgemein',
    question: 'Wie viele Saiten hat eine Standard-Gitarre normalerweise?',
    options: ['4', '5', '6', '7'],
    correctAnswer: 2,
    explanation: 'Eine klassische oder Westerngitarre hat in der Regel 6 Saiten.',
    difficulty: 'leicht'
  },
  {
    id: 'a23',
    category: 'allgemein',
    question: 'Welches Vitamin ist besonders viel in Zitrusfrüchten enthalten?',
    options: ['Vitamin A', 'Vitamin B', 'Vitamin C', 'Vitamin D'],
    correctAnswer: 2,
    explanation: 'Zitronen und Orangen sind bekannt für ihren hohen Vitamin-C-Gehalt.',
    difficulty: 'leicht'
  },
  {
    id: 'a24',
    category: 'allgemein',
    question: 'In welcher Stadt befindet sich das Weiße Haus?',
    options: ['New York', 'Washington, D.C.', 'Los Angeles', 'Chicago'],
    correctAnswer: 1,
    explanation: 'Das Weiße Haus ist der Amtssitz des Präsidenten der Vereinigten Staaten in Washington, D.C.',
    difficulty: 'leicht'
  },
  {
    id: 'a25',
    category: 'allgemein',
    question: 'Wie viele Tage hat ein Schaltjahr?',
    options: ['364', '365', '366', '367'],
    correctAnswer: 2,
    explanation: 'Ein Schaltjahr hat 366 Tage, da der Februar einen zusätzlichen Tag (den 29.) erhält.',
    difficulty: 'leicht'
  },
  {
    id: 'a26',
    category: 'allgemein',
    question: 'Was ist die Hauptstadt von Frankreich?',
    options: ['Lyon', 'Marseille', 'Paris', 'Nizza'],
    correctAnswer: 2,
    explanation: 'Paris ist die Hauptstadt und bevölkerungsreichste Stadt Frankreichs.',
    difficulty: 'leicht'
  },
  {
    id: 'a27',
    category: 'allgemein',
    question: 'Welches Tier ist als "König der Tiere" bekannt?',
    options: ['Tiger', 'Elefant', 'Löwe', 'Bär'],
    correctAnswer: 2,
    explanation: 'Der Löwe wird aufgrund seiner imposanten Erscheinung oft als König der Tiere bezeichnet.',
    difficulty: 'leicht'
  },
  {
    id: 'a28',
    category: 'allgemein',
    question: 'Wie viele Ozeane gibt es auf der Erde?',
    options: ['3', '4', '5', '6'],
    correctAnswer: 2,
    explanation: 'Es gibt 5 Ozeane: Pazifik, Atlantik, Indik, Arktischer Ozean und Antarktischer Ozean.',
    difficulty: 'mittel'
  },
  {
    id: 'a29',
    category: 'allgemein',
    question: 'Wer erfand das Telefon?',
    options: ['Thomas Edison', 'Alexander Graham Bell', 'Nikola Tesla', 'Guglielmo Marconi'],
    correctAnswer: 1,
    explanation: 'Alexander Graham Bell erhielt 1876 das erste Patent für das Telefon.',
    difficulty: 'mittel'
  },
  {
    id: 'a30',
    category: 'allgemein',
    question: 'Welches Land hat die Vorwahl +49?',
    options: ['Österreich', 'Schweiz', 'Deutschland', 'Niederlande'],
    correctAnswer: 2,
    explanation: '+49 ist die internationale Telefonvorwahl für Deutschland.',
    difficulty: 'leicht'
  },
  {
    id: 'a31',
    category: 'allgemein',
    question: 'Was ist das chemische Symbol für Gold?',
    options: ['Gd', 'Ag', 'Au', 'Fe'],
    correctAnswer: 2,
    explanation: 'Au leitet sich vom lateinischen Wort "Aurum" für Gold ab.',
    difficulty: 'mittel'
  },
  {
    id: 'a32',
    category: 'allgemein',
    question: 'Wie viele Planeten in unserem Sonnensystem haben Ringe?',
    options: ['1', '2', '3', '4'],
    correctAnswer: 3,
    explanation: 'Alle vier Gasriesen (Jupiter, Saturn, Uranus, Neptun) besitzen Ringsysteme.',
    difficulty: 'mittel'
  },
  {
    id: 'a33',
    category: 'allgemein',
    question: 'Welches ist das kleinste Land der Welt?',
    options: ['Monaco', 'San Marino', 'Vatikanstadt', 'Liechtenstein'],
    correctAnswer: 2,
    explanation: 'Die Vatikanstadt ist mit ca. 0,44 km² der kleinste Staat der Welt.',
    difficulty: 'leicht'
  },
  {
    id: 'a34',
    category: 'allgemein',
    question: 'Welche Farbe hat ein Saphir normalerweise?',
    options: ['Rot', 'Grün', 'Blau', 'Gelb'],
    correctAnswer: 2,
    explanation: 'Saphire sind am bekanntesten für ihre tiefblaue Farbe.',
    difficulty: 'leicht'
  },
  {
    id: 'a35',
    category: 'allgemein',
    question: 'Wie viele Milliliter sind in einem Liter?',
    options: ['100', '500', '1000', '10000'],
    correctAnswer: 2,
    explanation: 'Ein Liter entspricht 1000 Millilitern.',
    difficulty: 'leicht'
  },
  {
    id: 'a36',
    category: 'allgemein',
    question: 'Wer schrieb "Romeo und Julia"?',
    options: ['Charles Dickens', 'William Shakespeare', 'Mark Twain', 'Jane Austen'],
    correctAnswer: 1,
    explanation: 'William Shakespeare schrieb diese berühmte Tragödie im späten 16. Jahrhundert.',
    difficulty: 'leicht'
  },
  {
    id: 'a37',
    category: 'allgemein',
    question: 'Welches Land ist die Heimat des Kängurus?',
    options: ['Südafrika', 'Brasilien', 'Australien', 'Indien'],
    correctAnswer: 2,
    explanation: 'Kängurus sind Beuteltiere, die fast ausschließlich in Australien vorkommen.',
    difficulty: 'leicht'
  },
  {
    id: 'a38',
    category: 'allgemein',
    question: 'Was ist die Hauptstadt von Spanien?',
    options: ['Barcelona', 'Sevilla', 'Madrid', 'Valencia'],
    correctAnswer: 2,
    explanation: 'Madrid ist die Hauptstadt und das geografische Zentrum Spaniens.',
    difficulty: 'leicht'
  },
  {
    id: 'a39',
    category: 'allgemein',
    question: 'Wie viele Bundesländer hat Österreich?',
    options: ['7', '8', '9', '10'],
    correctAnswer: 2,
    explanation: 'Österreich besteht aus 9 Bundesländern.',
    difficulty: 'mittel'
  },
  {
    id: 'a40',
    category: 'allgemein',
    question: 'Welches Instrument spielt man mit Tasten und Pedalen?',
    options: ['Geige', 'Flöte', 'Klavier', 'Gitarre'],
    correctAnswer: 2,
    explanation: 'Das Klavier ist ein Tasteninstrument, das Pedale zur Klangbeeinflussung nutzt.',
    difficulty: 'leicht'
  },
  {
    id: 'a41',
    category: 'allgemein',
    question: 'In welchem Jahr sank die Titanic?',
    options: ['1905', '1912', '1920', '1931'],
    correctAnswer: 1,
    explanation: 'Die Titanic sank auf ihrer Jungfernfahrt im April 1912.',
    difficulty: 'mittel'
  },
  {
    id: 'a42',
    category: 'allgemein',
    question: 'Was ist die Hauptstadt von Kanada?',
    options: ['Toronto', 'Vancouver', 'Montreal', 'Ottawa'],
    correctAnswer: 3,
    explanation: 'Ottawa wurde im 19. Jahrhundert zur Hauptstadt Kanadas gewählt.',
    difficulty: 'mittel'
  },
  {
    id: 'a43',
    category: 'allgemein',
    question: 'Welches Metall ist bei Raumtemperatur flüssig?',
    options: ['Blei', 'Quecksilber', 'Zinn', 'Aluminium'],
    correctAnswer: 1,
    explanation: 'Quecksilber ist das einzige Metall, das unter Normalbedingungen flüssig ist.',
    difficulty: 'mittel'
  },
  {
    id: 'a44',
    category: 'allgemein',
    question: 'Wie viele Kontinente beginnen mit dem Buchstaben "A"?',
    options: ['2', '3', '4', '5'],
    correctAnswer: 2,
    explanation: 'Es sind 4: Afrika, Amerika (Nord/Süd), Antarktis und Asien (und Australien).',
    difficulty: 'mittel'
  },
  {
    id: 'a45',
    category: 'allgemein',
    question: 'Wer war der erste Mensch auf dem Mond?',
    options: ['Buzz Aldrin', 'Yuri Gagarin', 'Neil Armstrong', 'Michael Collins'],
    correctAnswer: 2,
    explanation: 'Neil Armstrong betrat am 21. Juli 1969 als erster Mensch den Mond.',
    difficulty: 'leicht'
  },
  {
    id: 'a46',
    category: 'allgemein',
    question: 'Welches Land hat die Form eines Stiefels?',
    options: ['Griechenland', 'Italien', 'Portugal', 'Türkei'],
    correctAnswer: 1,
    explanation: 'Die Apenninhalbinsel, auf der Italien liegt, erinnert stark an einen Stiefel.',
    difficulty: 'leicht'
  },
  {
    id: 'a47',
    category: 'allgemein',
    question: 'Was ist die Hauptstadt von China?',
    options: ['Shanghai', 'Hongkong', 'Peking', 'Guangzhou'],
    correctAnswer: 2,
    explanation: 'Peking (Beijing) ist das politische Zentrum Chinas.',
    difficulty: 'leicht'
  },
  {
    id: 'a48',
    category: 'allgemein',
    question: 'Wie viele Beine hat ein Insekt?',
    options: ['4', '6', '8', '10'],
    correctAnswer: 1,
    explanation: 'Insekten zeichnen sich durch genau drei Beinpaare (also 6 Beine) aus.',
    difficulty: 'leicht'
  },
  {
    id: 'a49',
    category: 'allgemein',
    question: 'Welches Land ist für den "Tag der Toten" bekannt?',
    options: ['Spanien', 'Brasilien', 'Mexiko', 'Argentinien'],
    correctAnswer: 2,
    explanation: 'Der "Día de los Muertos" ist ein wichtiger mexikanischer Feiertag.',
    difficulty: 'mittel'
  },
  {
    id: 'a50',
    category: 'allgemein',
    question: 'Was ist die kleinste Einheit der Materie?',
    options: ['Molekül', 'Atom', 'Zelle', 'Elektron'],
    correctAnswer: 1,
    explanation: 'Atome sind die Grundbausteine der Materie (im klassischen Sinne).',
    difficulty: 'mittel'
  },
  {
    id: 'a51',
    category: 'allgemein',
    question: 'Welches Land schenkte den USA die Freiheitsstatue?',
    options: ['Großbritannien', 'Deutschland', 'Frankreich', 'Italien'],
    correctAnswer: 2,
    explanation: 'Frankreich schenkte die Statue den USA zum 100. Jahrestag der Unabhängigkeitserklärung.',
    difficulty: 'mittel'
  },
  {
    id: 'a52',
    category: 'allgemein',
    question: 'Wie viele Tasten hat ein Standard-Klavier?',
    options: ['76', '84', '88', '92'],
    correctAnswer: 2,
    explanation: 'Ein modernes Standard-Klavier hat 88 Tasten (52 weiße, 36 schwarze).',
    difficulty: 'schwer'
  },
  {
    id: 'a53',
    category: 'allgemein',
    question: 'Was ist die Hauptstadt von Portugal?',
    options: ['Porto', 'Lissabon', 'Faro', 'Braga'],
    correctAnswer: 1,
    explanation: 'Lissabon ist die Hauptstadt und größte Stadt Portugals.',
    difficulty: 'leicht'
  },
  {
    id: 'a54',
    category: 'allgemein',
    question: 'Welches Tier legt die größten Eier?',
    options: ['Adler', 'Strauß', 'Krokodil', 'Schildkröte'],
    correctAnswer: 1,
    explanation: 'Der Strauß legt die größten Eier aller lebenden Vögel.',
    difficulty: 'leicht'
  },
  {
    id: 'a55',
    category: 'allgemein',
    question: 'Wie viele Liter Blut hat ein erwachsener Mensch etwa?',
    options: ['2-3 Liter', '5-6 Liter', '8-9 Liter', '10-12 Liter'],
    correctAnswer: 1,
    explanation: 'Ein durchschnittlicher Erwachsener hat etwa 5 bis 6 Liter Blut.',
    difficulty: 'mittel'
  },
  {
    id: 'a56',
    category: 'allgemein',
    question: 'Welches Land ist die Heimat von IKEA?',
    options: ['Norwegen', 'Dänemark', 'Schweden', 'Finnland'],
    correctAnswer: 2,
    explanation: 'IKEA wurde 1943 von Ingvar Kamprad in Schweden gegründet.',
    difficulty: 'leicht'
  },
  {
    id: 'a57',
    category: 'allgemein',
    question: 'Was ist die Hauptstadt von Russland?',
    options: ['Sankt Petersburg', 'Kasan', 'Moskau', 'Nowosibirsk'],
    correctAnswer: 2,
    explanation: 'Moskau ist die Hauptstadt der Russischen Föderation.',
    difficulty: 'leicht'
  },
  {
    id: 'a58',
    category: 'allgemein',
    question: 'Wie viele Millimeter sind ein Zentimeter?',
    options: ['1', '10', '100', '1000'],
    correctAnswer: 1,
    explanation: 'Ein Zentimeter besteht aus 10 Millimetern.',
    difficulty: 'leicht'
  },
  {
    id: 'a59',
    category: 'allgemein',
    question: 'Welches Land ist für seine Tulpen und Windmühlen bekannt?',
    options: ['Belgien', 'Dänemark', 'Niederlande', 'Schweden'],
    correctAnswer: 2,
    explanation: 'Die Niederlande sind weltberühmt für ihren Tulpenanbau und historische Windmühlen.',
    difficulty: 'leicht'
  },
  {
    id: 'a60',
    category: 'allgemein',
    question: 'Was ist die Hauptstadt von Ägypten?',
    options: ['Alexandria', 'Luxor', 'Kairo', 'Gizeh'],
    correctAnswer: 2,
    explanation: 'Kairo ist die Hauptstadt Ägyptens und eine der größten Städte Afrikas.',
    difficulty: 'leicht'
  },
  {
    id: 'a61',
    category: 'allgemein',
    question: 'Wie viele Augen hat eine Biene?',
    options: ['2', '3', '5', '8'],
    correctAnswer: 2,
    explanation: 'Bienen haben zwei große Facettenaugen und drei kleine Punktaugen (Ocellen).',
    difficulty: 'schwer'
  },
  {
    id: 'a62',
    category: 'allgemein',
    question: 'Welches Land ist die Heimat des Tango?',
    options: ['Brasilien', 'Argentinien', 'Spanien', 'Kolumbien'],
    correctAnswer: 1,
    explanation: 'Der Tango entstand Ende des 19. Jahrhunderts in Argentinien und Uruguay.',
    difficulty: 'mittel'
  },
  {
    id: 'a63',
    category: 'allgemein',
    question: 'Was ist die Hauptstadt von Griechenland?',
    options: ['Thessaloniki', 'Patras', 'Athen', 'Heraklion'],
    correctAnswer: 2,
    explanation: 'Athen ist die Hauptstadt Griechenlands und eine der ältesten Städte der Welt.',
    difficulty: 'leicht'
  },
  {
    id: 'a64',
    category: 'allgemein',
    question: 'Wie viele Spieler hat eine Fußballmannschaft auf dem Feld?',
    options: ['9', '10', '11', '12'],
    correctAnswer: 2,
    explanation: 'Eine Fußballmannschaft besteht aus 11 Spielern (inklusive Torwart).',
    difficulty: 'leicht'
  },
  {
    id: 'a65',
    category: 'allgemein',
    question: 'Welches Land ist für das Oktoberfest bekannt?',
    options: ['Österreich', 'Schweiz', 'Deutschland', 'Luxemburg'],
    correctAnswer: 2,
    explanation: 'Das Oktoberfest findet jährlich in München, Deutschland, statt.',
    difficulty: 'leicht'
  },
  {
    id: 'a66',
    category: 'allgemein',
    question: 'Was ist die Hauptstadt von Indien?',
    options: ['Mumbai', 'Neu-Delhi', 'Kalkutta', 'Bangalore'],
    correctAnswer: 1,
    explanation: 'Neu-Delhi ist die Hauptstadt Indiens.',
    difficulty: 'mittel'
  },
  {
    id: 'a67',
    category: 'allgemein',
    question: 'Wie viele Bundesländer hat die USA?',
    options: ['48', '50', '52', '54'],
    correctAnswer: 1,
    explanation: 'Die Vereinigten Staaten von Amerika bestehen aus 50 Bundesstaaten.',
    difficulty: 'leicht'
  },
  {
    id: 'a68',
    category: 'allgemein',
    question: 'Welches Land ist die Heimat des Pizza?',
    options: ['Frankreich', 'Griechenland', 'Italien', 'Türkei'],
    correctAnswer: 2,
    explanation: 'Die moderne Pizza stammt ursprünglich aus Neapel, Italien.',
    difficulty: 'leicht'
  },
  {
    id: 'a69',
    category: 'allgemein',
    question: 'Was ist die Hauptstadt von Brasilien?',
    options: ['Rio de Janeiro', 'São Paulo', 'Brasília', 'Salvador'],
    correctAnswer: 2,
    explanation: 'Brasília wurde 1960 als Planstadt zur Hauptstadt Brasiliens.',
    difficulty: 'mittel'
  },
  {
    id: 'a70',
    category: 'allgemein',
    question: 'Wie viele Zwerge begleiten Schneewittchen?',
    options: ['5', '6', '7', '8'],
    correctAnswer: 2,
    explanation: 'Im Märchen der Gebrüder Grimm sind es sieben Zwerge.',
    difficulty: 'leicht'
  },
  {
    id: 'a71',
    category: 'allgemein',
    question: 'Welches Land ist für seine Kuckucksuhren bekannt?',
    options: ['Österreich', 'Schweiz', 'Deutschland', 'Frankreich'],
    correctAnswer: 2,
    explanation: 'Die Kuckucksuhr ist ein Symbol für den Schwarzwald in Deutschland.',
    difficulty: 'leicht'
  },
  {
    id: 'a72',
    category: 'allgemein',
    question: 'Was ist die Hauptstadt von Thailand?',
    options: ['Phuket', 'Chiang Mai', 'Bangkok', 'Pattaya'],
    correctAnswer: 2,
    explanation: 'Bangkok ist die Hauptstadt und größte Stadt Thailands.',
    difficulty: 'leicht'
  },
  {
    id: 'a73',
    category: 'allgemein',
    question: 'Wie viele Ringe hat das olympische Symbol?',
    options: ['4', '5', '6', '7'],
    correctAnswer: 1,
    explanation: 'Die 5 Ringe repräsentieren die fünf bewohnten Kontinente der Erde.',
    difficulty: 'leicht'
  },
  {
    id: 'a74',
    category: 'allgemein',
    question: 'Welches Land ist die Heimat von LEGO?',
    options: ['Schweden', 'Norwegen', 'Dänemark', 'Deutschland'],
    correctAnswer: 2,
    explanation: 'LEGO wurde 1932 von Ole Kirk Christiansen in Dänemark gegründet.',
    difficulty: 'leicht'
  },
  {
    id: 'a75',
    category: 'allgemein',
    question: 'Was ist die Hauptstadt von Südkorea?',
    options: ['Busan', 'Incheon', 'Seoul', 'Daegu'],
    correctAnswer: 2,
    explanation: 'Seoul ist die Hauptstadt und das wirtschaftliche Zentrum Südkoreas.',
    difficulty: 'leicht'
  },
  {
    id: 'a76',
    category: 'allgemein',
    question: 'Wie viele Saiten hat eine Violine normalerweise?',
    options: ['3', '4', '5', '6'],
    correctAnswer: 1,
    explanation: 'Eine Standard-Violine hat 4 Saiten (G, D, A, E).',
    difficulty: 'mittel'
  },
  {
    id: 'a77',
    category: 'allgemein',
    question: 'Welches Land ist für seine Fjorde bekannt?',
    options: ['Schweden', 'Finnland', 'Norwegen', 'Island'],
    correctAnswer: 2,
    explanation: 'Norwegen ist weltberühmt für seine tiefen und spektakulären Fjorde.',
    difficulty: 'leicht'
  },
  {
    id: 'a78',
    category: 'allgemein',
    question: 'Was ist die Hauptstadt von Vietnam?',
    options: ['Ho-Chi-Minh-Stadt', 'Da Nang', 'Hanoi', 'Hue'],
    correctAnswer: 2,
    explanation: 'Hanoi ist die Hauptstadt Vietnams.',
    difficulty: 'mittel'
  },
  {
    id: 'a79',
    category: 'allgemein',
    question: 'Wie viele Zentimeter hat ein Meter?',
    options: ['10', '100', '1000', '10000'],
    correctAnswer: 1,
    explanation: 'Ein Meter entspricht 100 Zentimetern.',
    difficulty: 'leicht'
  },
  {
    id: 'a80',
    category: 'allgemein',
    question: 'Welches Land ist die Heimat des Flamenco?',
    options: ['Portugal', 'Italien', 'Spanien', 'Mexiko'],
    correctAnswer: 2,
    explanation: 'Flamenco ist eine traditionelle spanische Musik- und Tanzform.',
    difficulty: 'leicht'
  },

  // Geschichte (12)
  {
    id: 'h1',
    category: 'geschichte',
    question: 'In welchem Jahr begann der Erste Weltkrieg?',
    options: ['1912', '1914', '1918', '1939'],
    correctAnswer: 1,
    explanation: 'Der Erste Weltkrieg begann im Sommer 1914 nach dem Attentat von Sarajevo.'
  },
  {
    id: 'h2',
    category: 'geschichte',
    question: 'Wer war der erste Präsident der USA?',
    options: ['Thomas Jefferson', 'Abraham Lincoln', 'George Washington', 'John F. Kennedy'],
    correctAnswer: 2,
    explanation: 'George Washington amtierte von 1789 bis 1797 als erster US-Präsident.'
  },
  {
    id: 'h3',
    category: 'geschichte',
    question: 'Wann fiel die Berliner Mauer?',
    options: ['1987', '1989', '1990', '1991'],
    correctAnswer: 1,
    explanation: 'Die Maueröffnung am 9. November 1989 markierte das Ende der Teilung Deutschlands.'
  },
  {
    id: 'h4',
    category: 'geschichte',
    question: 'Welches Volk baute das Kolosseum in Rom?',
    options: ['Griechen', 'Ägypter', 'Römer', 'Phönizier'],
    correctAnswer: 2,
    explanation: 'Das Kolosseum wurde im 1. Jahrhundert n. Chr. von den Römern als Amphitheater erbaut.'
  },
  {
    id: 'h5',
    category: 'geschichte',
    question: 'Wer entdeckte 1492 Amerika?',
    options: ['Vasco da Gama', 'Marco Polo', 'Christoph Kolumbus', 'Ferdinand Magellan'],
    correctAnswer: 2,
    explanation: 'Kolumbus landete 1492 auf den Bahamas, im Glauben, einen Seeweg nach Indien gefunden zu haben.'
  },
  {
    id: 'h6',
    category: 'geschichte',
    question: 'Wie hieß die ägyptische Königin, die mit Caesar liiert war?',
    options: ['Nofretete', 'Kleopatra', 'Hatschepsut', 'Isis'],
    correctAnswer: 1,
    explanation: 'Kleopatra VII. war die letzte Pharaonin des ägyptischen Ptolemäerreiches.'
  },
  {
    id: 'h7',
    category: 'geschichte',
    question: 'Welches Ereignis löste die Französische Revolution aus?',
    options: ['Sturm auf die Bastille', 'Krönung Napoleons', 'Schlacht von Waterloo', 'Wiener Kongress'],
    correctAnswer: 0,
    explanation: 'Der Sturm auf die Bastille am 14. Juli 1789 gilt als symbolischer Beginn der Revolution.'
  },
  {
    id: 'h8',
    category: 'geschichte',
    question: 'Wer war der "Sonnenkönig"?',
    options: ['Ludwig XIV.', 'Friedrich der Große', 'Karl der Große', 'Napoleon Bonaparte'],
    correctAnswer: 0,
    explanation: 'Ludwig XIV. von Frankreich prägte den Absolutismus und baute Schloss Versailles.'
  },
  {
    id: 'h9',
    category: 'geschichte',
    question: 'In welchem Land fand die Industrielle Revolution ihren Anfang?',
    options: ['Deutschland', 'Frankreich', 'Großbritannien', 'USA'],
    correctAnswer: 2,
    explanation: 'Die Industrielle Revolution begann in der zweiten Hälfte des 18. Jahrhunderts in England.'
  },
  {
    id: 'h10',
    category: 'geschichte',
    question: 'Wie hießen die nordischen Seefahrer des Mittelalters?',
    options: ['Hunnen', 'Wikinger', 'Goten', 'Vandalen'],
    correctAnswer: 1,
    explanation: 'Die Wikinger waren Krieger und Händler aus Skandinavien, die weite Teile Europas bereisten.'
  },
  {
    id: 'h11',
    category: 'geschichte',
    question: 'Wann endete der Zweite Weltkrieg in Europa?',
    options: ['1943', '1944', '1945', '1946'],
    correctAnswer: 2,
    explanation: 'Der Krieg in Europa endete am 8. Mai 1945 mit der bedingungslosen Kapitulation der Wehrmacht.'
  },
  {
    id: 'h12',
    category: 'geschichte',
    question: 'Wer war die erste Frau, die einen Nobelpreis erhielt?',
    options: ['Marie Curie', 'Rosa Luxemburg', 'Bertha von Suttner', 'Mother Teresa'],
    correctAnswer: 0,
    explanation: 'Marie Curie erhielt 1903 den Nobelpreis für Physik und später auch den für Chemie.',
    difficulty: 'mittel'
  },
  {
    id: 'h13',
    category: 'geschichte',
    question: 'Wer war der Anführer der Unabhängigkeitsbewegung in Indien?',
    options: ['Jawaharlal Nehru', 'Mahatma Gandhi', 'Subhas Chandra Bose', 'Indira Gandhi'],
    correctAnswer: 1,
    explanation: 'Mahatma Gandhi führte den gewaltfreien Widerstand gegen die britische Kolonialherrschaft an.',
    difficulty: 'leicht'
  },
  {
    id: 'h14',
    category: 'geschichte',
    question: 'In welchem Jahr wurde die Magna Carta unterzeichnet?',
    options: ['1066', '1215', '1492', '1776'],
    correctAnswer: 1,
    explanation: 'Die Magna Carta Libertatum wurde 1215 vom englischen König Johann Ohneland unterzeichnet.',
    difficulty: 'schwer'
  },
  {
    id: 'h15',
    category: 'geschichte',
    question: 'Wer war die "Jungfrau von Orléans"?',
    options: ['Maria Stuart', 'Katharina die Große', 'Jeanne d\'Arc', 'Elisabeth I.'],
    correctAnswer: 2,
    explanation: 'Jeanne d\'Arc war eine französische Nationalheldin während des Hundertjährigen Krieges.',
    difficulty: 'leicht'
  },
  {
    id: 'h16',
    category: 'geschichte',
    question: 'Welches Reich wurde von Dschingis Khan gegründet?',
    options: ['Osmanisches Reich', 'Mongolisches Reich', 'Römisches Reich', 'Persisches Reich'],
    correctAnswer: 1,
    explanation: 'Dschingis Khan einte die mongolischen Stämme und schuf das größte zusammenhängende Weltreich der Geschichte.',
    difficulty: 'leicht'
  },
  {
    id: 'h17',
    category: 'geschichte',
    question: 'In welchem Jahr begann die Französische Revolution?',
    options: ['1776', '1789', '1804', '1848'],
    correctAnswer: 1,
    explanation: 'Die Revolution begann 1789 mit dem Sturm auf die Bastille.',
    difficulty: 'leicht'
  },
  {
    id: 'h18',
    category: 'geschichte',
    question: 'Wer war der erste Mensch im Weltraum?',
    options: ['Neil Armstrong', 'Buzz Aldrin', 'Yuri Gagarin', 'John Glenn'],
    correctAnswer: 2,
    explanation: 'Der sowjetische Kosmonaut Yuri Gagarin flog 1961 als erster Mensch ins All.',
    difficulty: 'leicht'
  },
  {
    id: 'h19',
    category: 'geschichte',
    question: 'Welches Land wurde früher "Persien" genannt?',
    options: ['Irak', 'Iran', 'Türkei', 'Ägypten'],
    correctAnswer: 1,
    explanation: 'Der Name Persien wurde 1935 offiziell in Iran geändert.',
    difficulty: 'leicht'
  },
  {
    id: 'h20',
    category: 'geschichte',
    question: 'Wer war der britische Premierminister während des Großteils des Zweiten Weltkriegs?',
    options: ['Neville Chamberlain', 'Winston Churchill', 'Clement Attlee', 'Anthony Eden'],
    correctAnswer: 1,
    explanation: 'Winston Churchill führte Großbritannien von 1940 bis 1945 durch den Krieg.',
    difficulty: 'leicht'
  },
  {
    id: 'h21',
    category: 'geschichte',
    question: 'In welchem Jahr wurde die UNO gegründet?',
    options: ['1918', '1945', '1950', '1961'],
    correctAnswer: 1,
    explanation: 'Die Vereinten Nationen wurden nach dem Zweiten Weltkrieg im Jahr 1945 gegründet.',
    difficulty: 'mittel'
  },
  {
    id: 'h22',
    category: 'geschichte',
    question: 'Wer war die letzte Zarin von Russland?',
    options: ['Katharina die Große', 'Alexandra Fjodorowna', 'Maria Fjodorowna', 'Anna Iwanowna'],
    correctAnswer: 1,
    explanation: 'Alexandra Fjodorowna war die Gemahlin von Nikolaus II., dem letzten russischen Zaren.',
    difficulty: 'schwer'
  },
  {
    id: 'h23',
    category: 'geschichte',
    question: 'Welches Ereignis markiert den Beginn des Mittelalters?',
    options: ['Krönung Karls des Großen', 'Fall des Weströmischen Reiches', 'Entdeckung Amerikas', 'Erfindung des Buchdrucks'],
    correctAnswer: 1,
    explanation: 'Der Fall Roms im Jahr 476 n. Chr. wird oft als Beginn des Mittelalters angesehen.',
    difficulty: 'mittel'
  },
  {
    id: 'h24',
    category: 'geschichte',
    question: 'Wer war der Anführer der Sowjetunion während des Zweiten Weltkriegs?',
    options: ['Wladimir Lenin', 'Josef Stalin', 'Nikita Chruschtschow', 'Leon Trotzki'],
    correctAnswer: 1,
    explanation: 'Josef Stalin regierte die Sowjetunion von Mitte der 1920er Jahre bis zu seinem Tod 1953.',
    difficulty: 'leicht'
  },
  {
    id: 'h25',
    category: 'geschichte',
    question: 'In welchem Jahr endete der Amerikanische Bürgerkrieg?',
    options: ['1861', '1863', '1865', '1870'],
    correctAnswer: 2,
    explanation: 'Der Sezessionskrieg endete 1865 mit dem Sieg der Nordstaaten.',
    difficulty: 'mittel'
  },
  {
    id: 'h26',
    category: 'geschichte',
    question: 'Wer war die erste Premierministerin des Vereinigten Königreichs?',
    options: ['Theresa May', 'Margaret Thatcher', 'Angela Merkel', 'Indira Gandhi'],
    correctAnswer: 1,
    explanation: 'Margaret Thatcher, die "Eiserne Lady", amtierte von 1979 bis 1990.',
    difficulty: 'leicht'
  },
  {
    id: 'h27',
    category: 'geschichte',
    question: 'Welches antike Volk erfand die Demokratie?',
    options: ['Römer', 'Ägypter', 'Griechen', 'Perser'],
    correctAnswer: 2,
    explanation: 'Die Wiege der Demokratie liegt im antiken Athen des 5. Jahrhunderts v. Chr.',
    difficulty: 'leicht'
  },
  {
    id: 'h28',
    category: 'geschichte',
    question: 'In welchem Jahr wurde Nelson Mandela aus dem Gefängnis entlassen?',
    options: ['1985', '1990', '1994', '1999'],
    correctAnswer: 1,
    explanation: 'Mandela wurde am 11. Februar 1990 nach 27 Jahren Haft entlassen.',
    difficulty: 'mittel'
  },
  {
    id: 'h29',
    category: 'geschichte',
    question: 'Wer war der "Wüstenfuchs" im Zweiten Weltkrieg?',
    options: ['Bernard Montgomery', 'Erwin Rommel', 'George Patton', 'Dwight D. Eisenhower'],
    correctAnswer: 1,
    explanation: 'Generalfeldmarschall Erwin Rommel erhielt diesen Spitznamen während des Afrikafeldzugs.',
    difficulty: 'mittel'
  },
  {
    id: 'h30',
    category: 'geschichte',
    question: 'Welches Land war das erste, das Frauen das Wahlrecht gewährte?',
    options: ['USA', 'Großbritannien', 'Neuseeland', 'Finnland'],
    correctAnswer: 2,
    explanation: 'Neuseeland führte das Frauenwahlrecht bereits 1893 auf nationaler Ebene ein.',
    difficulty: 'schwer'
  },
  {
    id: 'h31',
    category: 'geschichte',
    question: 'Wer war der Begründer des Islam?',
    options: ['Abraham', 'Moses', 'Mohammed', 'Ali'],
    correctAnswer: 2,
    explanation: 'Mohammed gilt im Islam als der letzte Prophet und Gesandte Gottes.',
    difficulty: 'leicht'
  },
  {
    id: 'h32',
    category: 'geschichte',
    question: 'In welchem Jahr wurde die Berliner Mauer gebaut?',
    options: ['1945', '1953', '1961', '1989'],
    correctAnswer: 2,
    explanation: 'Der Bau der Mauer begann am 13. August 1961.',
    difficulty: 'leicht'
  },
  {
    id: 'h33',
    category: 'geschichte',
    question: 'Wer war der römische Kaiser, der das Christentum legalisierte?',
    options: ['Nero', 'Augustus', 'Konstantin der Große', 'Trajan'],
    correctAnswer: 2,
    explanation: 'Mit der Mailänder Vereinbarung von 313 n. Chr. gewährte Konstantin Religionsfreiheit.',
    difficulty: 'mittel'
  },
  {
    id: 'h34',
    category: 'geschichte',
    question: 'Welches Ereignis löste den Eintritt der USA in den Zweiten Weltkrieg aus?',
    options: ['Invasion Polens', 'Angriff auf Pearl Harbor', 'D-Day', 'Schlacht um Midway'],
    correctAnswer: 1,
    explanation: 'Nach dem japanischen Angriff auf Pearl Harbor am 7. Dezember 1941 erklärten die USA Japan den Krieg.',
    difficulty: 'leicht'
  },
  {
    id: 'h35',
    category: 'geschichte',
    question: 'Wer war der Entdecker des Seewegs nach Indien?',
    options: ['Christoph Kolumbus', 'Vasco da Gama', 'Ferdinand Magellan', 'Amerigo Vespucci'],
    correctAnswer: 1,
    explanation: 'Vasco da Gama erreichte 1498 als erster Europäer Indien auf dem Seeweg um Afrika herum.',
    difficulty: 'mittel'
  },
  {
    id: 'h36',
    category: 'geschichte',
    question: 'In welchem Jahr wurde die Unabhängigkeitserklärung der USA unterzeichnet?',
    options: ['1770', '1776', '1783', '1789'],
    correctAnswer: 1,
    explanation: 'Die Declaration of Independence wurde am 4. Juli 1776 verabschiedet.',
    difficulty: 'leicht'
  },
  {
    id: 'h37',
    category: 'geschichte',
    question: 'Wer war der berühmte Philosoph, der Lehrer von Alexander dem Großen war?',
    options: ['Sokrates', 'Platon', 'Aristoteles', 'Epikur'],
    correctAnswer: 2,
    explanation: 'Aristoteles unterrichtete den jungen Alexander drei Jahre lang in Mieza.',
    difficulty: 'mittel'
  },
  {
    id: 'h38',
    category: 'geschichte',
    question: 'Welches Land war das Zentrum der Renaissance?',
    options: ['Frankreich', 'Deutschland', 'Italien', 'Spanien'],
    correctAnswer: 2,
    explanation: 'Die Renaissance begann im 14. Jahrhundert in Italien, insbesondere in Florenz.',
    difficulty: 'leicht'
  },
  {
    id: 'h39',
    category: 'geschichte',
    question: 'In welchem Jahr wurde die Apartheid in Südafrika offiziell beendet?',
    options: ['1990', '1992', '1994', '1996'],
    correctAnswer: 2,
    explanation: 'Die ersten freien Wahlen 1994 markierten das Ende der Apartheid.',
    difficulty: 'mittel'
  },
  {
    id: 'h40',
    category: 'geschichte',
    question: 'Wer war der Anführer der Reformation in Deutschland?',
    options: ['Johannes Calvin', 'Ulrich Zwingli', 'Martin Luther', 'Erasmus von Rotterdam'],
    correctAnswer: 2,
    explanation: 'Martin Luther löste 1517 mit seinen 95 Thesen die Reformation aus.',
    difficulty: 'leicht'
  },
  {
    id: 'h41',
    category: 'geschichte',
    question: 'Welches Reich wurde von den Konquistadoren unter Hernán Cortés zerstört?',
    options: ['Inka-Reich', 'Maya-Reich', 'Azteken-Reich', 'Olmeken-Reich'],
    correctAnswer: 2,
    explanation: 'Cortés eroberte zwischen 1519 und 1521 das Reich der Azteken im heutigen Mexiko.',
    difficulty: 'mittel'
  },
  {
    id: 'h42',
    category: 'geschichte',
    question: 'In welchem Jahr begann der Dreißigjährige Krieg?',
    options: ['1517', '1618', '1648', '1756'],
    correctAnswer: 1,
    explanation: 'Der Krieg begann 1618 mit dem Prager Fenstersturz.',
    difficulty: 'mittel'
  },
  {
    id: 'h43',
    category: 'geschichte',
    question: 'Wer war der erste Kaiser des Heiligen Römischen Reiches?',
    options: ['Karl der Große', 'Otto I.', 'Friedrich Barbarossa', 'Karl V.'],
    correctAnswer: 0,
    explanation: 'Karl der Große wurde im Jahr 800 in Rom zum Kaiser gekrönt.',
    difficulty: 'mittel'
  },
  {
    id: 'h44',
    category: 'geschichte',
    question: 'Welches Ereignis beendete die Herrschaft Napoleons endgültig?',
    options: ['Russlandfeldzug', 'Völkerschlacht bei Leipzig', 'Schlacht von Waterloo', 'Exil auf Elba'],
    correctAnswer: 2,
    explanation: 'Napoleon wurde 1815 bei Waterloo (heutiges Belgien) vernichtend geschlagen.',
    difficulty: 'leicht'
  },
  {
    id: 'h45',
    category: 'geschichte',
    question: 'In welchem Jahr wurde der Staat Israel gegründet?',
    options: ['1945', '1947', '1948', '1950'],
    correctAnswer: 2,
    explanation: 'David Ben-Gurion verlas am 14. Mai 1948 die Unabhängigkeitserklärung.',
    difficulty: 'mittel'
  },
  {
    id: 'h46',
    category: 'geschichte',
    question: 'Wer war der berühmte Entdecker, der als erster die Welt umsegelte (bzw. dessen Expedition)?',
    options: ['James Cook', 'Ferdinand Magellan', 'Francis Drake', 'Henry Hudson'],
    correctAnswer: 1,
    explanation: 'Magellans Expedition vollendete 1522 die erste Weltumsegelung, er selbst starb unterwegs.',
    difficulty: 'mittel'
  },
  {
    id: 'h47',
    category: 'geschichte',
    question: 'Welches Volk erfand die Keilschrift?',
    options: ['Ägypter', 'Sumerer', 'Phönizier', 'Hethiter'],
    correctAnswer: 1,
    explanation: 'Die Sumerer entwickelten die Keilschrift im 4. Jahrtausend v. Chr. in Mesopotamien.',
    difficulty: 'schwer'
  },
  {
    id: 'h48',
    category: 'geschichte',
    question: 'In welchem Jahr fand die erste Mondlandung statt?',
    options: ['1965', '1967', '1969', '1971'],
    correctAnswer: 2,
    explanation: 'Die Apollo-11-Mission landete am 20. Juli 1969 auf dem Mond.',
    difficulty: 'leicht'
  },
  {
    id: 'h49',
    category: 'geschichte',
    question: 'Wer war der russische Zar, der Sankt Petersburg gründete?',
    options: ['Iwan der Schreckliche', 'Peter der Große', 'Nikolaus I.', 'Alexander II.'],
    correctAnswer: 1,
    explanation: 'Peter I. gründete die Stadt 1703 als "Fenster nach Europa".',
    difficulty: 'mittel'
  },
  {
    id: 'h50',
    category: 'geschichte',
    question: 'Welches Land war die erste Demokratie der Neuzeit?',
    options: ['Frankreich', 'USA', 'Großbritannien', 'Schweiz'],
    correctAnswer: 1,
    explanation: 'Die USA gelten mit ihrer Verfassung von 1787 als die älteste noch bestehende Demokratie.',
    difficulty: 'mittel'
  },

  // Geografie (12)
  {
    id: 'g1',
    category: 'geografie',
    question: 'Welcher Berg ist der höchste der Welt?',
    options: ['Mont Blanc', 'Kilimandscharo', 'Mount Everest', 'K2'],
    correctAnswer: 2,
    explanation: 'Der Mount Everest im Himalaya ist mit 8.848 Metern der höchste Berg über dem Meeresspiegel.',
    difficulty: 'leicht'
  },
  {
    id: 'g2',
    category: 'geografie',
    question: 'In welchem Land liegt die Stadt Rio de Janeiro?',
    options: ['Argentinien', 'Brasilien', 'Portugal', 'Mexiko'],
    correctAnswer: 1,
    explanation: 'Rio de Janeiro ist eine der bekanntesten Städte Brasiliens, berühmt für den Karneval und die Christusstatue.',
    difficulty: 'leicht'
  },
  {
    id: 'g3',
    category: 'geografie',
    question: 'Was ist der kleinste Kontinent der Welt?',
    options: ['Europa', 'Antarktis', 'Australien', 'Südamerika'],
    correctAnswer: 2,
    explanation: 'Australien (oft als Teil von Ozeanien betrachtet) ist flächenmäßig der kleinste Kontinent.',
    difficulty: 'leicht'
  },
  {
    id: 'g4',
    category: 'geografie',
    question: 'Welcher Fluss fließt durch London?',
    options: ['Seine', 'Donau', 'Themse', 'Rhein'],
    correctAnswer: 2,
    explanation: 'Die Themse ist der bekannteste Fluss Englands und fließt mitten durch London.',
    difficulty: 'leicht'
  },
  {
    id: 'g5',
    category: 'geografie',
    question: 'Welches Land wird auch als "Land der aufgehenden Sonne" bezeichnet?',
    options: ['China', 'Japan', 'Südkorea', 'Thailand'],
    correctAnswer: 1,
    explanation: 'Japan liegt östlich von China, weshalb die Sonne dort früher aufzugehen scheint.',
    difficulty: 'leicht'
  },
  {
    id: 'g6',
    category: 'geografie',
    question: 'Wie heißt die Hauptstadt von Italien?',
    options: ['Mailand', 'Venedig', 'Florenz', 'Rom'],
    correctAnswer: 3,
    explanation: 'Rom ist die Hauptstadt Italiens und beherbergt den Vatikanstaat.',
    difficulty: 'leicht'
  },
  {
    id: 'g7',
    category: 'geografie',
    question: 'Welcher See ist der tiefste der Welt?',
    options: ['Bodensee', 'Baikalsee', 'Kaspisches Meer', 'Viktoriasee'],
    correctAnswer: 1,
    explanation: 'Der Baikalsee in Sibirien ist mit über 1.600 Metern der tiefste See der Erde.',
    difficulty: 'mittel'
  },
  {
    id: 'g8',
    category: 'geografie',
    question: 'In welchem Land befinden sich die Alpen NICHT?',
    options: ['Österreich', 'Schweiz', 'Spanien', 'Frankreich'],
    correctAnswer: 2,
    explanation: 'Die Alpen erstrecken sich über acht Länder, Spanien gehört jedoch nicht dazu (dort liegen die Pyrenäen).',
    difficulty: 'leicht'
  },
  {
    id: 'g9',
    category: 'geografie',
    question: 'Welches ist das flächenmäßig größte Land der Erde?',
    options: ['Kanada', 'China', 'USA', 'Russland'],
    correctAnswer: 3,
    explanation: 'Russland ist mit über 17 Millionen Quadratkilometern das größte Land der Welt.',
    difficulty: 'leicht'
  },
  {
    id: 'g10',
    category: 'geografie',
    question: 'Wie heißt die Meerenge zwischen Europa und Afrika?',
    options: ['Straße von Malakka', 'Straße von Gibraltar', 'Sueskanal', 'Panamakanal'],
    correctAnswer: 1,
    explanation: 'Die Straße von Gibraltar verbindet den Atlantik mit dem Mittelmeer.',
    difficulty: 'leicht'
  },
  {
    id: 'g11',
    category: 'geografie',
    question: 'Welche Wüste ist die größte Trockenwüste der Welt?',
    options: ['Gobi', 'Sahara', 'Atacama', 'Kalahari'],
    correctAnswer: 1,
    explanation: 'Die Sahara in Nordafrika ist die größte heiße Wüste der Erde.',
    difficulty: 'leicht'
  },
  {
    id: 'g12',
    category: 'geografie',
    question: 'In welcher Stadt befindet sich das Brandenburger Tor?',
    options: ['München', 'Hamburg', 'Berlin', 'Köln'],
    correctAnswer: 2,
    explanation: 'Das Brandenburger Tor ist das bekannteste Wahrzeichen Berlins.',
    difficulty: 'leicht'
  },
  {
    id: 'g13',
    category: 'geografie',
    question: 'Was ist die Hauptstadt von Island?',
    options: ['Oslo', 'Reykjavík', 'Helsinki', 'Stockholm'],
    correctAnswer: 1,
    explanation: 'Reykjavík ist die nördlichste Hauptstadt der Welt.',
    difficulty: 'leicht'
  },
  {
    id: 'g14',
    category: 'geografie',
    question: 'Welches Land hat die längste Küstenlinie der Welt?',
    options: ['Australien', 'Russland', 'Kanada', 'Indonesien'],
    correctAnswer: 2,
    explanation: 'Kanada hat aufgrund seiner vielen Inseln eine Küstenlinie von über 200.000 km.',
    difficulty: 'mittel'
  },
  {
    id: 'g15',
    category: 'geografie',
    question: 'Wie heißt der größte Ozean der Erde?',
    options: ['Atlantik', 'Indik', 'Pazifik', 'Arktischer Ozean'],
    correctAnswer: 2,
    explanation: 'Der Pazifische Ozean bedeckt fast ein Drittel der Erdoberfläche.',
    difficulty: 'leicht'
  },
  {
    id: 'g16',
    category: 'geografie',
    question: 'In welchem Land liegt das Great Barrier Reef?',
    options: ['Brasilien', 'Indonesien', 'Australien', 'Thailand'],
    correctAnswer: 2,
    explanation: 'Das größte Korallenriff der Welt liegt vor der Nordostküste Australiens.',
    difficulty: 'leicht'
  },
  {
    id: 'g17',
    category: 'geografie',
    question: 'Was ist die Hauptstadt von Argentinien?',
    options: ['Santiago', 'Lima', 'Buenos Aires', 'Montevideo'],
    correctAnswer: 2,
    explanation: 'Buenos Aires liegt am Río de la Plata.',
    difficulty: 'leicht'
  },
  {
    id: 'g18',
    category: 'geografie',
    question: 'Welcher Fluss ist der wasserreichste der Erde?',
    options: ['Nil', 'Amazonas', 'Kongo', 'Mississippi'],
    correctAnswer: 1,
    explanation: 'Der Amazonas führt mehr Wasser als die nächsten sieben größten Flüsse zusammen.',
    difficulty: 'leicht'
  },
  {
    id: 'g19',
    category: 'geografie',
    question: 'Wie heißt die Hauptstadt von Äthiopien?',
    options: ['Nairobi', 'Addis Abeba', 'Khartum', 'Kampala'],
    correctAnswer: 1,
    explanation: 'Addis Abeba ist auch der Sitz der Afrikanischen Union.',
    difficulty: 'schwer'
  },
  {
    id: 'g20',
    category: 'geografie',
    question: 'Welches Land liegt auf zwei Kontinenten?',
    options: ['Ägypten', 'Türkei', 'Russland', 'Alle genannten'],
    correctAnswer: 3,
    explanation: 'Diese Länder haben Gebiete sowohl in Asien als auch in Europa bzw. Afrika.',
    difficulty: 'mittel'
  },
  {
    id: 'g21',
    category: 'geografie',
    question: 'Was ist die Hauptstadt von Portugal?',
    options: ['Porto', 'Lissabon', 'Faro', 'Funchal'],
    correctAnswer: 1,
    explanation: 'Lissabon ist eine der ältesten Städte Westeuropas.',
    difficulty: 'leicht'
  },
  {
    id: 'g22',
    category: 'geografie',
    question: 'Welches Gebirge trennt Europa von Asien?',
    options: ['Alpen', 'Himalaya', 'Ural', 'Anden'],
    correctAnswer: 2,
    explanation: 'Das Uralgebirge gilt traditionell als Grenze zwischen den Kontinenten.',
    difficulty: 'mittel'
  },
  {
    id: 'g23',
    category: 'geografie',
    question: 'Wie heißt die Hauptstadt von Finnland?',
    options: ['Oslo', 'Stockholm', 'Helsinki', 'Kopenhagen'],
    correctAnswer: 2,
    explanation: 'Helsinki liegt an der Küste des Finnischen Meerbusens.',
    difficulty: 'leicht'
  },
  {
    id: 'g24',
    category: 'geografie',
    question: 'Welcher Staat ist der flächenmäßig kleinste der USA?',
    options: ['Delaware', 'Rhode Island', 'Vermont', 'Hawaii'],
    correctAnswer: 1,
    explanation: 'Rhode Island ist der kleinste Bundesstaat, aber dicht besiedelt.',
    difficulty: 'schwer'
  },
  {
    id: 'g25',
    category: 'geografie',
    question: 'Was ist die Hauptstadt von Marokko?',
    options: ['Casablanca', 'Marrakesch', 'Rabat', 'Fès'],
    correctAnswer: 2,
    explanation: 'Rabat ist die Hauptstadt, Casablanca die größte Stadt Marokkos.',
    difficulty: 'mittel'
  },
  {
    id: 'g26',
    category: 'geografie',
    question: 'Welcher Fluss fließt durch Budapest?',
    options: ['Rhein', 'Elbe', 'Donau', 'Oder'],
    correctAnswer: 2,
    explanation: 'Die Donau teilt die Stadt in die Stadtteile Buda und Pest.',
    difficulty: 'leicht'
  },
  {
    id: 'g27',
    category: 'geografie',
    question: 'Wie heißt die Hauptstadt von Neuseeland?',
    options: ['Auckland', 'Christchurch', 'Wellington', 'Hamilton'],
    correctAnswer: 2,
    explanation: 'Wellington ist die südlichste Hauptstadt eines unabhängigen Staates.',
    difficulty: 'mittel'
  },
  {
    id: 'g28',
    category: 'geografie',
    question: 'Welches Land hat die meisten Inseln weltweit?',
    options: ['Indonesien', 'Philippinen', 'Schweden', 'Norwegen'],
    correctAnswer: 2,
    explanation: 'Schweden hat über 220.000 Inseln, die meisten davon unbewohnt.',
    difficulty: 'schwer'
  },
  {
    id: 'g29',
    category: 'geografie',
    question: 'Was ist die Hauptstadt von Peru?',
    options: ['Cusco', 'Lima', 'Arequipa', 'Trujillo'],
    correctAnswer: 1,
    explanation: 'Lima wurde 1535 vom spanischen Eroberer Francisco Pizarro gegründet.',
    difficulty: 'leicht'
  },
  {
    id: 'g30',
    category: 'geografie',
    question: 'Welcher See ist der größte der Erde (nach Fläche)?',
    options: ['Oberer See', 'Viktoriasee', 'Kaspisches Meer', 'Baikalsee'],
    correctAnswer: 2,
    explanation: 'Das Kaspische Meer ist ein abflussloser Salzsee und der größte See der Welt.',
    difficulty: 'mittel'
  },
  {
    id: 'g31',
    category: 'geografie',
    question: 'Wie heißt die Hauptstadt von Polen?',
    options: ['Krakau', 'Danzig', 'Warschau', 'Breslau'],
    correctAnswer: 2,
    explanation: 'Warschau liegt an der Weichsel.',
    difficulty: 'leicht'
  },
  {
    id: 'g32',
    category: 'geografie',
    question: 'Welches Land hat die höchste Bevölkerungsdichte weltweit (Stadtstaaten ausgenommen)?',
    options: ['Indien', 'Niederlande', 'Bangladesch', 'Japan'],
    correctAnswer: 2,
    explanation: 'Bangladesch ist eines der am dichtesten besiedelten Länder der Welt.',
    difficulty: 'mittel'
  },
  {
    id: 'g33',
    category: 'geografie',
    question: 'Was ist die Hauptstadt von Südafrika (Sitz der Regierung)?',
    options: ['Kapstadt', 'Johannesburg', 'Pretoria', 'Durban'],
    correctAnswer: 2,
    explanation: 'Südafrika hat drei Hauptstädte: Pretoria (Exekutive), Kapstadt (Legislative) und Bloemfontein (Judikative).',
    difficulty: 'mittel'
  },
  {
    id: 'g34',
    category: 'geografie',
    question: 'Welche Inselgruppe gehört zu Ecuador?',
    options: ['Malediven', 'Galapagos-Inseln', 'Seychellen', 'Kanaren'],
    correctAnswer: 1,
    explanation: 'Die Galapagos-Inseln sind berühmt für ihre einzigartige Tierwelt.',
    difficulty: 'leicht'
  },
  {
    id: 'g35',
    category: 'geografie',
    question: 'Wie heißt die Hauptstadt von Norwegen?',
    options: ['Bergen', 'Trondheim', 'Oslo', 'Stavanger'],
    correctAnswer: 2,
    explanation: 'Oslo liegt am Ende des Oslofjords.',
    difficulty: 'leicht'
  },
  {
    id: 'g36',
    category: 'geografie',
    question: 'Welcher Kanal verbindet den Atlantik mit dem Pazifik?',
    options: ['Sueskanal', 'Nord-Ostsee-Kanal', 'Panamakanal', 'Korinthkanal'],
    correctAnswer: 2,
    explanation: 'Der Panamakanal wurde 1914 eröffnet und erspart Schiffen den Weg um Kap Hoorn.',
    difficulty: 'leicht'
  },
  {
    id: 'g37',
    category: 'geografie',
    question: 'Was ist die Hauptstadt von Kenia?',
    options: ['Mombasa', 'Nairobi', 'Kisumu', 'Nakuru'],
    correctAnswer: 1,
    explanation: 'Nairobi ist eine der bedeutendsten Städte Ostafrikas.',
    difficulty: 'leicht'
  },
  {
    id: 'g38',
    category: 'geografie',
    question: 'In welchem Land liegt die Atacama-Wüste?',
    options: ['Peru', 'Bolivien', 'Chile', 'Argentinien'],
    correctAnswer: 2,
    explanation: 'Die Atacama gilt als die trockenste Wüste der Erde außerhalb der Polargebiete.',
    difficulty: 'mittel'
  },
  {
    id: 'g39',
    category: 'geografie',
    question: 'Wie heißt die Hauptstadt von Irland?',
    options: ['Belfast', 'Cork', 'Dublin', 'Galway'],
    correctAnswer: 2,
    explanation: 'Dublin liegt an der Mündung des Flusses Liffey.',
    difficulty: 'leicht'
  },
  {
    id: 'g40',
    category: 'geografie',
    question: 'Welcher Staat ist der flächenmäßig größte Afrikas?',
    options: ['Sudan', 'Algerien', 'Kongo', 'Libyen'],
    correctAnswer: 1,
    explanation: 'Seit der Teilung des Sudan ist Algerien das größte Land Afrikas.',
    difficulty: 'mittel'
  },
  {
    id: 'g41',
    category: 'geografie',
    question: 'Was ist die Hauptstadt von Kolumbien?',
    options: ['Medellín', 'Cali', 'Bogotá', 'Cartagena'],
    correctAnswer: 2,
    explanation: 'Bogotá liegt auf einer Hochebene in den Anden.',
    difficulty: 'leicht'
  },
  {
    id: 'g42',
    category: 'geografie',
    question: 'Welches Land hat die meisten Zeitzonen?',
    options: ['Russland', 'USA', 'Frankreich', 'China'],
    correctAnswer: 2,
    explanation: 'Inklusive seiner Überseegebiete hat Frankreich 12 verschiedene Zeitzonen.',
    difficulty: 'schwer'
  },
  {
    id: 'g43',
    category: 'geografie',
    question: 'Wie heißt die Hauptstadt von Saudi-Arabien?',
    options: ['Mekka', 'Medina', 'Riad', 'Dschidda'],
    correctAnswer: 2,
    explanation: 'Riad ist das politische und wirtschaftliche Zentrum des Königreichs.',
    difficulty: 'mittel'
  },
  {
    id: 'g44',
    category: 'geografie',
    question: 'Welche Insel ist die größte der Welt?',
    options: ['Australien', 'Grönland', 'Neuguinea', 'Borneo'],
    correctAnswer: 1,
    explanation: 'Grönland ist die größte Insel, Australien wird als Kontinent klassifiziert.',
    difficulty: 'leicht'
  },
  {
    id: 'g45',
    category: 'geografie',
    question: 'Was ist die Hauptstadt von Ungarn?',
    options: ['Bratislava', 'Prag', 'Budapest', 'Bukarest'],
    correctAnswer: 2,
    explanation: 'Budapest entstand durch die Zusammenlegung von Buda und Pest.',
    difficulty: 'leicht'
  },
  {
    id: 'g46',
    category: 'geografie',
    question: 'Welcher Fluss fließt durch Kairo?',
    options: ['Kongo', 'Nil', 'Niger', 'Sambesi'],
    correctAnswer: 1,
    explanation: 'Der Nil ist die Lebensader Ägyptens.',
    difficulty: 'leicht'
  },
  {
    id: 'g47',
    category: 'geografie',
    question: 'Wie heißt die Hauptstadt von Kroatien?',
    options: ['Split', 'Dubrovnik', 'Zagreb', 'Zadar'],
    correctAnswer: 2,
    explanation: 'Zagreb liegt im Norden des Landes am Fluss Save.',
    difficulty: 'leicht'
  },
  {
    id: 'g48',
    category: 'geografie',
    question: 'In welchem Land liegt der Berg Kilimandscharo?',
    options: ['Kenia', 'Tansania', 'Uganda', 'Äthiopien'],
    correctAnswer: 1,
    explanation: 'Der Kilimandscharo ist das höchste Bergmassiv Afrikas.',
    difficulty: 'mittel'
  },
  {
    id: 'g49',
    category: 'geografie',
    question: 'Was ist die Hauptstadt von Dänemark?',
    options: ['Aarhus', 'Odense', 'Kopenhagen', 'Aalborg'],
    correctAnswer: 2,
    explanation: 'Kopenhagen liegt auf den Inseln Seeland und Amager.',
    difficulty: 'leicht'
  },
  {
    id: 'g50',
    category: 'geografie',
    question: 'Welches Land grenzt an die meisten Nachbarstaaten (14)?',
    options: ['Brasilien', 'Russland', 'China', 'Sowohl Russland als auch China'],
    correctAnswer: 3,
    explanation: 'Sowohl Russland als auch China haben jeweils 14 Nachbarländer.',
    difficulty: 'schwer'
  },

  // Wissenschaft (12)

  // Geografie (12)
  {
    id: 'g1',
    category: 'geografie',
    question: 'Welcher Berg ist der höchste der Welt?',
    options: ['Mont Blanc', 'Kilimandscharo', 'Mount Everest', 'K2'],
    correctAnswer: 2,
    explanation: 'Der Mount Everest im Himalaya ist mit 8.848 Metern der höchste Berg über dem Meeresspiegel.'
  },
  {
    id: 'g2',
    category: 'geografie',
    question: 'In welchem Land liegt die Stadt Rio de Janeiro?',
    options: ['Argentinien', 'Brasilien', 'Portugal', 'Mexiko'],
    correctAnswer: 1,
    explanation: 'Rio de Janeiro ist eine der bekanntesten Städte Brasiliens, berühmt für den Karneval und die Christusstatue.'
  },
  {
    id: 'g3',
    category: 'geografie',
    question: 'Was ist der kleinste Kontinent der Welt?',
    options: ['Europa', 'Antarktis', 'Australien', 'Südamerika'],
    correctAnswer: 2,
    explanation: 'Australien (oft als Teil von Ozeanien betrachtet) ist flächenmäßig der kleinste Kontinent.'
  },
  {
    id: 'g4',
    category: 'geografie',
    question: 'Welcher Fluss fließt durch London?',
    options: ['Seine', 'Donau', 'Themse', 'Rhein'],
    correctAnswer: 2,
    explanation: 'Die Themse ist der bekannteste Fluss Englands und fließt mitten durch London.'
  },
  {
    id: 'g5',
    category: 'geografie',
    question: 'Welches Land wird auch als "Land der aufgehenden Sonne" bezeichnet?',
    options: ['China', 'Japan', 'Südkorea', 'Thailand'],
    correctAnswer: 1,
    explanation: 'Japan liegt östlich von China, weshalb die Sonne dort früher aufzugehen scheint.'
  },
  {
    id: 'g6',
    category: 'geografie',
    question: 'Wie heißt die Hauptstadt von Italien?',
    options: ['Mailand', 'Venedig', 'Florenz', 'Rom'],
    correctAnswer: 3,
    explanation: 'Rom ist die Hauptstadt Italiens und beherbergt den Vatikanstaat.'
  },
  {
    id: 'g7',
    category: 'geografie',
    question: 'Welcher See ist der tiefste der Welt?',
    options: ['Bodensee', 'Baikalsee', 'Kaspisches Meer', 'Viktoriasee'],
    correctAnswer: 1,
    explanation: 'Der Baikalsee in Sibirien ist mit über 1.600 Metern der tiefste See der Erde.'
  },
  {
    id: 'g8',
    category: 'geografie',
    question: 'In welchem Land befinden sich die Alpen NICHT?',
    options: ['Österreich', 'Schweiz', 'Spanien', 'Frankreich'],
    correctAnswer: 2,
    explanation: 'Die Alpen erstrecken sich über acht Länder, Spanien gehört jedoch nicht dazu (dort liegen die Pyrenäen).'
  },
  {
    id: 'g9',
    category: 'geografie',
    question: 'Welches ist das flächenmäßig größte Land der Erde?',
    options: ['Kanada', 'China', 'USA', 'Russland'],
    correctAnswer: 3,
    explanation: 'Russland ist mit über 17 Millionen Quadratkilometern das größte Land der Welt.'
  },
  {
    id: 'g10',
    category: 'geografie',
    question: 'Wie heißt die Meerenge zwischen Europa und Afrika?',
    options: ['Straße von Malakka', 'Straße von Gibraltar', 'Sueskanal', 'Panamakanal'],
    correctAnswer: 1,
    explanation: 'Die Straße von Gibraltar verbindet den Atlantik mit dem Mittelmeer.'
  },
  {
    id: 'g11',
    category: 'geografie',
    question: 'Welche Wüste ist die größte Trockenwüste der Welt?',
    options: ['Gobi', 'Sahara', 'Atacama', 'Kalahari'],
    correctAnswer: 1,
    explanation: 'Die Sahara in Nordafrika ist die größte heiße Wüste der Erde.'
  },
  {
    id: 'g12',
    category: 'geografie',
    question: 'In welcher Stadt befindet sich das Brandenburger Tor?',
    options: ['München', 'Hamburg', 'Berlin', 'Köln'],
    correctAnswer: 2,
    explanation: 'Das Brandenburger Tor ist das bekannteste Wahrzeichen Berlins.'
  },

  // Wissenschaft (12)
  {
    id: 'w1',
    category: 'wissenschaft',
    question: 'Was ist die Lichtgeschwindigkeit (ungefähr)?',
    options: ['300.000 km/s', '30.000 km/s', '3.000 km/s', '300 km/s'],
    correctAnswer: 0,
    explanation: 'Licht legt im Vakuum etwa 299.792 Kilometer pro Sekunde zurück.'
  },
  {
    id: 'w2',
    category: 'wissenschaft',
    question: 'Wer formulierte die Relativitätstheorie?',
    options: ['Isaac Newton', 'Albert Einstein', 'Stephen Hawking', 'Galileo Galilei'],
    correctAnswer: 1,
    explanation: 'Albert Einstein veröffentlichte die spezielle Relativitätstheorie im Jahr 1905.'
  },
  {
    id: 'w3',
    category: 'wissenschaft',
    question: 'Welches Gas atmen wir hauptsächlich aus?',
    options: ['Sauerstoff', 'Stickstoff', 'Kohlendioxid', 'Helium'],
    correctAnswer: 2,
    explanation: 'Wir atmen Sauerstoff ein und geben Kohlendioxid (CO2) als Abfallprodukt des Stoffwechsels ab.'
  },
  {
    id: 'w4',
    category: 'wissenschaft',
    question: 'Wie viele Knochen hat ein neugeborenes Baby ungefähr?',
    options: ['206', '250', '300', '350'],
    correctAnswer: 2,
    explanation: 'Babys haben etwa 300 Knochen, von denen viele im Laufe des Wachstums zusammenwachsen.'
  },
  {
    id: 'w5',
    category: 'wissenschaft',
    question: 'Was ist die chemische Formel für Wasser?',
    options: ['CO2', 'H2O', 'NaCl', 'O2'],
    correctAnswer: 1,
    explanation: 'H2O bedeutet, dass ein Wassermolekül aus zwei Wasserstoffatomen und einem Sauerstoffatom besteht.'
  },
  {
    id: 'w6',
    category: 'wissenschaft',
    question: 'Welcher Planet ist der Sonne am nächsten?',
    options: ['Venus', 'Mars', 'Merkur', 'Jupiter'],
    correctAnswer: 2,
    explanation: 'Merkur ist der innerste Planet unseres Sonnensystems.'
  },
  {
    id: 'w7',
    category: 'wissenschaft',
    question: 'Was ist die Einheit für elektrischen Widerstand?',
    options: ['Volt', 'Ampere', 'Watt', 'Ohm'],
    correctAnswer: 3,
    explanation: 'Ohm (Symbol: Ω) ist die SI-Einheit des elektrischen Widerstands.'
  },
  {
    id: 'w8',
    category: 'wissenschaft',
    question: 'Welches Vitamin wird durch Sonnenlicht in der Haut gebildet?',
    options: ['Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin D'],
    correctAnswer: 3,
    explanation: 'Der Körper kann Vitamin D selbst herstellen, wenn die Haut UV-B-Strahlen ausgesetzt ist.'
  },
  {
    id: 'w9',
    category: 'wissenschaft',
    question: 'Wie nennt man die Vererbungseinheit in der Biologie?',
    options: ['Zelle', 'Gen', 'Atom', 'Molekül'],
    correctAnswer: 1,
    explanation: 'Gene sind Abschnitte auf der DNA, die Informationen für Merkmale enthalten.'
  },
  {
    id: 'w10',
    category: 'wissenschaft',
    question: 'Was ist der Siedepunkt von Wasser auf Meereshöhe?',
    options: ['90 °C', '100 °C', '110 °C', '120 °C'],
    correctAnswer: 1,
    explanation: 'Bei normalem Luftdruck siedet Wasser bei exakt 100 Grad Celsius.'
  },
  {
    id: 'w11',
    category: 'wissenschaft',
    question: 'Welches Instrument misst den Luftdruck?',
    options: ['Thermometer', 'Barometer', 'Hygrometer', 'Anemometer'],
    correctAnswer: 1,
    explanation: 'Ein Barometer wird zur Bestimmung des statischen Luftdrucks verwendet.'
  },
  {
    id: 'w12',
    category: 'wissenschaft',
    question: 'Wie viele Beine hat eine Spinne?',
    options: ['6', '8', '10', '12'],
    correctAnswer: 1,
    explanation: 'Spinnen gehören zu den Spinnentieren (Arachnida) und haben immer 8 Beine.',
    difficulty: 'mittel'
  },
  {
    id: 'w13',
    category: 'wissenschaft',
    question: 'Welches Element hat das chemische Symbol "O"?',
    options: ['Gold', 'Silber', 'Sauerstoff', 'Eisen'],
    correctAnswer: 2,
    explanation: 'O steht für Oxygenium (Sauerstoff).',
    difficulty: 'leicht'
  },
  {
    id: 'w14',
    category: 'wissenschaft',
    question: 'Wie nennt man die kleinste Einheit eines chemischen Elements?',
    options: ['Molekül', 'Atom', 'Zelle', 'Elektron'],
    correctAnswer: 1,
    explanation: 'Ein Atom ist der kleinste chemisch nicht weiter teilbare Baustein der Materie.',
    difficulty: 'leicht'
  },
  {
    id: 'w15',
    category: 'wissenschaft',
    question: 'Welches Organ im menschlichen Körper pumpt Blut?',
    options: ['Lunge', 'Leber', 'Herz', 'Niere'],
    correctAnswer: 2,
    explanation: 'Das Herz ist ein Hohlmuskel, der das Blut durch den Körper pumpt.',
    difficulty: 'leicht'
  },
  {
    id: 'w16',
    category: 'wissenschaft',
    question: 'Was ist die Hauptenergiequelle für das Leben auf der Erde?',
    options: ['Mond', 'Sonne', 'Erdkern', 'Wind'],
    correctAnswer: 1,
    explanation: 'Die Sonne liefert die Energie für die Photosynthese der Pflanzen.',
    difficulty: 'leicht'
  },
  {
    id: 'w17',
    category: 'wissenschaft',
    question: 'Wie viele Planeten hat unser Sonnensystem?',
    options: ['7', '8', '9', '10'],
    correctAnswer: 1,
    explanation: 'Seit 2006 gilt Pluto nicht mehr als Planet, daher sind es 8.',
    difficulty: 'leicht'
  },
  {
    id: 'w18',
    category: 'wissenschaft',
    question: 'Welches Metall ist bei Raumtemperatur flüssig?',
    options: ['Blei', 'Quecksilber', 'Kupfer', 'Zinn'],
    correctAnswer: 1,
    explanation: 'Quecksilber ist das einzige Metall, das bei Standardbedingungen flüssig ist.',
    difficulty: 'mittel'
  },
  {
    id: 'w19',
    category: 'wissenschaft',
    question: 'Was ist der größte Planet in unserem Sonnensystem?',
    options: ['Erde', 'Saturn', 'Jupiter', 'Neptun'],
    correctAnswer: 2,
    explanation: 'Jupiter ist der massereichste und größte Planet.',
    difficulty: 'leicht'
  },
  {
    id: 'w20',
    category: 'wissenschaft',
    question: 'Wie nennt man den Vorgang, bei dem Pflanzen Licht in Energie umwandeln?',
    options: ['Atmung', 'Photosynthese', 'Gärung', 'Oxidation'],
    correctAnswer: 1,
    explanation: 'Bei der Photosynthese wird Lichtenergie in chemische Energie umgewandelt.',
    difficulty: 'leicht'
  },
  {
    id: 'w21',
    category: 'wissenschaft',
    question: 'Welches Gas macht den größten Teil der Erdatmosphäre aus?',
    options: ['Sauerstoff', 'Kohlendioxid', 'Stickstoff', 'Argon'],
    correctAnswer: 2,
    explanation: 'Stickstoff macht etwa 78 % der Luft aus.',
    difficulty: 'mittel'
  },
  {
    id: 'w22',
    category: 'wissenschaft',
    question: 'Wer entdeckte das Penicillin?',
    options: ['Marie Curie', 'Alexander Fleming', 'Louis Pasteur', 'Robert Koch'],
    correctAnswer: 1,
    explanation: 'Fleming entdeckte 1928 zufällig die antibakterielle Wirkung des Schimmelpilzes.',
    difficulty: 'mittel'
  },
  {
    id: 'w23',
    category: 'wissenschaft',
    question: 'Was ist die Einheit der Kraft?',
    options: ['Joule', 'Watt', 'Newton', 'Pascal'],
    correctAnswer: 2,
    explanation: 'Newton (N) ist die SI-Einheit der Kraft.',
    difficulty: 'mittel'
  },
  {
    id: 'w24',
    category: 'wissenschaft',
    question: 'Welches ist das leichteste chemische Element?',
    options: ['Helium', 'Lithium', 'Wasserstoff', 'Sauerstoff'],
    correctAnswer: 2,
    explanation: 'Wasserstoff (H) hat die Ordnungszahl 1.',
    difficulty: 'leicht'
  },
  {
    id: 'w25',
    category: 'wissenschaft',
    question: 'Wie viele Zähne hat ein erwachsener Mensch normalerweise (inkl. Weisheitszähne)?',
    options: ['28', '30', '32', '34'],
    correctAnswer: 2,
    explanation: 'Ein vollständiges bleibendes Gebiss besteht aus 32 Zähnen.',
    difficulty: 'mittel'
  },
  {
    id: 'w26',
    category: 'wissenschaft',
    question: 'Was ist die chemische Formel für Kochsalz?',
    options: ['H2O', 'CO2', 'NaCl', 'HCl'],
    correctAnswer: 2,
    explanation: 'NaCl steht für Natriumchlorid.',
    difficulty: 'leicht'
  },
  {
    id: 'w27',
    category: 'wissenschaft',
    question: 'Welcher Planet wird oft als "Roter Planet" bezeichnet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 1,
    explanation: 'Die rötliche Farbe des Mars kommt von Eisenoxid (Rost) auf der Oberfläche.',
    difficulty: 'leicht'
  },
  {
    id: 'w28',
    category: 'wissenschaft',
    question: 'Was ist die Einheit der elektrischen Spannung?',
    options: ['Ampere', 'Ohm', 'Volt', 'Watt'],
    correctAnswer: 2,
    explanation: 'Volt (V) ist die SI-Einheit der elektrischen Spannung.',
    difficulty: 'leicht'
  },
  {
    id: 'w29',
    category: 'wissenschaft',
    question: 'Wie nennt man die Wissenschaft von den Lebewesen?',
    options: ['Physik', 'Chemie', 'Biologie', 'Geologie'],
    correctAnswer: 2,
    explanation: 'Biologie ist die Lehre vom Leben.',
    difficulty: 'leicht'
  },
  {
    id: 'w30',
    category: 'wissenschaft',
    question: 'Welches Organ reinigt das Blut im menschlichen Körper?',
    options: ['Herz', 'Lunge', 'Niere', 'Magen'],
    correctAnswer: 2,
    explanation: 'Die Nieren filtern Abfallstoffe aus dem Blut.',
    difficulty: 'mittel'
  },
  {
    id: 'w31',
    category: 'wissenschaft',
    question: 'Was ist die härteste natürliche Substanz der Erde?',
    options: ['Gold', 'Eisen', 'Diamant', 'Quarz'],
    correctAnswer: 2,
    explanation: 'Diamant besteht aus reinem Kohlenstoff in einer speziellen Gitterstruktur.',
    difficulty: 'leicht'
  },
  {
    id: 'w32',
    category: 'wissenschaft',
    question: 'Wie viele Bundesstaaten haben die USA?',
    options: ['48', '49', '50', '51'],
    correctAnswer: 2,
    explanation: 'Die USA bestehen aus 50 Bundesstaaten.',
    difficulty: 'leicht'
  },
  {
    id: 'w33',
    category: 'wissenschaft',
    question: 'Welches Gas benötigen Pflanzen für die Photosynthese?',
    options: ['Sauerstoff', 'Stickstoff', 'Kohlendioxid', 'Helium'],
    correctAnswer: 2,
    explanation: 'Pflanzen nehmen CO2 auf und geben O2 ab.',
    difficulty: 'leicht'
  },
  {
    id: 'w34',
    category: 'wissenschaft',
    question: 'Was ist die Einheit der Frequenz?',
    options: ['Hertz', 'Joule', 'Watt', 'Newton'],
    correctAnswer: 0,
    explanation: 'Hertz (Hz) gibt die Anzahl der Schwingungen pro Sekunde an.',
    difficulty: 'mittel'
  },
  {
    id: 'w35',
    category: 'wissenschaft',
    question: 'Wer entwickelte die Evolutionstheorie?',
    options: ['Gregor Mendel', 'Charles Darwin', 'Jean-Baptiste Lamarck', 'Thomas Huxley'],
    correctAnswer: 1,
    explanation: 'Darwin veröffentlichte 1859 sein Hauptwerk "Über die Entstehung der Arten".',
    difficulty: 'leicht'
  },
  {
    id: 'w36',
    category: 'wissenschaft',
    question: 'Welches Element hat das Symbol "Au"?',
    options: ['Silber', 'Kupfer', 'Gold', 'Aluminium'],
    correctAnswer: 2,
    explanation: 'Au leitet sich vom lateinischen Aurum ab.',
    difficulty: 'mittel'
  },
  {
    id: 'w37',
    category: 'wissenschaft',
    question: 'Wie nennt man einen Stoff, der den elektrischen Strom nicht leitet?',
    options: ['Leiter', 'Halbleiter', 'Isolator', 'Supraleiter'],
    correctAnswer: 2,
    explanation: 'Isolatoren haben einen sehr hohen elektrischen Widerstand.',
    difficulty: 'leicht'
  },
  {
    id: 'w38',
    category: 'wissenschaft',
    question: 'Was ist die größte Drüse im menschlichen Körper?',
    options: ['Bauchspeicheldrüse', 'Schilddrüse', 'Leber', 'Zirbeldrüse'],
    correctAnswer: 2,
    explanation: 'Die Leber ist das wichtigste Stoffwechselorgan.',
    difficulty: 'schwer'
  },
  {
    id: 'w39',
    category: 'wissenschaft',
    question: 'Welcher Planet hat die meisten Monde?',
    options: ['Jupiter', 'Saturn', 'Uranus', 'Neptun'],
    correctAnswer: 1,
    explanation: 'Saturn hat nach aktuellem Stand (2023) die meisten entdeckten Monde.',
    difficulty: 'schwer'
  },
  {
    id: 'w40',
    category: 'wissenschaft',
    question: 'Wie nennt man die Verfestigung von Wasser zu Eis?',
    options: ['Schmelzen', 'Gefrieren', 'Verdampfen', 'Sublimieren'],
    correctAnswer: 1,
    explanation: 'Gefrieren ist der Übergang von flüssig zu fest.',
    difficulty: 'leicht'
  },
  {
    id: 'w41',
    category: 'wissenschaft',
    question: 'Was ist die Einheit der Leistung?',
    options: ['Volt', 'Ampere', 'Watt', 'Joule'],
    correctAnswer: 2,
    explanation: 'Watt (W) ist die SI-Einheit der Leistung.',
    difficulty: 'leicht'
  },
  {
    id: 'w42',
    category: 'wissenschaft',
    question: 'Welches Element ist der Hauptbestandteil der Sonne?',
    options: ['Helium', 'Sauerstoff', 'Wasserstoff', 'Kohlenstoff'],
    correctAnswer: 2,
    explanation: 'Die Sonne besteht zu etwa 75 % aus Wasserstoff.',
    difficulty: 'mittel'
  },
  {
    id: 'w43',
    category: 'wissenschaft',
    question: 'Wie viele Chromosomen hat ein Mensch normalerweise pro Zelle?',
    options: ['23', '44', '46', '48'],
    correctAnswer: 2,
    explanation: 'Es sind 23 Paare, also insgesamt 46 Chromosomen.',
    difficulty: 'mittel'
  },
  {
    id: 'w44',
    category: 'wissenschaft',
    question: 'Was ist die Einheit der Energie?',
    options: ['Watt', 'Newton', 'Joule', 'Pascal'],
    correctAnswer: 2,
    explanation: 'Joule (J) ist die SI-Einheit der Energie.',
    difficulty: 'mittel'
  },
  {
    id: 'w45',
    category: 'wissenschaft',
    question: 'Welches Gas schützt uns vor UV-Strahlung?',
    options: ['Stickstoff', 'Ozon', 'Methan', 'Argon'],
    correctAnswer: 1,
    explanation: 'Die Ozonschicht in der Stratosphäre filtert schädliche UV-Strahlen.',
    difficulty: 'leicht'
  },
  {
    id: 'w46',
    category: 'wissenschaft',
    question: 'Wie nennt man die Wissenschaft von den Sternen?',
    options: ['Astrologie', 'Astronomie', 'Geologie', 'Meteorologie'],
    correctAnswer: 1,
    explanation: 'Astronomie ist die wissenschaftliche Sternkunde.',
    difficulty: 'leicht'
  },
  {
    id: 'w47',
    category: 'wissenschaft',
    question: 'Was ist das häufigste Metall in der Erdkruste?',
    options: ['Eisen', 'Kupfer', 'Aluminium', 'Gold'],
    correctAnswer: 2,
    explanation: 'Aluminium ist nach Sauerstoff und Silizium das dritthäufigste Element.',
    difficulty: 'schwer'
  },
  {
    id: 'w48',
    category: 'wissenschaft',
    question: 'Wie nennt man die unterste Schicht der Atmosphäre?',
    options: ['Stratosphäre', 'Mesosphäre', 'Troposphäre', 'Exosphäre'],
    correctAnswer: 2,
    explanation: 'In der Troposphäre spielt sich das meiste Wettergeschehen ab.',
    difficulty: 'schwer'
  },
  {
    id: 'w49',
    category: 'wissenschaft',
    question: 'Welches Element hat das Symbol "Fe"?',
    options: ['Fluor', 'Eisen', 'Fermium', 'Francium'],
    correctAnswer: 1,
    explanation: 'Fe leitet sich vom lateinischen Ferrum ab.',
    difficulty: 'mittel'
  },
  {
    id: 'w50',
    category: 'wissenschaft',
    question: 'Was ist die Einheit des Drucks?',
    options: ['Newton', 'Joule', 'Pascal', 'Watt'],
    correctAnswer: 2,
    explanation: 'Pascal (Pa) ist die SI-Einheit des Drucks.',
    difficulty: 'mittel'
  },

  // Technik (12)
  {
    id: 't1',
    category: 'technik',
    question: 'Wofür steht die Abkürzung "WWW"?',
    options: ['World Wide Web', 'Web Wide World', 'World Web Wide', 'Wide World Web'],
    correctAnswer: 0,
    explanation: 'Das World Wide Web wurde 1989 von Tim Berners-Lee am CERN entwickelt.'
  },
  {
    id: 't2',
    category: 'technik',
    question: 'Wer gilt als Erfinder des modernen Buchdrucks?',
    options: ['Leonardo da Vinci', 'Johannes Gutenberg', 'Thomas Edison', 'Nikola Tesla'],
    correctAnswer: 1,
    explanation: 'Gutenberg erfand um 1450 den Buchdruck mit beweglichen Metalllettern.'
  },
  {
    id: 't3',
    category: 'technik',
    question: 'Welches Unternehmen entwickelte das iPhone?',
    options: ['Samsung', 'Microsoft', 'Apple', 'Google'],
    correctAnswer: 2,
    explanation: 'Apple stellte das erste iPhone im Jahr 2007 vor.'
  },
  {
    id: 't4',
    category: 'technik',
    question: 'Was ist das Herzstück eines Computers?',
    options: ['Festplatte', 'Monitor', 'CPU (Prozessor)', 'Tastatur'],
    correctAnswer: 2,
    explanation: 'Die CPU (Central Processing Unit) führt die Berechnungen und Befehle aus.'
  },
  {
    id: 't5',
    category: 'technik',
    question: 'Wofür steht "USB"?',
    options: ['Universal Serial Bus', 'United Serial Bus', 'Universal System Bus', 'User Serial Bus'],
    correctAnswer: 0,
    explanation: 'USB ist ein serielles Bussystem zur Verbindung eines Computers mit externen Geräten.'
  },
  {
    id: 't6',
    category: 'technik',
    question: 'Welche Programmiersprache wird oft für künstliche Intelligenz genutzt?',
    options: ['HTML', 'CSS', 'Python', 'SQL'],
    correctAnswer: 2,
    explanation: 'Python ist aufgrund seiner einfachen Syntax und vieler Bibliotheken sehr beliebt in der KI-Entwicklung.'
  },
  {
    id: 't7',
    category: 'technik',
    question: 'Wer erfand die Glühbirne (marktreif)?',
    options: ['Alexander Graham Bell', 'Thomas Alva Edison', 'James Watt', 'Henry Ford'],
    correctAnswer: 1,
    explanation: 'Edison entwickelte 1879 eine langlebige Kohlenfaden-Glühlampe.'
  },
  {
    id: 't8',
    category: 'technik',
    question: 'Was bedeutet "AI" im Englischen?',
    options: ['Advanced Internet', 'Artificial Intelligence', 'Automated Information', 'Active Interface'],
    correctAnswer: 1,
    explanation: 'Artificial Intelligence (Künstliche Intelligenz) befasst sich mit der Automatisierung intelligenten Verhaltens.'
  },
  {
    id: 't9',
    category: 'technik',
    question: 'Welches Betriebssystem stammt von Google?',
    options: ['Windows', 'macOS', 'Android', 'Linux'],
    correctAnswer: 2,
    explanation: 'Android ist ein von Google entwickeltes Betriebssystem für mobile Geräte.'
  },
  {
    id: 't10',
    category: 'technik',
    question: 'Was ist ein "Pixel"?',
    options: ['Ein kleiner Computer', 'Ein Bildpunkt', 'Ein Kabeltyp', 'Ein Speicherchip'],
    correctAnswer: 1,
    explanation: 'Ein Pixel ist die kleinste Einheit eines digitalen Bildes.'
  },
  {
    id: 't11',
    category: 'technik',
    question: 'Wie nennt man die Cloud-Speicher-Lösung von Microsoft?',
    options: ['iCloud', 'Google Drive', 'OneDrive', 'Dropbox'],
    correctAnswer: 2,
    explanation: 'OneDrive ist der Filehosting-Dienst von Microsoft.'
  },
  {
    id: 't12',
    category: 'technik',
    question: 'Wofür steht "GPS"?',
    options: ['General Positioning System', 'Global Positioning System', 'Global Point System', 'Geographic Positioning System'],
    correctAnswer: 1,
    explanation: 'Das Global Positioning System ermöglicht die weltweite Positionsbestimmung per Satellit.',
    difficulty: 'mittel'
  },
  {
    id: 't13',
    category: 'technik',
    question: 'Welches Dateiformat wird am häufigsten für komprimierte Bilder im Web verwendet?',
    options: ['PNG', 'JPEG', 'GIF', 'BMP'],
    correctAnswer: 1,
    explanation: 'JPEG (Joint Photographic Experts Group) ist der Standard für die Kompression von Fotos.',
    difficulty: 'leicht'
  },
  {
    id: 't14',
    category: 'technik',
    question: 'Wie nennt man die physischen Teile eines Computers?',
    options: ['Software', 'Hardware', 'Firmware', 'Malware'],
    correctAnswer: 1,
    explanation: 'Hardware umfasst alle greifbaren Komponenten wie Gehäuse, Mainboard oder Grafikkarte.',
    difficulty: 'leicht'
  },
  {
    id: 't15',
    category: 'technik',
    question: 'Was ist die Hauptaufgabe eines Webbrowsers?',
    options: ['Emails schreiben', 'Webseiten anzeigen', 'Dateien löschen', 'Bilder bearbeiten'],
    correctAnswer: 1,
    explanation: 'Ein Browser (wie Chrome oder Firefox) interpretiert HTML-Code und stellt Webseiten dar.',
    difficulty: 'leicht'
  },
  {
    id: 't16',
    category: 'technik',
    question: 'Welche Technologie ermöglicht kabellose Kopfhörer?',
    options: ['WLAN', 'Infrarot', 'Bluetooth', 'NFC'],
    correctAnswer: 2,
    explanation: 'Bluetooth ist ein Industriestandard für die Datenübertragung über kurze Distanzen.',
    difficulty: 'leicht'
  },
  {
    id: 't17',
    category: 'technik',
    question: 'Wofür steht die Abkürzung "RAM"?',
    options: ['Read Access Memory', 'Random Access Memory', 'Real Access Memory', 'Rapid Access Memory'],
    correctAnswer: 1,
    explanation: 'RAM ist der Arbeitsspeicher eines Computers, der Daten flüchtig speichert.',
    difficulty: 'mittel'
  },
  {
    id: 't18',
    category: 'technik',
    question: 'Was ist ein "Algorithmus"?',
    options: ['Ein Computer-Virus', 'Eine eindeutige Handlungsvorschrift zur Lösung eines Problems', 'Ein spezieller Monitor', 'Eine Programmiersprache'],
    correctAnswer: 1,
    explanation: 'Ein Algorithmus besteht aus Einzelschritten, die nacheinander ausgeführt werden.',
    difficulty: 'mittel'
  },
  {
    id: 't19',
    category: 'technik',
    question: 'Welches Unternehmen entwickelte das Betriebssystem Windows?',
    options: ['Apple', 'IBM', 'Microsoft', 'Intel'],
    correctAnswer: 2,
    explanation: 'Microsoft veröffentlichte die erste Windows-Version im Jahr 1985.',
    difficulty: 'leicht'
  },
  {
    id: 't20',
    category: 'technik',
    question: 'Was ist die Aufgabe einer Firewall?',
    options: ['Den Computer kühlen', 'Das Netzwerk vor unbefugten Zugriffen schützen', 'Die Festplatte beschleunigen', 'Viren löschen'],
    correctAnswer: 1,
    explanation: 'Eine Firewall überwacht den Datenverkehr und blockiert potenziell schädliche Verbindungen.',
    difficulty: 'mittel'
  },
  {
    id: 't21',
    category: 'technik',
    question: 'Wofür steht "URL"?',
    options: ['Uniform Resource Locator', 'Universal Resource Link', 'Uniform Radio Link', 'Universal Radio Locator'],
    correctAnswer: 0,
    explanation: 'Die URL ist die eindeutige Adresse einer Ressource (z.B. einer Webseite) im Internet.',
    difficulty: 'schwer'
  },
  {
    id: 't22',
    category: 'technik',
    question: 'Welches Medium speichert Daten mithilfe von Magnetismus?',
    options: ['CD', 'DVD', 'HDD (Festplatte)', 'SSD'],
    correctAnswer: 2,
    explanation: 'Klassische HDDs nutzen rotierende Magnetscheiben zur Datenspeicherung.',
    difficulty: 'mittel'
  },
  {
    id: 't23',
    category: 'technik',
    question: 'Was ist "Phishing"?',
    options: ['Ein neues Computerspiel', 'Der Versuch, über gefälschte Webseiten an Nutzerdaten zu gelangen', 'Eine Methode zur Bildbearbeitung', 'Ein Hardware-Defekt'],
    correctAnswer: 1,
    explanation: 'Phishing ist eine Form des Social Engineering, oft per E-Mail.',
    difficulty: 'mittel'
  },
  {
    id: 't24',
    category: 'technik',
    question: 'Wie nennt man die Endung einer ausführbaren Datei unter Windows?',
    options: ['.txt', '.jpg', '.exe', '.pdf'],
    correctAnswer: 2,
    explanation: '.exe steht für "executable" (ausführbar).',
    difficulty: 'leicht'
  },
  {
    id: 't25',
    category: 'technik',
    question: 'Wofür wird die Programmiersprache SQL hauptsächlich verwendet?',
    options: ['Webdesign', 'Datenbanken', 'Spieleentwicklung', 'Betriebssysteme'],
    correctAnswer: 1,
    explanation: 'SQL (Structured Query Language) dient zur Abfrage und Verwaltung von Datenbanken.',
    difficulty: 'mittel'
  },
  {
    id: 't26',
    category: 'technik',
    question: 'Was ist ein "Router"?',
    options: ['Ein Eingabegerät', 'Ein Gerät zur Verbindung von Netzwerken', 'Ein Grafikprogramm', 'Ein Speichermedium'],
    correctAnswer: 1,
    explanation: 'Ein Router leitet Datenpakete zwischen verschiedenen Netzwerken weiter.',
    difficulty: 'leicht'
  },
  {
    id: 't27',
    category: 'technik',
    question: 'Welche Technologie steckt hinter Kryptowährungen wie Bitcoin?',
    options: ['Cloud Computing', 'Blockchain', 'Virtual Reality', 'Big Data'],
    correctAnswer: 1,
    explanation: 'Die Blockchain ist ein dezentrales, digitales Buchungssystem.',
    difficulty: 'mittel'
  },
  {
    id: 't28',
    category: 'technik',
    question: 'Wofür steht "HTML"?',
    options: ['Hypertext Markup Language', 'High Tech Modern Language', 'Hyperlink Text Mode Language', 'Home Tool Markup Language'],
    correctAnswer: 0,
    explanation: 'HTML ist die Grundlage fast jeder Webseite im Internet.',
    difficulty: 'mittel'
  },
  {
    id: 't29',
    category: 'technik',
    question: 'Was ist der Unterschied zwischen einer SSD und einer HDD?',
    options: ['SSDs sind langsamer', 'SSDs haben keine beweglichen Teile', 'HDDs sind teurer', 'Es gibt keinen Unterschied'],
    correctAnswer: 1,
    explanation: 'SSDs speichern Daten auf Flash-Chips, was sie schneller und robuster macht.',
    difficulty: 'mittel'
  },
  {
    id: 't30',
    category: 'technik',
    question: 'Wie nennt man das "Gehirn" eines Roboters?',
    options: ['Sensor', 'Aktor', 'Mikrocontroller', 'Gelenk'],
    correctAnswer: 2,
    explanation: 'Ein Mikrocontroller steuert die Funktionen und verarbeitet Sensordaten.',
    difficulty: 'schwer'
  },
  {
    id: 't31',
    category: 'technik',
    question: 'Was ist "Open Source" Software?',
    options: ['Software, die man kaufen muss', 'Software, deren Quellcode frei einsehbar und änderbar ist', 'Software nur für Linux', 'Software ohne Support'],
    correctAnswer: 1,
    explanation: 'Beispiele für Open Source sind Linux, Firefox oder VLC.',
    difficulty: 'leicht'
  },
  {
    id: 't32',
    category: 'technik',
    question: 'Wofür steht "PDF"?',
    options: ['Portable Document Format', 'Personal Data File', 'Print Document Folder', 'Public Data Format'],
    correctAnswer: 0,
    explanation: 'PDF wurde von Adobe entwickelt, um Dokumente plattformunabhängig darzustellen.',
    difficulty: 'mittel'
  },
  {
    id: 't33',
    category: 'technik',
    question: 'Was ist ein "Cookie" im Internet-Kontext?',
    options: ['Ein kleiner Virus', 'Eine Textdatei zur Speicherung von Nutzerinformationen', 'Ein Werbebanner', 'Ein Passwort-Manager'],
    correctAnswer: 1,
    explanation: 'Cookies werden vom Browser gespeichert, um z.B. Logins oder Warenkörbe zu merken.',
    difficulty: 'leicht'
  },
  {
    id: 't34',
    category: 'technik',
    question: 'Welche Einheit gibt die Auflösung eines Bildschirms oft an?',
    options: ['Hertz', 'Zoll', 'Pixel', 'Bit'],
    correctAnswer: 2,
    explanation: 'Die Auflösung wird meist in Breite x Höhe Pixeln angegeben (z.B. 1920x1080).',
    difficulty: 'leicht'
  },
  {
    id: 't35',
    category: 'technik',
    question: 'Was ist "Spam"?',
    options: ['Ein nützliches Programm', 'Unerwünschte, massenhaft versendete Nachrichten', 'Ein neuer Dateityp', 'Ein Sicherheitsupdate'],
    correctAnswer: 1,
    explanation: 'Spam-Mails machen einen großen Teil des weltweiten E-Mail-Verkehrs aus.',
    difficulty: 'leicht'
  },
  {
    id: 't36',
    category: 'technik',
    question: 'Wofür steht "CPU"?',
    options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Power Unit', 'Control Process Unit'],
    correctAnswer: 0,
    explanation: 'Die CPU ist der Hauptprozessor eines Computers.',
    difficulty: 'leicht'
  },
  {
    id: 't37',
    category: 'technik',
    question: 'Was ist "Virtual Reality" (VR)?',
    options: ['Ein schnellerer Internetanschluss', 'Eine computergenerierte, interaktive Umgebung', 'Ein spezieller Drucker', 'Eine neue Art von Fernsehen'],
    correctAnswer: 1,
    explanation: 'VR wird meist über spezielle Brillen (Headsets) erlebt.',
    difficulty: 'leicht'
  },
  {
    id: 't38',
    category: 'technik',
    question: 'Wie nennt man die Verschlüsselung von Daten?',
    options: ['Kompression', 'Kryptographie', 'Defragmentierung', 'Formatierung'],
    correctAnswer: 1,
    explanation: 'Kryptographie dient dazu, Informationen vor unbefugtem Zugriff zu schützen.',
    difficulty: 'mittel'
  },
  {
    id: 't39',
    category: 'technik',
    question: 'Was ist ein "Backup"?',
    options: ['Ein Computer-Neustart', 'Eine Sicherheitskopie von Daten', 'Ein Hardware-Upgrade', 'Ein Software-Fehler'],
    correctAnswer: 1,
    explanation: 'Backups schützen vor Datenverlust bei Hardware-Defekten oder Angriffen.',
    difficulty: 'leicht'
  },
  {
    id: 't40',
    category: 'technik',
    question: 'Wofür steht "IP" in IP-Adresse?',
    options: ['Internal Protocol', 'Internet Protocol', 'Information Point', 'Instant Process'],
    correctAnswer: 1,
    explanation: 'Das Internet Protocol ist die Grundlage für die Adressierung in Netzwerken.',
    difficulty: 'mittel'
  },

  // Sprache (10)
  {
    id: 's1',
    category: 'sprache',
    question: 'Was ist ein "Synonym"?',
    options: ['Ein Wort mit gegenteiliger Bedeutung', 'Ein Wort mit gleicher Bedeutung', 'Ein Fremdwort', 'Ein Rechtschreibfehler'],
    correctAnswer: 1,
    explanation: 'Synonyme sind bedeutungsgleiche oder bedeutungsähnliche Wörter (z.B. "schnell" und "fix").'
  },
  {
    id: 's2',
    category: 'sprache',
    question: 'Wie nennt man die Lehre vom Satzbau?',
    options: ['Phonetik', 'Morphologie', 'Syntax', 'Semantik'],
    correctAnswer: 2,
    explanation: 'Die Syntax befasst sich mit den Regeln, nach denen Wörter zu Sätzen kombiniert werden.'
  },
  {
    id: 's3',
    category: 'sprache',
    question: 'Welches dieser Wörter ist ein Adjektiv?',
    options: ['Laufen', 'Haus', 'Schön', 'Und'],
    correctAnswer: 2,
    explanation: 'Adjektive beschreiben Eigenschaften von Personen, Dingen oder Zuständen.'
  },
  {
    id: 's4',
    category: 'sprache',
    question: 'Was ist ein "Oxymoron"?',
    options: ['Ein langes Wort', 'Ein Widerspruch in sich', 'Eine Übertreibung', 'Ein Reim'],
    correctAnswer: 1,
    explanation: 'Ein Oxymoron verbindet zwei sich widersprechende Begriffe (z.B. "bittersüß" oder "alter Knabe").'
  },
  {
    id: 's5',
    category: 'sprache',
    question: 'In welcher Sprache wurde das Wort "Kindergarten" weltweit übernommen?',
    options: ['Englisch', 'Französisch', 'Deutsch', 'Latein'],
    correctAnswer: 2,
    explanation: 'Das deutsche Wort "Kindergarten" wird in vielen Sprachen (u.a. Englisch) als Lehnwort verwendet.'
  },
  {
    id: 's6',
    category: 'sprache',
    question: 'Was ist ein "Palindrom"?',
    options: ['Ein Wort, das sich reimt', 'Ein Wort, das vorwärts und rückwärts gelesen gleich ist', 'Ein sehr seltenes Wort', 'Ein Wort mit vielen Vokalen'],
    correctAnswer: 1,
    explanation: 'Beispiele für Palindrome sind "Anna", "Relieffpfeiler" oder "Lagerregal".'
  },
  {
    id: 's7',
    category: 'sprache',
    question: 'Wie nennt man die Zeitform für die Zukunft?',
    options: ['Präsens', 'Präteritum', 'Futur', 'Perfekt'],
    correctAnswer: 2,
    explanation: 'Das Futur wird verwendet, um Zukünftiges auszudrücken.'
  },
  {
    id: 's8',
    category: 'sprache',
    question: 'Was bedeutet das lateinische Wort "et cetera" (etc.)?',
    options: ['Und so weiter', 'Zum Beispiel', 'Das heißt', 'Im Gegenteil'],
    correctAnswer: 0,
    explanation: 'Et cetera bedeutet wörtlich "und die übrigen (Dinge)".'
  },
  {
    id: 's9',
    category: 'sprache',
    question: 'Welches Satzzeichen beendet eine Frage?',
    options: ['Punkt', 'Ausrufezeichen', 'Fragezeichen', 'Komma'],
    correctAnswer: 2,
    explanation: 'Das Fragezeichen steht am Ende eines direkten Fragesatzes.'
  },
  {
    id: 's10',
    category: 'sprache',
    question: 'Wie viele Fälle (Kasus) gibt es in der deutschen Grammatik?',
    options: ['3', '4', '5', '6'],
    correctAnswer: 1,
    explanation: 'Im Deutschen gibt es Nominativ, Genitiv, Dativ und Akkusativ.',
    difficulty: 'leicht'
  },
  {
    id: 's11',
    category: 'sprache',
    question: 'Was ist ein "Antonym"?',
    options: ['Ein Wort mit gleicher Bedeutung', 'Ein Wort mit gegenteiliger Bedeutung', 'Ein Fremdwort', 'Ein Wort, das man groß schreibt'],
    correctAnswer: 1,
    explanation: 'Antonyme sind Gegensatzwörter (z.B. "heiß" und "kalt").',
    difficulty: 'leicht'
  },
  {
    id: 's12',
    category: 'sprache',
    question: 'Wie nennt man die kleinste bedeutungstragende Einheit der Sprache?',
    options: ['Phonem', 'Morphem', 'Graphem', 'Lexem'],
    correctAnswer: 1,
    explanation: 'Ein Morphem ist die kleinste Einheit mit einer Bedeutung oder grammatischen Funktion.',
    difficulty: 'schwer'
  },
  {
    id: 's13',
    category: 'sprache',
    question: 'Was bedeutet das Wort "Interpunktion"?',
    options: ['Rechtschreibung', 'Satzzeichensetzung', 'Wortwahl', 'Aussprache'],
    correctAnswer: 1,
    explanation: 'Interpunktion bezeichnet das Setzen von Satzzeichen wie Punkt, Komma oder Fragezeichen.',
    difficulty: 'mittel'
  },
  {
    id: 's14',
    category: 'sprache',
    question: 'Welches dieser Wörter ist ein Pronomen?',
    options: ['Laufen', 'Schnell', 'Wir', 'Tisch'],
    correctAnswer: 2,
    explanation: 'Pronomen (Fürwörter) stehen stellvertretend für ein Nomen.',
    difficulty: 'leicht'
  },
  {
    id: 's15',
    category: 'sprache',
    question: 'Was ist eine "Metapher"?',
    options: ['Ein direkter Vergleich mit "wie"', 'Ein bildhafter Ausdruck mit übertragener Bedeutung', 'Ein Reim am Satzende', 'Eine Übertreibung'],
    correctAnswer: 1,
    explanation: 'Eine Metapher ist ein Vergleich ohne das Vergleichswort "wie" (z.B. "Rabenmutter").',
    difficulty: 'mittel'
  },
  {
    id: 's16',
    category: 'sprache',
    question: 'Wie nennt man Wörter, die gleich klingen, aber verschiedene Bedeutungen haben?',
    options: ['Synonyme', 'Homonyme', 'Antonyme', 'Akronyme'],
    correctAnswer: 1,
    explanation: 'Ein Beispiel für ein Homonym ist "Bank" (Sitzmöbel oder Geldinstitut).',
    difficulty: 'mittel'
  },
  {
    id: 's17',
    category: 'sprache',
    question: 'Was ist ein "Euphemismus"?',
    options: ['Eine Beschönigung', 'Eine Beleidigung', 'Ein Fachbegriff', 'Ein Dialektwort'],
    correctAnswer: 0,
    explanation: 'Ein Euphemismus ersetzt ein unangenehmes Wort durch ein positiveres (z.B. "entschlafen" statt "sterben").',
    difficulty: 'schwer'
  },
  {
    id: 's18',
    category: 'sprache',
    question: 'Welche Sprache hat die meisten Muttersprachler weltweit?',
    options: ['Englisch', 'Spanisch', 'Mandarin (Chinesisch)', 'Hindi'],
    correctAnswer: 2,
    explanation: 'Mandarin-Chinesisch hat über 900 Millionen Muttersprachler.',
    difficulty: 'mittel'
  },
  {
    id: 's19',
    category: 'sprache',
    question: 'Was ist ein "Anglizismus"?',
    options: ['Ein Wort aus dem Französischen', 'Ein Wort aus dem Englischen, das im Deutschen verwendet wird', 'Ein sehr altes deutsches Wort', 'Ein Wort aus der Jugendsprache'],
    correctAnswer: 1,
    explanation: 'Beispiele sind "Computer", "Cool" oder "Download".',
    difficulty: 'leicht'
  },
  {
    id: 's20',
    category: 'sprache',
    question: 'Wie nennt man die Zeitform "Plusquamperfekt"?',
    options: ['Gegenwart', 'Vollendete Gegenwart', 'Vorvergangenheit', 'Zukunft'],
    correctAnswer: 2,
    explanation: 'Das Plusquamperfekt drückt Handlungen aus, die vor einem Zeitpunkt in der Vergangenheit stattfanden.',
    difficulty: 'mittel'
  },
  {
    id: 's21',
    category: 'sprache',
    question: 'Was ist ein "Akronym"?',
    options: ['Ein Wort mit vielen Vokalen', 'Ein Kurzwort aus den Anfangsbuchstaben mehrerer Wörter', 'Ein Wort, das rückwärts das Gleiche bedeutet', 'Ein Reim'],
    correctAnswer: 1,
    explanation: 'Beispiele für Akronyme sind "NASA", "NATO" oder "Laser".',
    difficulty: 'mittel'
  },
  {
    id: 's22',
    category: 'sprache',
    question: 'Welches dieser Wörter ist ein Verb?',
    options: ['Blau', 'Singen', 'Freundschaft', 'Gestern'],
    correctAnswer: 1,
    explanation: 'Verben (Zeitwörter) drücken Tätigkeiten, Vorgänge oder Zustände aus.',
    difficulty: 'leicht'
  },
  {
    id: 's23',
    category: 'sprache',
    question: 'Was bedeutet das lateinische Wort "Veni, vidi, vici"?',
    options: ['Ich kam, ich sah, ich siegte', 'Das Leben ist kurz', 'In der Ruhe liegt die Kraft', 'Wissen ist Macht'],
    correctAnswer: 0,
    explanation: 'Dieser berühmte Ausspruch wird Julius Cäsar zugeschrieben.',
    difficulty: 'leicht'
  },
  {
    id: 's24',
    category: 'sprache',
    question: 'Wie nennt man die Wissenschaft von der Sprache?',
    options: ['Psychologie', 'Linguistik', 'Soziologie', 'Philosophie'],
    correctAnswer: 1,
    explanation: 'Linguistik ist die systematische Untersuchung von Sprache und Sprechen.',
    difficulty: 'leicht'
  },
  {
    id: 's25',
    category: 'sprache',
    question: 'Was ist ein "Dialekt"?',
    options: ['Eine Geheimsprache', 'Eine regionale Sprachvariante', 'Eine fehlerhafte Aussprache', 'Eine Schriftsprache'],
    correctAnswer: 1,
    explanation: 'Dialekte (Mundarten) sind lokal oder regional begrenzt.',
    difficulty: 'leicht'
  },
  {
    id: 's26',
    category: 'sprache',
    question: 'Was ist eine "Alliteration"?',
    options: ['Ein Reim am Ende', 'Gleiche Anfangsbuchstaben bei aufeinanderfolgenden Wörtern', 'Ein Wort mit zwei Bedeutungen', 'Eine Frage ohne Antwort'],
    correctAnswer: 1,
    explanation: 'Beispiel: "Milch macht müde Männer munter".',
    difficulty: 'mittel'
  },
  {
    id: 's27',
    category: 'sprache',
    question: 'Welches Satzzeichen leitet eine direkte Rede ein (nach dem Begleitsatz)?',
    options: ['Komma', 'Semikolon', 'Doppelpunkt', 'Gedankenstrich'],
    correctAnswer: 2,
    explanation: 'Nach dem Begleitsatz steht ein Doppelpunkt, dann folgen die Anführungszeichen.',
    difficulty: 'leicht'
  },
  {
    id: 's28',
    category: 'sprache',
    question: 'Was ist ein "Etymologie"?',
    options: ['Die Lehre von den Insekten', 'Die Lehre von der Herkunft der Wörter', 'Die Lehre von den Klängen', 'Die Lehre vom Satzbau'],
    correctAnswer: 1,
    explanation: 'Etymologie untersucht, wie Wörter entstanden sind und sich verändert haben.',
    difficulty: 'schwer'
  },
  {
    id: 's29',
    category: 'sprache',
    question: 'Wie nennt man die Steigerungsform "am schönsten"?',
    options: ['Positiv', 'Komparativ', 'Superlativ', 'Indikativ'],
    correctAnswer: 2,
    explanation: 'Der Superlativ ist die höchste Steigerungsstufe von Adjektiven.',
    difficulty: 'leicht'
  },
  {
    id: 's30',
    category: 'sprache',
    question: 'Was ist ein "Neologismus"?',
    options: ['Ein altes Wort', 'Eine Wortneuschöpfung', 'Ein Rechtschreibfehler', 'Ein Name'],
    correctAnswer: 1,
    explanation: 'Neologismen sind neu in den Sprachgebrauch aufgenommene Wörter (z.B. "googeln").',
    difficulty: 'mittel'
  },
  {
    id: 's31',
    category: 'sprache',
    question: 'Welches dieser Wörter ist ein Konjunktion?',
    options: ['Und', 'Groß', 'Laufen', 'Schnell'],
    correctAnswer: 0,
    explanation: 'Konjunktionen (Bindewörter) verbinden Wörter, Wortgruppen oder Sätze.',
    difficulty: 'leicht'
  },
  {
    id: 's32',
    category: 'sprache',
    question: 'Was bedeutet "phonetisch"?',
    options: ['Die Schrift betreffend', 'Den Klang oder die Aussprache betreffend', 'Die Grammatik betreffend', 'Die Bedeutung betreffend'],
    correctAnswer: 1,
    explanation: 'Phonetik ist die Lehre von den Lauten der Sprache.',
    difficulty: 'mittel'
  },
  {
    id: 's33',
    category: 'sprache',
    question: 'Wie nennt man ein Wort, das aus einer anderen Sprache übernommen wurde?',
    options: ['Erbwort', 'Lehnwort', 'Neuwort', 'Kunstwort'],
    correctAnswer: 1,
    explanation: 'Lehnwörter sind z.B. "Fenster" (aus dem Lateinischen) oder "Baby" (aus dem Englischen).',
    difficulty: 'mittel'
  },
  {
    id: 's34',
    category: 'sprache',
    question: 'Was ist ein "Rhetorische Frage"?',
    options: ['Eine sehr schwere Frage', 'Eine Frage, auf die keine Antwort erwartet wird', 'Eine Frage an ein Publikum', 'Eine unhöfliche Frage'],
    correctAnswer: 1,
    explanation: 'Die Antwort ist bei einer rhetorischen Frage meist offensichtlich oder bereits impliziert.',
    difficulty: 'leicht'
  },
  {
    id: 's35',
    category: 'sprache',
    question: 'Welches Alphabet wird für die deutsche Sprache verwendet?',
    options: ['Griechisch', 'Kyrillisch', 'Lateinisch', 'Hebräisch'],
    correctAnswer: 2,
    explanation: 'Das deutsche Alphabet basiert auf dem lateinischen Alphabet, ergänzt um Umlaute und das ß.',
    difficulty: 'leicht'
  },
  {
    id: 's36',
    category: 'sprache',
    question: 'Was ist ein "Pleonasmus"?',
    options: ['Ein Widerspruch', 'Eine unnötige Dopplung (z.B. "weißer Schimmel")', 'Ein kurzer Satz', 'Ein Reim'],
    correctAnswer: 1,
    explanation: 'Ein Pleonasmus fügt einem Wort ein Attribut hinzu, dessen Bedeutung schon im Wort enthalten ist.',
    difficulty: 'schwer'
  },
  {
    id: 's37',
    category: 'sprache',
    question: 'Wie nennt man die Grundform eines Verbs?',
    options: ['Partizip', 'Infinitiv', 'Imperativ', 'Konjunktiv'],
    correctAnswer: 1,
    explanation: 'Der Infinitiv ist die nicht nach Person, Zahl oder Zeit bestimmte Form (z.B. "gehen").',
    difficulty: 'leicht'
  },
  {
    id: 's38',
    category: 'sprache',
    question: 'Was bedeutet "semantisch"?',
    options: ['Die Form betreffend', 'Die Bedeutung betreffend', 'Die Herkunft betreffend', 'Die Aussprache betreffend'],
    correctAnswer: 1,
    explanation: 'Semantik ist die Lehre von der Bedeutung sprachlicher Zeichen.',
    difficulty: 'schwer'
  },
  {
    id: 's39',
    category: 'sprache',
    question: 'Welches dieser Wörter ist ein Adverb?',
    options: ['Haus', 'Gestern', 'Schön', 'Singen'],
    correctAnswer: 1,
    explanation: 'Adverbien (Umstandswörter) bestimmen Umstände von Handlungen näher (Zeit, Ort, Art und Weise).',
    difficulty: 'mittel'
  },
  {
    id: 's40',
    category: 'sprache',
    question: 'Was ist ein "Onomatopoetikum"?',
    options: ['Ein langes Wort', 'Ein lautmalerisches Wort (z.B. "Kuckuck" oder "Zischen")', 'Ein Wort mit vielen Konsonanten', 'Ein Fachbegriff aus der Medizin'],
    correctAnswer: 1,
    explanation: 'Onomatopoesie ist die Nachahmung von Naturlauten durch Sprache.',
    difficulty: 'schwer'
  },
  {
    id: 'd1',
    category: 'deutschland',
    question: 'Wie viele Bundesländer hat Deutschland?',
    options: ['12', '14', '16', '18'],
    correctAnswer: 2,
    explanation: 'Deutschland besteht aus 16 Bundesländern, darunter drei Stadtstaaten.',
    difficulty: 'leicht'
  },
  {
    id: 'd2',
    category: 'deutschland',
    question: 'Was ist die Hauptstadt von Deutschland?',
    options: ['Bonn', 'München', 'Berlin', 'Hamburg'],
    correctAnswer: 2,
    explanation: 'Berlin ist seit der Wiedervereinigung 1990 die Hauptstadt.',
    difficulty: 'leicht'
  },
  {
    id: 'd3',
    category: 'deutschland',
    question: 'Welcher Fluss ist der längste, der komplett durch Deutschland fließt?',
    options: ['Rhein', 'Elbe', 'Weser', 'Donau'],
    correctAnswer: 2,
    explanation: 'Die Weser ist der längste Fluss, dessen Einzugsgebiet vollständig in Deutschland liegt.',
    difficulty: 'mittel'
  },
  {
    id: 'd4',
    category: 'deutschland',
    question: 'Wie heißt der höchste Berg Deutschlands?',
    options: ['Watzmann', 'Zugspitze', 'Feldberg', 'Brocken'],
    correctAnswer: 1,
    explanation: 'Die Zugspitze ist mit 2.962 Metern der höchste Gipfel.',
    difficulty: 'leicht'
  },
  {
    id: 'd5',
    category: 'deutschland',
    question: 'In welchem Bundesland liegt die Stadt Köln?',
    options: ['Bayern', 'Hessen', 'Nordrhein-Westfalen', 'Niedersachsen'],
    correctAnswer: 2,
    explanation: 'Köln ist die größte Stadt in Nordrhein-Westfalen.',
    difficulty: 'leicht'
  },
  {
    id: 'd6',
    category: 'deutschland',
    question: 'Wer war der erste Bundeskanzler der Bundesrepublik Deutschland?',
    options: ['Willy Brandt', 'Konrad Adenauer', 'Helmut Kohl', 'Ludwig Erhard'],
    correctAnswer: 1,
    explanation: 'Konrad Adenauer war von 1949 bis 1963 im Amt.',
    difficulty: 'mittel'
  },
  {
    id: 'd7',
    category: 'deutschland',
    question: 'Welches Fest in München ist das größte Volksfest der Welt?',
    options: ['Cannstatter Wasen', 'Oktoberfest', 'Kieler Woche', 'Hafengeburtstag'],
    correctAnswer: 1,
    explanation: 'Das Oktoberfest (die "Wiesn") zieht jährlich Millionen Besucher an.',
    difficulty: 'leicht'
  },
  {
    id: 'd8',
    category: 'deutschland',
    question: 'Was sind die Farben der deutschen Nationalflagge?',
    options: ['Schwarz-Weiß-Rot', 'Schwarz-Rot-Gold', 'Blau-Weiß-Rot', 'Grün-Weiß-Rot'],
    correctAnswer: 1,
    explanation: 'Die Farben Schwarz-Rot-Gold stehen für die deutsche Demokratie.',
    difficulty: 'leicht'
  },
  {
    id: 'd9',
    category: 'deutschland',
    question: 'Welches Meer grenzt im Norden an Deutschland?',
    options: ['Mittelmeer', 'Ostsee', 'Schwarzes Meer', 'Rotes Meer'],
    correctAnswer: 1,
    explanation: 'Deutschland grenzt im Norden an die Nordsee und die Ostsee.',
    difficulty: 'leicht'
  },
  {
    id: 'd10',
    category: 'deutschland',
    question: 'In welcher Stadt steht das berühmte Holstentor?',
    options: ['Bremen', 'Lübeck', 'Rostock', 'Wismar'],
    correctAnswer: 1,
    explanation: 'Das Holstentor ist das Wahrzeichen der Hansestadt Lübeck.',
    difficulty: 'mittel'
  },
  {
    id: 'd11',
    category: 'deutschland',
    question: 'Welches Bundesland ist flächenmäßig das größte?',
    options: ['Niedersachsen', 'Baden-Württemberg', 'Bayern', 'Brandenburg'],
    correctAnswer: 2,
    explanation: 'Bayern ist mit über 70.000 km² das größte Bundesland.',
    difficulty: 'leicht'
  },
  {
    id: 'd12',
    category: 'deutschland',
    question: 'Wie heißt das deutsche Parlament?',
    options: ['Bundesrat', 'Bundestag', 'Bundesversammlung', 'Bundesverfassungsgericht'],
    correctAnswer: 1,
    explanation: 'Der Deutsche Bundestag hat seinen Sitz im Reichstagsgebäude in Berlin.',
    difficulty: 'leicht'
  },
  {
    id: 'd13',
    category: 'deutschland',
    question: 'Welche Stadt ist als "Elbflorenz" bekannt?',
    options: ['Hamburg', 'Magdeburg', 'Dresden', 'Leipzig'],
    correctAnswer: 2,
    explanation: 'Dresden erhielt diesen Namen wegen seiner Kunstsammlungen und Architektur.',
    difficulty: 'mittel'
  },
  {
    id: 'd14',
    category: 'deutschland',
    question: 'Welches Gebirge trennt Deutschland von Tschechien?',
    options: ['Harz', 'Erzgebirge', 'Schwarzwald', 'Eifel'],
    correctAnswer: 1,
    explanation: 'Das Erzgebirge bildet die natürliche Grenze im Südosten.',
    difficulty: 'mittel'
  },
  {
    id: 'd15',
    category: 'deutschland',
    question: 'Wann wurde die Berliner Mauer gebaut?',
    options: ['1945', '1953', '1961', '1989'],
    correctAnswer: 2,
    explanation: 'Der Bau der Mauer begann am 13. August 1961.',
    difficulty: 'mittel'
  },
  {
    id: 'd16',
    category: 'deutschland',
    question: 'Welches Bundesland ist ein Stadtstaat?',
    options: ['Saarland', 'Hessen', 'Hamburg', 'Sachsen'],
    correctAnswer: 2,
    explanation: 'Die drei Stadtstaaten sind Berlin, Hamburg und Bremen.',
    difficulty: 'leicht'
  },
  {
    id: 'd17',
    category: 'deutschland',
    question: 'Wie heißt die größte Insel Deutschlands?',
    options: ['Sylt', 'Usedom', 'Rügen', 'Fehmarn'],
    correctAnswer: 2,
    explanation: 'Rügen liegt in der Ostsee und gehört zu Mecklenburg-Vorpommern.',
    difficulty: 'leicht'
  },
  {
    id: 'd18',
    category: 'deutschland',
    question: 'Welcher deutsche Dichter schrieb "Faust"?',
    options: ['Friedrich Schiller', 'Johann Wolfgang von Goethe', 'Heinrich Heine', 'Bertolt Brecht'],
    correctAnswer: 1,
    explanation: 'Goethe arbeitete über 60 Jahre an seinem Hauptwerk.',
    difficulty: 'leicht'
  },
  {
    id: 'd19',
    category: 'deutschland',
    question: 'In welcher Stadt befindet sich der größte Flughafen Deutschlands?',
    options: ['Berlin', 'München', 'Frankfurt am Main', 'Düsseldorf'],
    correctAnswer: 2,
    explanation: 'Der Flughafen Frankfurt (FRA) ist eines der wichtigsten Drehkreuze weltweit.',
    difficulty: 'leicht'
  },
  {
    id: 'd20',
    category: 'deutschland',
    question: 'Welches Bundesland hat die meisten Einwohner?',
    options: ['Bayern', 'Baden-Württemberg', 'Nordrhein-Westfalen', 'Niedersachsen'],
    correctAnswer: 2,
    explanation: 'In NRW leben über 18 Millionen Menschen.',
    difficulty: 'leicht'
  },
  {
    id: 'd21',
    category: 'deutschland',
    question: 'Was geschah am 9. November 1989?',
    options: ['Gründung der BRD', 'Mauerfall', 'Wiedervereinigung', 'Ende des 2. Weltkriegs'],
    correctAnswer: 1,
    explanation: 'Der Mauerfall markierte das Ende der Teilung Deutschlands.',
    difficulty: 'leicht'
  },
  {
    id: 'd22',
    category: 'deutschland',
    question: 'Wie heißt der größte See, der (teilweise) in Deutschland liegt?',
    options: ['Müritz', 'Chiemsee', 'Bodensee', 'Starnberger See'],
    correctAnswer: 2,
    explanation: 'Der Bodensee grenzt an Deutschland, Österreich und die Schweiz.',
    difficulty: 'leicht'
  },
  {
    id: 'd23',
    category: 'deutschland',
    question: 'In welcher Stadt wurde Ludwig van Beethoven geboren?',
    options: ['Wien', 'Salzburg', 'Bonn', 'Leipzig'],
    correctAnswer: 2,
    explanation: 'Beethoven wurde 1770 in Bonn geboren.',
    difficulty: 'mittel'
  },
  {
    id: 'd24',
    category: 'deutschland',
    question: 'Welches Gebirge liegt im Süden Deutschlands?',
    options: ['Harz', 'Alpen', 'Rhön', 'Taunus'],
    correctAnswer: 1,
    explanation: 'Die Alpen bilden die südliche Grenze Bayerns.',
    difficulty: 'leicht'
  },
  {
    id: 'd25',
    category: 'deutschland',
    question: 'Wie viele Nachbarländer hat Deutschland?',
    options: ['7', '8', '9', '10'],
    correctAnswer: 2,
    explanation: 'Dänemark, Polen, Tschechien, Österreich, Schweiz, Frankreich, Luxemburg, Belgien, Niederlande.',
    difficulty: 'mittel'
  },
  {
    id: 'd26',
    category: 'deutschland',
    question: 'Welche Stadt ist der Sitz der Europäischen Zentralbank?',
    options: ['Brüssel', 'Straßburg', 'Frankfurt am Main', 'Luxemburg'],
    correctAnswer: 2,
    explanation: 'Die EZB hat ihren Sitz im Frankfurter Ostend.',
    difficulty: 'mittel'
  },
  {
    id: 'd27',
    category: 'deutschland',
    question: 'Was ist das Wahrzeichen der Stadt Köln?',
    options: ['Frauenkirche', 'Kölner Dom', 'Fernsehturm', 'Speicherstadt'],
    correctAnswer: 1,
    explanation: 'Der Kölner Dom ist eine der meistbesuchten Sehenswürdigkeiten Deutschlands.',
    difficulty: 'leicht'
  },
  {
    id: 'd28',
    category: 'deutschland',
    question: 'Welches Bundesland umschließt die Stadt Berlin vollständig?',
    options: ['Sachsen', 'Sachsen-Anhalt', 'Brandenburg', 'Mecklenburg-Vorpommern'],
    correctAnswer: 2,
    explanation: 'Berlin liegt als Enklave mitten in Brandenburg.',
    difficulty: 'leicht'
  },
  {
    id: 'd29',
    category: 'deutschland',
    question: 'Wie heißt die Hymne der Bundesrepublik Deutschland?',
    options: ['Auferstanden aus Ruinen', 'Das Lied der Deutschen (3. Strophe)', 'Ode an die Freude', 'Heil dir im Siegerkranz'],
    correctAnswer: 1,
    explanation: 'Nur die dritte Strophe des Deutschlandliedes ist die Nationalhymne.',
    difficulty: 'mittel'
  },
  {
    id: 'd30',
    category: 'deutschland',
    question: 'Welche Stadt ist für ihre Porzellanmanufaktur berühmt?',
    options: ['Meißen', 'Jena', 'Weimar', 'Erfurt'],
    correctAnswer: 0,
    explanation: 'Meissener Porzellan ist weltweit bekannt für seine Qualität und das Logo mit den gekreuzten Schwertern.',
    difficulty: 'mittel'
  },
  {
    id: 'ti1',
    category: 'tiere',
    question: 'Welches ist das größte Landsäugetier der Erde?',
    options: ['Nashorn', 'Flusspferd', 'Afrikanischer Elefant', 'Giraffe'],
    correctAnswer: 2,
    explanation: 'Ein ausgewachsener Elefantenbulle kann bis zu 6 Tonnen wiegen.',
    difficulty: 'leicht'
  },
  {
    id: 'ti2',
    category: 'tiere',
    question: 'Welcher Vogel kann nicht fliegen, aber sehr schnell laufen?',
    options: ['Pinguin', 'Strauß', 'Adler', 'Kolibri'],
    correctAnswer: 1,
    explanation: 'Der Strauß erreicht Geschwindigkeiten von bis zu 70 km/h.',
    difficulty: 'leicht'
  },
  {
    id: 'ti3',
    category: 'tiere',
    question: 'Wie viele Arme hat ein Oktopus normalerweise?',
    options: ['6', '8', '10', '12'],
    correctAnswer: 1,
    explanation: 'Kraken (Oktopusse) gehören zu den achtarmigen Tintenfischen.',
    difficulty: 'leicht'
  },
  {
    id: 'ti4',
    category: 'tiere',
    question: 'Welches Tier wird oft als "König der Tiere" bezeichnet?',
    options: ['Tiger', 'Elefant', 'Löwe', 'Bär'],
    correctAnswer: 2,
    explanation: 'Der Löwe gilt aufgrund seiner Mähne und seines majestätischen Aussehens als König der Tiere.',
    difficulty: 'leicht'
  },
  {
    id: 'ti5',
    category: 'tiere',
    question: 'Was ist das schnellste Landtier der Welt?',
    options: ['Gepard', 'Antilope', 'Löwe', 'Pferd'],
    correctAnswer: 0,
    explanation: 'Ein Gepard kann im Sprint über 100 km/h erreichen.',
    difficulty: 'leicht'
  },
  {
    id: 'ti6',
    category: 'tiere',
    question: 'Welches Tier ist ein Beuteltier?',
    options: ['Waschbär', 'Känguru', 'Eichhörnchen', 'Igel'],
    correctAnswer: 1,
    explanation: 'Kängurus ziehen ihre Jungen in einem Beutel auf.',
    difficulty: 'leicht'
  },
  {
    id: 'ti7',
    category: 'tiere',
    question: 'Wie nennt man eine Gruppe von Wölfen?',
    options: ['Herde', 'Schwarm', 'Rudel', 'Meute'],
    correctAnswer: 2,
    explanation: 'Wölfe leben und jagen in einem sozialen Verband, dem Rudel.',
    difficulty: 'leicht'
  },
  {
    id: 'ti8',
    category: 'tiere',
    question: 'Welches Insekt produziert Honig?',
    options: ['Wespe', 'Hummel', 'Biene', 'Ameise'],
    correctAnswer: 2,
    explanation: 'Honigbienen sammeln Nektar und verarbeiten ihn zu Honig.',
    difficulty: 'leicht'
  },
  {
    id: 'ti9',
    category: 'tiere',
    question: 'Welches Tier ist das größte Lebewesen der Erde?',
    options: ['Blauwal', 'Riesenkrake', 'Weißer Hai', 'Elefant'],
    correctAnswer: 0,
    explanation: 'Der Blauwal kann bis zu 30 Meter lang und 190 Tonnen schwer werden.',
    difficulty: 'leicht'
  },
  {
    id: 'ti10',
    category: 'tiere',
    question: 'Wie viele Beine hat ein Insekt?',
    options: ['4', '6', '8', '10'],
    correctAnswer: 1,
    explanation: 'Alle Insekten haben im Erwachsenenstadium genau sechs Beine.',
    difficulty: 'leicht'
  },
  {
    id: 'ti11',
    category: 'tiere',
    question: 'Welches Tier kann seine Farbe zur Tarnung ändern?',
    options: ['Chamäleon', 'Leguan', 'Schildkröte', 'Krokodil'],
    correctAnswer: 0,
    explanation: 'Chamäleons ändern ihre Farbe zur Tarnung oder Kommunikation.',
    difficulty: 'leicht'
  },
  {
    id: 'ti12',
    category: 'tiere',
    question: 'Was ist die Hauptnahrung eines Großen Pandas?',
    options: ['Fisch', 'Bambus', 'Früchte', 'Insekten'],
    correctAnswer: 1,
    explanation: 'Pandas fressen fast ausschließlich Bambus (bis zu 30 kg am Tag).',
    difficulty: 'leicht'
  },
  {
    id: 'ti13',
    category: 'tiere',
    question: 'Welcher Vogel ist für seinen bunten "Pfauenrad"-Schwanz bekannt?',
    options: ['Fasan', 'Pfau', 'Papagei', 'Truthahn'],
    correctAnswer: 1,
    explanation: 'Männliche Pfauen schlagen ein Rad, um Weibchen zu beeindrucken.',
    difficulty: 'leicht'
  },
  {
    id: 'ti14',
    category: 'tiere',
    question: 'Welches Tier schläft im Stehen?',
    options: ['Hund', 'Katze', 'Pferd', 'Schwein'],
    correctAnswer: 2,
    explanation: 'Pferde haben einen speziellen Mechanismus in den Beinen, der sie im Stehen fixiert.',
    difficulty: 'mittel'
  },
  {
    id: 'ti15',
    category: 'tiere',
    question: 'Wie nennt man die Jungen eines Schafes?',
    options: ['Ferkel', 'Kälber', 'Lämmer', 'Welpen'],
    correctAnswer: 2,
    explanation: 'Ein junges Schaf heißt Lamm.',
    difficulty: 'leicht'
  },
  {
    id: 'ti16',
    category: 'tiere',
    question: 'Welches Tier hat einen extrem langen Hals?',
    options: ['Strauß', 'Giraffe', 'Schwan', 'Schlange'],
    correctAnswer: 1,
    explanation: 'Giraffen nutzen ihren langen Hals, um Blätter in Baumkronen zu erreichen.',
    difficulty: 'leicht'
  },
  {
    id: 'ti17',
    category: 'tiere',
    question: 'Welches Tier ist ein Amphibium?',
    options: ['Eidechse', 'Frosch', 'Hai', 'Delfin'],
    correctAnswer: 1,
    explanation: 'Frösche leben sowohl im Wasser als auch an Land.',
    difficulty: 'leicht'
  },
  {
    id: 'ti18',
    category: 'tiere',
    question: 'Wie viele Flügel hat eine Libelle?',
    options: ['2', '4', '6', '8'],
    correctAnswer: 1,
    explanation: 'Libellen haben zwei Flügelpaare, die sie unabhängig voneinander bewegen können.',
    difficulty: 'mittel'
  },
  {
    id: 'ti19',
    category: 'tiere',
    question: 'Welches Tier hat Streifen auf seinem Fell?',
    options: ['Leopard', 'Gepard', 'Zebra', 'Hyäne'],
    correctAnswer: 2,
    explanation: 'Zebras haben ein charakteristisches schwarz-weißes Streifenmuster.',
    difficulty: 'leicht'
  },
  {
    id: 'ti20',
    category: 'tiere',
    question: 'Welches Tier ist für seinen Fleiß beim Dammbau bekannt?',
    options: ['Dachs', 'Biber', 'Otter', 'Maulwurf'],
    correctAnswer: 1,
    explanation: 'Biber bauen Dämme, um den Wasserstand in ihrem Revier zu regulieren.',
    difficulty: 'leicht'
  },
  {
    id: 'ti21',
    category: 'tiere',
    question: 'Welches Tier legt Eier, obwohl es ein Säugetier ist?',
    options: ['Schnabeltier', 'Gürteltier', 'Ameisenbär', 'Koala'],
    correctAnswer: 0,
    explanation: 'Das Schnabeltier gehört zu den Kloakentieren, die Eier legen.',
    difficulty: 'schwer'
  },
  {
    id: 'ti22',
    category: 'tiere',
    question: 'Wie viele Mägen hat eine Kuh?',
    options: ['1', '2', '3', '4'],
    correctAnswer: 3,
    explanation: 'Kühe haben vier Magenabteilungen: Pansen, Netzmagen, Blättermagen und Labmagen.',
    difficulty: 'mittel'
  },
  {
    id: 'ti23',
    category: 'tiere',
    question: 'Welches Tier ist der nächste lebende Verwandte des Menschen?',
    options: ['Gorilla', 'Schimpanse', 'Orang-Utan', 'Gibbon'],
    correctAnswer: 1,
    explanation: 'Schimpansen und Bonobos teilen etwa 99 % ihrer DNA mit dem Menschen.',
    difficulty: 'mittel'
  },
  {
    id: 'ti24',
    category: 'tiere',
    question: 'Welches Tier hat kein Skelett aus Knochen, sondern aus Knorpel?',
    options: ['Wal', 'Hai', 'Schildkröte', 'Kabeljau'],
    correctAnswer: 1,
    explanation: 'Haie und Rochen gehören zur Klasse der Knorpelfische.',
    difficulty: 'mittel'
  },
  {
    id: 'ti25',
    category: 'tiere',
    question: 'Wie nennt man das männliche Schwein?',
    options: ['Eber', 'Bulle', 'Hengst', 'Widder'],
    correctAnswer: 0,
    explanation: 'Das männliche Hausschwein wird Eber genannt.',
    difficulty: 'leicht'
  },
  {
    id: 'ti26',
    category: 'tiere',
    question: 'Welches Tier kann seinen Kopf um bis zu 270 Grad drehen?',
    options: ['Adler', 'Eule', 'Falke', 'Reiher'],
    correctAnswer: 1,
    explanation: 'Eulen haben 14 Halswirbel (doppelt so viele wie Menschen), was diese Beweglichkeit ermöglicht.',
    difficulty: 'mittel'
  },
  {
    id: 'ti27',
    category: 'tiere',
    question: 'Welches Tier hat die längste Tragzeit (ca. 22 Monate)?',
    options: ['Blauwal', 'Nashorn', 'Elefant', 'Giraffe'],
    correctAnswer: 2,
    explanation: 'Elefantenkühe tragen ihr Junges fast zwei Jahre lang.',
    difficulty: 'mittel'
  },
  {
    id: 'ti28',
    category: 'tiere',
    question: 'Welches Tier ist für seinen Winterschlaf bekannt?',
    options: ['Wolf', 'Siebenschläfer', 'Reh', 'Fuchs'],
    correctAnswer: 1,
    explanation: 'Der Siebenschläfer verschläft etwa sieben Monate des Jahres.',
    difficulty: 'leicht'
  },
  {
    id: 'ti29',
    category: 'tiere',
    question: 'Wie viele Herzen hat ein Tintenfisch (Echter Krake)?',
    options: ['1', '2', '3', '4'],
    correctAnswer: 2,
    explanation: 'Kraken haben ein Hauptherz und zwei Kiemenherzen.',
    difficulty: 'schwer'
  },
  {
    id: 'ti30',
    category: 'tiere',
    question: 'Welches Tier ist das einzige fliegende Säugetier?',
    options: ['Flughörnchen', 'Fledermaus', 'Kolibri', 'Fliegender Fisch'],
    correctAnswer: 1,
    explanation: 'Fledermäuse und Flughunde sind die einzigen Säugetiere, die aktiv fliegen können.',
    difficulty: 'leicht'
  },
  {
    id: 'we1',
    category: 'weltall',
    question: 'Welcher Planet ist der Sonne am nächsten?',
    options: ['Venus', 'Erde', 'Merkur', 'Mars'],
    correctAnswer: 2,
    explanation: 'Merkur ist der innerste Planet unseres Sonnensystems.',
    difficulty: 'leicht'
  },
  {
    id: 'we2',
    category: 'weltall',
    question: 'Wie heißt unsere Galaxie?',
    options: ['Andromeda', 'Milchstraße', 'Sombrero-Galaxie', 'Magellansche Wolke'],
    correctAnswer: 1,
    explanation: 'Die Milchstraße ist eine Balkenspiralgalaxie, in der sich unser Sonnensystem befindet.',
    difficulty: 'leicht'
  },
  {
    id: 'we3',
    category: 'weltall',
    question: 'Welcher Himmelskörper ist kein Planet mehr, sondern ein Zwergplanet?',
    options: ['Neptun', 'Uranus', 'Pluto', 'Saturn'],
    correctAnswer: 2,
    explanation: 'Pluto wurde 2006 der Status als Planet aberkannt.',
    difficulty: 'leicht'
  },
  {
    id: 'we4',
    category: 'weltall',
    question: 'Wie nennt man eine Explosion eines Sterns am Ende seiner Lebenszeit?',
    options: ['Schwarzes Loch', 'Supernova', 'Roter Riese', 'Weißer Zwerg'],
    correctAnswer: 1,
    explanation: 'Eine Supernova ist das kurzzeitige, helle Aufleuchten eines Sterns bei seiner Explosion.',
    difficulty: 'mittel'
  },
  {
    id: 'we5',
    category: 'weltall',
    question: 'Welcher Planet ist für seine markanten Ringe bekannt?',
    options: ['Jupiter', 'Saturn', 'Uranus', 'Neptun'],
    correctAnswer: 1,
    explanation: 'Obwohl alle Gasriesen Ringe haben, sind die des Saturn am auffälligsten.',
    difficulty: 'leicht'
  },
  {
    id: 'we6',
    category: 'weltall',
    question: 'Wer war der erste Mensch im Weltraum?',
    options: ['Neil Armstrong', 'Buzz Aldrin', 'Juri Gagarin', 'John Glenn'],
    correctAnswer: 2,
    explanation: 'Der sowjetische Kosmonaut Juri Gagarin flog am 12. April 1961 ins All.',
    difficulty: 'mittel'
  },
  {
    id: 'we7',
    category: 'weltall',
    question: 'Wie heißt der größte Mond des Planeten Saturn?',
    options: ['Europa', 'Ganymed', 'Titan', 'Io'],
    correctAnswer: 2,
    explanation: 'Titan ist der einzige Mond im Sonnensystem mit einer dichten Atmosphäre.',
    difficulty: 'schwer'
  },
  {
    id: 'we8',
    category: 'weltall',
    question: 'Was ist die Sonne eigentlich?',
    options: ['Ein Planet', 'Ein Mond', 'Ein Stern', 'Ein Komet'],
    correctAnswer: 2,
    explanation: 'Die Sonne ist ein Stern im Zentrum unseres Sonnensystems.',
    difficulty: 'leicht'
  },
  {
    id: 'we9',
    category: 'weltall',
    question: 'Wie nennt man die Gesteinsbrocken, die zwischen Mars und Jupiter kreisen?',
    options: ['Kometen', 'Asteroiden', 'Meteore', 'Schwarze Löcher'],
    correctAnswer: 1,
    explanation: 'Dort befindet sich der sogenannte Asteroidengürtel.',
    difficulty: 'mittel'
  },
  {
    id: 'we10',
    category: 'weltall',
    question: 'Welcher Planet wird oft als "Abendstern" oder "Morgenstern" bezeichnet?',
    options: ['Mars', 'Jupiter', 'Venus', 'Merkur'],
    correctAnswer: 2,
    explanation: 'Die Venus ist nach Sonne und Mond das hellste Objekt am Himmel.',
    difficulty: 'leicht'
  },
  {
    id: 'we11',
    category: 'weltall',
    question: 'Wie lange braucht das Licht der Sonne ungefähr bis zur Erde?',
    options: ['8 Sekunden', '8 Minuten', '8 Stunden', '8 Tage'],
    correctAnswer: 1,
    explanation: 'Das Licht legt die ca. 150 Millionen Kilometer in etwa 8 Minuten und 20 Sekunden zurück.',
    difficulty: 'mittel'
  },
  {
    id: 'we12',
    category: 'weltall',
    question: 'Was ist ein "Schwarzes Loch"?',
    options: ['Ein Loch im Weltraum-Gewebe', 'Ein Objekt mit extrem starker Gravitation', 'Ein erloschener Planet', 'Ein Schatten eines Sterns'],
    correctAnswer: 1,
    explanation: 'Die Gravitation ist so stark, dass nicht einmal Licht entkommen kann.',
    difficulty: 'mittel'
  },
  {
    id: 'we13',
    category: 'weltall',
    question: 'Welcher Planet rotiert "auf der Seite" (seine Achse ist extrem geneigt)?',
    options: ['Jupiter', 'Saturn', 'Uranus', 'Neptun'],
    correctAnswer: 2,
    explanation: 'Uranus rollt quasi auf seiner Umlaufbahn um die Sonne.',
    difficulty: 'schwer'
  },
  {
    id: 'we14',
    category: 'weltall',
    question: 'Wie heißt der rote Fleck auf dem Jupiter?',
    options: ['Ein Vulkan', 'Ein Krater', 'Ein riesiger Wirbelsturm', 'Ein Ozean'],
    correctAnswer: 2,
    explanation: 'Der Große Rote Fleck ist ein Hochdruckgebiet, das seit Jahrhunderten besteht.',
    difficulty: 'mittel'
  },
  {
    id: 'we15',
    category: 'weltall',
    question: 'Welches Land schickte den ersten künstlichen Satelliten (Sputnik 1) ins All?',
    options: ['USA', 'Sowjetunion', 'China', 'Deutschland'],
    correctAnswer: 1,
    explanation: 'Sputnik 1 wurde 1957 gestartet und löste den "Sputnik-Schock" aus.',
    difficulty: 'mittel'
  },
  {
    id: 'we16',
    category: 'weltall',
    question: 'Wie nennt man die scheinbare rückläufige Bewegung von Planeten?',
    options: ['Retrograd', 'Anterograd', 'Zirkular', 'Elliptisch'],
    correctAnswer: 0,
    explanation: 'Dies ist ein optischer Effekt, wenn die Erde einen anderen Planeten überholt.',
    difficulty: 'schwer'
  },
  {
    id: 'we17',
    category: 'weltall',
    question: 'Was ist die "Oortsche Wolke"?',
    options: ['Eine Gewitterwolke auf dem Jupiter', 'Ein Reservoir für Kometen am Rand des Sonnensystems', 'Eine Staubwolke im Zentrum der Galaxie', 'Ein Nebel im Sternbild Orion'],
    correctAnswer: 1,
    explanation: 'Sie gilt als Ursprungsort langperiodischer Kometen.',
    difficulty: 'schwer'
  },
  {
    id: 'we18',
    category: 'weltall',
    question: 'Welches Teleskop wurde 1990 ins All geschickt und lieferte spektakuläre Bilder?',
    options: ['James Webb', 'Hubble', 'Kepler', 'Galileo'],
    correctAnswer: 1,
    explanation: 'Das Hubble-Weltraumteleskop hat unser Verständnis des Universums revolutioniert.',
    difficulty: 'leicht'
  },
  {
    id: 'we19',
    category: 'weltall',
    question: 'Wie nennt man die Grenze eines Schwarzen Lochs, ab der nichts mehr entkommen kann?',
    options: ['Singularität', 'Ereignishorizont', 'Photonensphäre', 'Ergosphäre'],
    correctAnswer: 1,
    explanation: 'Hinter dem Ereignishorizont ist keine Information mehr nach außen möglich.',
    difficulty: 'schwer'
  },
  {
    id: 'we20',
    category: 'weltall',
    question: 'Welcher Planet hat die höchste Oberflächentemperatur (ca. 460 °C)?',
    options: ['Merkur', 'Venus', 'Mars', 'Jupiter'],
    correctAnswer: 1,
    explanation: 'Ein extremer Treibhauseffekt macht die Venus heißer als den sonnennäheren Merkur.',
    difficulty: 'mittel'
  },
  {
    id: 'we21',
    category: 'weltall',
    question: 'Wie nennt man die Theorie zur Entstehung des Universums?',
    options: ['Steady State', 'Urknall (Big Bang)', 'Multiversum', 'String-Theorie'],
    correctAnswer: 1,
    explanation: 'Nach der Urknall-Theorie entstand das Universum vor etwa 13,8 Milliarden Jahren.',
    difficulty: 'leicht'
  },
  {
    id: 'we22',
    category: 'weltall',
    question: 'Was ist ein "Lichtjahr"?',
    options: ['Eine Zeiteinheit', 'Eine Entfernungseinheit', 'Eine Geschwindigkeitseinheit', 'Eine Helligkeitseinheit'],
    correctAnswer: 1,
    explanation: 'Es ist die Strecke, die Licht in einem Jahr zurücklegt (ca. 9,5 Billionen km).',
    difficulty: 'leicht'
  },
  {
    id: 'we23',
    category: 'weltall',
    question: 'Wie heißt der größte Mond im gesamten Sonnensystem?',
    options: ['Titan', 'Ganymed', 'Callisto', 'Io'],
    correctAnswer: 1,
    explanation: 'Ganymed ist ein Mond des Jupiters und sogar größer als der Planet Merkur.',
    difficulty: 'schwer'
  },
  {
    id: 'we24',
    category: 'weltall',
    question: 'Welches Sternbild enthält den "Großen Wagen"?',
    options: ['Kleiner Bär', 'Großer Bär', 'Orion', 'Kassiopeia'],
    correctAnswer: 1,
    explanation: 'Der Große Wagen ist ein Teil (Asterismus) des Sternbilds Großer Bär.',
    difficulty: 'mittel'
  },
  {
    id: 'we25',
    category: 'weltall',
    question: 'Was ist ein "Pulsar"?',
    options: ['Ein pulsierender Planet', 'Ein schnell rotierender Neutronenstern', 'Ein Komet mit zwei Schweifen', 'Eine Galaxie im Werden'],
    correctAnswer: 1,
    explanation: 'Pulsare senden regelmäßige Radiowellenimpulse aus.',
    difficulty: 'schwer'
  },
  {
    id: 'we26',
    category: 'weltall',
    question: 'Wie nennt man die dunklen Flecken auf der Sonnenoberfläche?',
    options: ['Sonnenkrater', 'Sonnenflecken', 'Sonnenstürme', 'Sonnenlöcher'],
    correctAnswer: 1,
    explanation: 'Sonnenflecken sind kühlere Bereiche mit starken Magnetfeldern.',
    difficulty: 'mittel'
  },
  {
    id: 'we27',
    category: 'weltall',
    question: 'Welcher Planet wurde aufgrund mathematischer Berechnungen entdeckt, bevor er gesehen wurde?',
    options: ['Uranus', 'Neptun', 'Saturn', 'Pluto'],
    correctAnswer: 1,
    explanation: 'Bahnstörungen des Uranus führten zur Entdeckung von Neptun im Jahr 1846.',
    difficulty: 'schwer'
  },
  {
    id: 'we28',
    category: 'weltall',
    question: 'Was ist die "ISS"?',
    options: ['Ein Satelliten-System', 'Die Internationale Raumstation', 'Ein Weltraum-Teleskop', 'Eine Mars-Sonde'],
    correctAnswer: 1,
    explanation: 'Die International Space Station wird seit 1998 dauerhaft bewohnt.',
    difficulty: 'leicht'
  },
  {
    id: 'we29',
    category: 'weltall',
    question: 'Wie nennt man Gesteinsbrocken, die in der Erdatmosphäre verglühen?',
    options: ['Meteoriten', 'Meteore (Sternschnuppen)', 'Asteroiden', 'Kometen'],
    correctAnswer: 1,
    explanation: 'Meteore sind die Leuchterscheinungen; Meteoriten sind die Teile, die den Boden erreichen.',
    difficulty: 'mittel'
  },
  {
    id: 'we30',
    category: 'weltall',
    question: 'Welches Element ist das häufigste im Universum?',
    options: ['Helium', 'Sauerstoff', 'Wasserstoff', 'Kohlenstoff'],
    correctAnswer: 2,
    explanation: 'Wasserstoff macht etwa 75 % der normalen Materie im Universum aus.',
    difficulty: 'mittel'
  },
  {
    id: 'sp1',
    category: 'sport',
    question: 'Wie viele Spieler stehen beim Fußball pro Team gleichzeitig auf dem Platz?',
    options: ['9', '10', '11', '12'],
    correctAnswer: 2,
    explanation: 'Ein Team besteht aus 10 Feldspielern und einem Torwart.',
    difficulty: 'leicht'
  },
  {
    id: 'sp2',
    category: 'sport',
    question: 'Welches Land gewann die Fußball-Weltmeisterschaft 2014?',
    options: ['Brasilien', 'Argentinien', 'Deutschland', 'Spanien'],
    correctAnswer: 2,
    explanation: 'Deutschland besiegte Argentinien im Finale mit 1:0 nach Verlängerung.',
    difficulty: 'leicht'
  },
  {
    id: 'sp3',
    category: 'sport',
    question: 'Wie lang ist eine Marathonstrecke?',
    options: ['21,0975 km', '42,195 km', '50 km', '100 km'],
    correctAnswer: 1,
    explanation: 'Die Distanz wurde 1908 bei den Olympischen Spielen in London festgelegt.',
    difficulty: 'leicht'
  },
  {
    id: 'sp4',
    category: 'sport',
    question: 'In welcher Sportart ist Roger Federer eine Legende?',
    options: ['Golf', 'Tennis', 'Basketball', 'Schwimmen'],
    correctAnswer: 1,
    explanation: 'Der Schweizer gewann 20 Grand-Slam-Titel im Einzel.',
    difficulty: 'leicht'
  },
  {
    id: 'sp5',
    category: 'sport',
    question: 'Wie viele Ringe hat das olympische Symbol?',
    options: ['3', '4', '5', '6'],
    correctAnswer: 2,
    explanation: 'Die fünf Ringe repräsentieren die fünf Kontinente.',
    difficulty: 'leicht'
  },
  {
    id: 'sp6',
    category: 'sport',
    question: 'Welcher Basketballspieler wird oft als "Air Jordan" bezeichnet?',
    options: ['LeBron James', 'Kobe Bryant', 'Michael Jordan', 'Shaquille O\'Neal'],
    correctAnswer: 2,
    explanation: 'Michael Jordan prägte die NBA in den 1990er Jahren mit den Chicago Bulls.',
    difficulty: 'leicht'
  },
  {
    id: 'sp7',
    category: 'sport',
    question: 'Was ist die maximale Punktzahl, die man mit einem Dartwurf (ein Pfeil) erreichen kann?',
    options: ['20', '50', '60', '100'],
    correctAnswer: 2,
    explanation: 'Das Triple-20-Feld zählt 60 Punkte.',
    difficulty: 'mittel'
  },
  {
    id: 'sp8',
    category: 'sport',
    question: 'In welcher Sportart ist Michael Schumacher eine Legende?',
    options: ['Tennis', 'Fußball', 'Formel 1', 'Golf'],
    correctAnswer: 2,
    explanation: 'Michael Schumacher ist siebenfacher Formel-1-Weltmeister.',
    difficulty: 'leicht'
  },
  {
    id: 'sp9',
    category: 'sport',
    question: 'Wie nennt man einen Schlag beim Golf, der den Ball direkt vom Abschlag ins Loch befördert?',
    options: ['Birdie', 'Eagle', 'Hole-in-one', 'Albatros'],
    correctAnswer: 2,
    explanation: 'Ein Hole-in-one ist ein sehr seltenes Ereignis.',
    difficulty: 'leicht'
  },
  {
    id: 'sp10',
    category: 'sport',
    question: 'Welche Farbe hat das Trikot des Führenden bei der Tour de France?',
    options: ['Grün', 'Weiß mit roten Punkten', 'Gelb', 'Rosa'],
    correctAnswer: 2,
    explanation: 'Das "Maillot Jaune" kennzeichnet den Führenden der Gesamtwertung.',
    difficulty: 'leicht'
  },
  {
    id: 'sp11',
    category: 'sport',
    question: 'Wie viele Sätze muss ein Mann bei einem Grand-Slam-Turnier gewinnen, um das Match zu entscheiden?',
    options: ['2', '3', '4', '5'],
    correctAnswer: 1,
    explanation: 'Bei Grand Slams wird im Modus "Best of Five" gespielt, man braucht also 3 Gewinnsätze.',
    difficulty: 'mittel'
  },
  {
    id: 'sp12',
    category: 'sport',
    question: 'Welche Sportart wird im "Super Bowl" entschieden?',
    options: ['Baseball', 'Basketball', 'American Football', 'Eishockey'],
    correctAnswer: 2,
    explanation: 'Der Super Bowl ist das Finale der US-amerikanischen Profiliga NFL.',
    difficulty: 'leicht'
  },
  {
    id: 'sp13',
    category: 'sport',
    question: 'Wie viele Spieler hat ein Eishockey-Team normalerweise gleichzeitig auf dem Eis?',
    options: ['5', '6', '7', '11'],
    correctAnswer: 1,
    explanation: 'In der Regel sind es 5 Feldspieler und ein Torwart.',
    difficulty: 'mittel'
  },
  {
    id: 'sp14',
    category: 'sport',
    question: 'Welcher Boxer nannte sich selbst "The Greatest"?',
    options: ['Mike Tyson', 'Muhammad Ali', 'Joe Frazier', 'George Foreman'],
    correctAnswer: 1,
    explanation: 'Muhammad Ali gilt als einer der bedeutendsten Schwergewichtsboxer der Geschichte.',
    difficulty: 'leicht'
  },
  {
    id: 'sp15',
    category: 'sport',
    question: 'In welcher Sportart gibt es die Begriffe "Slam Dunk" und "Rebound"?',
    options: ['Volleyball', 'Handball', 'Basketball', 'Wasserball'],
    correctAnswer: 2,
    explanation: 'Basketball ist ein sehr dynamischer Sport mit vielen technischen Begriffen.',
    difficulty: 'leicht'
  },
  {
    id: 'sp16',
    category: 'sport',
    question: 'Wie viele Meter ist eine Bahn in einem olympischen Schwimmbecken lang?',
    options: ['25 m', '50 m', '75 m', '100 m'],
    correctAnswer: 1,
    explanation: 'Olympische Becken werden auch als "Langbahn" bezeichnet.',
    difficulty: 'leicht'
  },
  {
    id: 'sp17',
    category: 'sport',
    question: 'Welches Land ist die erfolgreichste Nation bei Olympischen Winterspielen (Gesamtmedaillen)?',
    options: ['USA', 'Deutschland', 'Norwegen', 'Kanada'],
    correctAnswer: 2,
    explanation: 'Norwegen führt den ewigen Medaillenspiegel der Winterspiele an.',
    difficulty: 'schwer'
  },
  {
    id: 'sp18',
    category: 'sport',
    question: 'Wie nennt man den Schläger beim Baseball?',
    options: ['Bat', 'Stick', 'Club', 'Racket'],
    correctAnswer: 0,
    explanation: 'Der Baseballschläger (Bat) besteht meist aus Holz oder Aluminium.',
    difficulty: 'leicht'
  },
  {
    id: 'sp19',
    category: 'sport',
    question: 'In welcher Stadt fanden die ersten Olympischen Spiele der Neuzeit (1896) statt?',
    options: ['Paris', 'Rom', 'Athen', 'London'],
    correctAnswer: 2,
    explanation: 'Athen wurde als Geburtsort der antiken Spiele gewählt.',
    difficulty: 'mittel'
  },
  {
    id: 'sp20',
    category: 'sport',
    question: 'Wie viele Punkte zählt ein "Touchdown" im American Football?',
    options: ['3', '6', '7', '2'],
    correctAnswer: 1,
    explanation: 'Ein Touchdown bringt 6 Punkte, danach folgt meist ein Zusatzpunkt-Versuch.',
    difficulty: 'mittel'
  },
  {
    id: 'sp21',
    category: 'sport',
    question: 'Welcher Radprofi gewann siebenmal die Tour de France (Titel später wegen Doping aberkannt)?',
    options: ['Jan Ullrich', 'Lance Armstrong', 'Eddy Merckx', 'Miguel Indurain'],
    correctAnswer: 1,
    explanation: 'Armstrongs Karriere endete in einem der größten Skandale der Sportgeschichte.',
    difficulty: 'mittel'
  },
  {
    id: 'sp22',
    category: 'sport',
    question: 'Wie nennt man das Spielgerät beim Eishockey?',
    options: ['Ball', 'Puck', 'Disk', 'Shuttle'],
    correctAnswer: 1,
    explanation: 'Der Puck ist eine Hartgummischeibe.',
    difficulty: 'leicht'
  },
  {
    id: 'sp23',
    category: 'sport',
    question: 'In welcher Sportart gibt es die Disziplinen "Reißen" und "Stoßen"?',
    options: ['Ringen', 'Gewichtheben', 'Judo', 'Boxen'],
    correctAnswer: 1,
    explanation: 'Gewichtheben ist seit 1896 eine olympische Sportart.',
    difficulty: 'mittel'
  },
  {
    id: 'sp24',
    category: 'sport',
    question: 'Wie viele Spieler hat ein Volleyball-Team auf dem Feld?',
    options: ['4', '5', '6', '7'],
    correctAnswer: 2,
    explanation: 'Ein Team besteht aus 6 Spielern pro Seite.',
    difficulty: 'leicht'
  },
  {
    id: 'sp25',
    category: 'sport',
    question: 'Welcher Tennisspieler hält den Rekord für die meisten Wochen an der Spitze der Weltrangliste (Stand 2023)?',
    options: ['Rafael Nadal', 'Roger Federer', 'Novak Djokovic', 'Pete Sampras'],
    correctAnswer: 2,
    explanation: 'Djokovic überholte 2023 den Rekord von Steffi Graf.',
    difficulty: 'schwer'
  },
  {
    id: 'sp26',
    category: 'sport',
    question: 'Was ist die Standarddistanz eines 110-Meter-Hürdenlaufs der Männer?',
    options: ['100 m', '110 m', '400 m', '110,5 m'],
    correctAnswer: 1,
    explanation: 'Die Hürden sind 1,067 Meter hoch.',
    difficulty: 'leicht'
  },
  {
    id: 'sp27',
    category: 'sport',
    question: 'In welcher Sportart wird um den "Ryder Cup" gekämpft?',
    options: ['Segeln', 'Golf', 'Polo', 'Cricket'],
    correctAnswer: 1,
    explanation: 'Der Ryder Cup ist ein alle zwei Jahre stattfindender Teamwettbewerb zwischen den USA und Europa.',
    difficulty: 'schwer'
  },
  {
    id: 'sp28',
    category: 'sport',
    question: 'Wie nennt man den Schiedsrichter beim Tennis?',
    options: ['Umpire', 'Referee', 'Judge', 'Marshal'],
    correctAnswer: 0,
    explanation: 'Der Chair Umpire sitzt auf einem erhöhten Stuhl am Netz.',
    difficulty: 'mittel'
  },
  {
    id: 'sp29',
    category: 'sport',
    question: 'Welches Land ist Rekordweltmeister im Fußball (Männer)?',
    options: ['Deutschland', 'Italien', 'Brasilien', 'Argentinien'],
    correctAnswer: 2,
    explanation: 'Brasilien hat bisher fünf WM-Titel gewonnen (1958, 1962, 1970, 1994, 2002).',
    difficulty: 'leicht'
  },
  {
    id: 'sp30',
    category: 'sport',
    question: 'Wie viele Steine hat ein Spieler beim Curling?',
    options: ['4', '6', '8', '10'],
    correctAnswer: 2,
    explanation: 'In einem Team (4 Spieler) spielt jeder Spieler zwei Steine pro End.',
    difficulty: 'schwer'
  },
  {
    id: 'new1',
    category: 'allgemein',
    question: 'Welches ist das kleinste Land der Welt?',
    options: ['Monaco', 'Vatikanstadt', 'San Marino', 'Liechtenstein'],
    correctAnswer: 1,
    explanation: 'Die Vatikanstadt ist mit einer Fläche von nur 0,44 Quadratkilometern das kleinste anerkannte Land der Welt.',
    difficulty: 'mittel'
  },
  {
    id: 'new2',
    category: 'geschichte',
    question: 'In welchem Jahr fiel die Berliner Mauer?',
    options: ['1987', '1988', '1989', '1990'],
    correctAnswer: 2,
    explanation: 'Die Berliner Mauer fiel am 9. November 1989 und ebnete den Weg zur deutschen Wiedervereinigung.',
    difficulty: 'schwer'
  },
  {
    id: 'new3',
    category: 'geografie',
    question: 'Welcher ist der längste Fluss der Welt?',
    options: ['Amazonas', 'Nil', 'Jangtsekiang', 'Mississippi'],
    correctAnswer: 1,
    explanation: 'Der Nil gilt traditionell mit etwa 6.650 km als der längste Fluss der Erde, dicht gefolgt vom Amazonas.',
    difficulty: 'leicht'
  },
  {
    id: 'new4',
    category: 'wissenschaft',
    question: 'Welches chemische Element hat das Symbol "Au"?',
    options: ['Silber', 'Gold', 'Aluminium', 'Argon'],
    correctAnswer: 1,
    explanation: 'Das Symbol "Au" leitet sich vom lateinischen Wort "aurum" ab, was Gold bedeutet.',
    difficulty: 'mittel'
  },
  {
    id: 'new5',
    category: 'technik',
    question: 'Wer gilt als der Erfinder des World Wide Web?',
    options: ['Bill Gates', 'Steve Jobs', 'Tim Berners-Lee', 'Mark Zuckerberg'],
    correctAnswer: 2,
    explanation: 'Tim Berners-Lee entwickelte 1989 am CERN die Grundlagen des World Wide Web.',
    difficulty: 'schwer'
  },
  {
    id: 'new6',
    category: 'sprache',
    question: 'Was ist ein Palindrom?',
    options: ['Ein Wort, das vorwärts und rückwärts gleich gelesen wird', 'Ein Wort mit mehreren Bedeutungen', 'Ein Reimschema', 'Ein veraltetes Wort'],
    correctAnswer: 0,
    explanation: 'Beispiele für Palindrome sind "Anna", "Otto" oder "Rentner".',
    difficulty: 'mittel'
  },
  {
    id: 'new7',
    category: 'deutschland',
    question: 'Welches ist das flächenmäßig größte Bundesland in Deutschland?',
    options: ['Niedersachsen', 'Baden-Württemberg', 'Nordrhein-Westfalen', 'Bayern'],
    correctAnswer: 3,
    explanation: 'Bayern ist mit über 70.500 Quadratkilometern das größte deutsche Bundesland.',
    difficulty: 'leicht'
  },
  {
    id: 'new8',
    category: 'tiere',
    question: 'Welches Tier ist das schnellste Landsäugetier der Welt?',
    options: ['Löwe', 'Gepard', 'Antilope', 'Strauß'],
    correctAnswer: 1,
    explanation: 'Der Gepard kann auf kurzen Strecken Geschwindigkeiten von über 100 km/h erreichen.',
    difficulty: 'mittel'
  },
  {
    id: 'new9',
    category: 'weltall',
    question: 'Wie heißt die erste Raumsonde, die das Sonnensystem verlassen hat?',
    options: ['Voyager 1', 'Pioneer 10', 'Cassini', 'New Horizons'],
    correctAnswer: 0,
    explanation: 'Voyager 1 trat 2012 als erstes menschengemachtes Objekt in den interstellaren Raum ein.',
    difficulty: 'schwer'
  },
  {
    id: 'new10',
    category: 'sport',
    question: 'In welcher Stadt fanden die Olympischen Sommerspiele 2000 statt?',
    options: ['Athen', 'Sydney', 'Peking', 'Atlanta'],
    correctAnswer: 1,
    explanation: 'Die Olympischen Sommerspiele 2000 wurden in Sydney, Australien, ausgetragen.',
    difficulty: 'mittel'
  },
  // Kunst
  {
    id: 'k1',
    category: 'kunst',
    difficulty: 'leicht',
    question: 'Wer malte die Mona Lisa?',
    options: ['Vincent van Gogh', 'Leonardo da Vinci', 'Pablo Picasso', 'Claude Monet'],
    correctAnswer: 1,
    explanation: 'Leonardo da Vinci malte die Mona Lisa im frühen 16. Jahrhundert.'
  },
  {
    id: 'k2',
    category: 'kunst',
    difficulty: 'mittel',
    question: 'Welcher Künstler ist bekannt für seine schmelzenden Uhren?',
    options: ['Salvador Dalí', 'René Magritte', 'Joan Miró', 'Max Ernst'],
    correctAnswer: 0,
    explanation: 'Salvador Dalí malte das berühmte Bild "Die Beständigkeit der Erinnerung" mit den schmelzenden Uhren.'
  },
  {
    id: 'k3',
    category: 'kunst',
    difficulty: 'schwer',
    question: 'In welcher Stadt befindet sich das Prado-Museum?',
    options: ['Barcelona', 'Sevilla', 'Madrid', 'Valencia'],
    correctAnswer: 2,
    explanation: 'Das Museo del Prado ist eines der wichtigsten Kunstmuseen der Welt und befindet sich in Madrid.'
  },
  {
    id: 'k4',
    category: 'kunst',
    difficulty: 'mittel',
    question: 'Welcher niederländische Maler schnitt sich einen Teil seines linken Ohres ab?',
    options: ['Rembrandt', 'Johannes Vermeer', 'Piet Mondrian', 'Vincent van Gogh'],
    correctAnswer: 3,
    explanation: 'Vincent van Gogh schnitt sich nach einem Streit mit Paul Gauguin einen Teil seines Ohres ab.'
  },
  {
    id: 'k5',
    category: 'kunst',
    difficulty: 'leicht',
    question: 'Welche Farbe entsteht, wenn man Blau und Gelb mischt?',
    options: ['Grün', 'Lila', 'Orange', 'Braun'],
    correctAnswer: 0,
    explanation: 'Die Mischung der Primärfarben Blau und Gelb ergibt die Sekundärfarbe Grün.'
  },
  // Musik
  {
    id: 'm1',
    category: 'musik',
    difficulty: 'leicht',
    question: 'Wer wird als "King of Pop" bezeichnet?',
    options: ['Elvis Presley', 'Prince', 'Michael Jackson', 'Madonna'],
    correctAnswer: 2,
    explanation: 'Michael Jackson gilt weltweit als der "King of Pop".'
  },
  {
    id: 'm2',
    category: 'musik',
    difficulty: 'mittel',
    question: 'Wie viele Saiten hat eine klassische Gitarre?',
    options: ['4', '5', '6', '7'],
    correctAnswer: 2,
    explanation: 'Eine Standard-Konzertgitarre hat 6 Saiten (E-A-D-G-H-E).'
  },
  {
    id: 'm3',
    category: 'musik',
    difficulty: 'schwer',
    question: 'Welcher Komponist war am Ende seines Lebens völlig taub?',
    options: ['Wolfgang Amadeus Mozart', 'Ludwig van Beethoven', 'Johann Sebastian Bach', 'Frédéric Chopin'],
    correctAnswer: 1,
    explanation: 'Beethoven verlor im Laufe seines Lebens sein Gehör, komponierte aber dennoch Meisterwerke wie die 9. Sinfonie.'
  },
  {
    id: 'm4',
    category: 'musik',
    difficulty: 'mittel',
    question: 'Welche britische Band veröffentlichte das Album "Abbey Road"?',
    options: ['The Rolling Stones', 'The Who', 'Pink Floyd', 'The Beatles'],
    correctAnswer: 3,
    explanation: '"Abbey Road" ist das elfte Studioalbum der Beatles, veröffentlicht 1969.'
  },
  {
    id: 'm5',
    category: 'musik',
    difficulty: 'leicht',
    question: 'Welches Instrument spielt Lisa Simpson?',
    options: ['Saxophon', 'Trompete', 'Klavier', 'Querflöte'],
    correctAnswer: 0,
    explanation: 'Lisa Simpson aus der Zeichentrickserie "Die Simpsons" spielt Baritonsaxophon.'
  },
  // Filme
  {
    id: 'f1',
    category: 'filme',
    difficulty: 'leicht',
    question: 'Wie heißt der Zauberer in "Der Herr der Ringe"?',
    options: ['Dumbledore', 'Gandalf', 'Merlin', 'Gargamel'],
    correctAnswer: 1,
    explanation: 'Gandalf ist einer der Hauptcharaktere in J.R.R. Tolkiens "Der Herr der Ringe".'
  },
  {
    id: 'f2',
    category: 'filme',
    difficulty: 'mittel',
    question: 'Welcher Film gewann 1998 elf Oscars?',
    options: ['Der Herr der Ringe: Die Rückkehr des Königs', 'Ben Hur', 'Titanic', 'Forrest Gump'],
    correctAnswer: 2,
    explanation: 'James Camerons "Titanic" gewann bei der Oscarverleihung 1998 elf Auszeichnungen.'
  },
  {
    id: 'f3',
    category: 'filme',
    difficulty: 'schwer',
    question: 'Wer führte Regie bei "Pulp Fiction"?',
    options: ['Martin Scorsese', 'Steven Spielberg', 'Christopher Nolan', 'Quentin Tarantino'],
    correctAnswer: 3,
    explanation: 'Quentin Tarantino schrieb das Drehbuch und führte Regie bei dem Kultfilm "Pulp Fiction" (1994).'
  },
  {
    id: 'f4',
    category: 'filme',
    difficulty: 'mittel',
    question: 'Wie heißt die Prinzessin in Star Wars?',
    options: ['Padmé', 'Leia', 'Rey', 'Jyn'],
    correctAnswer: 1,
    explanation: 'Prinzessin Leia Organa ist eine der Hauptfiguren der originalen Star Wars-Trilogie.'
  },
  {
    id: 'f5',
    category: 'filme',
    difficulty: 'leicht',
    question: 'Welches Tier ist Simba in "Der König der Löwen"?',
    options: ['Tiger', 'Leopard', 'Löwe', 'Gepard'],
    correctAnswer: 2,
    explanation: 'Simba ist ein Löwe und der rechtmäßige König des Geweihten Landes.'
  },
  // Literatur
  {
    id: 'l1',
    category: 'literatur',
    difficulty: 'leicht',
    question: 'Wer schrieb "Romeo und Julia"?',
    options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
    correctAnswer: 1,
    explanation: 'William Shakespeare verfasste die berühmte Tragödie "Romeo und Julia" um 1597.'
  },
  {
    id: 'l2',
    category: 'literatur',
    difficulty: 'mittel',
    question: 'Wie heißt der Schöpfer von Sherlock Holmes?',
    options: ['Agatha Christie', 'Edgar Allan Poe', 'Arthur Conan Doyle', 'Ian Fleming'],
    correctAnswer: 2,
    explanation: 'Sir Arthur Conan Doyle erschuf den berühmten Detektiv Sherlock Holmes.'
  },
  {
    id: 'l3',
    category: 'literatur',
    difficulty: 'schwer',
    question: 'Welcher Roman beginnt mit dem Satz "Nennt mich Ismael"?',
    options: ['Moby-Dick', 'Der alte Mann und das Meer', 'Die Schatzinsel', 'Robinson Crusoe'],
    correctAnswer: 0,
    explanation: 'Herman Melvilles Roman "Moby-Dick" beginnt mit diesem weltberühmten Satz.'
  },
  {
    id: 'l4',
    category: 'literatur',
    difficulty: 'mittel',
    question: 'Wer schrieb "Die Verwandlung"?',
    options: ['Thomas Mann', 'Hermann Hesse', 'Franz Kafka', 'Bertolt Brecht'],
    correctAnswer: 2,
    explanation: 'Die Erzählung "Die Verwandlung" wurde 1915 von Franz Kafka veröffentlicht.'
  },
  {
    id: 'l5',
    category: 'literatur',
    difficulty: 'leicht',
    question: 'Wie heißt der Zauberschüler mit der Narbe auf der Stirn?',
    options: ['Ron Weasley', 'Neville Longbottom', 'Draco Malfoy', 'Harry Potter'],
    correctAnswer: 3,
    explanation: 'Harry Potter, die Hauptfigur der Buchreihe von J.K. Rowling, hat eine blitzförmige Narbe.'
  },
  // Medizin
  {
    id: 'med1',
    category: 'medizin',
    difficulty: 'leicht',
    question: 'Welches Organ pumpt das Blut durch den Körper?',
    options: ['Lunge', 'Gehirn', 'Herz', 'Leber'],
    correctAnswer: 2,
    explanation: 'Das Herz ist ein Muskel, der als Pumpe für den Blutkreislauf fungiert.'
  },
  {
    id: 'med2',
    category: 'medizin',
    difficulty: 'mittel',
    question: 'Was misst ein Sphygmomanometer?',
    options: ['Blutzucker', 'Blutdruck', 'Herzfrequenz', 'Sauerstoffsättigung'],
    correctAnswer: 1,
    explanation: 'Ein Sphygmomanometer ist ein medizinisches Gerät zur Messung des Blutdrucks.'
  },
  {
    id: 'med3',
    category: 'medizin',
    difficulty: 'schwer',
    question: 'Welches ist der längste Knochen im menschlichen Körper?',
    options: ['Schienbein', 'Oberschenkelknochen', 'Oberarmknochen', 'Wadenbein'],
    correctAnswer: 1,
    explanation: 'Der Oberschenkelknochen (Femur) ist der längste und stärkste Knochen des Menschen.'
  },
  {
    id: 'med4',
    category: 'medizin',
    difficulty: 'mittel',
    question: 'Welches Vitamin wird durch Sonnenlicht in der Haut gebildet?',
    options: ['Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin D'],
    correctAnswer: 3,
    explanation: 'Vitamin D kann vom Körper selbst hergestellt werden, wenn Sonnenlicht (UV-B) auf die Haut trifft.'
  },
  {
    id: 'med5',
    category: 'medizin',
    difficulty: 'leicht',
    question: 'Wie nennt man die roten Blutkörperchen?',
    options: ['Leukozyten', 'Thrombozyten', 'Erythrozyten', 'Lymphozyten'],
    correctAnswer: 2,
    explanation: 'Die roten Blutkörperchen werden in der Medizin als Erythrozyten bezeichnet.'
  },
  // Natur
  {
    id: 'n1',
    category: 'natur',
    difficulty: 'leicht',
    question: 'Welcher Prozess ermöglicht es Pflanzen, aus Sonnenlicht Energie zu gewinnen?',
    options: ['Atmung', 'Photosynthese', 'Gärung', 'Oxidation'],
    correctAnswer: 1,
    explanation: 'Durch Photosynthese wandeln Pflanzen Lichtenergie in chemische Energie um.'
  },
  {
    id: 'n2',
    category: 'natur',
    difficulty: 'mittel',
    question: 'Welches ist das größte Korallenriff der Erde?',
    options: ['Belize Barrier Reef', 'Great Barrier Reef', 'Rotes Meer Riff', 'Mesoamerikanisches Riff'],
    correctAnswer: 1,
    explanation: 'Das Great Barrier Reef vor der Küste Australiens ist das größte Korallenriff der Welt.'
  },
  {
    id: 'n3',
    category: 'natur',
    difficulty: 'schwer',
    question: 'Wie nennt man die Lehre von den Pilzen?',
    options: ['Botanik', 'Zoologie', 'Mykologie', 'Ökologie'],
    correctAnswer: 2,
    explanation: 'Die Mykologie ist die Wissenschaft, die sich mit Pilzen beschäftigt.'
  },
  {
    id: 'n4',
    category: 'natur',
    difficulty: 'mittel',
    question: 'Welches Gas macht den größten Teil der Erdatmosphäre aus?',
    options: ['Sauerstoff', 'Kohlendioxid', 'Stickstoff', 'Argon'],
    correctAnswer: 2,
    explanation: 'Die Erdatmosphäre besteht zu etwa 78 % aus Stickstoff.'
  },
  {
    id: 'n5',
    category: 'natur',
    difficulty: 'leicht',
    question: 'Was ist ein Tsunami?',
    options: ['Ein Wirbelsturm', 'Eine Riesenwelle', 'Ein Erdbeben', 'Ein Vulkan'],
    correctAnswer: 1,
    explanation: 'Ein Tsunami ist eine Abfolge von extrem langen Wasserwellen, oft ausgelöst durch Seebeben.'
  },
  // Wirtschaft
  {
    id: 'w1',
    category: 'wirtschaft',
    difficulty: 'leicht',
    question: 'Wie heißt die Währung in Japan?',
    options: ['Won', 'Yuan', 'Yen', 'Ringgit'],
    correctAnswer: 2,
    explanation: 'Der Yen ist die offizielle Währung Japans.'
  },
  {
    id: 'w2',
    category: 'wirtschaft',
    difficulty: 'mittel',
    question: 'Was bedeutet die Abkürzung BIP?',
    options: ['Bruttoinlandsprodukt', 'Bundesinstitut für Preise', 'Bruttoinvestitionspreis', 'Banken-Insolvenz-Prüfung'],
    correctAnswer: 0,
    explanation: 'Das Bruttoinlandsprodukt (BIP) gibt den Gesamtwert aller Güter und Dienstleistungen an.'
  },
  {
    id: 'w3',
    category: 'wirtschaft',
    difficulty: 'schwer',
    question: 'Wer gilt als Begründer der modernen Nationalökonomie?',
    options: ['Karl Marx', 'Adam Smith', 'John Maynard Keynes', 'Milton Friedman'],
    correctAnswer: 1,
    explanation: 'Der Schotte Adam Smith gilt mit seinem Werk "Der Wohlstand der Nationen" als Begründer der klassischen Nationalökonomie.'
  },
  {
    id: 'w4',
    category: 'wirtschaft',
    difficulty: 'mittel',
    question: 'Welches Tier symbolisiert an der Börse steigende Kurse?',
    options: ['Bär', 'Bulle', 'Adler', 'Löwe'],
    correctAnswer: 1,
    explanation: 'Der Bulle steht für steigende (Hausse), der Bär für fallende Kurse (Baisse).'
  },
  {
    id: 'w5',
    category: 'wirtschaft',
    difficulty: 'leicht',
    question: 'Was ist eine Inflation?',
    options: ['Geldaufwertung', 'Geldentwertung', 'Wirtschaftswachstum', 'Steuersenkung'],
    correctAnswer: 1,
    explanation: 'Inflation bezeichnet eine allgemeine und anhaltende Erhöhung des Preisniveaus, also eine Geldentwertung.'
  },
  // Politik
  {
    id: 'p1',
    category: 'politik',
    difficulty: 'leicht',
    question: 'Wie oft wird der Deutsche Bundestag regulär gewählt?',
    options: ['Alle 3 Jahre', 'Alle 4 Jahre', 'Alle 5 Jahre', 'Alle 6 Jahre'],
    correctAnswer: 1,
    explanation: 'Die reguläre Wahlperiode des Deutschen Bundestages beträgt vier Jahre.'
  },
  {
    id: 'p2',
    category: 'politik',
    difficulty: 'mittel',
    question: 'Welches Gremium wählt den Bundespräsidenten in Deutschland?',
    options: ['Der Bundestag', 'Der Bundesrat', 'Die Bundesversammlung', 'Das Volk'],
    correctAnswer: 2,
    explanation: 'Der Bundespräsident wird von der Bundesversammlung gewählt.'
  },
  {
    id: 'p3',
    category: 'politik',
    difficulty: 'schwer',
    question: 'Wer war der erste Bundeskanzler der Bundesrepublik Deutschland?',
    options: ['Willy Brandt', 'Ludwig Erhard', 'Konrad Adenauer', 'Helmut Schmidt'],
    correctAnswer: 2,
    explanation: 'Konrad Adenauer war von 1949 bis 1963 der erste Bundeskanzler der BRD.'
  },
  {
    id: 'p4',
    category: 'politik',
    difficulty: 'mittel',
    question: 'Wo hat die Europäische Zentralbank (EZB) ihren Sitz?',
    options: ['Brüssel', 'Straßburg', 'Frankfurt am Main', 'Luxemburg'],
    correctAnswer: 2,
    explanation: 'Der Sitz der Europäischen Zentralbank befindet sich in Frankfurt am Main.'
  },
  {
    id: 'p5',
    category: 'politik',
    difficulty: 'leicht',
    question: 'Was bedeutet das Wort "Demokratie" wörtlich übersetzt?',
    options: ['Herrschaft der Reichen', 'Herrschaft des Volkes', 'Herrschaft der Besten', 'Herrschaft der Wenigen'],
    correctAnswer: 1,
    explanation: 'Das Wort stammt aus dem Griechischen und bedeutet "Herrschaft des Volkes" (demos = Volk, kratia = Herrschaft).'
  },
  // Mythologie
  {
    id: 'my1',
    category: 'mythologie',
    difficulty: 'leicht',
    question: 'Wer ist der höchste Gott in der griechischen Mythologie?',
    options: ['Hades', 'Poseidon', 'Ares', 'Zeus'],
    correctAnswer: 3,
    explanation: 'Zeus ist der oberste olympische Gott in der griechischen Mythologie.'
  },
  {
    id: 'my2',
    category: 'mythologie',
    difficulty: 'mittel',
    question: 'Welcher Gott entspricht dem griechischen Ares in der römischen Mythologie?',
    options: ['Jupiter', 'Mars', 'Merkur', 'Neptun'],
    correctAnswer: 1,
    explanation: 'Mars ist der römische Gott des Krieges und entspricht dem griechischen Ares.'
  },
  {
    id: 'my3',
    category: 'mythologie',
    difficulty: 'schwer',
    question: 'Wie heißt der Göttervater in der nordischen Mythologie?',
    options: ['Thor', 'Loki', 'Odin', 'Freyr'],
    correctAnswer: 2,
    explanation: 'Odin (oder Wotan) ist der Hauptgott in der nordischen Mythologie.'
  },
  {
    id: 'my4',
    category: 'mythologie',
    difficulty: 'mittel',
    question: 'Welches Fabelwesen erhebt sich aus seiner eigenen Asche?',
    options: ['Greif', 'Pegasus', 'Phönix', 'Sphinx'],
    correctAnswer: 2,
    explanation: 'Der Phönix ist ein mythischer Vogel, der verbrennt und aus seiner Asche neu ersteht.'
  },
  {
    id: 'my5',
    category: 'mythologie',
    difficulty: 'leicht',
    question: 'Welche Waffe führt der nordische Gott Thor?',
    options: ['Schwert', 'Speer', 'Bogen', 'Hammer'],
    correctAnswer: 3,
    explanation: 'Thor kämpft mit seinem magischen Hammer Mjölnir.'
  },
  // Videospiele
  {
    id: 'v1',
    category: 'videospiele',
    difficulty: 'leicht',
    question: 'Wie heißt der berühmte Klempner von Nintendo?',
    options: ['Luigi', 'Mario', 'Wario', 'Bowser'],
    correctAnswer: 1,
    explanation: 'Mario ist das Maskottchen von Nintendo und der wohl bekannteste Videospielcharakter.'
  },
  {
    id: 'v2',
    category: 'videospiele',
    difficulty: 'mittel',
    question: 'Welches Spiel ist das meistverkaufte Videospiel aller Zeiten?',
    options: ['Tetris', 'Grand Theft Auto V', 'Minecraft', 'Wii Sports'],
    correctAnswer: 2,
    explanation: 'Minecraft ist mit über 300 Millionen verkauften Exemplaren das erfolgreichste Videospiel.'
  },
  {
    id: 'v3',
    category: 'videospiele',
    difficulty: 'schwer',
    question: 'In welchem Jahr erschien die erste PlayStation?',
    options: ['1992', '1994', '1996', '1998'],
    correctAnswer: 1,
    explanation: 'Die erste PlayStation von Sony erschien im Dezember 1994 in Japan.'
  },
  {
    id: 'v4',
    category: 'videospiele',
    difficulty: 'mittel',
    question: 'Wie heißt die Hauptfigur in der "The Legend of Zelda"-Reihe?',
    options: ['Zelda', 'Link', 'Ganon', 'Navi'],
    correctAnswer: 1,
    explanation: 'Der Spieler steuert den Helden Link. Zelda ist die Prinzessin, die oft gerettet werden muss.'
  },
  {
    id: 'v5',
    category: 'videospiele',
    difficulty: 'leicht',
    question: 'Welches Unternehmen entwickelte die Xbox?',
    options: ['Sony', 'Nintendo', 'Sega', 'Microsoft'],
    correctAnswer: 3,
    explanation: 'Die Xbox-Konsolen werden von Microsoft entwickelt.'
  },
  // Mehr Allgemeinwissen
  {
    id: 'a21',
    category: 'allgemein',
    difficulty: 'leicht',
    question: 'Welche Farbe hat ein Smaragd?',
    options: ['Rot', 'Blau', 'Grün', 'Gelb'],
    correctAnswer: 2,
    explanation: 'Ein Smaragd ist ein grüner Edelstein.'
  },
  {
    id: 'a22',
    category: 'allgemein',
    difficulty: 'mittel',
    question: 'Wie viele Zähne hat ein erwachsener Mensch normalerweise?',
    options: ['28', '30', '32', '34'],
    correctAnswer: 2,
    explanation: 'Ein vollständiges Gebiss eines Erwachsenen besteht aus 32 Zähnen (inklusive Weisheitszähne).'
  },
  {
    id: 'a23',
    category: 'allgemein',
    difficulty: 'schwer',
    question: 'Welches ist das kleinste Land der Welt?',
    options: ['Monaco', 'Nauru', 'Tuvalu', 'Vatikanstadt'],
    correctAnswer: 3,
    explanation: 'Die Vatikanstadt ist mit einer Fläche von 0,44 Quadratkilometern das kleinste anerkannte Land der Welt.'
  },
  {
    id: 'a24',
    category: 'allgemein',
    difficulty: 'mittel',
    question: 'Welcher Planet ist der Sonne am nächsten?',
    options: ['Venus', 'Merkur', 'Mars', 'Erde'],
    correctAnswer: 1,
    explanation: 'Merkur ist der sonnennächste Planet in unserem Sonnensystem.'
  },
  {
    id: 'a25',
    category: 'allgemein',
    difficulty: 'leicht',
    question: 'Wie viele Kontinente gibt es auf der Erde (nach dem 7-Kontinente-Modell)?',
    options: ['5', '6', '7', '8'],
    correctAnswer: 2,
    explanation: 'Nach dem weit verbreiteten Modell gibt es 7 Kontinente: Nordamerika, Südamerika, Europa, Asien, Afrika, Australien/Ozeanien und Antarktika.'
  },
  // Mehr Geschichte
  {
    id: 'g21',
    category: 'geschichte',
    difficulty: 'leicht',
    question: 'Wer entdeckte 1492 Amerika?',
    options: ['Vasco da Gama', 'Christoph Kolumbus', 'Ferdinand Magellan', 'Marco Polo'],
    correctAnswer: 1,
    explanation: 'Christoph Kolumbus erreichte 1492 die Bahamas und entdeckte damit für Europa den amerikanischen Kontinent.'
  },
  {
    id: 'g22',
    category: 'geschichte',
    difficulty: 'mittel',
    question: 'In welchem Jahr fiel die Berliner Mauer?',
    options: ['1987', '1988', '1989', '1990'],
    correctAnswer: 2,
    explanation: 'Die Berliner Mauer fiel am 9. November 1989.'
  },
  {
    id: 'g23',
    category: 'geschichte',
    difficulty: 'schwer',
    question: 'Wer war der erste römische Kaiser?',
    options: ['Julius Cäsar', 'Augustus', 'Nero', 'Caligula'],
    correctAnswer: 1,
    explanation: 'Augustus (geboren als Gaius Octavius) war der erste römische Kaiser.'
  },
  {
    id: 'g24',
    category: 'geschichte',
    difficulty: 'mittel',
    question: 'Welches Land schenkte den USA die Freiheitsstatue?',
    options: ['Großbritannien', 'Spanien', 'Frankreich', 'Deutschland'],
    correctAnswer: 2,
    explanation: 'Die Freiheitsstatue war ein Geschenk Frankreichs an die Vereinigten Staaten zur Erinnerung an die Unabhängigkeit.'
  },
  {
    id: 'g25',
    category: 'geschichte',
    difficulty: 'leicht',
    question: 'Wie hieß das Schiff, das 1912 auf seiner Jungfernfahrt sank?',
    options: ['Lusitania', 'Britannic', 'Titanic', 'Olympic'],
    correctAnswer: 2,
    explanation: 'Die RMS Titanic sank 1912 nach einer Kollision mit einem Eisberg.'
  },
  // Mehr Geografie
  {
    id: 'geo21',
    category: 'geografie',
    difficulty: 'leicht',
    question: 'Welches ist der längste Fluss der Welt?',
    options: ['Amazonas', 'Nil', 'Jangtsekiang', 'Mississippi'],
    correctAnswer: 1,
    explanation: 'Der Nil gilt traditionell als der längste Fluss der Erde, auch wenn es Diskussionen um den Amazonas gibt.'
  },
  {
    id: 'geo22',
    category: 'geografie',
    difficulty: 'mittel',
    question: 'Welches Land hat die größte Landfläche?',
    options: ['Kanada', 'China', 'USA', 'Russland'],
    correctAnswer: 3,
    explanation: 'Russland ist mit Abstand das flächenmäßig größte Land der Erde.'
  },
  {
    id: 'geo23',
    category: 'geografie',
    difficulty: 'schwer',
    question: 'Was ist die Hauptstadt von Kanada?',
    options: ['Toronto', 'Vancouver', 'Montreal', 'Ottawa'],
    correctAnswer: 3,
    explanation: 'Ottawa ist die Hauptstadt von Kanada.'
  },
  {
    id: 'geo24',
    category: 'geografie',
    difficulty: 'mittel',
    question: 'In welchem Gebirge liegt der Mount Everest?',
    options: ['Anden', 'Rocky Mountains', 'Alpen', 'Himalaya'],
    correctAnswer: 3,
    explanation: 'Der Mount Everest, der höchste Berg der Welt, liegt im Himalaya.'
  },
  {
    id: 'geo25',
    category: 'geografie',
    difficulty: 'leicht',
    question: 'Welcher Ozean liegt zwischen Europa und Nordamerika?',
    options: ['Pazifischer Ozean', 'Indischer Ozean', 'Atlantischer Ozean', 'Arktischer Ozean'],
    correctAnswer: 2,
    explanation: 'Der Atlantische Ozean trennt Europa und Nordamerika.'
  },
  // Mehr Wissenschaft
  {
    id: 'w21',
    category: 'wissenschaft',
    difficulty: 'leicht',
    question: 'Welcher Planet ist als der "Rote Planet" bekannt?',
    options: ['Venus', 'Jupiter', 'Saturn', 'Mars'],
    correctAnswer: 3,
    explanation: 'Mars wird wegen seiner rötlichen Oberfläche oft als Roter Planet bezeichnet.'
  },
  {
    id: 'w22',
    category: 'wissenschaft',
    difficulty: 'mittel',
    question: 'Was ist das chemische Symbol für Gold?',
    options: ['Ag', 'Au', 'Fe', 'Cu'],
    correctAnswer: 1,
    explanation: 'Das chemische Symbol für Gold ist Au (von lateinisch aurum).'
  },
  {
    id: 'w23',
    category: 'wissenschaft',
    difficulty: 'schwer',
    question: 'Wer formulierte die Relativitätstheorie?',
    options: ['Isaac Newton', 'Galileo Galilei', 'Albert Einstein', 'Stephen Hawking'],
    correctAnswer: 2,
    explanation: 'Albert Einstein veröffentlichte 1905 die spezielle und 1915 die allgemeine Relativitätstheorie.'
  },
  {
    id: 'w24',
    category: 'wissenschaft',
    difficulty: 'mittel',
    question: 'Welches ist das leichteste Element im Periodensystem?',
    options: ['Sauerstoff', 'Helium', 'Kohlenstoff', 'Wasserstoff'],
    correctAnswer: 3,
    explanation: 'Wasserstoff (H) hat die Ordnungszahl 1 und ist das leichteste Element.'
  },
  {
    id: 'w25',
    category: 'wissenschaft',
    difficulty: 'leicht',
    question: 'Bei welcher Temperatur gefriert Wasser (in Celsius)?',
    options: ['-10', '0', '10', '100'],
    correctAnswer: 1,
    explanation: 'Wasser gefriert bei 0 Grad Celsius unter Normaldruck.'
  },
  // Mehr Technik
  {
    id: 't21',
    category: 'technik',
    difficulty: 'leicht',
    question: 'Wofür steht die Abkürzung "PC"?',
    options: ['Personal Computer', 'Private Computer', 'Primary Computer', 'Portable Computer'],
    correctAnswer: 0,
    explanation: 'PC steht für Personal Computer.'
  },
  {
    id: 't22',
    category: 'technik',
    difficulty: 'mittel',
    question: 'Wer gilt als Erfinder des World Wide Web?',
    options: ['Bill Gates', 'Steve Jobs', 'Tim Berners-Lee', 'Mark Zuckerberg'],
    correctAnswer: 2,
    explanation: 'Tim Berners-Lee entwickelte 1989 am CERN die Grundlagen des World Wide Web.'
  },
  {
    id: 't23',
    category: 'technik',
    difficulty: 'schwer',
    question: 'In welchem Jahr wurde das erste iPhone vorgestellt?',
    options: ['2005', '2006', '2007', '2008'],
    correctAnswer: 2,
    explanation: 'Steve Jobs stellte das erste iPhone im Januar 2007 vor.'
  },
  {
    id: 't24',
    category: 'technik',
    difficulty: 'mittel',
    question: 'Was misst die Einheit "Hertz" (Hz)?',
    options: ['Spannung', 'Frequenz', 'Widerstand', 'Stromstärke'],
    correctAnswer: 1,
    explanation: 'Hertz ist die abgeleitete SI-Einheit für die Frequenz (Schwingungen pro Sekunde).'
  },
  {
    id: 't25',
    category: 'technik',
    difficulty: 'leicht',
    question: 'Welches Bauteil wird oft als das "Gehirn" eines Computers bezeichnet?',
    options: ['Festplatte', 'Arbeitsspeicher', 'Grafikkarte', 'Prozessor (CPU)'],
    correctAnswer: 3,
    explanation: 'Die CPU (Central Processing Unit) führt die wichtigsten Berechnungen aus.'
  },
  // Mehr Sprache
  {
    id: 's21',
    category: 'sprache',
    difficulty: 'leicht',
    question: 'Welche Sprache hat die meisten Muttersprachler weltweit?',
    options: ['Englisch', 'Spanisch', 'Mandarin (Chinesisch)', 'Hindi'],
    correctAnswer: 2,
    explanation: 'Mandarin hat mit über 900 Millionen die meisten Muttersprachler.'
  },
  {
    id: 's22',
    category: 'sprache',
    difficulty: 'mittel',
    question: 'Was ist ein Synonym?',
    options: ['Ein Wort mit gleicher Bedeutung', 'Ein Wort mit gegensätzlicher Bedeutung', 'Ein Fremdwort', 'Ein Dialekt'],
    correctAnswer: 0,
    explanation: 'Synonyme sind verschiedene Wörter mit gleicher oder sehr ähnlicher Bedeutung.'
  },
  {
    id: 's23',
    category: 'sprache',
    difficulty: 'schwer',
    question: 'Wie nennt man die Lehre vom Satzbau?',
    options: ['Morphologie', 'Semantik', 'Syntax', 'Phonologie'],
    correctAnswer: 2,
    explanation: 'Die Syntax (Satzlehre) befasst sich mit dem Aufbau von Sätzen.'
  },
  {
    id: 's24',
    category: 'sprache',
    difficulty: 'mittel',
    question: 'Welche dieser Sprachen ist keine romanische Sprache?',
    options: ['Französisch', 'Spanisch', 'Italienisch', 'Englisch'],
    correctAnswer: 3,
    explanation: 'Englisch gehört zu den germanischen Sprachen, auch wenn es viele romanische Lehnwörter enthält.'
  },
  {
    id: 's25',
    category: 'sprache',
    difficulty: 'leicht',
    question: 'Wie viele Buchstaben hat das klassische lateinische Alphabet (ohne Umlaute)?',
    options: ['24', '25', '26', '27'],
    correctAnswer: 2,
    explanation: 'Das lateinische Alphabet besteht aus 26 Grundbuchstaben.'
  },
  // Mehr Deutschland
  {
    id: 'd21',
    category: 'deutschland',
    difficulty: 'leicht',
    question: 'Welches ist das flächenmäßig größte Bundesland?',
    options: ['Niedersachsen', 'Nordrhein-Westfalen', 'Baden-Württemberg', 'Bayern'],
    correctAnswer: 3,
    explanation: 'Bayern ist mit über 70.000 Quadratkilometern das größte Bundesland.'
  },
  {
    id: 'd22',
    category: 'deutschland',
    difficulty: 'mittel',
    question: 'Wie heißt der höchste Berg Deutschlands?',
    options: ['Watzmann', 'Feldberg', 'Zugspitze', 'Brocken'],
    correctAnswer: 2,
    explanation: 'Die Zugspitze in den Alpen ist mit 2.962 Metern der höchste Berg Deutschlands.'
  },
  {
    id: 'd23',
    category: 'deutschland',
    difficulty: 'schwer',
    question: 'In welchem Jahr wurde die Bundesrepublik Deutschland gegründet?',
    options: ['1945', '1948', '1949', '1955'],
    correctAnswer: 2,
    explanation: 'Die BRD wurde am 23. Mai 1949 mit der Verkündung des Grundgesetzes gegründet.'
  },
  {
    id: 'd24',
    category: 'deutschland',
    difficulty: 'mittel',
    question: 'Welcher Fluss fließt durch Köln?',
    options: ['Elbe', 'Donau', 'Rhein', 'Weser'],
    correctAnswer: 2,
    explanation: 'Der Rhein fließt durch Köln und prägt das Stadtbild maßgeblich.'
  },
  {
    id: 'd25',
    category: 'deutschland',
    difficulty: 'leicht',
    question: 'Welche Farben hat die deutsche Flagge (von oben nach unten)?',
    options: ['Schwarz-Weiß-Rot', 'Schwarz-Rot-Gold', 'Gold-Rot-Schwarz', 'Rot-Schwarz-Gold'],
    correctAnswer: 1,
    explanation: 'Die Farben der Bundesflagge sind Schwarz-Rot-Gold.'
  },
  // Mehr Tiere
  {
    id: 'ti21',
    category: 'tiere',
    difficulty: 'leicht',
    question: 'Welches ist das schnellste Landtier der Welt?',
    options: ['Löwe', 'Gepard', 'Antilope', 'Strauß'],
    correctAnswer: 1,
    explanation: 'Der Gepard kann beim Sprint Geschwindigkeiten von über 100 km/h erreichen.'
  },
  {
    id: 'ti22',
    category: 'tiere',
    difficulty: 'mittel',
    question: 'Zu welcher Tierklasse gehören Pinguine?',
    options: ['Säugetiere', 'Fische', 'Amphibien', 'Vögel'],
    correctAnswer: 3,
    explanation: 'Pinguine sind flugunfähige Seevögel.'
  },
  {
    id: 'ti23',
    category: 'tiere',
    difficulty: 'schwer',
    question: 'Welches Tier hat das größte Gehirn aller Lebewesen?',
    options: ['Elefant', 'Blauwal', 'Pottwal', 'Mensch'],
    correctAnswer: 2,
    explanation: 'Das Gehirn eines Pottwals kann bis zu 8 Kilogramm wiegen und ist damit das größte im Tierreich.'
  },
  {
    id: 'ti24',
    category: 'tiere',
    difficulty: 'mittel',
    question: 'Wie viele Beine hat eine Spinne?',
    options: ['6', '8', '10', '12'],
    correctAnswer: 1,
    explanation: 'Spinnentiere (Arachnida) haben acht Beine, im Gegensatz zu Insekten, die sechs haben.'
  },
  {
    id: 'ti25',
    category: 'tiere',
    difficulty: 'leicht',
    question: 'Welches Tier produziert Honig?',
    options: ['Wespe', 'Hummel', 'Biene', 'Schmetterling'],
    correctAnswer: 2,
    explanation: 'Honigbienen sammeln Nektar und verarbeiten ihn zu Honig.'
  },
  // Mehr Weltall
  {
    id: 'we21',
    category: 'weltall',
    difficulty: 'leicht',
    question: 'Welcher Himmelskörper ist das Zentrum unseres Sonnensystems?',
    options: ['Erde', 'Mond', 'Sonne', 'Jupiter'],
    correctAnswer: 2,
    explanation: 'Die Sonne ist der Stern im Zentrum unseres Sonnensystems.'
  },
  {
    id: 'we22',
    category: 'weltall',
    difficulty: 'mittel',
    question: 'Wie heißt unsere Heimatgalaxie?',
    options: ['Andromeda-Galaxie', 'Milchstraße', 'Sombrero-Galaxie', 'Dreiecksgalaxie'],
    correctAnswer: 1,
    explanation: 'Unser Sonnensystem befindet sich in der Milchstraße.'
  },
  {
    id: 'we23',
    category: 'weltall',
    difficulty: 'schwer',
    question: 'Wer war der erste Mensch im Weltraum?',
    options: ['Neil Armstrong', 'Juri Gagarin', 'Buzz Aldrin', 'John Glenn'],
    correctAnswer: 1,
    explanation: 'Der sowjetische Kosmonaut Juri Gagarin flog 1961 als erster Mensch ins All.'
  },
  {
    id: 'we24',
    category: 'weltall',
    difficulty: 'mittel',
    question: 'Welcher Planet hat die markantesten Ringe?',
    options: ['Jupiter', 'Uranus', 'Neptun', 'Saturn'],
    correctAnswer: 3,
    explanation: 'Saturn ist berühmt für sein ausgeprägtes und helles Ringsystem.'
  },
  {
    id: 'we25',
    category: 'weltall',
    difficulty: 'leicht',
    question: 'Wie nennt man Gesteinsbrocken, die aus dem Weltall auf die Erde fallen?',
    options: ['Kometen', 'Asteroiden', 'Meteoriten', 'Sterne'],
    correctAnswer: 2,
    explanation: 'Wenn ein Meteoroid die Erdatmosphäre durchquert und den Boden erreicht, nennt man ihn Meteorit.'
  },
  // Mehr Sport
  {
    id: 'sp21',
    category: 'sport',
    difficulty: 'leicht',
    question: 'Wie viele Spieler stehen bei einer Fußballmannschaft regulär auf dem Platz?',
    options: ['9', '10', '11', '12'],
    correctAnswer: 2,
    explanation: 'Eine Fußballmannschaft besteht aus 11 Spielern (1 Torwart und 10 Feldspieler).'
  },
  {
    id: 'sp22',
    category: 'sport',
    difficulty: 'mittel',
    question: 'In welcher Sportart gibt es einen "Touchdown"?',
    options: ['Rugby', 'Basketball', 'American Football', 'Baseball'],
    correctAnswer: 2,
    explanation: 'Ein Touchdown ist die wichtigste Möglichkeit, im American Football Punkte zu erzielen.'
  },
  {
    id: 'sp23',
    category: 'sport',
    difficulty: 'schwer',
    question: 'Wie lang ist eine Marathonstrecke genau?',
    options: ['40,000 km', '42,195 km', '45,000 km', '50,000 km'],
    correctAnswer: 1,
    explanation: 'Die offizielle Länge eines Marathons beträgt 42,195 Kilometer.'
  },
  {
    id: 'sp24',
    category: 'sport',
    difficulty: 'mittel',
    question: 'Welches Land hat die meisten Fußball-Weltmeisterschaften gewonnen?',
    options: ['Deutschland', 'Italien', 'Argentinien', 'Brasilien'],
    correctAnswer: 3,
    explanation: 'Brasilien ist mit fünf Titeln (Stand 2023) Rekordweltmeister.'
  },
  {
    id: 'sp25',
    category: 'sport',
    difficulty: 'leicht',
    question: 'Welches Sportgerät wird beim Tennis verwendet?',
    options: ['Schläger', 'Schläger und Puck', 'Schläger und Ball', 'Nur ein Ball'],
    correctAnswer: 2,
    explanation: 'Beim Tennis schlagen die Spieler einen Ball mit einem Tennisschläger über das Netz.'
  }
];
