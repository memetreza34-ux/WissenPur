import type { CustomQuiz, Difficulty, Question } from '../types';
import type { SRSData } from './srsService';

export const MAX_IMPORT_BYTES = 1_000_000;
export const MAX_IMPORTED_QUESTIONS = 100;
export const MAX_LIBRARY_DECKS = 100;
export const MAX_LIBRARY_QUESTIONS = 500;
export const MAX_LIBRARY_SERIALIZED_BYTES = 700_000;

export type LearningSetImportFormat = 'json' | 'csv';

export interface LearningSetImportResult {
  deck: CustomQuiz;
  format: LearningSetImportFormat;
  importedQuestions: number;
  skippedRows: number;
  warnings: string[];
}

export class LearningSetImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LearningSetImportError';
  }
}

const allowedCategories = new Set([
  'allgemein', 'geschichte', 'geografie', 'wissenschaft', 'technik',
  'sprache', 'deutschland', 'tiere', 'weltall', 'sport', 'kunst',
  'musik', 'filme', 'literatur', 'medizin', 'natur', 'wirtschaft',
  'politik', 'mythologie', 'videospiele', 'flaggen',
]);

const normalizeText = (value: unknown, maxLength: number): string =>
  typeof value === 'string'
    ? value.trim().replace(/\s+/g, ' ').slice(0, maxLength)
    : '';

const normalizeDifficulty = (value: unknown): Difficulty | undefined => {
  const candidate = normalizeText(value, 20).toLowerCase();
  if (candidate === 'leicht' || candidate === 'mittel' || candidate === 'schwer') return candidate;
  return undefined;
};

const normalizeCategory = (value: unknown): string => {
  const candidate = normalizeText(value, 50).toLowerCase();
  return allowedCategories.has(candidate) ? candidate : 'allgemein';
};

const normalizeSrsData = (value: unknown): SRSData | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const data = value as Record<string, unknown>;
  const interval = Number(data.interval);
  const easeFactor = Number(data.easeFactor);
  const repetitions = Number(data.repetitions);
  const nextReviewDate = Number(data.nextReviewDate);

  if (
    !Number.isFinite(interval) || interval < 0 || interval > 36_500 ||
    !Number.isFinite(easeFactor) || easeFactor < 1.3 || easeFactor > 5 ||
    !Number.isInteger(repetitions) || repetitions < 0 || repetitions > 10_000 ||
    !Number.isFinite(nextReviewDate) || nextReviewDate < 0
  ) return undefined;

  return { interval, easeFactor, repetitions, nextReviewDate };
};

const hashText = (value: string): string => {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return (hash >>> 0).toString(36);
};

const slug = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'lernset';

