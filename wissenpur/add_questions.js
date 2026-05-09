import fs from 'fs';

const newQuestions = `
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
  }
];
`
const dataFile = fs.readFileSync('src/data.ts', 'utf-8');
const updatedFile = dataFile.replace(/];\\s*$/, ',' + newQuestions.substring(1) + '\\n];\\n');
fs.writeFileSync('src/data.ts', updatedFile);
console.log("Added new questions!");
