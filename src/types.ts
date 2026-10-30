export enum FingerId {
  LeftPinky = 'LP',
  LeftRing = 'LR',
  LeftMiddle = 'LM',
  LeftIndex = 'LI',
  Thumb = 'TH',
  RightIndex = 'RI',
  RightMiddle = 'RM',
  RightRing = 'RR',
  RightPinky = 'RP',
}

export enum PracticeMode {
  Lesson = 'lesson',
  TimedTest = 'timed_test',
  ZenFocus = 'zen_focus',
  CustomText = 'custom_text',
}

export enum LessonCategory {
  HomeRow = 'Hàng phím cơ sở',
  TopRow = 'Hàng phím trên',
  BottomRow = 'Hàng phím dưới',
  NumbersShift = 'Chữ hoa & Dấu câu',
  VietnameseProse = 'Văn bản tiếng Việt',
  EnglishCode = 'Tiếng Anh & Lập trình',
}

export interface FingerInfo {
  id: FingerId;
  name: string;
  shortName: string;
  hand: 'Tay trái' | 'Tay phải' | 'Hai ngón cái';
  homeKey: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  keyTint: string;
  svgFill: string;
}

export interface KeyDef {
  code: string;
  label: string;
  shiftLabel?: string;
  finger: FingerId;
  width?: number; // relative unit, 1 = standard key
  isHomeBump?: boolean;
  matchChars?: string[];
}

export interface Lesson {
  id: string;
  number: string;
  title: string;
  category: LessonCategory;
  focusKeys: string[];
  targetWpm: number;
  targetAccuracy: number;
  description: string;
  exercises: string[];
}

export interface SessionRecord {
  id: string;
  timestamp: number;
  mode: PracticeMode;
  lessonId?: string;
  title: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  durationSec: number;
  totalChars: number;
  errorCount: number;
  missedChars: Record<string, number>;
}

export interface KeyFeedbackEvent {
  code: string;
  shiftCode?: 'ShiftLeft' | 'ShiftRight' | null;
  outcome: 'correct' | 'error';
  seq: number;
}