const uniqueQuestionId = (
  title: string,
  question: string,
  options: string[],
  usedIds: Set<string>,
): string => {
  const base = `import-${slug(title)}-${hashText(`${question}\u0000${options.join('\u0000')}`)}`;
  let candidate = base;
  let suffix = 2;
  while (usedIds.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  usedIds.add(candidate);
  return candidate;
};

const resolveCorrectAnswer = (
  value: unknown,
  options: string[],
  numericValuesAreOneBased: boolean,
): number | null => {
  if (typeof value === 'number' && Number.isInteger(value)) {
    const index = numericValuesAreOneBased ? value - 1 : value;
    return index >= 0 && index < options.length ? index : null;
  }

  const text = normalizeText(value, 300);
  if (!text) return null;

  const matchingOption = options.findIndex(
    (option) => option.toLocaleLowerCase('de-DE') === text.toLocaleLowerCase('de-DE'),
  );
  if (matchingOption >= 0) return matchingOption;

  if (/^[A-J]$/i.test(text)) {
    const index = text.toUpperCase().charCodeAt(0) - 65;
    return index < options.length ? index : null;
  }

  if (/^\d+$/.test(text)) {
    const number = Number(text);
    const index = number === 0 ? 0 : number - 1;
    return index >= 0 && index < options.length ? index : null;
  }

  return null;
};

const readOptions = (data: Record<string, unknown>): string[] => {
  const arrayOptions = Array.isArray(data.options)
    ? data.options.map((entry) => normalizeText(entry, 250)).filter(Boolean)
    : [];
  if (arrayOptions.length > 0) return arrayOptions.slice(0, 6);

  return Array.from({ length: 10 }, (_, index) =>
    normalizeText(
      data[`option${index + 1}`] ??
      data[`antwort${index + 1}`] ??
      data[String.fromCharCode(65 + index)],
      250,
    ),
  ).filter(Boolean).slice(0, 6);
};

const normalizeQuestion = (
  raw: unknown,
  title: string,
  usedIds: Set<string>,
  numericValuesAreOneBased: boolean,
): Question | null => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const data = raw as Record<string, unknown>;
  const question = normalizeText(data.question ?? data.prompt ?? data.frage, 500);
  const options = readOptions(data);
  const normalizedOptions = options.map((entry) => entry.toLocaleLowerCase('de-DE'));

  if (!question || options.length < 2 || new Set(normalizedOptions).size !== options.length) {
    return null;
  }

  const correctAnswer = resolveCorrectAnswer(
    data.correctAnswer ?? data.correct ?? data.answer ?? data.richtig ?? data.loesung,
    options,
    numericValuesAreOneBased,
  );
  if (correctAnswer === null) return null;

  const explanation = normalizeText(
    data.explanation ?? data.erklaerung ?? data.reason,
    2_000,
  ) || 'Importierte Lernfrage.';
  const difficulty = normalizeDifficulty(data.difficulty ?? data.schwierigkeit);
  const srsData = normalizeSrsData(data.srsData);

  return {
    id: uniqueQuestionId(title, question, options, usedIds),
    category: normalizeCategory(data.category ?? data.kategorie),
    question,
    options,
    correctAnswer,
    explanation,
    ...(difficulty ? { difficulty } : {}),
    ...(srsData ? { srsData } : {}),
  };
};

const parseDelimitedRows = (text: string, delimiter: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += character;
      }
      continue;
    }

    if (character === '"') quoted = true;
    else if (character === delimiter) {
      row.push(cell.trim());
      cell = '';
    } else if (character === '\n') {
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
    } else if (character !== '\r') {
      cell += character;
    }
  }

  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
};

const normalizeHeader = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

const rowObject = (headers: string[], row: string[]): Record<string, unknown> => {
  const aliases: Record<string, string> = {
    frage: 'question',
    prompt: 'question',
    question: 'question',
    richtig: 'correctAnswer',
    korrekt: 'correctAnswer',
    loesung: 'correctAnswer',
    answer: 'correctAnswer',
    correct: 'correctAnswer',
    correctanswer: 'correctAnswer',
    erklaerung: 'explanation',
    explanation: 'explanation',
    reason: 'explanation',
    kategorie: 'category',
    category: 'category',
    schwierigkeit: 'difficulty',
    difficulty: 'difficulty',
  };
  const result: Record<string, unknown> = {};
  headers.forEach((header, index) => {
    result[aliases[header] || header] = row[index] ?? '';
  });
  return result;
};

const chooseDelimiter = (text: string): string => {
  const firstLine = text.split(/\r?\n/, 1)[0] || '';
  return [';', ',', '\t'].sort(
    (left, right) => firstLine.split(right).length - firstLine.split(left).length,
  )[0] || ';';
};

const fileTitle = (fileName: string): string => {
  const withoutExtension = fileName.replace(/\.[^.]+$/, '');
  return normalizeText(withoutExtension.replace(/[-_]+/g, ' '), 100)
    || 'Importiertes Lernset';
};

const createDeck = (
  title: string,
  questions: Question[],
  now: number,
): CustomQuiz => ({
  id: `set-import-${now}-${hashText(`${title}\u0000${questions.map((question) => question.id).join('\u0000')}`)}`,
  title: normalizeText(title, 100) || 'Importiertes Lernset',
  questions,
  createdAt: now,
});

