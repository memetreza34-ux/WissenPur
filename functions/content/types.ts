export type Difficulty = 'leicht' | 'mittel' | 'schwer';

export interface Question {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty?: Difficulty;
  imageUrl?: string;
  imagePrompt?: string;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}
