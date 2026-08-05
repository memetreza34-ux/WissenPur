export interface SRSData {
  interval: number; // in days
  easeFactor: number;
  repetitions: number;
  nextReviewDate: number; // timestamp
}

export type Quality = 0 | 1 | 2 | 3 | 4 | 5;
// 0: Complete blackout
// 1: Incorrect, but remembered the correct answer after seeing it
// 2: Incorrect, but seemed easy to remember
// 3: Correct, but required significant effort
// 4: Correct, after some hesitation
// 5: Perfect response

export const initSRSData = (): SRSData => ({
  interval: 0,
  easeFactor: 2.5,
  repetitions: 0,
  nextReviewDate: Date.now(),
});

export const calculateNextReview = (data: SRSData, quality: Quality): SRSData => {
  let { interval, easeFactor, repetitions } = data;

  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions++;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReviewDate = Date.now() + interval * 24 * 60 * 60 * 1000;

  return {
    interval,
    easeFactor,
    repetitions,
    nextReviewDate,
  };
};