const parseJson = (
  text: string,
  fileName: string,
  now: number,
): LearningSetImportResult => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new LearningSetImportError('Die JSON-Datei ist nicht gültig.');
  }

  const container = parsed && typeof parsed === 'object' && !Array.isArray(parsed)
    ? parsed as Record<string, unknown>
    : null;
  const sourceQuestions = container?.questions;
  const title = normalizeText(container?.title, 100) || fileTitle(fileName);
  const rows: unknown[] = Array.isArray(parsed)
    ? parsed
    : Array.isArray(sourceQuestions)
      ? sourceQuestions
      : [];

  if (rows.length === 0) {
    throw new LearningSetImportError('Die JSON-Datei enthält kein questions-Array.');
  }

  const usedIds = new Set<string>();
  const questions = rows
    .slice(0, MAX_IMPORTED_QUESTIONS)
    .map((row) => normalizeQuestion(row, title, usedIds, false))
    .filter((question): question is Question => Boolean(question));

  if (questions.length === 0) {
    throw new LearningSetImportError('Es wurde keine gültige Frage gefunden.');
  }

  const skippedRows = rows.length - questions.length;
  const warnings: string[] = [];
  if (rows.length > MAX_IMPORTED_QUESTIONS) {
    warnings.push(`Es wurden nur die ersten ${MAX_IMPORTED_QUESTIONS} Fragen importiert.`);
  }
  if (skippedRows > 0) {
    warnings.push(`${skippedRows} ungültige oder unvollständige Fragen wurden übersprungen.`);
  }

  return {
    deck: createDeck(title, questions, now),
    format: 'json',
    importedQuestions: questions.length,
    skippedRows,
    warnings,
  };
};

const parseCsv = (
  text: string,
  fileName: string,
  now: number,
): LearningSetImportResult => {
  const rows = parseDelimitedRows(text, chooseDelimiter(text));
  if (rows.length < 2) {
    throw new LearningSetImportError('Die CSV-Datei benötigt eine Kopfzeile und mindestens eine Frage.');
  }

  const firstRow = rows[0];
  if (!firstRow) {
    throw new LearningSetImportError('Die CSV-Kopfzeile fehlt.');
  }
  const headers = firstRow.map(normalizeHeader);
  if (!headers.includes('question') && !headers.includes('frage')) {
    throw new LearningSetImportError('Die CSV-Kopfzeile benötigt die Spalte question oder frage.');
  }

  const title = fileTitle(fileName);
  const dataRows = rows.slice(1);
  const usedIds = new Set<string>();
  const questions = dataRows
    .slice(0, MAX_IMPORTED_QUESTIONS)
    .map((row) => normalizeQuestion(rowObject(headers, row), title, usedIds, true))
    .filter((question): question is Question => Boolean(question));

  if (questions.length === 0) {
    throw new LearningSetImportError('Es wurde keine gültige CSV-Frage gefunden.');
  }

  const skippedRows = dataRows.length - questions.length;
  const warnings: string[] = [];
  if (dataRows.length > MAX_IMPORTED_QUESTIONS) {
    warnings.push(`Es wurden nur die ersten ${MAX_IMPORTED_QUESTIONS} Fragen importiert.`);
  }
  if (skippedRows > 0) {
    warnings.push(`${skippedRows} ungültige oder unvollständige Zeilen wurden übersprungen.`);
  }

  return {
    deck: createDeck(title, questions, now),
    format: 'csv',
    importedQuestions: questions.length,
    skippedRows,
    warnings,
  };
};

export const estimateLearningLibraryBytes = (decks: readonly CustomQuiz[]): number =>
  new TextEncoder().encode(JSON.stringify(decks)).byteLength;

export const parseLearningSetImport = (
  text: string,
  fileName: string,
  now = Date.now(),
): LearningSetImportResult => {
  const bytes = new TextEncoder().encode(text).byteLength;
  if (bytes === 0) throw new LearningSetImportError('Die ausgewählte Datei ist leer.');
  if (bytes > MAX_IMPORT_BYTES) {
    throw new LearningSetImportError('Die Datei ist größer als 1 MB.');
  }

  const extension = fileName.toLowerCase().split('.').pop();
  if (extension === 'json') return parseJson(text, fileName, now);
  if (extension === 'csv' || extension === 'tsv' || extension === 'txt') {
    return parseCsv(text, fileName, now);
  }
  throw new LearningSetImportError('Unterstützt werden JSON-, CSV- und TSV-Dateien.');
};

export const serializeLearningSet = (deck: CustomQuiz): string => JSON.stringify({
  schemaVersion: 1,
  title: deck.title,
  questions: deck.questions.map((question) => ({
    question: question.question,
    options: question.options,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    category: question.category,
    difficulty: question.difficulty || 'mittel',
    ...(question.srsData ? { srsData: question.srsData } : {}),
  })),
}, null, 2);
