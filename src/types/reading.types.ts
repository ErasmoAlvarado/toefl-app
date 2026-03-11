export type ToeflQuestionType =
  | 'Factual Information'
  | 'Negative Factual Information'
  | 'Inference'
  | 'Rhetorical Purpose'
  | 'Vocabulary in context'
  | 'Reference'
  | 'Sentence Simplification'
  | 'Insert Text'
  | 'Prose Summary'
  | 'Fill a Table'
  | 'Complete the Word'

export interface BaseQuestion {
  id: string
  type: ToeflQuestionType
  question: string
  paragraphNumber?: number
  explanation: string
  wrongExplanations?: Record<string, string> // key is the option index (e.g. 'A', 'B') or option id
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 
    | 'Factual Information'
    | 'Negative Factual Information'
    | 'Inference'
    | 'Rhetorical Purpose'
    | 'Vocabulary in context'
    | 'Reference'
    | 'Sentence Simplification'
  options: string[]
  correctAnswer: string // The exact string of the correct option
}

export interface InsertTextQuestion extends BaseQuestion {
  type: 'Insert Text'
  insertSentence: string // The sentence to be inserted
  // The passage text will have markers like [A], [B], [C], [D]
  correctPosition: string // 'A', 'B', 'C', or 'D'
}

export interface ProseSummaryQuestion extends BaseQuestion {
  type: 'Prose Summary'
  introductorySentence: string
  options: string[] // Array of 6 options
  correctAnswers: string[] // Array of 3 exact strings
}

export interface FillTableQuestion extends BaseQuestion {
  type: 'Fill a Table'
  categories: string[] // e.g. ["Mammals", "Reptiles"]
  options: string[] // List of items to categorize
  correctAnswers: Record<string, string[]> // category -> array of items
}

export interface InlineCompleteWordsQuestion extends BaseQuestion {
  type: 'Complete the Word'
  paragraphWithBlanks: string // e.g. "The quick bro___ fox jum___ over..."
  blanks: {
    id: string; // e.g. blank-1
    fullWord: string; // "brown"
    missingPart: string; // "wn"
  }[]
}

export type ToeflQuestion =
  | MultipleChoiceQuestion
  | InsertTextQuestion
  | ProseSummaryQuestion
  | FillTableQuestion
  | InlineCompleteWordsQuestion

export interface GeneratedPassage {
  title: string
  content: string // The passage text, with paragraphs separated by \n\n. Might include [A] [B] [C] [D] markers.
  questions: ToeflQuestion[]
}
